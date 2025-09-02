"""
Configuration settings for the Crypto Risk Dashboard
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import validator


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
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Database - Support both local and containerized deployment
    DATABASE_URL: Optional[str] = None
    POSTGRES_SERVER: str = "localhost"  # Default for local development
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "crypto_risk_db"
    POSTGRES_PORT: str = "5432"
    
    # Redis - Support both local and containerized deployment
    REDIS_URL: Optional[str] = None
    REDIS_SERVER: str = "localhost"  # Default for local development
    REDIS_PORT: str = "6379"
    
    # Docker environment flag
    DOCKER_ENV: bool = False
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # AI/OpenAI
    OPENAI_API_KEY: Optional[str] = None
    
    # External APIs
    COINGECKO_API_URL: str = (
        "https://api.coingecko.com/api/v3"
    )
    YAHOO_FINANCE_API_URL: str = (
        "https://query1.finance.yahoo.com"
    )
    
    # TimescaleDB
    TIMESCALE_ENABLED: bool = True
    TIMESCALE_CHUNK_TIME_INTERVAL: str = (
        "1 day"
    )
    
    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        
        # Use Docker service names when running in containers
        server = values.get('POSTGRES_SERVER', 'localhost')
        if values.get('DOCKER_ENV', False):
            server = 'postgres'  # Docker service name
        
        user = values.get('POSTGRES_USER', 'postgres')
        password = values.get('POSTGRES_PASSWORD', 'password')
        port = values.get('POSTGRES_PORT', '5432')
        db = values.get('POSTGRES_DB', 'crypto_risk_db')
        
        return f"postgresql://{user}:{password}@{server}:{port}/{db}"
    
    @validator("REDIS_URL", pre=True)
    def assemble_redis_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        
        # Use Docker service names when running in containers
        server = values.get('REDIS_SERVER', 'localhost')
        if values.get('DOCKER_ENV', False):
            server = 'redis'  # Docker service name
        
        port = values.get('REDIS_PORT', '6379')
        return f"redis://{server}:{port}"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()
