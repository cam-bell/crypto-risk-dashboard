from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class CryptoAssetResponse(BaseModel):
    """Response schema for cryptocurrency asset data"""
    
    id: str = Field(..., description="Unique identifier for the crypto asset")
    symbol: str = Field(..., description="Ticker symbol (e.g., BTC, ETH)")
    name: str = Field(..., description="Full name of the cryptocurrency")
    coingecko_id: Optional[str] = Field(None, description="CoinGecko identifier")
    contract_address: Optional[str] = Field(None, description="Smart contract address")
    blockchain: Optional[str] = Field(None, description="Blockchain network")
    decimals: Optional[float] = Field(None, description="Token decimals")
    market_cap: Optional[float] = Field(None, description="Market capitalization in USD")
    circulating_supply: Optional[float] = Field(None, description="Circulating supply")
    total_supply: Optional[float] = Field(None, description="Total supply")
    max_supply: Optional[float] = Field(None, description="Maximum supply")
    current_price_usd: Optional[float] = Field(None, description="Current price in USD")
    price_change_24h: Optional[float] = Field(None, description="24h price change in USD")
    price_change_percentage_24h: Optional[float] = Field(None, description="24h price change percentage")
    volume_24h: Optional[float] = Field(None, description="24h trading volume in USD")
    is_active: bool = Field(True, description="Whether the asset is active")
    logo_url: Optional[str] = Field(None, description="URL to the asset logo")
    description: Optional[str] = Field(None, description="Asset description")
    website_url: Optional[str] = Field(None, description="Official website URL")
    whitepaper_url: Optional[str] = Field(None, description="Whitepaper URL")
    github_url: Optional[str] = Field(None, description="GitHub repository URL")
    twitter_url: Optional[str] = Field(None, description="Twitter profile URL")
    reddit_url: Optional[str] = Field(None, description="Reddit community URL")
    telegram_url: Optional[str] = Field(None, description="Telegram group URL")
    discord_url: Optional[str] = Field(None, description="Discord server URL")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True

class CryptoAssetListResponse(BaseModel):
    """Response schema for paginated list of crypto assets"""
    
    assets: List[CryptoAssetResponse] = Field(..., description="List of cryptocurrency assets")
    total: int = Field(..., description="Total number of assets")
    page: int = Field(..., description="Current page number")
    page_size: int = Field(..., description="Number of assets per page")

class CryptoAssetCreate(BaseModel):
    """Schema for creating a new crypto asset"""
    
    symbol: str = Field(..., description="Ticker symbol")
    name: str = Field(..., description="Full name")
    coingecko_id: Optional[str] = Field(None, description="CoinGecko identifier")
    contract_address: Optional[str] = Field(None, description="Smart contract address")
    blockchain: Optional[str] = Field(None, description="Blockchain network")
    decimals: Optional[float] = Field(None, description="Token decimals")
    logo_url: Optional[str] = Field(None, description="Logo URL")
    description: Optional[str] = Field(None, description="Description")
    website_url: Optional[str] = Field(None, description="Website URL")

class CryptoAssetUpdate(BaseModel):
    """Schema for updating a crypto asset"""
    
    symbol: Optional[str] = Field(None, description="Ticker symbol")
    name: Optional[str] = Field(None, description="Full name")
    coingecko_id: Optional[str] = Field(None, description="CoinGecko identifier")
    contract_address: Optional[str] = Field(None, description="Smart contract address")
    blockchain: Optional[str] = Field(None, description="Blockchain network")
    decimals: Optional[float] = Field(None, description="Token decimals")
    market_cap: Optional[float] = Field(None, description="Market capitalization")
    circulating_supply: Optional[float] = Field(None, description="Circulating supply")
    total_supply: Optional[float] = Field(None, description="Total supply")
    max_supply: Optional[float] = Field(None, description="Maximum supply")
    current_price_usd: Optional[float] = Field(None, description="Current price")
    price_change_24h: Optional[float] = Field(None, description="24h price change")
    price_change_percentage_24h: Optional[float] = Field(None, description="24h price change percentage")
    volume_24h: Optional[float] = Field(None, description="24h volume")
    is_active: Optional[bool] = Field(None, description="Active status")
    logo_url: Optional[str] = Field(None, description="Logo URL")
    description: Optional[str] = Field(None, description="Description")
    website_url: Optional[str] = Field(None, description="Website URL")
    whitepaper_url: Optional[str] = Field(None, description="Whitepaper URL")
    github_url: Optional[str] = Field(None, description="GitHub URL")
    twitter_url: Optional[str] = Field(None, description="Twitter URL")
    reddit_url: Optional[str] = Field(None, description="Reddit URL")
    telegram_url: Optional[str] = Field(None, description="Telegram URL")
    discord_url: Optional[str] = Field(None, description="Discord URL")

class CryptoAssetSearchRequest(BaseModel):
    """Schema for crypto asset search request"""
    
    query: str = Field(..., description="Search query")
    category: Optional[str] = Field(None, description="Category filter")
    market_cap_min: Optional[float] = Field(None, description="Minimum market cap")
    market_cap_max: Optional[float] = Field(None, description="Maximum market cap")
    limit: int = Field(20, description="Maximum results")
    offset: int = Field(0, description="Results offset")

class CryptoAssetSearchResponse(BaseModel):
    """Schema for crypto asset search response"""
    
    assets: List[CryptoAssetResponse] = Field(..., description="Search results")
    total: int = Field(..., description="Total matching results")
    query: str = Field(..., description="Original search query")
    filters: dict = Field(..., description="Applied filters")
