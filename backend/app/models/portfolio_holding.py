"""
PortfolioHolding model for individual crypto holdings in portfolios
"""

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class PortfolioHolding(Base):
    """PortfolioHolding model"""

    __tablename__ = "portfolio_holdings"

    id = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id = Column(
        String, ForeignKey("portfolios.id"), nullable=False, index=True
    )
    crypto_asset_id = Column(
        String, ForeignKey("crypto_assets.id"), nullable=False, index=True
    )
    quantity = Column(Float, nullable=False)
    average_buy_price_usd = Column(Float, nullable=False)
    total_invested_usd = Column(Float, nullable=False)
    current_value_usd = Column(Float, nullable=False)
    profit_loss_usd = Column(Float, nullable=False)
    profit_loss_percentage = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    portfolio = relationship("Portfolio", back_populates="holdings")
    crypto_asset = relationship("CryptoAsset", back_populates="portfolio_holdings")

    def __repr__(self):
        return f"<PortfolioHolding(id={self.id}, portfolio_id={self.portfolio_id}, crypto_asset_id={self.crypto_asset_id})>"
