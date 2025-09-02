"""
PriceHistory model as TimescaleDB hypertable for time-series price data
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class PriceHistory(Base):
    """PriceHistory model - TimescaleDB hypertable"""
    __tablename__ = "price_history"

    id = Column(String, primary_key=True, default=generate_uuid)
    crypto_asset_id = Column(String, ForeignKey("crypto_assets.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    price_usd = Column(Float, nullable=False)
    volume_24h = Column(Float, nullable=True)
    market_cap = Column(Float, nullable=True)
    price_change_24h = Column(Float, nullable=True)
    price_change_percentage_24h = Column(Float, nullable=True)
    high_24h = Column(Float, nullable=True)
    low_24h = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    crypto_asset = relationship("CryptoAsset", back_populates="price_history")

    # Indexes for TimescaleDB optimization
    __table_args__ = (
        Index('idx_price_history_crypto_timestamp', 'crypto_asset_id', 'timestamp'),
        Index('idx_price_history_timestamp', 'timestamp'),
        Index('idx_price_history_crypto_asset', 'crypto_asset_id'),
    )

    def __repr__(self):
        return f"<PriceHistory(id={self.id}, crypto_asset_id={self.crypto_asset_id}, timestamp={self.timestamp})>"
