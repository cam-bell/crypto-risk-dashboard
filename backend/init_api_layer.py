#!/usr/bin/env python3
"""
API Integration Layer Initialization Script

This script initializes and tests all components of the API integration layer:
- Redis cache connection
- API client health checks
- Background task setup
- Cache population with initial data
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from app.cache.redis_cache import cache
from app.api_clients.integration_service import integration_service
from app.background_tasks.celery_app import get_celery_app

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def test_redis_connection():
    """Test Redis cache connection"""
    logger.info("Testing Redis connection...")
    
    try:
        await cache.connect()
        stats = await cache.get_cache_stats()
        logger.info(f"Redis connection successful: {stats}")
        return True
    except Exception as e:
        logger.error(f"Redis connection failed: {e}")
        return False


async def test_api_clients():
    """Test all API client connections"""
    logger.info("Testing API client connections...")
    
    try:
        health_results = await integration_service.health_check_all_apis()
        
        if health_results["success"]:
            logger.info("API health check results:")
            for api_name, status in health_results["data"].items():
                logger.info(f"  {api_name}: {status['status']}")
            return True
        else:
            logger.error(f"API health check failed: {health_results['error']}")
            return False
            
    except Exception as e:
        logger.error(f"API client test failed: {e}")
        return False


async def test_cache_functionality():
    """Test cache functionality"""
    logger.info("Testing cache functionality...")
    
    try:
        # Test basic cache operations
        test_key = "test:cache:key"
        test_data = {"test": "data", "timestamp": "2024-01-01T00:00:00Z"}
        
        # Set cache
        success = await cache.set(test_key, test_data, ttl=60)
        if not success:
            logger.error("Failed to set cache")
            return False
        
        # Get cache
        retrieved_data = await cache.get(test_key)
        if retrieved_data != test_data:
            logger.error("Cache data mismatch")
            return False
        
        # Check TTL
        ttl = await cache.ttl(test_key)
        if ttl <= 0:
            logger.error("Cache TTL not working")
            return False
        
        # Delete cache
        await cache.delete(test_key)
        
        logger.info("Cache functionality test passed")
        return True
        
    except Exception as e:
        logger.error(f"Cache test failed: {e}")
        return False


async def populate_initial_cache():
    """Populate cache with initial data"""
    logger.info("Populating cache with initial data...")
    
    try:
        # Get some initial crypto data
        crypto_ids = ["bitcoin", "ethereum"]
        
        overview = await integration_service.get_crypto_overview(crypto_ids)
        if overview["success"]:
            logger.info("Successfully populated cache with initial crypto data")
        else:
            logger.warning("Failed to populate cache with crypto data")
        
        # Get global market data
        try:
            from app.api_clients.coingecko_client import CoinGeckoClient
            async with CoinGeckoClient() as client:
                global_data = await client.get_global_market_data()
                if global_data.success:
                    await cache.cache_api_response(
                        "coingecko", "global", {}, global_data.data
                    )
                    logger.info("Successfully cached global market data")
        except Exception as e:
            logger.warning(f"Failed to cache global market data: {e}")
        
        return True
        
    except Exception as e:
        logger.error(f"Cache population failed: {e}")
        return False


async def test_background_tasks():
    """Test background task setup"""
    logger.info("Testing background task setup...")
    
    try:
        # Get Celery app
        celery_app = get_celery_app()
        
        # Check Celery configuration
        if celery_app.conf.broker_url:
            logger.info(f"Celery broker configured: {celery_app.conf.broker_url}")
        else:
            logger.warning("Celery broker not configured")
        
        # Check beat schedule
        if celery_app.conf.beat_schedule:
            logger.info("Celery beat schedule configured:")
            for task_name, task_config in celery_app.conf.beat_schedule.items():
                logger.info(f"  {task_name}: {task_config['schedule']}s")
        else:
            logger.warning("Celery beat schedule not configured")
        
        return True
        
    except Exception as e:
        logger.error(f"Background task test failed: {e}")
        return False


async def run_initialization():
    """Run the complete initialization process"""
    logger.info("Starting API Integration Layer initialization...")
    
    results = {}
    
    # Test Redis connection
    results["redis"] = await test_redis_connection()
    
    # Test API clients
    results["api_clients"] = await test_api_clients()
    
    # Test cache functionality
    results["cache"] = await test_cache_functionality()
    
    # Test background tasks
    results["background_tasks"] = await test_background_tasks()
    
    # Populate initial cache
    results["cache_population"] = await populate_initial_cache()
    
    # Summary
    logger.info("\n" + "="*50)
    logger.info("INITIALIZATION SUMMARY")
    logger.info("="*50)
    
    for component, status in results.items():
        status_str = "✅ PASSED" if status else "❌ FAILED"
        logger.info(f"{component.replace('_', ' ').title()}: {status_str}")
    
    # Overall status
    all_passed = all(results.values())
    if all_passed:
        logger.info("\n🎉 All components initialized successfully!")
        logger.info("API Integration Layer is ready to use.")
    else:
        logger.error("\n⚠️  Some components failed to initialize.")
        logger.error("Please check the logs above and fix any issues.")
    
    return all_passed


async def cleanup():
    """Cleanup resources"""
    logger.info("Cleaning up resources...")
    
    try:
        await cache.disconnect()
        await integration_service.close()
        logger.info("Cleanup completed")
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")


def main():
    """Main entry point"""
    try:
        # Run initialization
        success = asyncio.run(run_initialization())
        
        if success:
            logger.info("\n🚀 API Integration Layer initialization completed successfully!")
            logger.info("You can now start using the API clients and background tasks.")
        else:
            logger.error("\n💥 API Integration Layer initialization failed!")
            logger.error("Please review the errors above and try again.")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("\n⏹️  Initialization interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n💥 Unexpected error during initialization: {e}")
        sys.exit(1)
    finally:
        # Cleanup
        asyncio.run(cleanup())


if __name__ == "__main__":
    main()
