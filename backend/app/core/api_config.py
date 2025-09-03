from pydantic_settings import BaseSettings
from typing import Optional


class APIConfig(BaseSettings):
    """Configuration for external API integrations"""

    # CoinGecko API
    coingecko_api_key: Optional[str] = None
    coingecko_base_url: str = "https://api.coingecko.com/api/v3"
    coingecko_rate_limit: int = 50  # calls per minute
    coingecko_timeout: int = 30

    # Etherscan API
    etherscan_api_key: Optional[str] = None
    etherscan_base_url: str = "https://api.etherscan.io/api"
    etherscan_rate_limit: int = 5  # calls per second
    etherscan_timeout: int = 30

    # Alpha Vantage API
    alphavantage_api_key: Optional[str] = None
    alphavantage_base_url: str = "https://www.alphavantage.co/query"
    alphavantage_rate_limit: int = 5  # calls per minute for free tier
    alphavantage_timeout: int = 30

    # Redis Configuration
    redis_url: str = "redis://localhost:6379"
    redis_db: int = 0
    redis_password: Optional[str] = None

    # Cache Configuration
    cache_ttl: int = 300  # 5 minutes in seconds
    cache_max_size: int = 1000

    # Background Task Configuration
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Data Refresh Intervals (in seconds)
    price_refresh_interval: int = 300  # 5 minutes
    market_data_refresh_interval: int = 600  # 10 minutes
    wallet_analysis_refresh_interval: int = 3600  # 1 hour

    # Retry Configuration
    max_retries: int = 3
    retry_delay: int = 1  # seconds
    exponential_backoff: bool = True

    # Fallback Configuration
    enable_fallbacks: bool = True
    fallback_timeout: int = 10

    class Config:
        env_file = "../.env"
        env_prefix = ""
        extra = "ignore"


# Global API config instance
api_config = APIConfig()
