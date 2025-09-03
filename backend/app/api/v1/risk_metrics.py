"""
FastAPI routes for risk metrics calculation
"""

import time
import uuid
from typing import Optional
import pandas as pd
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.risk_metrics import (
    RiskCalculationRequest,
    AssetRiskRequest,
    RiskMetricsResponse,
    AssetRiskResponse,
    CorrelationMatrixResponse,
    HistoricalRiskMetrics,
    PortfolioComposition,
    RiskCalculationStatus,
    BulkRiskCalculationRequest,
    BulkRiskCalculationResponse
)
from app.utils.risk_calculator import PortfolioRiskCalculator, AssetRiskCalculator
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.models.price_history import PriceHistory
from app.models.portfolio_risk_metric import PortfolioRiskMetric

router = APIRouter()


@router.post("/portfolio/calculate", response_model=RiskMetricsResponse)
async def calculate_portfolio_risk(
    request: RiskCalculationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Calculate comprehensive risk metrics for a portfolio
    """
    start_time = time.time()
    
    try:
        # Get portfolio and holdings
        portfolio = db.query(Portfolio).filter(
            Portfolio.id == request.portfolio_id
        ).first()
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == request.portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=400, 
                detail="Portfolio has no holdings"
            )
        
        # Get price history for all assets
        asset_ids = [h.crypto_asset_id for h in holdings]
        price_history = db.query(PriceHistory).filter(
            PriceHistory.crypto_asset_id.in_(asset_ids)
        ).order_by(PriceHistory.timestamp).all()
        
        if not price_history:
            raise HTTPException(
                status_code=400, 
                detail="No price history available for portfolio assets"
            )
        
        # Create price DataFrame
        price_df = pd.DataFrame([
            {
                'timestamp': ph.timestamp,
                'asset_id': ph.crypto_asset_id,
                'price': ph.price_usd
            }
            for ph in price_history
        ])
        
        # Calculate returns
        returns_data = []
        for asset_id in asset_ids:
            asset_prices = price_df[
                price_df['asset_id'] == asset_id
            ].sort_values('timestamp')
            if len(asset_prices) > 1:
                asset_prices['returns'] = asset_prices['price'].pct_change()
                returns_data.extend([
                    {
                        'timestamp': row['timestamp'],
                        'asset_id': row['asset_id'],
                        'returns': row['returns']
                    }
                    for _, row in asset_prices.iterrows()
                    if pd.notna(row['returns'])
                ])
        
        if not returns_data:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient data to calculate returns"
            )
        
        returns_df = pd.DataFrame(returns_data)
        
        # Calculate portfolio weights
        total_value = sum(h.current_value_usd for h in holdings)
        weights = {
            h.crypto_asset_id: h.current_value_usd / total_value 
            for h in holdings
        }
        
        # Get benchmark data if requested
        benchmark_data = None
        if request.include_benchmarks:
            # Get Bitcoin price history for beta calculation
            btc_prices = db.query(PriceHistory).filter(
                PriceHistory.crypto_asset_id == 'bitcoin'
            ).order_by(PriceHistory.timestamp).all()
            
            if btc_prices:
                btc_df = pd.DataFrame([
                    {
                        'timestamp': p.timestamp,
                        'price': p.price_usd
                    }
                    for p in btc_prices
                ])
                btc_df['returns'] = btc_df['price'].pct_change()
                btc_returns = btc_df.set_index('timestamp')['returns'].dropna()
                benchmark_data = {'btc': btc_returns}
        
        # Calculate risk metrics
        risk_free_rate = request.risk_free_rate or 0.02
        calculator = PortfolioRiskCalculator(risk_free_rate)
        metrics = calculator.calculate_all_metrics(
            returns_df, weights, benchmark_data
        )
        
        # Determine risk level
        if metrics.risk_score <= 3:
            risk_level = "Low"
        elif metrics.risk_score <= 6:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        calculation_time = (time.time() - start_time) * 1000
        
        # Store metrics in database
        portfolio_risk_metric = PortfolioRiskMetric(
            portfolio_id=request.portfolio_id,
            timestamp=pd.Timestamp.now(),
            total_value_usd=total_value,
            total_invested_usd=sum(h.total_invested_usd for h in holdings),
            total_profit_loss_usd=sum(h.profit_loss_usd for h in holdings),
            total_profit_loss_percentage=(
                sum(h.profit_loss_usd for h in holdings) / 
                sum(h.total_invested_usd for h in holdings) * 100
                if sum(h.total_invested_usd for h in holdings) > 0 else 0
            ),
            volatility=metrics.volatility_30d,
            var_95=metrics.var_95,
            var_99=metrics.var_99,
            expected_shortfall=metrics.expected_shortfall,
            sharpe_ratio=metrics.sharpe_ratio,
            max_drawdown=metrics.max_drawdown,
            beta=metrics.beta_btc,
            herfindahl_index=metrics.herfindahl_index,
            correlation_matrix=metrics.correlation_matrix.to_json()
        )
        
        db.add(portfolio_risk_metric)
        db.commit()
        
        # Update portfolio with latest risk metrics
        portfolio.risk_score = metrics.risk_score
        portfolio.volatility = metrics.volatility_30d
        portfolio.sharpe_ratio = metrics.sharpe_ratio
        portfolio.max_drawdown = metrics.max_drawdown
        db.commit()
        
        return RiskMetricsResponse(
            portfolio_id=request.portfolio_id,
            timestamp=pd.Timestamp.now(),
            volatility_30d=metrics.volatility_30d,
            volatility_90d=metrics.volatility_90d,
            volatility_365d=metrics.volatility_365d,
            sharpe_ratio=metrics.sharpe_ratio,
            sortino_ratio=None,  # TODO: Implement Sortino ratio
            max_drawdown=metrics.max_drawdown,
            current_drawdown=None,  # TODO: Implement current drawdown
            beta_btc=metrics.beta_btc,
            beta_sp500=metrics.beta_sp500,
            herfindahl_index=metrics.herfindahl_index,
            effective_n=1/metrics.herfindahl_index if metrics.herfindahl_index > 0 else None,
            var_95=metrics.var_95,
            var_99=metrics.var_99,
            expected_shortfall=metrics.expected_shortfall,
            skewness=metrics.skewness,
            kurtosis=metrics.kurtosis,
            risk_score=metrics.risk_score,
            risk_level=risk_level,
            total_assets=len(holdings),
            total_value_usd=total_value,
            calculation_time_ms=calculation_time,
            data_points_used=len(returns_df)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/asset/calculate", response_model=AssetRiskResponse)
async def calculate_asset_risk(
    request: AssetRiskRequest,
    db: Session = Depends(get_db)
):
    """
    Calculate risk metrics for individual asset
    """
    start_time = time.time()
    
    try:
        # Get asset price history
        price_history = db.query(PriceHistory).filter(
            PriceHistory.crypto_asset_id == request.asset_id
        ).order_by(PriceHistory.timestamp).all()
        
        if not price_history:
            raise HTTPException(
                status_code=404, 
                detail="Asset price history not found"
            )
        
        # Create price DataFrame
        price_df = pd.DataFrame([
            {
                'timestamp': ph.timestamp,
                'price': ph.price_usd
            }
            for ph in price_history
        ])
        
        price_df['returns'] = price_df['price'].pct_change()
        returns_series = price_df.set_index('timestamp')['returns'].dropna()
        
        if len(returns_series) < 30:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient data for risk calculation (need at least 30 days)"
            )
        
        # Get benchmark data if requested
        benchmark_data = None
        if request.include_benchmarks:
            # Get Bitcoin price history for beta calculation
            btc_prices = db.query(PriceHistory).filter(
                PriceHistory.crypto_asset_id == 'bitcoin'
            ).order_by(PriceHistory.timestamp).all()
            
            if btc_prices:
                btc_df = pd.DataFrame([
                    {
                        'timestamp': p.timestamp,
                        'price': p.price_usd
                    }
                    for p in btc_prices
                ])
                btc_df['returns'] = btc_df['price'].pct_change()
                btc_returns = btc_df.set_index('timestamp')['returns'].dropna()
                benchmark_data = btc_returns
        
        # Calculate risk metrics
        risk_free_rate = request.risk_free_rate or 0.02
        calculator = AssetRiskCalculator(risk_free_rate)
        metrics = calculator.calculate_asset_metrics(
            returns_series, benchmark_data
        )
        
        # Determine risk level
        if metrics['risk_score'] <= 3:
            risk_level = "Low"
        elif metrics['risk_score'] <= 6:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        calculation_time = (time.time() - start_time) * 1000
        
        # Get current asset price
        current_price = price_history[-1].price_usd if price_history else 0
        
        return AssetRiskResponse(
            asset_id=request.asset_id,
            timestamp=pd.Timestamp.now(),
            volatility_30d=metrics['volatility_30d'],
            volatility_90d=metrics['volatility_90d'],
            volatility_365d=metrics['volatility_365d'],
            sharpe_ratio=metrics['sharpe_ratio'],
            sortino_ratio=None,  # TODO: Implement Sortino ratio
            max_drawdown=metrics['max_drawdown'],
            beta_btc=metrics['beta_btc'],
            beta_sp500=None,  # TODO: Implement S&P 500 beta
            var_95=metrics['var_95'],
            var_99=metrics['var_99'],
            expected_shortfall=metrics['expected_shortfall'],
            skewness=metrics['skewness'],
            kurtosis=metrics['kurtosis'],
            risk_score=metrics['risk_score'],
            risk_level=risk_level,
            current_price_usd=current_price,
            market_cap_usd=None,  # TODO: Get from crypto asset model
            calculation_time_ms=calculation_time,
            data_points_used=len(returns_series)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio/{portfolio_id}/correlation", response_model=CorrelationMatrixResponse)
async def get_portfolio_correlation(
    portfolio_id: str,
    db: Session = Depends(get_db)
):
    """
    Get correlation matrix for portfolio holdings
    """
    start_time = time.time()
    
    try:
        # Get portfolio holdings
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=404, 
                detail="Portfolio not found or has no holdings"
            )
        
        # Get price history for all assets
        asset_ids = [h.crypto_asset_id for h in holdings]
        price_history = db.query(PriceHistory).filter(
            PriceHistory.crypto_asset_id.in_(asset_ids)
        ).order_by(PriceHistory.timestamp).all()
        
        if not price_history:
            raise HTTPException(
                status_code=400, 
                detail="No price history available for portfolio assets"
            )
        
        # Create price DataFrame
        price_df = pd.DataFrame([
            {
                'timestamp': ph.timestamp,
                'asset_id': ph.crypto_asset_id,
                'price': ph.price_usd
            }
            for ph in price_history
        ])
        
        # Calculate returns
        returns_data = []
        for asset_id in asset_ids:
            asset_prices = price_df[
                price_df['asset_id'] == asset_id
            ].sort_values('timestamp')
            if len(asset_prices) > 1:
                asset_prices['returns'] = asset_prices['price'].pct_change()
                returns_data.extend([
                    {
                        'timestamp': row['timestamp'],
                        'asset_id': row['asset_id'],
                        'returns': row['returns']
                    }
                    for _, row in asset_prices.iterrows()
                    if pd.notna(row['returns'])
                ])
        
        if not returns_data:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient data to calculate returns"
            )
        
        returns_df = pd.DataFrame(returns_data)
        
        # Calculate correlation matrix
        calculator = PortfolioRiskCalculator()
        correlation_matrix = calculator.calculate_correlation_matrix(returns_df)
        
        # Convert to dictionary format
        corr_dict = correlation_matrix.to_dict()
        
        calculation_time = (time.time() - start_time) * 1000
        
        return CorrelationMatrixResponse(
            portfolio_id=portfolio_id,
            timestamp=pd.Timestamp.now(),
            correlation_matrix=corr_dict,
            assets=asset_ids,
            calculation_time_ms=calculation_time
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/portfolio/{portfolio_id}/composition", response_model=PortfolioComposition)
async def get_portfolio_composition(
    portfolio_id: str,
    db: Session = Depends(get_db)
):
    """
    Get portfolio composition analysis
    """
    try:
        # Get portfolio holdings
        holdings = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id
        ).all()
        
        if not holdings:
            raise HTTPException(
                status_code=404, 
                detail="Portfolio not found or has no holdings"
            )
        
        # Calculate weights and composition
        total_value = sum(h.current_value_usd for h in holdings)
        asset_weights = {
            h.crypto_asset_id: h.current_value_usd / total_value 
            for h in holdings
        }
        
        # Calculate Herfindahl index
        calculator = PortfolioRiskCalculator()
        herfindahl_index = calculator.calculate_herfindahl_index(asset_weights)
        effective_n = 1 / herfindahl_index if herfindahl_index > 0 else len(holdings)
        
        # Get top holdings
        sorted_holdings = sorted(
            holdings, 
            key=lambda x: x.current_value_usd, 
            reverse=True
        )
        top_holdings = [
            {
                'asset_id': h.crypto_asset_id,
                'weight': asset_weights[h.crypto_asset_id],
                'value_usd': h.current_value_usd,
                'quantity': h.quantity
            }
            for h in sorted_holdings[:10]  # Top 10 holdings
        ]
        
        # TODO: Implement sector allocation and risk contribution analysis
        
        return PortfolioComposition(
            portfolio_id=portfolio_id,
            timestamp=pd.Timestamp.now(),
            asset_weights=asset_weights,
            sector_allocation={},  # TODO: Implement sector allocation
            top_holdings=top_holdings,
            herfindahl_index=herfindahl_index,
            effective_n=effective_n,
            risk_contribution={},  # TODO: Implement risk contribution
            marginal_risk={}  # TODO: Implement marginal risk
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bulk/calculate", response_model=BulkRiskCalculationResponse)
async def bulk_risk_calculation(
    request: BulkRiskCalculationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start bulk risk calculation for multiple portfolios
    """
    try:
        # Validate portfolio IDs
        portfolios = db.query(Portfolio).filter(
            Portfolio.id.in_(request.portfolio_ids)
        ).all()
        
        if len(portfolios) != len(request.portfolio_ids):
            raise HTTPException(
                status_code=400, 
                detail="Some portfolio IDs not found"
            )
        
        # Create job ID
        job_id = str(uuid.uuid4())
        
        # TODO: Implement background job processing with Celery
        
        return BulkRiskCalculationResponse(
            job_id=job_id,
            total_portfolios=len(request.portfolio_ids),
            status="Pending",
            estimated_completion=None,
            individual_jobs=[]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/job/{job_id}/status", response_model=RiskCalculationStatus)
async def get_calculation_status(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Get status of risk calculation job
    """
    # TODO: Implement job status tracking
    raise HTTPException(
        status_code=501, 
        detail="Job status tracking not yet implemented"
    )


@router.get("/portfolio/{portfolio_id}/historical", response_model=HistoricalRiskMetrics)
async def get_historical_risk_metrics(
    portfolio_id: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get historical risk metrics for portfolio
    """
    try:
        # Get historical risk metrics
        query = db.query(PortfolioRiskMetric).filter(
            PortfolioRiskMetric.portfolio_id == portfolio_id
        )
        
        if start_date:
            query = query.filter(PortfolioRiskMetric.timestamp >= start_date)
        if end_date:
            query = query.filter(PortfolioRiskMetric.timestamp <= end_date)
        
        metrics = query.order_by(PortfolioRiskMetric.timestamp).all()
        
        if not metrics:
            raise HTTPException(
                status_code=404, 
                detail="No historical risk metrics found"
            )
        
        # TODO: Implement summary statistics calculation
        
        return HistoricalRiskMetrics(
            portfolio_id=portfolio_id,
            start_date=metrics[0].timestamp,
            end_date=metrics[-1].timestamp,
            metrics=[],  # TODO: Convert to RiskMetricsResponse
            summary_stats={}  # TODO: Calculate summary statistics
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
