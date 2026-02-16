"""
In-memory caching utilities
Simple TTL-based cache for prayer times responses
"""
from datetime import datetime, timedelta
from typing import Optional, Any, Dict
import logging

logger = logging.getLogger(__name__)


class SimpleCache:
    """Simple in-memory cache with TTL"""

    def __init__(self, default_ttl_hours: int = 24):
        """
        Initialize cache

        Args:
            default_ttl_hours: Default TTL in hours
        """
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = timedelta(hours=default_ttl_hours)

    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        if key not in self.cache:
            return None

        entry = self.cache[key]
        if datetime.now() > entry['expires_at']:
            # Expired, remove from cache
            del self.cache[key]
            logger.debug(f"Cache key expired: {key}")
            return None

        logger.debug(f"Cache hit: {key}")
        return entry['value']

    def set(self, key: str, value: Any, ttl_hours: Optional[int] = None):
        """
        Set value in cache

        Args:
            key: Cache key
            value: Value to cache
            ttl_hours: TTL in hours (uses default if not specified)
        """
        ttl = timedelta(hours=ttl_hours) if ttl_hours else self.default_ttl
        expires_at = datetime.now() + ttl

        self.cache[key] = {
            'value': value,
            'expires_at': expires_at
        }

        logger.debug(f"Cache set: {key} (expires at {expires_at})")

    def clear(self):
        """Clear all cache entries"""
        self.cache.clear()
        logger.info("Cache cleared")

    def remove(self, key: str):
        """
        Remove specific key from cache

        Args:
            key: Cache key to remove
        """
        if key in self.cache:
            del self.cache[key]
            logger.debug(f"Cache key removed: {key}")


# Global cache instance
_cache_instance = None


def get_cache() -> SimpleCache:
    """Get global cache instance"""
    global _cache_instance
    if _cache_instance is None:
        _cache_instance = SimpleCache(default_ttl_hours=24)
    return _cache_instance
