from typing import List, Optional
from app.api_clients.base_client import BaseAPIClient, APIResponse
from app.core.api_config import api_config


class CoinGeckoClient(BaseAPIClient):
    """CoinGecko API client for cryptocurrency data"""

    def __init__(self):
        super().__init__(
            base_url=api_config.coingecko_base_url,
            api_key=api_config.coingecko_api_key,
            rate_limit=api_config.coingecko_rate_limit,
            timeout=api_config.coingecko_timeout,
        )

    async def health_check(self) -> APIResponse:
        """Check CoinGecko API health"""
        return await self._make_request("GET", "ping")

    async def get_supported_coins(self) -> APIResponse:
        """Get list of supported coins"""
        return await self._make_request("GET", "coins/list")

    async def get_coin_price(
        self, coin_id: str, vs_currencies: Optional[List[str]] = None
    ) -> APIResponse:
        """Get current price for a specific coin"""
        if vs_currencies is None:
            vs_currencies = ["usd"]
        params = {"ids": coin_id, "vs_currencies": ",".join(vs_currencies)}
        return await self._make_request("GET", "simple/price", params=params)

    async def get_coin_market_data(
        self,
        coin_ids: List[str],
        vs_currency: str = "usd",
        order: str = "market_cap_desc",
        per_page: int = 100,
        page: int = 1,
        sparkline: bool = False,
    ) -> APIResponse:
        """Get market data for multiple coins"""
        params = {
            "vs_currency": vs_currency,
            "ids": ",".join(coin_ids),
            "order": order,
            "per_page": per_page,
            "page": page,
            "sparkline": str(sparkline).lower(),
        }
        return await self._make_request("GET", "coins/markets", params=params)

    async def get_coin_detail(self, coin_id: str) -> APIResponse:
        """Get detailed information about a specific coin"""
        return await self._make_request("GET", f"coins/{coin_id}")

    async def get_coin_price_history(
        self, coin_id: str, vs_currency: str = "usd", days: int = 30
    ) -> APIResponse:
        """Get historical price data for a coin"""
        params = {"vs_currency": vs_currency, "days": days}
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

    async def get_coins_by_category(
        self, category: str, vs_currency: str = "usd", per_page: int = 100
    ) -> APIResponse:
        """Get coins by category using predefined coin lists"""
        # Define popular coins for each category
        category_coins = {
            "defi": [
                "uniswap", "aave", "compound-governance-token", "maker", 
                "curve-dao-token", "sushiswap", "yearn-finance", "1inch",
                "pancakeswap-token", "synthetix-network-token", "compound-ether",
                "compound-usd-coin", "compound-usdt", "compound-basic-attention-token"
            ],
            "layer1": [
                "bitcoin", "ethereum", "cardano", "solana", "avalanche-2",
                "polkadot", "cosmos", "algorand", "near", "fantom",
                "elrond-erd-2", "hedera-hashgraph", "tezos", "stellar"
            ],
            "layer2": [
                "polygon", "optimism", "arbitrum", "immutable-x", "loopring",
                "matic-network", "skale", "omg", "zksync", "starknet"
            ],
            "meme": [
                "dogecoin", "shiba-inu", "pepe", "floki", "bonk", "doge",
                "baby-doge-coin", "dogelon-mars", "shiba-inu", "safe-moon"
            ],
            "gaming": [
                "axie-infinity", "the-sandbox", "decentraland", "enjincoin",
                "gala", "illuvium", "star-atlas", "splinterlands", "alien-worlds",
                "my-neighbor-alice", "crypto-blades", "mobox"
            ],
            "stablecoin": [
                "tether", "usd-coin", "dai", "binance-usd", "true-usd",
                "frax", "liquity-usd", "magic-internet-money", "fei-usd",
                "reserve-rights-token", "neutrino-usd", "stasis-eurs"
            ]
        }
        
        coin_ids = category_coins.get(category, [])
        if not coin_ids:
            # For unknown categories, return top coins
            return await self.get_coin_market_data(
                coin_ids=[],
                vs_currency=vs_currency,
                order="market_cap_desc",
                per_page=per_page
            )
        
        # Get market data for category-specific coins
        return await self.get_coin_market_data(
            coin_ids=coin_ids[:per_page],
            vs_currency=vs_currency,
            order="market_cap_desc",
            per_page=per_page
        )

    async def get_trending_coins_detailed(
        self, vs_currency: str = "usd"
    ) -> APIResponse:
        """Get detailed trending coins data"""
        # Get trending coins
        trending_response = await self.get_trending_coins()
        if not trending_response.success:
            return trending_response
        
        # Extract coin IDs from trending response
        trending_data = trending_response.data or {}
        trending_coins = trending_data.get("coins", [])
        coin_ids = [coin["item"]["id"] for coin in trending_coins[:50]]
        
        if not coin_ids:
            return APIResponse(success=False, error="No trending coins found")
        
        # Get detailed market data for trending coins
        return await self.get_coin_market_data(
            coin_ids=coin_ids,
            vs_currency=vs_currency,
            order="market_cap_desc",
            per_page=len(coin_ids)
        )

    async def get_top_coins(
        self, vs_currency: str = "usd", per_page: int = 100
    ) -> APIResponse:
        """Get top coins by market cap"""
        return await self.get_coin_market_data(
            coin_ids=[],
            vs_currency=vs_currency,
            order="market_cap_desc",
            per_page=per_page
        )
