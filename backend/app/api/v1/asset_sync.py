"""
Asset Synchronization API endpoints

Provides endpoints for manually triggering asset synchronization
and checking sync status.
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.db.session import get_db
from app.services.asset_sync_service import asset_sync_service
from app.schemas.crypto_asset import CryptoAssetListResponse

router = APIRouter()


@router.post("/sync/category/{category}")
async def sync_assets_by_category(
    category: str,
    per_page: int = 100,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Sync assets from a specific CoinGecko category
    
    Args:
        category: CoinGecko category (trending, defi, ai, etc.)
        per_page: Number of assets to sync
        background_tasks: FastAPI background tasks
        db: Database session
        
    Returns:
        Sync results
    """
    try:
        print(f"🔄 [AssetSyncAPI] Starting sync for category: {category}")
        
        result = await asset_sync_service.sync_assets_from_markets(
            db=db,
            category=category,
            per_page=per_page
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Successfully synced {result['synced']} assets from category '{category}'",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to sync assets: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        print(f"❌ [AssetSyncAPI] Error syncing category {category}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to sync assets from category '{category}': {str(e)}"
        )


@router.post("/sync/coins")
async def sync_specific_coins(
    coin_ids: List[str],
    db: Session = Depends(get_db)
):
    """
    Sync specific coins by their CoinGecko IDs
    
    Args:
        coin_ids: List of CoinGecko coin IDs to sync
        db: Database session
        
    Returns:
        Sync results
    """
    try:
        print(f"🔄 [AssetSyncAPI] Starting sync for specific coins: {coin_ids}")
        
        if not coin_ids:
            raise HTTPException(
                status_code=400,
                detail="No coin IDs provided"
            )
        
        result = await asset_sync_service.sync_assets_by_ids(
            db=db,
            coin_ids=coin_ids
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Successfully synced {result['synced']} specific assets",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to sync specific assets: {result.get('error', 'Unknown error')}"
            )
            
    except Exception as e:
        print(f"❌ [AssetSyncAPI] Error syncing specific coins: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to sync specific assets: {str(e)}"
        )


@router.post("/ensure")
async def ensure_assets_exist(
    coin_ids: List[str],
    db: Session = Depends(get_db)
):
    """
    Ensure that specific coins exist in the database.
    If they don't exist, sync them from CoinGecko.
    
    Args:
        coin_ids: List of CoinGecko coin IDs to ensure exist
        db: Database session
        
    Returns:
        Ensure results
    """
    try:
        print(f"🔍 [AssetSyncAPI] Ensuring assets exist: {coin_ids}")
        
        if not coin_ids:
            raise HTTPException(
                status_code=400,
                detail="No coin IDs provided"
            )
        
        result = await asset_sync_service.ensure_assets_exist(
            db=db,
            coin_ids=coin_ids
        )
        
        return {
            "success": True,
            "message": f"Asset check completed. Existing: {result['existing']}, Missing: {result['missing']}, Synced: {result['synced']}",
            "data": result
        }
            
    except Exception as e:
        print(f"❌ [AssetSyncAPI] Error ensuring assets exist: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to ensure assets exist: {str(e)}"
        )


@router.get("/status")
async def get_sync_status(
    db: Session = Depends(get_db)
):
    """
    Get current asset sync status and statistics
    
    Args:
        db: Database session
        
    Returns:
        Sync status and statistics
    """
    try:
        from app.models.crypto_asset import CryptoAsset
        
        # Get total assets in database
        total_assets = db.query(CryptoAsset).count()
        
        # Get active assets
        active_assets = db.query(CryptoAsset).filter(CryptoAsset.is_active == True).count()
        
        # Get recently updated assets (last 24 hours)
        from datetime import datetime, timedelta
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_assets = db.query(CryptoAsset).filter(
            CryptoAsset.updated_at >= yesterday
        ).count()
        
        return {
            "success": True,
            "data": {
                "total_assets": total_assets,
                "active_assets": active_assets,
                "recently_updated": recent_assets,
                "last_check": datetime.utcnow().isoformat()
            }
        }
        
    except Exception as e:
        print(f"❌ [AssetSyncAPI] Error getting sync status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get sync status: {str(e)}"
        )
