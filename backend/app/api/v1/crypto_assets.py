from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.crypto_asset import CryptoAsset
from app.schemas.crypto_asset import (
    CryptoAssetResponse,
    CryptoAssetListResponse
)
from app.api_clients.coingecko_client import CoinGeckoClient
from app.services.asset_sync_service import asset_sync_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=CryptoAssetListResponse)
async def get_crypto_assets(
    category: Optional[str] = Query(
        None, description="Filter by category (top, trending, defi, etc.)"
    ),
    market_cap_min: Optional[float] = Query(
        None, description="Minimum market cap filter"
    ),
    market_cap_max: Optional[float] = Query(
        None, description="Maximum market cap filter"
    ),
    search: Optional[str] = Query(
        None, description="Search by name or symbol"
    ),
    limit: int = Query(100, description="Maximum number of assets to return"),
    offset: int = Query(0, description="Number of assets to skip"),
    db: Session = Depends(get_db)
):
    """
    Get list of cryptocurrency assets with optional filtering using CoinGecko API
    """
    try:
        coingecko_client = CoinGeckoClient()
        assets_data = []
        
        # Use CoinGecko API for real-time data and sync to database
        async with coingecko_client as client:
            if category is None:
                # Default to all coins
                response = await client.get_top_coins(per_page=limit)
            elif category == "trending":
                # Get trending coins
                response = await client.get_trending_coins_detailed()
            elif category == "all":
                # Get top coins for "all" category
                response = await client.get_top_coins(per_page=limit)
            else:
                # Use the category mapping system
                response = await client.get_coins_by_category(category, per_page=limit)
            
            if response.success and response.data:
                # Sync assets to database to ensure they exist for portfolio creation
                coin_ids = [coin_data.get("id") for coin_data in response.data if coin_data.get("id")]
                if coin_ids:
                    sync_result = await asset_sync_service.ensure_assets_exist(db, coin_ids)
                    print(f"🔄 [CryptoAssets] Asset sync result: {sync_result}")
                
                # Convert CoinGecko data to our format
                for coin_data in response.data:
                    asset = {
                        "id": coin_data.get("id", ""),
                        "symbol": coin_data.get("symbol", "").upper(),
                        "name": coin_data.get("name", ""),
                        "current_price_usd": coin_data.get("current_price", 0),
                        "price_change_24h": coin_data.get("price_change_24h", 0),
                        "price_change_percentage_24h": coin_data.get("price_change_percentage_24h", 0),
                        "market_cap": coin_data.get("market_cap", 0),
                        "volume_24h": coin_data.get("total_volume", 0),
                        "circulating_supply": coin_data.get("circulating_supply", 0),
                        "total_supply": coin_data.get("total_supply", 0),
                        "max_supply": coin_data.get("max_supply", 0),
                        "logo_url": coin_data.get("image", ""),
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                    
                    # Apply market cap filters
                    if market_cap_min is not None and asset["market_cap"] < market_cap_min:
                        continue
                    if market_cap_max is not None and asset["market_cap"] > market_cap_max:
                        continue
                    
                    # Apply search filter
                    if search:
                        search_term = search.lower()
                        if (search_term not in asset["name"].lower() and 
                            search_term not in asset["symbol"].lower()):
                            continue
                    
                    assets_data.append(asset)
        
        # Apply pagination
        total_count = len(assets_data)
        paginated_assets = assets_data[offset:offset + limit]
        
        # Convert to response format
        assets = [CryptoAssetResponse(**asset) for asset in paginated_assets]
        
        return CryptoAssetListResponse(
            assets=assets,
            total=total_count,
            page=offset // limit + 1,
            page_size=limit
        )
        
    except Exception as e:
        logger.error(f"Error fetching crypto assets: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cryptocurrency assets")

@router.get("/trending", response_model=List[CryptoAssetResponse])
async def get_trending_crypto_assets(
    limit: int = Query(50, description="Maximum number of trending assets to return"),
    db: Session = Depends(get_db)
):
    """
    Get trending cryptocurrency assets using CoinGecko API
    """
    try:
        coingecko_client = CoinGeckoClient()
        
        async with coingecko_client as client:
            response = await client.get_trending_coins_detailed()
            
            if response.success and response.data:
                assets = []
                for coin_data in response.data[:limit]:
                    asset = {
                        "id": coin_data.get("id", ""),
                        "symbol": coin_data.get("symbol", "").upper(),
                        "name": coin_data.get("name", ""),
                        "current_price_usd": coin_data.get("current_price", 0),
                        "price_change_24h": coin_data.get("price_change_24h", 0),
                        "price_change_percentage_24h": coin_data.get("price_change_percentage_24h", 0),
                        "market_cap": coin_data.get("market_cap", 0),
                        "volume_24h": coin_data.get("total_volume", 0),
                        "circulating_supply": coin_data.get("circulating_supply", 0),
                        "total_supply": coin_data.get("total_supply", 0),
                        "max_supply": coin_data.get("max_supply", 0),
                        "logo_url": coin_data.get("image", ""),
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                    assets.append(CryptoAssetResponse(**asset))
                
                return assets
        
        return []
        
    except Exception as e:
        logger.error(f"Error fetching trending crypto assets: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending cryptocurrency assets")

@router.get("/top", response_model=List[CryptoAssetResponse])
async def get_top_crypto_assets(
    limit: int = Query(100, description="Maximum number of top assets to return"),
    db: Session = Depends(get_db)
):
    """
    Get top cryptocurrency assets by market cap using CoinGecko API
    """
    try:
        coingecko_client = CoinGeckoClient()
        
        async with coingecko_client as client:
            response = await client.get_top_coins(per_page=limit)
            
            if response.success and response.data:
                assets = []
                for coin_data in response.data:
                    asset = {
                        "id": coin_data.get("id", ""),
                        "symbol": coin_data.get("symbol", "").upper(),
                        "name": coin_data.get("name", ""),
                        "current_price_usd": coin_data.get("current_price", 0),
                        "price_change_24h": coin_data.get("price_change_24h", 0),
                        "price_change_percentage_24h": coin_data.get("price_change_percentage_24h", 0),
                        "market_cap": coin_data.get("market_cap", 0),
                        "volume_24h": coin_data.get("total_volume", 0),
                        "circulating_supply": coin_data.get("circulating_supply", 0),
                        "total_supply": coin_data.get("total_supply", 0),
                        "max_supply": coin_data.get("max_supply", 0),
                        "logo_url": coin_data.get("image", ""),
                        "is_active": True,
                        "created_at": "2024-01-01T00:00:00Z",
                        "updated_at": "2024-01-01T00:00:00Z"
                    }
                    assets.append(CryptoAssetResponse(**asset))
                
                return assets
        
        return []
        
    except Exception as e:
        logger.error(f"Error fetching top crypto assets: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch top cryptocurrency assets")

@router.get("/search", response_model=List[CryptoAssetResponse])
async def search_crypto_assets(
    q: str = Query(..., description="Search query for name or symbol"),
    limit: int = Query(20, description="Maximum number of search results"),
    db: Session = Depends(get_db)
):
    """
    Search for cryptocurrency assets by name or symbol using CoinGecko API
    """
    try:
        if not q.strip():
            return []
        
        coingecko_client = CoinGeckoClient()
        
        async with coingecko_client as client:
            # First search for coins
            search_response = await client.search_coins(q)
            
            if search_response.success and search_response.data:
                # Get coin IDs from search results
                coin_ids = [coin["id"] for coin in search_response.data.get("coins", [])[:limit]]
                
                if coin_ids:
                    # Get detailed market data for found coins
                    market_response = await client.get_coin_market_data(
                        coin_ids=coin_ids,
                        per_page=len(coin_ids)
                    )
                    
                    if market_response.success and market_response.data:
                        assets = []
                        for coin_data in market_response.data:
                            asset = {
                                "id": coin_data.get("id", ""),
                                "symbol": coin_data.get("symbol", "").upper(),
                                "name": coin_data.get("name", ""),
                                "current_price_usd": coin_data.get("current_price", 0),
                                "price_change_24h": coin_data.get("price_change_24h", 0),
                                "price_change_percentage_24h": coin_data.get("price_change_percentage_24h", 0),
                                "market_cap": coin_data.get("market_cap", 0),
                                "volume_24h": coin_data.get("total_volume", 0),
                                "circulating_supply": coin_data.get("circulating_supply", 0),
                                "total_supply": coin_data.get("total_supply", 0),
                                "max_supply": coin_data.get("max_supply", 0),
                                "logo_url": coin_data.get("image", ""),
                                "is_active": True,
                                "created_at": "2024-01-01T00:00:00Z",
                                "updated_at": "2024-01-01T00:00:00Z"
                            }
                            assets.append(CryptoAssetResponse(**asset))
                        
                        return assets
        
        return []
        
    except Exception as e:
        logger.error(f"Error searching crypto assets: {e}")
        raise HTTPException(status_code=500, detail="Failed to search cryptocurrency assets")

@router.get("/{asset_id}", response_model=CryptoAssetResponse)
async def get_crypto_asset(
    asset_id: str,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific cryptocurrency asset
    """
    try:
        asset = db.query(CryptoAsset).filter(
            CryptoAsset.id == asset_id,
            CryptoAsset.is_active == True
        ).first()
        
        if not asset:
            raise HTTPException(status_code=404, detail="Cryptocurrency asset not found")
        
        return CryptoAssetResponse.from_orm(asset)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching crypto asset {asset_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch cryptocurrency asset")

@router.get("/{asset_id}/price-history")
async def get_crypto_asset_price_history(
    asset_id: str,
    timeframe: str = Query("24h", description="Timeframe for price history"),
    db: Session = Depends(get_db)
):
    """
    Get price history for a specific cryptocurrency asset
    """
    try:
        # This would typically fetch from a price history table
        # For now, return a placeholder response
        return {
            "asset_id": asset_id,
            "timeframe": timeframe,
            "prices": [],
            "message": "Price history endpoint - to be implemented"
        }
        
    except Exception as e:
        logger.error(f"Error fetching price history for {asset_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch price history")

@router.get("/categories/list")
async def get_crypto_categories():
    """
    Get list of available cryptocurrency categories from CoinGecko API
    """
    try:
        coingecko_client = CoinGeckoClient()
        
        async with coingecko_client as client:
            response = await client.get_categories()
            
            if response.success and response.data:
                # Add special categories
                categories = [
                    {"id": "all", "name": "All", "description": "All cryptocurrencies"},
                    {"id": "trending", "name": "Trending", "description": "High volume & price movement"},
                ]
                
                # Add dynamic categories from CoinGecko (limit to top 5 for testing)
                for category_data in response.data[:5]:
                    categories.append({
                        "id": category_data.get("id", ""),
                        "name": category_data.get("name", ""),
                        "description": category_data.get("content", ""),
                        "market_cap": category_data.get("market_cap", 0),
                        "market_cap_change_24h": category_data.get("market_cap_change_24h", 0),
                        "volume_24h": category_data.get("volume_24h", 0),
                        "top_3_coins": category_data.get("top_3_coins", []),
                        "updated_at": category_data.get("updated_at", "")
                    })
                
                return {"categories": categories}
        
        # Fallback to static categories if API fails
        return {
            "categories": [
                {"id": "all", "name": "All", "description": "All cryptocurrencies"},
                {"id": "top", "name": "Top by Market Cap", "description": "Largest cryptocurrencies"},
                {"id": "trending", "name": "Trending", "description": "High volume & price movement"},
                {"id": "smart-contract-platform", "name": "Smart Contract Platform", "description": "Blockchain platforms with smart contract capabilities"},
                {"id": "world-liberty-financial-portfolio", "name": "World Liberty Financial Portfolio", "description": "Financial freedom focused cryptocurrencies"},
                {"id": "made-in-usa", "name": "Made in USA", "description": "US-based cryptocurrency projects"},
                {"id": "alleged-sec-securities", "name": "Alleged SEC Securities", "description": "Cryptocurrencies under SEC scrutiny"},
                {"id": "stablecoins", "name": "Stablecoins", "description": "Price-stable cryptocurrencies"},
                {"id": "exchange-based-tokens", "name": "Exchange-based Tokens", "description": "Tokens issued by cryptocurrency exchanges"},
                {"id": "decentralized-finance-defi", "name": "Decentralized Finance (DeFi)", "description": "Decentralized financial protocols"},
                {"id": "meme", "name": "Meme", "description": "Community-driven meme tokens"},
                {"id": "real-world-assets-rwa", "name": "Real World Assets (RWA)", "description": "Tokens backed by real-world assets"},
                {"id": "governance", "name": "Governance", "description": "Governance and voting tokens"},
            ]
        }
        
    except Exception as e:
        logger.error(f"Error fetching crypto categories: {e}")
        # Return fallback categories
        return {
            "categories": [
                {"id": "all", "name": "All", "description": "All cryptocurrencies"},
                {"id": "top", "name": "Top by Market Cap", "description": "Largest cryptocurrencies"},
                {"id": "trending", "name": "Trending", "description": "High volume & price movement"},
            ]
        }
