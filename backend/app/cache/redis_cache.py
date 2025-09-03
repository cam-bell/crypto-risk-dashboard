import json
import logging
from typing import Any, Optional
import aioredis
from app.core.api_config import api_config

logger = logging.getLogger(__name__)


class RedisCache:
    """Redis caching layer for API responses"""
    
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.default_ttl = api_config.cache_ttl
        self.max_size = api_config.cache_max_size
    
    async def connect(self):
        """Connect to Redis"""
        try:
            self.redis = await aioredis.from_url(
                api_config.redis_url,
                db=api_config.redis_db,
                password=api_config.redis_password,
                encoding="utf-8",
                decode_responses=True
            )
            logger.info("Connected to Redis cache")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.redis = None
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            self.redis = None
            logger.info("Disconnected from Redis cache")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not self.redis:
            return None
        
        try:
            value = await self.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting from cache: {e}")
            return None
    
    async def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """Set value in cache with TTL"""
        if not self.redis:
            return False
        
        try:
            ttl = ttl or self.default_ttl
            serialized_value = json.dumps(value, default=str)
            await self.redis.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"Error setting cache: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.redis:
            return False
        
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"Error deleting from cache: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if key exists in cache"""
        if not self.redis:
            return False
        
        try:
            return await self.redis.exists(key) > 0
        except Exception as e:
            logger.error(f"Error checking cache existence: {e}")
            return False
    
    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for a key"""
        if not self.redis:
            return False
        
        try:
            return await self.redis.expire(key, ttl)
        except Exception as e:
            logger.error(f"Error setting expiration: {e}")
            return False
    
    async def ttl(self, key: str) -> int:
        """Get TTL for a key"""
        if not self.redis:
            return -1
        
        try:
            return await self.redis.ttl(key)
        except Exception as e:
            logger.error(f"Error getting TTL: {e}")
            return -1
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching a pattern"""
        if not self.redis:
            return 0
        
        try:
            keys = await self.redis.keys(pattern)
            if keys:
                return await self.redis.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Error clearing pattern: {e}")
            return 0
    
    async def get_cache_stats(self) -> dict:
        """Get cache statistics"""
        if not self.redis:
            return {"status": "disconnected"}
        
        try:
            info = await self.redis.info()
            return {
                "status": "connected",
                "used_memory": info.get("used_memory_human", "N/A"),
                "connected_clients": info.get("connected_clients", 0),
                "total_commands_processed": info.get(
                    "total_commands_processed", 0
                ),
                "keyspace_hits": info.get("keyspace_hits", 0),
                "keyspace_misses": info.get("keyspace_misses", 0)
            }
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {"status": "error", "error": str(e)}
    
    def generate_key(self, prefix: str, *args) -> str:
        """Generate cache key from prefix and arguments"""
        key_parts = [prefix] + [str(arg) for arg in args]
        return ":".join(key_parts)
    
    async def cache_api_response(
        self, 
        api_name: str, 
        endpoint: str, 
        params: dict, 
        response: Any, 
        ttl: Optional[int] = None
    ) -> bool:
        """Cache API response with standardized key format"""
        cache_key = self.generate_key(
            "api", 
            api_name, 
            endpoint, 
            json.dumps(params, sort_keys=True)
        )
        return await self.set(cache_key, response, ttl)
    
    async def get_cached_api_response(
        self, 
        api_name: str, 
        endpoint: str, 
        params: dict
    ) -> Optional[Any]:
        """Get cached API response"""
        cache_key = self.generate_key(
            "api", 
            api_name, 
            endpoint, 
            json.dumps(params, sort_keys=True)
        )
        return await self.get(cache_key)
    
    async def invalidate_api_cache(self, api_name: str, endpoint: str = None):
        """Invalidate cache for specific API or endpoint"""
        if endpoint:
            pattern = f"api:{api_name}:{endpoint}:*"
        else:
            pattern = f"api:{api_name}:*"
        
        cleared = await self.clear_pattern(pattern)
        logger.info(f"Cleared {cleared} cache entries for {pattern}")


# Global cache instance
cache = RedisCache()
