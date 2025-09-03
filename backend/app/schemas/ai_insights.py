"""
Pydantic schemas for AI insights API
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


class AIInsightRequest(BaseModel):
    """Base request for AI insights"""
    user_id: str = Field(description="User ID requesting the insight")
    portfolio_id: str = Field(description="Portfolio ID to analyze")


class WeeklyAnalysisRequest(AIInsightRequest):
    """Request for weekly portfolio risk analysis"""
    include_market_context: bool = Field(
        default=True,
        description="Include market context in analysis"
    )
    risk_tolerance: Optional[str] = Field(
        default="medium",
        description="User's risk tolerance level"
    )


class RebalancingRequest(AIInsightRequest):
    """Request for portfolio rebalancing suggestions"""
    target_allocation: Optional[Dict[str, float]] = Field(
        default=None,
        description="Target allocation percentages"
    )
    rebalancing_frequency: Optional[str] = Field(
        default="monthly",
        description="Preferred rebalancing frequency"
    )


class SentimentAnalysisRequest(AIInsightRequest):
    """Request for market sentiment analysis"""
    include_news_analysis: bool = Field(
        default=True,
        description="Include news sentiment analysis"
    )
    time_horizon: str = Field(
        default="1w",
        description="Analysis time horizon"
    )


class ComparativeAnalysisRequest(AIInsightRequest):
    """Request for comparative analysis with benchmarks"""
    benchmark_data: Dict[str, Any] = Field(
        description="Benchmark data for comparison"
    )
    comparison_metrics: List[str] = Field(
        default=["returns", "volatility", "sharpe_ratio"],
        description="Metrics to compare"
    )


class AIInsightResponse(BaseModel):
    """Response model for AI insights"""
    id: str = Field(description="Unique insight ID")
    title: str = Field(description="Insight title")
    summary: str = Field(description="Brief summary")
    detailed_analysis: str = Field(description="Detailed analysis")
    risk_level: str = Field(description="Risk level")
    actionable: bool = Field(description="Whether actionable")
    confidence_score: float = Field(description="Confidence score")
    tags: List[str] = Field(description="Insight tags")
    created_at: datetime = Field(description="Creation timestamp")
    processing_time: float = Field(description="Processing time in seconds")

    class Config:
        from_attributes = True


class AIInsightListResponse(BaseModel):
    """Response model for lists of AI insights"""
    insights: List[AIInsightResponse] = Field(description="List of insights")
    total: int = Field(description="Total number of insights")
    portfolio_id: Optional[str] = Field(
        default=None,
        description="Portfolio ID if portfolio-specific"
    )
    user_id: Optional[str] = Field(
        default=None,
        description="User ID if user-specific"
    )


class AIInsightUpdateRequest(BaseModel):
    """Request to update an AI insight"""
    title: Optional[str] = Field(description="Updated title")
    summary: Optional[str] = Field(description="Updated summary")
    detailed_analysis: Optional[str] = Field(description="Updated analysis")
    tags: Optional[List[str]] = Field(description="Updated tags")
    actionable: Optional[bool] = Field(description="Updated actionable status")


class AIInsightFilterRequest(BaseModel):
    """Request to filter AI insights"""
    portfolio_id: Optional[str] = Field(description="Filter by portfolio")
    user_id: Optional[str] = Field(description="Filter by user")
    insight_type: Optional[str] = Field(description="Filter by insight type")
    risk_level: Optional[str] = Field(description="Filter by risk level")
    actionable: Optional[bool] = Field(
        description="Filter by actionable status"
    )
    tags: Optional[List[str]] = Field(description="Filter by tags")
    date_from: Optional[datetime] = Field(description="Filter from date")
    date_to: Optional[datetime] = Field(description="Filter to date")
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
