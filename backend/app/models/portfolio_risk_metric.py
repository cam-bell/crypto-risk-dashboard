"""
PortfolioRiskMetric model for portfolio-level risk metrics
"""
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class PortfolioRiskMetric(Base):
    """PortfolioRiskMetric model"""
    __tablename__ = "portfolio_risk_metrics"

    id = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=False, index=True)
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    
    # Portfolio risk metrics
    total_value_usd = Column(Float, nullable=False)
    total_invested_usd = Column(Float, nullable=False)
    total_profit_loss_usd = Column(Float, nullable=False)
    total_profit_loss_percentage = Column(Float, nullable=False)
    
    # Risk metrics
    volatility = Column(Float, nullable=True)
    var_95 = Column(Float, nullable=True)  # Value at Risk 95%
    var_99 = Column(Float, nullable=True)  # Value at Risk 99%
    expected_shortfall = Column(Float, nullable=True)
    sharpe_ratio = Column(Float, nullable=True)
    sortino_ratio = Column(Float, nullable=True)
    max_drawdown = Column(Float, nullable=True)
    beta = Column(Float, nullable=True)
    
    # Diversification metrics
    herfindahl_index = Column(Float, nullable=True)
    effective_n = Column(Float, nullable=True)
    correlation_matrix = Column(String, nullable=True)  # JSON string
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    portfolio = relationship("Portfolio", back_populates="risk_metrics")

    # Indexes for optimization
    __table_args__ = (
        Index('idx_portfolio_risk_metrics_portfolio_timestamp', 'portfolio_id', 'timestamp'),
        Index('idx_portfolio_risk_metrics_timestamp', 'timestamp'),
    )

    def __repr__(self):
        return f"<PortfolioRiskMetric(id={self.id}, portfolio_id={self.portfolio_id})>"
