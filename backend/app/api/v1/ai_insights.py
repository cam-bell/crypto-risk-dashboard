"""
FastAPI routes for AI-powered portfolio insights
"""

import time
import logging
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.utils.ai_insights_engine import (
    AIInsightsEngine,
    PortfolioContext
)
from app.utils.risk_calculator import PortfolioRiskCalculator
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.models.ai_insights import AIInsight
from app.schemas.ai_insights import (
    AIInsightResponse,
    AIInsightListResponse,
    WeeklyAnalysisRequest,
    RebalancingRequest,
    SentimentAnalysisRequest,
    ComparativeAnalysisRequest
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/weekly-analysis", response_model=AIInsightResponse)
async def generate_weekly_risk_analysis(
    request: WeeklyAnalysisRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate weekly portfolio risk analysis using AI
    """
    start_time = time.time()
    
    try:
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == request.portfolio_id
        ).first()
        
        if not portfolio:
            raise HTTPException(
                status_code=404, 
                detail="Portfolio not found"
            )
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == request.portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=400,
                detail="Portfolio has no holdings"
            )
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = await risk_calculator.calculate_portfolio_risk_metrics(
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
        insight_output = await ai_engine.generate_weekly_risk_analysis(
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=request.user_id,
            portfolio_id=request.portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        db.refresh(ai_insight)
        
        # Add to background tasks for additional processing
        background_tasks.add_task(
            process_ai_insight_background,
            ai_insight.id, db
        )
        
        processing_time = time.time() - start_time
        
        return AIInsightResponse(
            id=ai_insight.id,
            title=ai_insight.title,
            summary=ai_insight.summary,
            detailed_analysis=ai_insight.detailed_analysis,
            risk_level=ai_insight.risk_level,
            actionable=ai_insight.actionable,
            confidence_score=ai_insight.confidence_score,
            tags=ai_insight.tags or [],
            created_at=ai_insight.created_at,
            processing_time=processing_time
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating weekly analysis: {str(e)}"
        )


@router.post("/rebalancing-suggestions", response_model=AIInsightResponse)
async def generate_rebalancing_suggestions(
    request: RebalancingRequest,
    db: Session = Depends(get_db)
):
    """
    Generate portfolio rebalancing suggestions using AI
    """
    try:
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == request.portfolio_id
        ).first()
        
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="Portfolio not found"
            )
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == request.portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=400,
                detail="Portfolio has no holdings"
            )
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = await risk_calculator.calculate_portfolio_risk_metrics(
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
        insight_output = await ai_engine.generate_rebalancing_suggestions(
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=request.user_id,
            portfolio_id=request.portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        db.refresh(ai_insight)
        
        return AIInsightResponse(
            id=ai_insight.id,
            title=ai_insight.title,
            summary=ai_insight.summary,
            detailed_analysis=ai_insight.detailed_analysis,
            risk_level=ai_insight.risk_level,
            actionable=ai_insight.actionable,
            confidence_score=ai_insight.confidence_score,
            tags=ai_insight.tags or [],
            created_at=ai_insight.created_at,
            processing_time=0.0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating rebalancing suggestions: {str(e)}"
        )


@router.post("/market-sentiment", response_model=AIInsightResponse)
async def generate_market_sentiment_analysis(
    request: SentimentAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Generate market sentiment analysis using AI
    """
    try:
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == request.portfolio_id
        ).first()
        
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="Portfolio not found"
            )
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == request.portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=400,
                detail="Portfolio has no holdings"
            )
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = await risk_calculator.calculate_portfolio_risk_metrics(
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
        insight_output = await ai_engine.generate_market_sentiment_analysis(
            portfolio_context
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=request.user_id,
            portfolio_id=request.portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        db.refresh(ai_insight)
        
        return AIInsightResponse(
            id=ai_insight.id,
            title=ai_insight.title,
            summary=ai_insight.summary,
            detailed_analysis=ai_insight.detailed_analysis,
            risk_level=ai_insight.risk_level,
            actionable=ai_insight.actionable,
            confidence_score=ai_insight.confidence_score,
            tags=ai_insight.tags or [],
            created_at=ai_insight.created_at,
            processing_time=0.0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating market sentiment analysis: {str(e)}"
        )


@router.post("/comparative-analysis", response_model=AIInsightResponse)
async def generate_comparative_analysis(
    request: ComparativeAnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    Generate comparative analysis with market benchmarks using AI
    """
    try:
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == request.portfolio_id
        ).first()
        
        if not portfolio:
            raise HTTPException(
                status_code=404,
                detail="Portfolio not found"
            )
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == request.portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=400,
                detail="Portfolio has no holdings"
            )
        
        # Calculate risk metrics
        risk_calculator = PortfolioRiskCalculator()
        risk_metrics = await risk_calculator.calculate_portfolio_risk_metrics(
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
        insight_output = await ai_engine.generate_comparative_analysis(
            portfolio_context,
            request.benchmark_data
        )
        
        # Create and save AI insight
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id=request.user_id,
            portfolio_id=request.portfolio_id
        )
        
        db.add(ai_insight)
        db.commit()
        db.refresh(ai_insight)
        
        return AIInsightResponse(
            id=ai_insight.id,
            title=ai_insight.title,
            summary=ai_insight.summary,
            detailed_analysis=ai_insight.detailed_analysis,
            risk_level=ai_insight.risk_level,
            actionable=ai_insight.actionable,
            confidence_score=ai_insight.confidence_score,
            tags=ai_insight.tags or [],
            created_at=ai_insight.created_at,
            processing_time=0.0
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating comparative analysis: {str(e)}"
        )


@router.get("/portfolio/{portfolio_id}", response_model=AIInsightListResponse)
async def get_portfolio_insights(
    portfolio_id: str,
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get AI insights for a specific portfolio
    """
    try:
        insights = db.query(AIInsight).filter(
            AIInsight.portfolio_id == portfolio_id
        ).order_by(
            AIInsight.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return AIInsightListResponse(
            insights=[
                AIInsightResponse(
                    id=insight.id,
                    title=insight.title,
                    summary=insight.summary,
                    detailed_analysis=insight.detailed_analysis,
                    risk_level=insight.risk_level,
                    actionable=insight.actionable,
                    confidence_score=insight.confidence_score,
                    tags=insight.tags or [],
                    created_at=insight.created_at,
                    processing_time=0.0
                )
                for insight in insights
            ],
            total=len(insights),
            portfolio_id=portfolio_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving portfolio insights: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=AIInsightListResponse)
async def get_user_insights(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get AI insights for a specific user
    """
    try:
        insights = db.query(AIInsight).filter(
            AIInsight.user_id == user_id
        ).order_by(
            AIInsight.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        return AIInsightListResponse(
            insights=[
                AIInsightResponse(
                    id=insight.id,
                    title=insight.title,
                    summary=insight.summary,
                    detailed_analysis=insight.detailed_analysis,
                    risk_level=insight.risk_level,
                    actionable=insight.actionable,
                    confidence_score=insight.confidence_score,
                    tags=insight.tags or [],
                    created_at=insight.created_at,
                    processing_time=0.0
                )
                for insight in insights
            ],
            total=len(insights),
            user_id=user_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving user insights: {str(e)}"
        )


@router.delete("/{insight_id}")
async def delete_insight(
    insight_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a specific AI insight
    """
    try:
        insight = db.query(AIInsight).filter(
            AIInsight.id == insight_id
        ).first()
        
        if not insight:
            raise HTTPException(
                status_code=404,
                detail="Insight not found"
            )
        
        db.delete(insight)
        db.commit()
        
        return {"message": "Insight deleted successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error deleting insight: {str(e)}"
        )


async def process_ai_insight_background(insight_id: str, db: Session):
    """
    Background task for additional AI insight processing
    """
    try:
        # This would include additional processing like:
        # - Sending notifications
        # - Updating related metrics
        # - Triggering alerts
        # - Logging analytics
        
        logger.info(f"Background processing completed for insight {insight_id}")
        
    except Exception as e:
        logger.error(f"Background processing failed for insight {insight_id}: {e}")


# Import logger at the top
import logging
logger = logging.getLogger(__name__)
