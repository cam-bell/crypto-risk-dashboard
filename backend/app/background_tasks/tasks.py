import logging
import asyncio
from typing import List, Dict, Any
from celery import shared_task
from app.api_clients.coingecko_client import CoinGeckoClient
from app.api_clients.etherscan_client import EtherscanClient
from app.api_clients.alphavantage_client import AlphaVantageClient
from app.cache.redis_cache import cache
from app.core.api_config import api_config

logger = logging.getLogger(__name__)


@shared_task
def fetch_crypto_prices():
    """Fetch cryptocurrency prices from CoinGecko"""
    try:
        logger.info("Starting crypto price fetch task")
        
        # List of major cryptocurrencies to fetch
        crypto_ids = [
            "bitcoin", "ethereum", "binancecoin", "cardano", 
            "solana", "ripple", "polkadot", "dogecoin"
        ]
        
        # Run async function in sync context
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(_fetch_crypto_prices_async(crypto_ids))
            logger.info(f"Successfully fetched prices for {len(result)} cryptocurrencies")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in fetch_crypto_prices task: {e}")
        raise


async def _fetch_crypto_prices_async(crypto_ids: List[str]) -> List[Dict[str, Any]]:
    """Async function to fetch crypto prices"""
    async with CoinGeckoClient() as client:
        # Check cache first
        cached_data = await cache.get_cached_api_response(
            "coingecko", "simple/price", {"ids": crypto_ids, "vs_currencies": ["usd"]}
        )
        
        if cached_data:
            logger.info("Using cached crypto price data")
            return cached_data
        
        # Fetch fresh data
        response = await client.get_coin_price(crypto_ids, ["usd"])
        
        if response.success:
            # Cache the response
            await cache.cache_api_response(
                "coingecko", "simple/price", 
                {"ids": crypto_ids, "vs_currencies": ["usd"]}, 
                response.data
            )
            return response.data
        else:
            logger.error(f"Failed to fetch crypto prices: {response.error}")
            return []


@shared_task
def fetch_market_data():
    """Fetch market data from multiple sources"""
    try:
        logger.info("Starting market data fetch task")
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(_fetch_market_data_async())
            logger.info("Successfully fetched market data")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in fetch_market_data task: {e}")
        raise


async def _fetch_market_data_async() -> Dict[str, Any]:
    """Async function to fetch market data"""
    results = {}
    
    # Fetch from CoinGecko
    try:
        async with CoinGeckoClient() as client:
            global_data = await client.get_global_market_data()
            if global_data.success:
                results["coingecko_global"] = global_data.data
                await cache.cache_api_response(
                    "coingecko", "global", {}, global_data.data
                )
    except Exception as e:
        logger.error(f"Error fetching CoinGecko global data: {e}")
    
    # Fetch from Alpha Vantage
    try:
        async with AlphaVantageClient() as client:
            sector_data = await client.get_sector_performance()
            if sector_data.success:
                results["alphavantage_sector"] = sector_data.data
                await cache.cache_api_response(
                    "alphavantage", "SECTOR", {}, sector_data.data
                )
    except Exception as e:
        logger.error(f"Error fetching Alpha Vantage sector data: {e}")
    
    return results


@shared_task
def fetch_wallet_analysis():
    """Fetch wallet analysis data from Etherscan"""
    try:
        logger.info("Starting wallet analysis task")
        
        # List of wallets to analyze (example addresses)
        wallet_addresses = [
            "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",  # Example
            "0x1234567890123456789012345678901234567890"   # Example
        ]
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(_fetch_wallet_analysis_async(wallet_addresses))
            logger.info(f"Successfully analyzed {len(result)} wallets")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in fetch_wallet_analysis task: {e}")
        raise


async def _fetch_wallet_analysis_async(wallet_addresses: List[str]) -> List[Dict[str, Any]]:
    """Async function to analyze wallets"""
    results = []
    
    async with EtherscanClient() as client:
        for address in wallet_addresses:
            try:
                wallet_data = {}
                
                # Get balance
                balance_response = await client.get_account_balance(address)
                if balance_response.success:
                    wallet_data["balance"] = balance_response.data
                
                # Get transactions (last 100)
                tx_response = await client.get_account_transactions(address, offset=100)
                if tx_response.success:
                    wallet_data["transactions"] = tx_response.data
                
                # Get token transfers
                token_response = await client.get_erc20_token_transfers(address, offset=100)
                if token_response.success:
                    wallet_data["token_transfers"] = token_response.data
                
                # Cache wallet data
                await cache.cache_api_response(
                    "etherscan", "wallet_analysis", {"address": address}, wallet_data
                )
                
                results.append({
                    "address": address,
                    "data": wallet_data
                })
                
            except Exception as e:
                logger.error(f"Error analyzing wallet {address}: {e}")
                continue
    
    return results


@shared_task
def cleanup_cache():
    """Clean up expired cache entries and optimize cache"""
    try:
        logger.info("Starting cache cleanup task")
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(_cleanup_cache_async())
            logger.info("Cache cleanup completed")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in cleanup_cache task: {e}")
        raise


async def _cleanup_cache_async() -> Dict[str, Any]:
    """Async function to cleanup cache"""
    try:
        # Get cache stats before cleanup
        stats_before = await cache.get_cache_stats()
        
        # Clear expired entries (Redis handles this automatically)
        # But we can clear old API responses
        cleared_coingecko = await cache.invalidate_api_cache("coingecko")
        cleared_etherscan = await cache.invalidate_api_cache("etherscan")
        cleared_alphavantage = await cache.invalidate_api_cache("alphavantage")
        
        # Get cache stats after cleanup
        stats_after = await cache.get_cache_stats()
        
        return {
            "cleared_entries": {
                "coingecko": cleared_coingecko,
                "etherscan": cleared_etherscan,
                "alphavantage": cleared_alphavantage
            },
            "stats_before": stats_before,
            "stats_after": stats_after
        }
        
    except Exception as e:
        logger.error(f"Error in cache cleanup: {e}")
        return {"error": str(e)}


@shared_task
def health_check_apis():
    """Check health of all external APIs"""
    try:
        logger.info("Starting API health check task")
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(_health_check_apis_async())
            logger.info("API health check completed")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in health_check_apis task: {e}")
        raise


async def _health_check_apis_async() -> Dict[str, Any]:
    """Async function to check API health"""
    results = {}
    
    # Check CoinGecko
    try:
        async with CoinGeckoClient() as client:
            health_response = await client.health_check()
            results["coingecko"] = {
                "status": "healthy" if health_response.success else "unhealthy",
                "response_time": health_response.status_code,
                "error": health_response.error
            }
    except Exception as e:
        results["coingecko"] = {"status": "error", "error": str(e)}
    
    # Check Etherscan
    try:
        async with EtherscanClient() as client:
            health_response = await client.health_check()
            results["etherscan"] = {
                "status": "healthy" if health_response.success else "unhealthy",
                "response_time": health_response.status_code,
                "error": health_response.error
            }
    except Exception as e:
        results["etherscan"] = {"status": "error", "error": str(e)}
    
    # Check Alpha Vantage
    try:
        async with AlphaVantageClient() as client:
            health_response = await client.health_check()
            results["alphavantage"] = {
                "status": "healthy" if health_response.success else "unhealthy",
                "response_time": health_response.status_code,
                "error": health_response.error
            }
    except Exception as e:
        results["alphavantage"] = {"status": "error", "error": str(e)}
    
    # Cache health check results
    await cache.cache_api_response(
        "system", "health_check", {}, results, ttl=300
    )
    
    return results


@shared_task
def fetch_specific_crypto_data(crypto_id: str, data_type: str = "price"):
    """Fetch specific cryptocurrency data"""
    try:
        logger.info(f"Starting specific crypto data fetch for {crypto_id}")
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            result = loop.run_until_complete(_fetch_specific_crypto_data_async(crypto_id, data_type))
            logger.info(f"Successfully fetched {data_type} data for {crypto_id}")
            return result
        finally:
            loop.close()
            
    except Exception as e:
        logger.error(f"Error in fetch_specific_crypto_data task: {e}")
        raise


async def _fetch_specific_crypto_data_async(crypto_id: str, data_type: str) -> Dict[str, Any]:
    """Async function to fetch specific crypto data"""
    async with CoinGeckoClient() as client:
        if data_type == "price":
            response = await client.get_coin_price(crypto_id, ["usd"])
        elif data_type == "detail":
            response = await client.get_coin_detail(crypto_id)
        elif data_type == "history":
            response = await client.get_coin_price_history(crypto_id, days=30)
        else:
            return {"error": f"Unknown data type: {data_type}"}
        
        if response.success:
            # Cache the response
            await cache.cache_api_response(
                "coingecko", f"{data_type}", {"id": crypto_id}, response.data
            )
            return response.data
        else:
            return {"error": response.error}
