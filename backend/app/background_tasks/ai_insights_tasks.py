"""
Celery background tasks for AI insights processing
"""

import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from celery import Celery

from app.utils.ai_insights_engine import (
    AIInsightsEngine,
    PortfolioContext,
    InsightType
)
from app.utils.risk_calculator import PortfolioRiskCalculator
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.models.ai_insights import AIInsight
from app.models.user import User
from app.db.session import get_db

logger = logging.getLogger(__name__)


def get_celery_app():
    """Get Celery app instance"""
    from app.background_tasks.celery_app import celery_app
    return celery_app


celery_app = get_celery_app()


@celery_app.task(bind=True, name="ai_insights.generate_weekly_analysis")
def generate_weekly_analysis_task(self, portfolio_id: str, user_id: str):
    """
    Generate weekly portfolio risk analysis for all portfolios
    """
    try:
        logger.info(f"Starting weekly analysis for portfolio {portfolio_id}")
        
        # Get database session
        db = next(get_db())
        
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == portfolio_id
        ).first()
        
        if not portfolio:
            logger.error(f"Portfolio {portfolio_id} not found")
            return {"status": "error", "message": "Portfolio not found"}
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()
        
        if not holdings:
            logger.warning(f"Portfolio {portfolio_id} has no holdings")
            return {"status": "warning", "message": "No holdings found"}
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = risk_calculator.calculate_portfolio_risk_metrics(
            portfolio, holdings
        )
        
        # Create portfolio context
        portfolio_context = PortfolioContext(
            portfolio=portfolio,
            holdings=holdings,
            risk_metrics=risk_metrics,
            market_data={},  # Would fetch real market data
            user_preferences={}  # Would fetch user preferences
        )
        
        # Generate AI insight
        ai_engine = AIInsightsEngine()
        insight_output = ai_engine.generate_weekly_risk_analysis(
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=user_id,
            portfolio_id=portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        
        logger.info(
            f"Weekly analysis completed for portfolio {portfolio_id}"
        )
        
        # Trigger additional tasks
        process_ai_insight_alerts.delay(ai_insight.id)
        
        return {
            "status": "success",
            "insight_id": ai_insight.id,
            "portfolio_id": portfolio_id
        }
        
    except Exception as e:
        logger.error(f"Weekly analysis failed: {e}")
        self.retry(countdown=300, max_retries=3)  # Retry in 5 minutes
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True, name="ai_insights.generate_rebalancing_suggestions")
def generate_rebalancing_suggestions_task(
    self, 
    portfolio_id: str, 
    user_id: str,
    target_allocation: Optional[Dict[str, float]] = None
):
    """
    Generate portfolio rebalancing suggestions
    """
    try:
        logger.info(f"Generating rebalancing suggestions for {portfolio_id}")
        
        db = next(get_db())
        
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == portfolio_id
        ).first()
        
        if not portfolio:
            logger.error(f"Portfolio {portfolio_id} not found")
            return {"status": "error", "message": "Portfolio not found"}
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()
        
        if not holdings:
            logger.warning(f"Portfolio {portfolio_id} has no holdings")
            return {"status": "warning", "message": "No holdings found"}
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = risk_calculator.calculate_portfolio_risk_metrics(
            portfolio, holdings
        )
        
        # Create portfolio context
        portfolio_context = PortfolioContext(
            portfolio=portfolio,
            holdings=holdings,
            risk_metrics=risk_metrics,
            market_data={},
            user_preferences={}
        )
        
        # Generate AI insight
        ai_engine = AIInsightsEngine()
        insight_output = ai_engine.generate_rebalancing_suggestions(
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=user_id,
            portfolio_id=portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        
        logger.info(
            f"Rebalancing suggestions generated for {portfolio_id}"
        )
        
        return {
            "status": "success",
            "insight_id": ai_insight.id,
            "portfolio_id": portfolio_id
        }
        
    except Exception as e:
        logger.error(f"Rebalancing suggestions failed: {e}")
        self.retry(countdown=300, max_retries=3)
        return {"status": "error", "message": str(e)}


@celery_app.task(bind=True, name="ai_insights.generate_market_sentiment")
def generate_market_sentiment_task(self, portfolio_id: str, user_id: str):
    """
    Generate market sentiment analysis
    """
    try:
        logger.info(f"Generating market sentiment for {portfolio_id}")
        
        db = next(get_db())
        
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == portfolio_id
        ).first()
        
        if not portfolio:
            logger.error(f"Portfolio {portfolio_id} not found")
            return {"status": "error", "message": "Portfolio not found"}
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()
        
        if not holdings:
            logger.warning(f"Portfolio {portfolio_id} has no holdings")
            return {"status": "warning", "message": "No holdings found"}
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = risk_calculator.calculate_portfolio_risk_metrics(
            portfolio, holdings
        )
        
        # Create portfolio context
        portfolio_context = PortfolioContext(
            portfolio=portfolio,
            holdings=holdings,
            risk_metrics=risk_metrics,
            market_data={},
            user_preferences={}
        )
        
        # Generate AI insight
        ai_engine = AIInsightsEngine()
        insight_output = ai_engine.generate_market_sentiment_analysis(
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=user_id,
            portfolio_id=portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        
        logger.info(
            f"Market sentiment generated for {portfolio_id}"
        )
        
        return {
            "status": "success",
            "insight_id": ai_insight.id,
            "portfolio_id": portfolio_id
        }
        
    except Exception as e:
        logger.error(f"Market sentiment generation failed: {e}")
        self.retry(countdown=300, max_retries=3)
        return {"status": "error", "message": str(e)}


@celery_app.task(name="ai_insights.process_alerts")
def process_ai_insight_alerts(insight_id: str):
    """
    Process AI insights and generate alerts if needed
    """
    try:
        logger.info(f"Processing alerts for insight {insight_id}")
        
        db = next(get_db())
        
        # Get the insight
        insight = db.query(AIInsight).filter(
            AIInsight.id == insight_id
        ).first()
        
        if not insight:
            logger.error(f"Insight {insight_id} not found")
            return {"status": "error", "message": "Insight not found"}
        
        # Check if alert should be generated
        if insight.risk_level in ["high", "critical"] and insight.actionable:
            # Generate alert
            generate_risk_alert.delay(insight_id)
            logger.info(f"Risk alert triggered for insight {insight_id}")
        
        # Update insight processing status
        insight.tags = (insight.tags or []) + ["processed"]
        db.commit()
        
        return {"status": "success", "insight_id": insight_id}
        
    except Exception as e:
        logger.error(f"Alert processing failed: {e}")
        return {"status": "error", "message": str(e)}


@celery_app.task(name="ai_insights.generate_risk_alert")
def generate_risk_alert(insight_id: str):
    """
    Generate risk alert based on AI insight
    """
    try:
        logger.info(f"Generating risk alert for insight {insight_id}")
        
        db = next(get_db())
        
        # Get the insight
        insight = db.query(AIInsight).filter(
            AIInsight.id == insight_id
        ).first()
        
        if not insight:
            logger.error(f"Insight {insight_id} not found")
            return {"status": "error", "message": "Insight not found"}
        
        # Create alert (this would integrate with your alert system)
        alert_data = {
            "type": "ai_risk_alert",
            "title": f"AI Risk Alert: {insight.title}",
            "message": insight.summary,
            "risk_level": insight.risk_level,
            "portfolio_id": insight.portfolio_id,
            "user_id": insight.user_id,
            "insight_id": insight_id,
            "created_at": datetime.utcnow()
        }
        
        # Here you would create an actual alert record
        # For now, just log it
        logger.warning(f"RISK ALERT: {alert_data}")
        
        return {
            "status": "success",
            "alert_generated": True,
            "insight_id": insight_id
        }
        
    except Exception as e:
        logger.error(f"Risk alert generation failed: {e}")
        return {"status": "error", "message": str(e)}


@celery_app.task(name="ai_insights.cleanup_old_insights")
def cleanup_old_insights(days_old: int = 90):
    """
    Clean up old AI insights to manage storage
    """
    try:
        logger.info(f"Cleaning up insights older than {days_old} days")
        
        db = next(get_db())
        
        cutoff_date = datetime.utcnow() - timedelta(days=days_old)
        
        # Delete old insights
        deleted_count = db.query(AIInsight).filter(
            AIInsight.created_at < cutoff_date
        ).delete()
        
        db.commit()
        
        logger.info(f"Deleted {deleted_count} old insights")
        
        return {
            "status": "success",
            "deleted_count": deleted_count
        }
        
    except Exception as e:
        logger.error(f"Insight cleanup failed: {e}")
        return {"status": "error", "message": str(e)}


@celery_app.task(name="ai_insights.optimize_portfolio")
def optimize_portfolio_task(portfolio_id: str, user_id: str):
    """
    Generate portfolio optimization recommendations
    """
    try:
        logger.info(f"Optimizing portfolio {portfolio_id}")
        
        db = next(get_db())
        
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == portfolio_id
        ).first()
        
        if not portfolio:
            logger.error(f"Portfolio {portfolio_id} not found")
            return {"status": "error", "message": "Portfolio not found"}
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()
        
        if not holdings:
            logger.warning(f"Portfolio {portfolio_id} has no holdings")
            return {"status": "warning", "message": "No holdings found"}
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = risk_calculator.calculate_portfolio_risk_metrics(
            portfolio, holdings
        )
        
        # Create portfolio context
        portfolio_context = PortfolioContext(
            portfolio=portfolio,
            holdings=holdings,
            risk_metrics=risk_metrics,
            market_data={},
            user_preferences={}
        )
        
        # Generate optimization insight
        ai_engine = AIInsightsEngine()
        insight_output = ai_engine.generate_insight(
            InsightType.OPPORTUNITY_ANALYSIS,
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=user_id,
            portfolio_id=portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        
        logger.info(f"Portfolio optimization completed for {portfolio_id}")
        
        return {
            "status": "success",
            "insight_id": ai_insight.id,
            "portfolio_id": portfolio_id
        }
        
    except Exception as e:
        logger.error(f"Portfolio optimization failed: {e}")
        return {"status": "error", "message": str(e)}


# Schedule periodic tasks
@celery_app.task(name="ai_insights.schedule_weekly_analysis")
def schedule_weekly_analysis():
    """
    Schedule weekly analysis for all active portfolios
    """
    try:
        logger.info("Scheduling weekly analysis for all portfolios")
        
        db = next(get_db())
        
        # Get all active portfolios
        portfolios = db.query(Portfolio).filter(
            Portfolio.is_active == True  # noqa: E712
        ).all()
        
        scheduled_count = 0
        
        for portfolio in portfolios:
            # Schedule weekly analysis
            generate_weekly_analysis_task.delay(
                portfolio.id,
                portfolio.user_id
            )
            scheduled_count += 1
        
        logger.info(f"Scheduled weekly analysis for {scheduled_count} portfolios")
        
        return {
            "status": "success",
            "scheduled_count": scheduled_count
        }
        
    except Exception as e:
        logger.error(f"Weekly analysis scheduling failed: {e}")
        return {"status": "error", "message": str(e)}
