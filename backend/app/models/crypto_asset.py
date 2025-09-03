"""
CryptoAsset model for cryptocurrency information
"""

from sqlalchemy import Column, String, Float, Boolean, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class CryptoAsset(Base):
    """CryptoAsset model"""

    __tablename__ = "crypto_assets"

    id = Column(String, primary_key=True, default=generate_uuid)
    symbol = Column(String(20), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    coingecko_id = Column(String(100), unique=True, nullable=True, index=True)
    contract_address = Column(String(255), nullable=True)
    blockchain = Column(String(50), nullable=True)
    decimals = Column(Float, nullable=True)
    market_cap = Column(Float, nullable=True)
    circulating_supply = Column(Float, nullable=True)
    total_supply = Column(Float, nullable=True)
    max_supply = Column(Float, nullable=True)
    current_price_usd = Column(Float, nullable=True)
    price_change_24h = Column(Float, nullable=True)
    price_change_percentage_24h = Column(Float, nullable=True)
    volume_24h = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    logo_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    website_url = Column(String(500), nullable=True)
    whitepaper_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    twitter_url = Column(String(500), nullable=True)
    reddit_url = Column(String(500), nullable=True)
    telegram_url = Column(String(500), nullable=True)
    discord_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    portfolio_holdings = relationship("PortfolioHolding", back_populates="crypto_asset")
    price_history = relationship("PriceHistory", back_populates="crypto_asset")
    risk_metrics = relationship("RiskMetric", back_populates="crypto_asset")

    def __repr__(self):
        return f"<CryptoAsset(id={self.id}, symbol={self.symbol}, name={self.name})>"
