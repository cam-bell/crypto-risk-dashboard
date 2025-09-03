from typing import List
from app.api_clients.base_client import BaseAPIClient, APIResponse
from app.core.api_config import api_config


class CoinGeckoClient(BaseAPIClient):
    """CoinGecko API client for cryptocurrency data"""
    
    def __init__(self):
        super().__init__(
            base_url=api_config.coingecko_base_url,
            api_key=api_config.coingecko_api_key,
            rate_limit=api_config.coingecko_rate_limit,
            timeout=api_config.coingecko_timeout
        )
    
    async def health_check(self) -> APIResponse:
        """Check CoinGecko API health"""
        return await self._make_request("GET", "ping")
    
    async def get_supported_coins(self) -> APIResponse:
        """Get list of supported coins"""
        return await self._make_request("GET", "coins/list")
    
    async def get_coin_price(
        self, 
        coin_id: str, 
        vs_currencies: List[str] = ["usd"]
    ) -> APIResponse:
        """Get current price for a specific coin"""
        params = {
            "ids": coin_id,
            "vs_currencies": ",".join(vs_currencies)
        }
        return await self._make_request("GET", "simple/price", params=params)
    
    async def get_coin_market_data(
        self, 
        coin_ids: List[str], 
        vs_currency: str = "usd",
        order: str = "market_cap_desc",
        per_page: int = 100,
        page: int = 1,
        sparkline: bool = False
    ) -> APIResponse:
        """Get market data for multiple coins"""
        params = {
            "vs_currency": vs_currency,
            "ids": ",".join(coin_ids),
            "order": order,
            "per_page": per_page,
            "page": page,
            "sparkline": str(sparkline).lower()
        }
        return await self._make_request("GET", "coins/markets", params=params)
    
    async def get_coin_detail(self, coin_id: str) -> APIResponse:
        """Get detailed information about a specific coin"""
        return await self._make_request("GET", f"coins/{coin_id}")
    
    async def get_coin_price_history(
        self, 
        coin_id: str, 
        vs_currency: str = "usd",
        days: int = 30
    ) -> APIResponse:
        """Get historical price data for a coin"""
        params = {
            "vs_currency": vs_currency,
            "days": days
        }
        return await self._make_request(
            "GET", f"coins/{coin_id}/market_chart", params=params
        )
    
    async def get_trending_coins(self) -> APIResponse:
        """Get trending coins in the last 24 hours"""
        return await self._make_request("GET", "search/trending")
    
    async def get_global_market_data(self) -> APIResponse:
        """Get global cryptocurrency market data"""
        return await self._make_request("GET", "global")
    
    async def get_exchange_rates(self) -> APIResponse:
        """Get exchange rates for supported currencies"""
        return await self._make_request("GET", "exchange_rates")
    
    async def search_coins(self, query: str) -> APIResponse:
        """Search for coins by name or symbol"""
        params = {"query": query}
        return await self._make_request("GET", "search", params=params)
