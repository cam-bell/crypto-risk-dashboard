from app.api_clients.base_client import BaseAPIClient, APIResponse
from app.core.api_config import api_config


class AlphaVantageClient(BaseAPIClient):
    """Alpha Vantage API client for financial data"""

    def __init__(self):
        super().__init__(
            base_url=api_config.alphavantage_base_url,
            api_key=api_config.alphavantage_api_key,
            rate_limit=api_config.alphavantage_rate_limit,
            timeout=api_config.alphavantage_timeout,
        )

    async def health_check(self) -> APIResponse:
        """Check Alpha Vantage API health"""
        params = {
            "function": "TIME_SERIES_INTRADAY",
            "symbol": "AAPL",
            "interval": "1min",
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_crypto_price(self, symbol: str, market: str = "USD") -> APIResponse:
        """Get cryptocurrency price data"""
        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": symbol,
            "to_currency": market,
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_crypto_daily(self, symbol: str, market: str = "USD") -> APIResponse:
        """Get daily cryptocurrency data"""
        params = {
            "function": "DIGITAL_CURRENCY_DAILY",
            "symbol": symbol,
            "market": market,
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_crypto_intraday(
        self, symbol: str, market: str = "USD"
    ) -> APIResponse:
        """Get intraday cryptocurrency data"""
        params = {
            "function": "DIGITAL_CURRENCY_INTRADAY",
            "symbol": symbol,
            "market": market,
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_forex_rate(self, from_currency: str, to_currency: str) -> APIResponse:
        """Get foreign exchange rate"""
        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": from_currency,
            "to_currency": to_currency,
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)

    async def get_economic_indicators(self, indicator: str) -> APIResponse:
        """Get economic indicators"""
        params = {"function": indicator, "apikey": self.api_key}
        return await self._make_request("GET", "", params=params)

    async def get_sector_performance(self) -> APIResponse:
        """Get sector performance data"""
        params = {"function": "SECTOR", "apikey": self.api_key}
        return await self._make_request("GET", "", params=params)

    async def get_market_sentiment(self, symbol: str) -> APIResponse:
        """Get market sentiment indicators"""
        params = {
            "function": "NEWS_SENTIMENT",
            "tickers": symbol,
            "apikey": self.api_key,
        }
        return await self._make_request("GET", "", params=params)
