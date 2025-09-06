"""
FastAPI routes for portfolio management
"""

import math
from typing import List, Optional, Any, Dict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.schemas.portfolio import (
    PortfolioCreate,
    PortfolioUpdate,
    PortfolioResponse,
    PortfolioListResponse,
    PortfolioHoldingCreate,
    PortfolioHoldingUpdate,
    PortfolioHoldingResponse
)

router = APIRouter()

def clean_nan_values(data: Any) -> Any:
    """
    Recursively clean NaN values from data structures to make them JSON serializable
    """
    if isinstance(data, dict):
        return {key: clean_nan_values(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [clean_nan_values(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data):
            return None
        elif math.isinf(data):
            return None
        return data
    else:
        return data


def _update_portfolio_totals(db: Session, portfolio_id: str):
    """Update portfolio totals based on current holdings"""
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        return
    
    # Get all holdings for this portfolio
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.portfolio_id == portfolio_id
    ).all()
    
    # Calculate totals
    total_invested = sum(h.total_invested_usd for h in holdings)
    total_value = sum(h.current_value_usd for h in holdings)
    total_pnl = sum(h.profit_loss_usd for h in holdings)
    total_pnl_percentage = (total_pnl / total_invested * 100) if total_invested > 0 else 0
    
    # Update portfolio
    portfolio.total_invested_usd = total_invested
    portfolio.total_value_usd = total_value
    portfolio.total_profit_loss_usd = total_pnl
    portfolio.total_profit_loss_percentage = total_pnl_percentage
    
    db.commit()


@router.get("/", response_model=PortfolioListResponse)
async def get_portfolios(
    skip: int = Query(0, ge=0, description="Number of portfolios to skip"),
    limit: int = Query(10, ge=1, le=100, description="Number of portfolios to return"),
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    db: Session = Depends(get_db)
):
    """
    Get all portfolios with optional filtering and pagination
    """
    from sqlalchemy.orm import joinedload
    
    query = db.query(Portfolio).options(
        joinedload(Portfolio.holdings).joinedload(PortfolioHolding.crypto_asset)
    )
    
    if user_id:
        query = query.filter(Portfolio.user_id == user_id)
    
    total = query.count()
    portfolios = query.offset(skip).limit(limit).all()
    
    response = PortfolioListResponse(
        portfolios=portfolios,
        total=total,
        page=(skip // limit) + 1,
        page_size=limit
    )
    
    # Clean NaN values to prevent JSON serialization issues
    return clean_nan_values(response.dict())


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
    portfolio_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific portfolio by ID
    """
    from sqlalchemy.orm import joinedload
    
    portfolio = db.query(Portfolio).options(
        joinedload(Portfolio.holdings).joinedload(PortfolioHolding.crypto_asset)
    ).filter(Portfolio.id == portfolio_id).first()
    
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Clean NaN values to prevent JSON serialization issues
    return clean_nan_values(portfolio.__dict__)


@router.post("/", response_model=PortfolioResponse)
async def create_portfolio(
    portfolio: PortfolioCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new portfolio
    """
    # Check if user already has a default portfolio
    if portfolio.is_default:
        existing_default = db.query(Portfolio).filter(
            Portfolio.user_id == portfolio.user_id,
            Portfolio.is_default == True
        ).first()
        if existing_default:
            # Remove default flag from existing portfolio
            existing_default.is_default = False
    
    db_portfolio = Portfolio(**portfolio.dict())
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    
    # Clean NaN values to prevent JSON serialization issues
    return clean_nan_values(db_portfolio.__dict__)


@router.put("/{portfolio_id}", response_model=PortfolioResponse)
async def update_portfolio(
    portfolio_id: str,
    portfolio_update: PortfolioUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing portfolio
    """
    db_portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not db_portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Handle default portfolio logic
    if portfolio_update.is_default and not db_portfolio.is_default:
        # Remove default flag from other portfolios of the same user
        db.query(Portfolio).filter(
            Portfolio.user_id == db_portfolio.user_id,
            Portfolio.is_default == True,
            Portfolio.id != portfolio_id
        ).update({"is_default": False})
    
    # Update portfolio fields
    update_data = portfolio_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_portfolio, field, value)
    
    db.commit()
    db.refresh(db_portfolio)
    
    # Clean NaN values to prevent JSON serialization issues
    return clean_nan_values(db_portfolio.__dict__)


@router.delete("/{portfolio_id}")
async def delete_portfolio(
    portfolio_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a portfolio
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    db.delete(portfolio)
    db.commit()
    
    return {"message": "Portfolio deleted successfully"}


@router.get("/{portfolio_id}/holdings", response_model=List[PortfolioHoldingResponse])
async def get_portfolio_holdings(
    portfolio_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all holdings for a specific portfolio
    """
    # Verify portfolio exists
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    holdings = db.query(PortfolioHolding).filter(
        PortfolioHolding.portfolio_id == portfolio_id
    ).all()
    
    return holdings


@router.post("/{portfolio_id}/holdings", response_model=PortfolioHoldingResponse)
async def create_portfolio_holding(
    portfolio_id: str,
    holding: PortfolioHoldingCreate,
    db: Session = Depends(get_db)
):
    """
    Add a new holding to a portfolio
    """
    # Verify portfolio exists
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    # Check if holding already exists for this asset
    existing_holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.portfolio_id == portfolio_id,
        PortfolioHolding.crypto_asset_id == holding.crypto_asset_id
    ).first()
    
    if existing_holding:
        raise HTTPException(
            status_code=400, 
            detail="Holding for this asset already exists in the portfolio"
        )
    
    # Calculate derived fields
    total_invested = holding.quantity * holding.average_buy_price_usd
    current_value = total_invested  # For now, assume current value equals invested
    profit_loss = current_value - total_invested
    profit_loss_percentage = (profit_loss / total_invested) * 100 if total_invested > 0 else 0
    
    db_holding = PortfolioHolding(
        portfolio_id=portfolio_id,
        crypto_asset_id=holding.crypto_asset_id,
        quantity=holding.quantity,
        average_buy_price_usd=holding.average_buy_price_usd,
        total_invested_usd=total_invested,
        current_value_usd=current_value,
        profit_loss_usd=profit_loss,
        profit_loss_percentage=profit_loss_percentage,
        notes=holding.notes
    )
    
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    
    # Update portfolio totals
    _update_portfolio_totals(db, portfolio_id)
    
    return db_holding


@router.put("/{portfolio_id}/holdings/{holding_id}", response_model=PortfolioHoldingResponse)
async def update_portfolio_holding(
    portfolio_id: str,
    holding_id: str,
    holding_update: PortfolioHoldingUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing portfolio holding
    """
    db_holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id
    ).first()
    
    if not db_holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    # Update fields
    update_data = holding_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_holding, field, value)
    
    # Recalculate derived fields if quantity or price changed
    if 'quantity' in update_data or 'average_buy_price_usd' in update_data:
        total_invested = db_holding.quantity * db_holding.average_buy_price_usd
        current_value = total_invested  # For now, assume current value equals invested
        profit_loss = current_value - total_invested
        profit_loss_percentage = (profit_loss / total_invested) * 100 if total_invested > 0 else 0
        
        db_holding.total_invested_usd = total_invested
        db_holding.current_value_usd = current_value
        db_holding.profit_loss_usd = profit_loss
        db_holding.profit_loss_percentage = profit_loss_percentage
    
    db.commit()
    db.refresh(db_holding)
    
    # Update portfolio totals
    _update_portfolio_totals(db, portfolio_id)
    
    return db_holding


@router.delete("/{portfolio_id}/holdings/{holding_id}")
async def delete_portfolio_holding(
    portfolio_id: str,
    holding_id: str,
    db: Session = Depends(get_db)
):
    """
    Delete a portfolio holding
    """
    holding = db.query(PortfolioHolding).filter(
        PortfolioHolding.id == holding_id,
        PortfolioHolding.portfolio_id == portfolio_id
    ).first()
    
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    db.delete(holding)
    db.commit()
    
    # Update portfolio totals
    _update_portfolio_totals(db, portfolio_id)
    
    return {"message": "Holding deleted successfully"}
