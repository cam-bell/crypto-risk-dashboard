"""
AIInsight model for storing AI-generated insights and analysis
"""
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class AIInsight(Base):
    """AIInsight model"""
    __tablename__ = "ai_insights"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    portfolio_id = Column(String, ForeignKey("portfolios.id"), nullable=True, index=True)
    crypto_asset_id = Column(String, ForeignKey("crypto_assets.id"), nullable=True, index=True)
    
    # Insight details
    insight_type = Column(String(50), nullable=False, index=True)  # risk, opportunity, trend, etc.
    title = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    detailed_analysis = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)  # 0.0 to 1.0
    
    # AI model info
    model_name = Column(String(100), nullable=True)
    model_version = Column(String(50), nullable=True)
    prompt_used = Column(Text, nullable=True)
    
    # Metadata
    tags = Column(JSON, nullable=True)  # Array of tags
    risk_level = Column(String(20), nullable=True)  # low, medium, high, critical
    actionable = Column(String(5), nullable=True)  # yes, no
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User")
    portfolio = relationship("Portfolio")
    crypto_asset = relationship("CryptoAsset")

    def __repr__(self):
        return f"<AIInsight(id={self.id}, type={self.insight_type}, title={self.title})>"
