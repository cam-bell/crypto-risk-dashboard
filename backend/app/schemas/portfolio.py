"""
Pydantic schemas for portfolio API endpoints
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from .crypto_asset import CryptoAssetResponse


class PortfolioBase(BaseModel):
    """Base portfolio schema"""
    name: str = Field(..., min_length=1, max_length=100, description="Portfolio name")
    description: Optional[str] = Field(None, description="Portfolio description")
    is_default: bool = Field(False, description="Whether this is the default portfolio")
    is_public: bool = Field(False, description="Whether this portfolio is public")


class PortfolioCreate(PortfolioBase):
    """Schema for creating a portfolio"""
    user_id: str = Field(..., description="User ID who owns the portfolio")


class PortfolioUpdate(BaseModel):
    """Schema for updating a portfolio"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_default: Optional[bool] = None
    is_public: Optional[bool] = None


class PortfolioHoldingResponse(BaseModel):
    """Schema for portfolio holding response"""
    id: str
    crypto_asset_id: str
    quantity: float
    average_buy_price_usd: float
    total_invested_usd: float
    current_value_usd: float
    profit_loss_usd: float
    profit_loss_percentage: float
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    crypto_asset: Optional[CryptoAssetResponse] = None

    class Config:
        from_attributes = True


class PortfolioResponse(PortfolioBase):
    """Schema for portfolio response"""
    id: str
    user_id: str
    total_value_usd: float
    total_invested_usd: float
    total_profit_loss_usd: float
    total_profit_loss_percentage: float
    risk_score: Optional[float] = None
    volatility: Optional[float] = None
    sharpe_ratio: Optional[float] = None
    max_drawdown: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    holdings: List[PortfolioHoldingResponse] = []

    class Config:
        from_attributes = True


class PortfolioListResponse(BaseModel):
    """Schema for portfolio list response"""
    portfolios: List[PortfolioResponse]
    total: int
    page: int = 1
    page_size: int = 10


class PortfolioHoldingCreate(BaseModel):
    """Schema for creating a portfolio holding"""
    crypto_asset_id: str = Field(..., description="Crypto asset ID")
    quantity: float = Field(..., gt=0, description="Quantity of the asset")
    average_buy_price_usd: float = Field(..., gt=0, description="Average buy price in USD")
    notes: Optional[str] = Field(None, description="Notes about this holding")


class PortfolioHoldingUpdate(BaseModel):
    """Schema for updating a portfolio holding"""
    quantity: Optional[float] = Field(None, gt=0)
    average_buy_price_usd: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None
