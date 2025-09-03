"""
Pydantic schemas for risk metrics API endpoints
"""

from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime


class RiskCalculationRequest(BaseModel):
    """Request model for risk calculations"""
    portfolio_id: str = Field(
        ..., description="Portfolio ID to calculate risk for"
    )
    include_benchmarks: bool = Field(
        True, description="Include benchmark comparisons"
    )
    risk_free_rate: Optional[float] = Field(
        0.02, description="Annual risk-free rate"
    )
    calculation_method: str = Field(
        "historical", description="VaR calculation method"
    )


class AssetRiskRequest(BaseModel):
    """Request model for individual asset risk calculations"""
    asset_id: str = Field(
        ..., description="Asset ID to calculate risk for"
    )
    period_days: int = Field(
        365, description="Number of days for historical data"
    )
    include_benchmarks: bool = Field(
        True, description="Include benchmark comparisons"
    )
    risk_free_rate: Optional[float] = Field(
        0.02, description="Annual risk-free rate"
    )


class VolatilityMetrics(BaseModel):
    """Volatility metrics for different time periods"""
    volatility_30d: Optional[float] = Field(
        None, description="30-day rolling volatility"
    )
    volatility_90d: Optional[float] = Field(
        None, description="90-day rolling volatility"
    )
    volatility_365d: Optional[float] = Field(
        None, description="365-day rolling volatility"
    )


class RiskMetricsResponse(BaseModel):
    """Response model for portfolio risk metrics"""
    portfolio_id: str = Field(..., description="Portfolio ID")
    timestamp: datetime = Field(..., description="Calculation timestamp")
    
    # Volatility metrics
    volatility_30d: Optional[float] = Field(
        None, description="30-day rolling volatility"
    )
    volatility_90d: Optional[float] = Field(
        None, description="90-day rolling volatility"
    )
    volatility_365d: Optional[float] = Field(
        None, description="365-day rolling volatility"
    )
    
    # Risk-adjusted return metrics
    sharpe_ratio: Optional[float] = Field(
        None, description="Sharpe ratio"
    )
    sortino_ratio: Optional[float] = Field(
        None, description="Sortino ratio"
    )
    
    # Drawdown metrics
    max_drawdown: Optional[float] = Field(
        None, description="Maximum drawdown"
    )
    current_drawdown: Optional[float] = Field(
        None, description="Current drawdown"
    )
    
    # Beta metrics
    beta_btc: Optional[float] = Field(
        None, description="Beta vs Bitcoin"
    )
    beta_sp500: Optional[float] = Field(
        None, description="Beta vs S&P 500"
    )
    
    # Concentration risk
    herfindahl_index: Optional[float] = Field(
        None, description="Herfindahl index"
    )
    effective_n: Optional[float] = Field(
        None, description="Effective number of assets"
    )
    
    # Value at Risk
    var_95: Optional[float] = Field(
        None, description="95% Value at Risk"
    )
    var_99: Optional[float] = Field(
        None, description="99% Value at Risk"
    )
    expected_shortfall: Optional[float] = Field(
        None, description="Expected shortfall"
    )
    
    # Statistical measures
    skewness: Optional[float] = Field(
        None, description="Return distribution skewness"
    )
    kurtosis: Optional[float] = Field(
        None, description="Return distribution kurtosis"
    )
    
    # Overall risk score
    risk_score: int = Field(
        ..., description="Overall risk score (1-10)"
    )
    risk_level: str = Field(
        ..., description="Risk level (Low/Medium/High)"
    )
    
    # Portfolio composition
    total_assets: int = Field(..., description="Total number of assets")
    total_value_usd: float = Field(
        ..., description="Total portfolio value in USD"
    )
    
    # Metadata
    calculation_time_ms: float = Field(
        ..., description="Calculation time in milliseconds"
    )
    data_points_used: int = Field(
        ..., description="Number of data points used"
    )


class AssetRiskResponse(BaseModel):
    """Response model for individual asset risk metrics"""
    asset_id: str = Field(..., description="Asset ID")
    timestamp: datetime = Field(..., description="Calculation timestamp")
    
    # Volatility metrics
    volatility_30d: Optional[float] = Field(
        None, description="30-day rolling volatility"
    )
    volatility_90d: Optional[float] = Field(
        None, description="90-day rolling volatility"
    )
    volatility_365d: Optional[float] = Field(
        None, description="365-day rolling volatility"
    )
    
    # Risk-adjusted return metrics
    sharpe_ratio: Optional[float] = Field(
        None, description="Sharpe ratio"
    )
    sortino_ratio: Optional[float] = Field(
        None, description="Sortino ratio"
    )
    
    # Drawdown metrics
    max_drawdown: Optional[float] = Field(
        None, description="Maximum drawdown"
    )
    
    # Beta metrics
    beta_btc: Optional[float] = Field(
        None, description="Beta vs Bitcoin"
    )
    beta_sp500: Optional[float] = Field(
        None, description="Beta vs S&P 500"
    )
    
    # Value at Risk
    var_95: Optional[float] = Field(
        None, description="95% Value at Risk"
    )
    var_99: Optional[float] = Field(
        None, description="99% Value at Risk"
    )
    expected_shortfall: Optional[float] = Field(
        None, description="Expected shortfall"
    )
    
    # Statistical measures
    skewness: Optional[float] = Field(
        None, description="Return distribution skewness"
    )
    kurtosis: Optional[float] = Field(
        None, description="Return distribution kurtosis"
    )
    
    # Overall risk score
    risk_score: int = Field(
        ..., description="Overall risk score (1-10)"
    )
    risk_level: str = Field(
        ..., description="Risk level (Low/Medium/High)"
    )
    
    # Asset information
    current_price_usd: float = Field(
        ..., description="Current asset price in USD"
    )
    market_cap_usd: Optional[float] = Field(
        None, description="Market cap in USD"
    )
    
    # Metadata
    calculation_time_ms: float = Field(
        ..., description="Calculation time in milliseconds"
    )
    data_points_used: int = Field(
        ..., description="Number of data points used"
    )


class CorrelationMatrixResponse(BaseModel):
    """Response model for correlation matrix"""
    portfolio_id: str = Field(..., description="Portfolio ID")
    timestamp: datetime = Field(..., description="Calculation timestamp")
    correlation_matrix: Dict[str, Dict[str, float]] = Field(
        ..., description="Correlation matrix"
    )
    assets: List[str] = Field(..., description="List of asset IDs")
    calculation_time_ms: float = Field(
        ..., description="Calculation time in milliseconds"
    )


class HistoricalRiskMetrics(BaseModel):
    """Historical risk metrics over time"""
    portfolio_id: str = Field(..., description="Portfolio ID")
    start_date: datetime = Field(..., description="Start date for historical data")
    end_date: datetime = Field(..., description="End date for historical data")
    metrics: List[RiskMetricsResponse] = Field(
        ..., description="Historical risk metrics"
    )
    summary_stats: Dict[str, Any] = Field(
        ..., description="Summary statistics"
    )


class BenchmarkComparison(BaseModel):
    """Benchmark comparison metrics"""
    benchmark_name: str = Field(
        ..., description="Benchmark name (e.g., Bitcoin, S&P 500)"
    )
    correlation: float = Field(..., description="Correlation with portfolio")
    beta: float = Field(..., description="Beta relative to benchmark")
    tracking_error: float = Field(..., description="Tracking error")
    information_ratio: float = Field(..., description="Information ratio")


class PortfolioComposition(BaseModel):
    """Portfolio composition analysis"""
    portfolio_id: str = Field(..., description="Portfolio ID")
    timestamp: datetime = Field(..., description="Analysis timestamp")
    
    # Asset allocation
    asset_weights: Dict[str, float] = Field(
        ..., description="Asset weights by percentage"
    )
    sector_allocation: Dict[str, float] = Field(
        ..., description="Sector allocation"
    )
    
    # Concentration metrics
    top_holdings: List[Dict[str, Any]] = Field(
        ..., description="Top holdings by weight"
    )
    herfindahl_index: float = Field(
        ..., description="Herfindahl concentration index"
    )
    effective_n: float = Field(
        ..., description="Effective number of assets"
    )
    
    # Risk contribution
    risk_contribution: Dict[str, float] = Field(
        ..., description="Risk contribution by asset"
    )
    marginal_risk: Dict[str, float] = Field(
        ..., description="Marginal risk by asset"
    )


class RiskAlert(BaseModel):
    """Risk alert notification"""
    alert_id: str = Field(..., description="Unique alert identifier")
    portfolio_id: str = Field(..., description="Portfolio ID")
    alert_type: str = Field(..., description="Type of risk alert")
    severity: str = Field(
        ..., description="Alert severity (Low/Medium/High/Critical)"
    )
    message: str = Field(..., description="Alert message")
    timestamp: datetime = Field(..., description="Alert timestamp")
    metrics: Dict[str, Any] = Field(
        ..., description="Relevant risk metrics"
    )
    recommendations: List[str] = Field(
        ..., description="Risk mitigation recommendations"
    )


class RiskCalculationStatus(BaseModel):
    """Status of risk calculation job"""
    job_id: str = Field(..., description="Calculation job ID")
    portfolio_id: str = Field(..., description="Portfolio ID")
    status: str = Field(
        ..., description="Job status (Pending/Running/Completed/Failed)"
    )
    progress: float = Field(..., description="Progress percentage (0-100)")
    estimated_completion: Optional[datetime] = Field(
        None, description="Estimated completion time"
    )
    error_message: Optional[str] = Field(
        None, description="Error message if failed"
    )
    created_at: datetime = Field(..., description="Job creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class BulkRiskCalculationRequest(BaseModel):
    """Request model for bulk risk calculations"""
    portfolio_ids: List[str] = Field(..., description="List of portfolio IDs")
    include_benchmarks: bool = Field(
        True, description="Include benchmark comparisons"
    )
    risk_free_rate: Optional[float] = Field(
        0.02, description="Annual risk-free rate"
    )
    priority: str = Field(
        "normal", description="Calculation priority (low/normal/high)"
    )


class BulkRiskCalculationResponse(BaseModel):
    """Response model for bulk risk calculations"""
    job_id: str = Field(..., description="Bulk calculation job ID")
    total_portfolios: int = Field(..., description="Total number of portfolios")
    status: str = Field(..., description="Overall job status")
    estimated_completion: Optional[datetime] = Field(
        None, description="Estimated completion time"
    )
    individual_jobs: List[RiskCalculationStatus] = Field(
        ..., description="Individual job statuses"
    )
