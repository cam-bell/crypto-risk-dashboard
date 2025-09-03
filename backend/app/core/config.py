"""
Configuration settings for the Crypto Risk Dashboard
"""

from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "Crypto Risk Dashboard"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Crypto Risk Dashboard API"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS_ORIGINS string to list"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    # Database - Simple, reliable configuration
    DATABASE_URL: str = "postgresql://postgres:password@127.0.0.1:5432/crypto_risk_db"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "crypto_risk_db"
    POSTGRES_PORT: str = "5432"

    # Redis - Simple, reliable configuration
    REDIS_URL: str = "redis://127.0.0.1:6379"
    REDIS_SERVER: str = "localhost"
    REDIS_PORT: str = "6379"

    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI/OpenAI
    OPENAI_API_KEY: Optional[str] = None

    # External APIs
    COINGECKO_API_URL: str = "https://api.coingecko.com/api/v3"
    YAHOO_FINANCE_API_URL: str = "https://query1.finance.yahoo.com"

    # TimescaleDB
    TIMESCALE_ENABLED: bool = True
    TIMESCALE_CHUNK_TIME_INTERVAL: str = "1 day"

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
