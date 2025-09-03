import logging
from typing import Dict, List, Any, Optional
from app.api_clients.coingecko_client import CoinGeckoClient
from app.api_clients.etherscan_client import EtherscanClient
from app.api_clients.alphavantage_client import AlphaVantageClient
from app.cache.redis_cache import cache


logger = logging.getLogger(__name__)


class CryptoDataIntegrationService:
    """Main service for integrating all crypto data APIs"""

    def __init__(self):
        self.coingecko_client = CoinGeckoClient()
        self.etherscan_client = EtherscanClient()
        self.alphavantage_client = AlphaVantageClient()

    async def get_crypto_overview(self, crypto_ids: List[str]) -> Dict[str, Any]:
        """Get comprehensive crypto overview from multiple sources"""
        try:
            results = {}

            # Get CoinGecko data
            coingecko_data = await self._get_coingecko_data(crypto_ids)
            if coingecko_data:
                results["coingecko"] = coingecko_data

            # Get Alpha Vantage data for additional metrics
            alphavantage_data = await self._get_alphavantage_data(crypto_ids)
            if alphavantage_data:
                results["alphavantage"] = alphavantage_data

            return {
                "success": True,
                "data": results,
                "timestamp": self._get_current_timestamp(),
            }

        except Exception as e:
            logger.error(f"Error getting crypto overview: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": self._get_current_timestamp(),
            }

    async def get_wallet_analysis(self, wallet_address: str) -> Dict[str, Any]:
        """Get comprehensive wallet analysis"""
        try:
            # Check cache first
            cached_data = await cache.get_cached_api_response(
                "wallet_analysis", "comprehensive", {"address": wallet_address}
            )

            if cached_data:
                return {
                    "success": True,
                    "data": cached_data,
                    "cached": True,
                    "timestamp": self._get_current_timestamp(),
                }

            # Fetch fresh data
            wallet_data = await self._get_wallet_data(wallet_address)

            if wallet_data:
                # Cache the result
                await cache.cache_api_response(
                    "wallet_analysis",
                    "comprehensive",
                    {"address": wallet_address},
                    wallet_data,
                )

                return {
                    "success": True,
                    "data": wallet_data,
                    "cached": False,
                    "timestamp": self._get_current_timestamp(),
                }
            else:
                return {
                    "success": False,
                    "error": "Failed to fetch wallet data",
                    "timestamp": self._get_current_timestamp(),
                }

        except Exception as e:
            logger.error(f"Error getting wallet analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": self._get_current_timestamp(),
            }

    async def get_market_sentiment(self, symbols: List[str]) -> Dict[str, Any]:
        """Get market sentiment from multiple sources"""
        try:
            results = {}

            # Get Alpha Vantage sentiment
            for symbol in symbols:
                sentiment_data = await self._get_sentiment_data(symbol)
                if sentiment_data:
                    results[symbol] = sentiment_data

            return {
                "success": True,
                "data": results,
                "timestamp": self._get_current_timestamp(),
            }

        except Exception as e:
            logger.error(f"Error getting market sentiment: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": self._get_current_timestamp(),
            }

    async def health_check_all_apis(self) -> Dict[str, Any]:
        """Check health of all external APIs"""
        try:
            results = {}

            # Check CoinGecko
            async with self.coingecko_client as client:
                coingecko_health = await client.health_check()
                results["coingecko"] = {
                    "status": "healthy" if coingecko_health.success else "unhealthy",
                    "response_time": coingecko_health.status_code,
                    "error": coingecko_health.error,
                }

            # Check Etherscan
            async with self.etherscan_client as client:
                etherscan_health = await client.health_check()
                results["etherscan"] = {
                    "status": "healthy" if etherscan_health.success else "unhealthy",
                    "response_time": etherscan_health.status_code,
                    "error": etherscan_health.error,
                }

            # Check Alpha Vantage
            async with self.alphavantage_client as client:
                alphavantage_health = await client.health_check()
                results["alphavantage"] = {
                    "status": "healthy" if alphavantage_health.success else "unhealthy",
                    "response_time": alphavantage_health.status_code,
                    "error": alphavantage_health.error,
                }

            return {
                "success": True,
                "data": results,
                "timestamp": self._get_current_timestamp(),
            }

        except Exception as e:
            logger.error(f"Error in health check: {e}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": self._get_current_timestamp(),
            }

    async def _get_coingecko_data(
        self, crypto_ids: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Get data from CoinGecko"""
        try:
            async with self.coingecko_client as client:
                # Get prices
                price_response = await client.get_coin_price(crypto_ids, ["usd"])
                if not price_response.success:
                    return None

                # Get market data
                market_response = await client.get_coin_market_data(crypto_ids)
                if not market_response.success:
                    return None

                return {
                    "prices": price_response.data,
                    "market_data": market_response.data,
                }

        except Exception as e:
            logger.error(f"Error getting CoinGecko data: {e}")
            return None

    async def _get_alphavantage_data(
        self, crypto_ids: List[str]
    ) -> Optional[Dict[str, Any]]:
        """Get data from Alpha Vantage"""
        try:
            results = {}

            async with self.alphavantage_client as client:
                for crypto_id in crypto_ids[:5]:  # Limit to 5 due to rate limits
                    try:
                        # Get daily data
                        daily_response = await client.get_crypto_daily(crypto_id)
                        if daily_response.success:
                            results[crypto_id] = {"daily": daily_response.data}

                        # Get intraday data
                        intraday_response = await client.get_crypto_intraday(crypto_id)
                        if intraday_response.success:
                            if crypto_id not in results:
                                results[crypto_id] = {}
                            results[crypto_id]["intraday"] = intraday_response.data

                    except Exception as e:
                        logger.warning(
                            f"Error getting Alpha Vantage data for {crypto_id}: {e}"
                        )
                        continue

            return results if results else None

        except Exception as e:
            logger.error(f"Error getting Alpha Vantage data: {e}")
            return None

    async def _get_wallet_data(self, wallet_address: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive wallet data"""
        try:
            wallet_data = {}

            # Get balance
            balance_response = await self.etherscan_client.get_account_balance(
                wallet_address
            )
            if balance_response.success:
                wallet_data["balance"] = balance_response.data

            # Get transactions
            tx_response = await self.etherscan_client.get_account_transactions(
                wallet_address, offset=50
            )
            if tx_response.success:
                wallet_data["transactions"] = tx_response.data

            # Get token transfers
            token_response = await self.etherscan_client.get_erc20_token_transfers(
                wallet_address, offset=50
            )
            if token_response.success:
                wallet_data["token_transfers"] = token_response.data

            # Get NFT transfers
            nft_response = await self.etherscan_client.get_nft_transfers(
                wallet_address, offset=50
            )
            if nft_response.success:
                wallet_data["nft_transfers"] = nft_response.data

            return wallet_data if wallet_data else None

        except Exception as e:
            logger.error(f"Error getting wallet data: {e}")
            return None

    async def _get_sentiment_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get sentiment data for a symbol"""
        try:
            sentiment_response = await self.alphavantage_client.get_market_sentiment(
                symbol
            )
            if sentiment_response.success:
                return sentiment_response.data
            return None

        except Exception as e:
            logger.error(f"Error getting sentiment data for {symbol}: {e}")
            return None

    def _get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        from datetime import datetime

        return datetime.utcnow().isoformat()

    async def close(self):
        """Close all client connections"""
        try:
            await self.coingecko_client.__aexit__(None, None, None)
            await self.etherscan_client.__aexit__(None, None, None)
            await self.alphavantage_client.__aexit__(None, None, None)
        except Exception as e:
            logger.error(f"Error closing clients: {e}")


# Global service instance
integration_service = CryptoDataIntegrationService()
