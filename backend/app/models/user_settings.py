"""
UserSettings model for user preferences and configurations
"""
from sqlalchemy import Column, String, Boolean, JSON, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.base import Base
import uuid


def generate_uuid():
    """Generate UUID for primary keys"""
    return str(uuid.uuid4())


class UserSettings(Base):
    """UserSettings model"""
    __tablename__ = "user_settings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True, index=True)
    
    # Notification preferences
    email_notifications = Column(Boolean, default=True, nullable=False)
    push_notifications = Column(Boolean, default=True, nullable=False)
    sms_notifications = Column(Boolean, default=False, nullable=False)
    
    # Alert preferences
    price_alerts = Column(Boolean, default=True, nullable=False)
    risk_alerts = Column(Boolean, default=True, nullable=False)
    portfolio_alerts = Column(Boolean, default=True, nullable=False)
    
    # Risk tolerance
    risk_tolerance = Column(String(20), default="medium", nullable=False)  # low, medium, high
    max_portfolio_risk = Column(String(20), default="medium", nullable=False)
    
    # Display preferences
    default_currency = Column(String(3), default="USD", nullable=False)
    timezone = Column(String(50), default="UTC", nullable=False)
    theme = Column(String(20), default="light", nullable=False)  # light, dark, auto
    
    # Trading preferences
    auto_rebalancing = Column(Boolean, default=False, nullable=False)
    stop_loss_enabled = Column(Boolean, default=False, nullable=False)
    take_profit_enabled = Column(Boolean, default=False, nullable=False)
    
    # Custom settings
    custom_settings = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="user_settings")

    def __repr__(self):
        return f"<UserSettings(id={self.id}, user_id={self.user_id})>"
