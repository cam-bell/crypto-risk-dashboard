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
    print(f"🔍 [Backend] Getting portfolios - skip: {skip}, limit: {limit}, user_id: {user_id}")
    
    try:
        from sqlalchemy.orm import joinedload
        
        query = db.query(Portfolio).options(
            joinedload(Portfolio.holdings).joinedload(PortfolioHolding.crypto_asset)
        )
        
        if user_id:
            print(f"🔍 [Backend] Filtering by user_id: {user_id}")
            query = query.filter(Portfolio.user_id == user_id)
        
        total = query.count()
        print(f"📊 [Backend] Total portfolios found: {total}")
        
        portfolios = query.offset(skip).limit(limit).all()
        print(f"📋 [Backend] Returning {len(portfolios)} portfolios")
        
        # Log portfolio details
        for i, portfolio in enumerate(portfolios):
            print(f"📋 [Backend] Portfolio {i+1}: {portfolio.id} - {portfolio.name} (holdings: {len(portfolio.holdings)})")
        
        response = PortfolioListResponse(
            portfolios=portfolios,
            total=total,
            page=(skip // limit) + 1,
            page_size=limit
        )
        
        # Clean NaN values to prevent JSON serialization issues
        result = clean_nan_values(response.dict())
        print(f"📤 [Backend] Returning response with {len(result.get('portfolios', []))} portfolios")
        return result
        
    except Exception as e:
        print(f"❌ [Backend] Error getting portfolios: {str(e)}")
        print(f"❌ [Backend] Error type: {type(e)}")
        import traceback
        print(f"❌ [Backend] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to get portfolios: {str(e)}")


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
    print(f"🚀 [Backend] Creating portfolio: {portfolio.name} for user: {portfolio.user_id}")
    
    try:
        # Check if user already has a default portfolio
        if portfolio.is_default:
            existing_default = db.query(Portfolio).filter(
                Portfolio.user_id == portfolio.user_id,
                Portfolio.is_default == True
            ).first()
            if existing_default:
                print(f"🔄 [Backend] Removing default flag from existing portfolio: {existing_default.id}")
                # Remove default flag from existing portfolio
                existing_default.is_default = False
        
        print(f"📝 [Backend] Creating portfolio with data: {portfolio.dict()}")
        db_portfolio = Portfolio(**portfolio.dict())
        db.add(db_portfolio)
        try:
            db.commit()
            db.refresh(db_portfolio)
            print(f"✅ [Backend] Database commit successful for portfolio: {db_portfolio.id}")
        except Exception as commit_error:
            print(f"❌ [Backend] Database commit failed: {str(commit_error)}")
            db.rollback()
            raise commit_error
        
        print(f"✅ [Backend] Portfolio created successfully: {db_portfolio.id} - {db_portfolio.name}")
        print(f"📊 [Backend] Portfolio data: {db_portfolio.__dict__}")
        
        # Verify the portfolio was actually saved by querying it back
        verification = db.query(Portfolio).filter(Portfolio.id == db_portfolio.id).first()
        if verification:
            print(f"✅ [Backend] Portfolio verification successful: {verification.name}")
        else:
            print(f"❌ [Backend] Portfolio verification failed - portfolio not found in database!")
        
        # Clean NaN values to prevent JSON serialization issues
        result = clean_nan_values(db_portfolio.__dict__)
        print(f"📤 [Backend] Returning portfolio: {result}")
        return result
        
    except Exception as e:
        print(f"❌ [Backend] Error creating portfolio: {str(e)}")
        print(f"❌ [Backend] Error type: {type(e)}")
        import traceback
        print(f"❌ [Backend] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create portfolio: {str(e)}")


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
    print(f"🚀 [Backend] Creating holding for portfolio: {portfolio_id}")
    print(f"📝 [Backend] Holding data: {holding.dict()}")
    
    try:
        # Verify portfolio exists
        portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
        if not portfolio:
            print(f"❌ [Backend] Portfolio not found: {portfolio_id}")
            raise HTTPException(status_code=404, detail="Portfolio not found")
        
        print(f"✅ [Backend] Portfolio found: {portfolio.name}")
        
        # Check if holding already exists for this asset
        existing_holding = db.query(PortfolioHolding).filter(
            PortfolioHolding.portfolio_id == portfolio_id,
            PortfolioHolding.crypto_asset_id == holding.crypto_asset_id
        ).first()
        
        if existing_holding:
            print(f"⚠️ [Backend] Holding already exists for asset: {holding.crypto_asset_id}")
            raise HTTPException(
                status_code=400, 
                detail="Holding for this asset already exists in the portfolio"
            )
        
        # Calculate derived fields
        total_invested = holding.quantity * holding.average_buy_price_usd
        current_value = total_invested  # For now, assume current value equals invested
        profit_loss = current_value - total_invested
        profit_loss_percentage = (profit_loss / total_invested) * 100 if total_invested > 0 else 0
        
        print(f"💰 [Backend] Calculated values - total_invested: {total_invested}, current_value: {current_value}")
        
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
        try:
            db.commit()
            db.refresh(db_holding)
            print(f"✅ [Backend] Database commit successful for holding: {db_holding.id}")
        except Exception as commit_error:
            print(f"❌ [Backend] Database commit failed for holding: {str(commit_error)}")
            db.rollback()
            raise commit_error
        
        print(f"✅ [Backend] Holding created successfully: {db_holding.id}")
        
        # Update portfolio totals
        print(f"🔄 [Backend] Updating portfolio totals for: {portfolio_id}")
        _update_portfolio_totals(db, portfolio_id)
        
        # Verify the holding was actually saved
        verification = db.query(PortfolioHolding).filter(PortfolioHolding.id == db_holding.id).first()
        if verification:
            print(f"✅ [Backend] Holding verification successful: {verification.id}")
        else:
            print(f"❌ [Backend] Holding verification failed - holding not found in database!")
        
        print(f"📤 [Backend] Returning holding: {db_holding.__dict__}")
        return db_holding
        
    except Exception as e:
        print(f"❌ [Backend] Error creating holding: {str(e)}")
        print(f"❌ [Backend] Error type: {type(e)}")
        import traceback
        print(f"❌ [Backend] Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to create holding: {str(e)}")


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
