"""
Background tasks for risk calculations using Celery
"""

from typing import List
from celery import Celery
from sqlalchemy.orm import Session
import pandas as pd

from app.db.session import get_db
from app.utils.risk_calculator import PortfolioRiskCalculator, AssetRiskCalculator
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.models.price_history import PriceHistory
from app.models.portfolio_risk_metric import PortfolioRiskMetric
from app.models.risk_metrics import RiskMetric

# Import Celery app
from app.background_tasks.celery_app import celery_app
