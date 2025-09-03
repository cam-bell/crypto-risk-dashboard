"""
Portfolio model for user portfolio management
"""

from sqlalchemy import Column, String, Float, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class Portfolio(Base):
    """Portfolio model"""

    __tablename__ = "portfolios"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_default = Column(Boolean, default=False, nullable=False)
    is_public = Column(Boolean, default=False, nullable=False)
    total_value_usd = Column(Float, default=0.0, nullable=False)
    total_invested_usd = Column(Float, default=0.0, nullable=False)
    total_profit_loss_usd = Column(Float, default=0.0, nullable=False)
    total_profit_loss_percentage = Column(Float, default=0.0, nullable=False)
    risk_score = Column(Float, nullable=True)
    volatility = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="portfolios")
    holdings = relationship(
        "PortfolioHolding", back_populates="portfolio", cascade="all, delete-orphan"
    )
    risk_metrics = relationship(
        "PortfolioRiskMetric", back_populates="portfolio", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Portfolio(id={self.id}, name={self.name}, user_id={self.user_id})>"
