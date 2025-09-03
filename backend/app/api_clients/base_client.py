import asyncio
import time
import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass
import httpx
from httpx import Response, TimeoutException, HTTPStatusError

from app.core.api_config import api_config

logger = logging.getLogger(__name__)


@dataclass
class APIResponse:
    """Standardized API response wrapper"""

    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    status_code: Optional[int] = None
    headers: Optional[Dict[str, str]] = None
    cached: bool = False


class RateLimiter:
    """Rate limiter for API calls"""

    def __init__(self, calls_per_second: int = 1):
        self.calls_per_second = calls_per_second
        self.last_call_time = 0
        self.min_interval = 1.0 / calls_per_second

    async def wait_if_needed(self):
        """Wait if necessary to respect rate limits"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time

        if time_since_last_call < self.min_interval:
            wait_time = self.min_interval - time_since_last_call
            await asyncio.sleep(wait_time)

        self.last_call_time = time.time()


class BaseAPIClient(ABC):
    """Base class for all API clients"""

    def __init__(
        self,
        base_url: str,
        api_key: Optional[str] = None,
        rate_limit: int = 1,
        timeout: int = 30,
        max_retries: int = 3,
    ):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.rate_limiter = RateLimiter(rate_limit)
        self.timeout = timeout
        self.max_retries = max_retries
        self.client: Optional[httpx.AsyncClient] = None

    async def __aenter__(self):
        """Async context manager entry"""
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.client:
            await self.client.aclose()

    async def _make_request(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        data: Optional[Dict[str, Any]] = None,
        retry_count: int = 0,
    ) -> APIResponse:
        """Make HTTP request with retry logic and rate limiting"""

        # Wait for rate limiter
        await self.rate_limiter.wait_if_needed()

        # Prepare request
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        request_headers = self._get_default_headers()
        if headers:
            request_headers.update(headers)

        try:
            if method.upper() == "GET":
                response = await self.client.get(
                    url, params=params, headers=request_headers
                )
            elif method.upper() == "POST":
                response = await self.client.post(
                    url, params=params, headers=request_headers, json=data
                )
            else:
                return APIResponse(
                    success=False, error=f"Unsupported HTTP method: {method}"
                )

            return await self._process_response(response)

        except TimeoutException as e:
            logger.warning(f"Timeout error for {url}: {e}")
            return await self._handle_retry(
                method, endpoint, params, headers, data, retry_count, "timeout"
            )

        except HTTPStatusError as e:
            logger.warning(f"HTTP error {e.response.status_code} for {url}: {e}")
            return await self._handle_retry(
                method, endpoint, params, headers, data, retry_count, "http_error"
            )

        except Exception as e:
            logger.error(f"Unexpected error for {url}: {e}")
            return await self._handle_retry(
                method, endpoint, params, headers, data, retry_count, "unexpected_error"
            )

    async def _handle_retry(
        self,
        method: str,
        endpoint: str,
        params: Optional[Dict[str, Any]],
        headers: Optional[Dict[str, str]],
        data: Optional[Dict[str, Any]],
        retry_count: int,
        error_type: str,
    ) -> APIResponse:
        """Handle retry logic for failed requests"""

        if retry_count < self.max_retries:
            retry_count += 1
            wait_time = self._calculate_retry_delay(retry_count, error_type)

            logger.info(
                f"Retrying {method} {endpoint} in {wait_time}s (attempt {retry_count}/{self.max_retries})"
            )
            await asyncio.sleep(wait_time)

            return await self._make_request(
                method, endpoint, params, headers, data, retry_count
            )
        else:
            return APIResponse(
                success=False,
                error=f"Max retries exceeded after {error_type}",
                status_code=500,
            )

    def _calculate_retry_delay(self, retry_count: int, error_type: str) -> float:
        """Calculate delay for retry attempts"""
        base_delay = api_config.retry_delay

        if api_config.exponential_backoff:
            delay = base_delay * (2 ** (retry_count - 1))
        else:
            delay = base_delay * retry_count

        # Add jitter to prevent thundering herd
        jitter = delay * 0.1 * (time.time() % 1)
        return min(delay + jitter, 60)  # Cap at 60 seconds

    async def _process_response(self, response: Response) -> APIResponse:
        """Process HTTP response and return standardized APIResponse"""
        try:
            response.raise_for_status()

            # Try to parse JSON response
            try:
                data = response.json()
            except Exception:
                data = response.text

            return APIResponse(
                success=True,
                data=data,
                status_code=response.status_code,
                headers=dict(response.headers),
            )

        except HTTPStatusError as e:
            return APIResponse(
                success=False,
                error=f"HTTP {e.response.status_code}: {e.response.text}",
                status_code=e.response.status_code,
                headers=dict(e.response.headers),
            )

    def _get_default_headers(self) -> Dict[str, str]:
        """Get default headers for requests"""
        headers = {
            "User-Agent": "CryptoRiskDashboard/1.0",
            "Accept": "application/json",
        }

        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        return headers

    @abstractmethod
    async def health_check(self) -> APIResponse:
        """Check if the API is healthy and accessible"""
        pass

    def _log_request(self, method: str, url: str, params: Optional[Dict] = None):
        """Log API request for debugging"""
        logger.debug(f"API Request: {method} {url}")
        if params:
            logger.debug(f"Parameters: {params}")

    def _log_response(self, response: APIResponse):
        """Log API response for debugging"""
        if response.success:
            logger.debug(f"API Response: Success (Status: {response.status_code})")
        else:
            logger.error(f"API Response: Failed - {response.error}")
