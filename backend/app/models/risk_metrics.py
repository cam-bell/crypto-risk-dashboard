"""
RiskMetric model as TimescaleDB hypertable for time-series risk data
"""

from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class RiskMetric(Base):
    """RiskMetric model - TimescaleDB hypertable"""

    __tablename__ = "risk_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    crypto_asset_id = Column(String, ForeignKey("crypto_assets.id"), nullable=True)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)

    # Risk metrics
    volatility = Column(Float, nullable=True)
    var_95 = Column(Float, nullable=True)  # Value at Risk 95%
    var_99 = Column(Float, nullable=True)  # Value at Risk 99%
    expected_shortfall = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    sortino_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    beta = Column(Float, nullable=True)
    correlation_sp500 = Column(Float, nullable=True)
    correlation_btc = Column(Float, nullable=True)

    # Additional metrics
    skewness = Column(Float, nullable=True)
    kurtosis = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    crypto_asset = relationship("CryptoAsset", back_populates="risk_metrics")

    # Indexes for TimescaleDB optimization
    __table_args__ = (
        Index("idx_risk_metrics_timestamp", "timestamp"),
        Index("idx_risk_metrics_crypto_timestamp", "crypto_asset_id", "timestamp"),
        Index("idx_risk_metrics_portfolio_timestamp", "portfolio_id", "timestamp"),
    )

    def __repr__(self):
        return f"<RiskMetric(id={self.id}, timestamp={self.timestamp})>"
