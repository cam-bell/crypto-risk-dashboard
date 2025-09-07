"""
Asset Synchronization Service

Automatically syncs cryptocurrency assets from CoinGecko API to the database,
ensuring we always have the latest assets available for portfolio creation.
"""

import asyncio
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.session import get_db
from app.models.crypto_asset import CryptoAsset
from app.api_clients.coingecko_client import CoinGeckoClient
from app.core.api_config import api_config


class AssetSyncService:
    """Service for synchronizing crypto assets from CoinGecko"""
    
    def __init__(self):
        self.coingecko_client = CoinGeckoClient()
    
    async def sync_assets_from_markets(
        self, 
        db: Session, 
        category: Optional[str] = None,
        per_page: int = 100
    ) -> Dict[str, Any]:
        """
        Sync assets from CoinGecko markets endpoint
        
        Args:
            db: Database session
            category: Optional category filter (trending, defi, etc.)
            per_page: Number of assets to fetch
            
        Returns:
            Dict with sync results
        """
        print(f"🔄 [AssetSync] Starting asset sync for category: {category}")
        
        try:
            # Get market data from CoinGecko
            if category == "trending":
                response = await self.coingecko_client.get_trending_coins_detailed()
            elif category:
                response = await self.coingecko_client.get_coins_by_category(category, per_page=per_page)
            else:
                response = await self.coingecko_client.get_top_coins(per_page=per_page)
            
            if not response.success or not response.data:
                print(f"❌ [AssetSync] No data received from CoinGecko for category: {category}")
                return {"success": False, "error": "No data from CoinGecko", "synced": 0}
            
            synced_count = 0
            updated_count = 0
            created_count = 0
            
            for coin_data in response.data:
                coin_id = coin_data.get("id")
                if not coin_id:
                    continue
                
                # Check if asset already exists
                existing_asset = db.query(CryptoAsset).filter(
                    CryptoAsset.id == coin_id
                ).first()
                
                if existing_asset:
                    # Update existing asset
                    self._update_asset_from_coingecko_data(existing_asset, coin_data)
                    updated_count += 1
                else:
                    # Create new asset
                    new_asset = self._create_asset_from_coingecko_data(coin_data)
                    db.add(new_asset)
                    created_count += 1
                
                synced_count += 1
            
            # Commit all changes
            db.commit()
            
            print(f"✅ [AssetSync] Sync completed - Created: {created_count}, Updated: {updated_count}, Total: {synced_count}")
            
            return {
                "success": True,
                "synced": synced_count,
                "created": created_count,
                "updated": updated_count,
                "category": category
            }
            
        except Exception as e:
            print(f"❌ [AssetSync] Error syncing assets: {str(e)}")
            db.rollback()
            return {"success": False, "error": str(e), "synced": 0}
    
    async def sync_assets_by_ids(
        self, 
        db: Session, 
        coin_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Sync specific assets by their CoinGecko IDs
        
        Args:
            db: Database session
            coin_ids: List of CoinGecko coin IDs
            
        Returns:
            Dict with sync results
        """
        print(f"🔄 [AssetSync] Syncing specific assets: {coin_ids}")
        
        try:
            # Get market data for specific coins
            response = await self.coingecko_client.get_coin_market_data(
                coin_ids=coin_ids,
                per_page=len(coin_ids)
            )
            
            if not response.success or not response.data:
                print(f"❌ [AssetSync] No data received for coins: {coin_ids}")
                return {"success": False, "error": "No data from CoinGecko", "synced": 0}
            
            synced_count = 0
            updated_count = 0
            created_count = 0
            
            for coin_data in response.data:
                coin_id = coin_data.get("id")
                if not coin_id:
                    continue
                
                # Check if asset already exists
                existing_asset = db.query(CryptoAsset).filter(
                    CryptoAsset.id == coin_id
                ).first()
                
                if existing_asset:
                    # Update existing asset
                    self._update_asset_from_coingecko_data(existing_asset, coin_data)
                    updated_count += 1
                else:
                    # Create new asset
                    new_asset = self._create_asset_from_coingecko_data(coin_data)
                    db.add(new_asset)
                    created_count += 1
                
                synced_count += 1
            
            # Commit all changes
            db.commit()
            
            print(f"✅ [AssetSync] Specific sync completed - Created: {created_count}, Updated: {updated_count}, Total: {synced_count}")
            
            return {
                "success": True,
                "synced": synced_count,
                "created": created_count,
                "updated": updated_count,
                "coin_ids": coin_ids
            }
            
        except Exception as e:
            print(f"❌ [AssetSync] Error syncing specific assets: {str(e)}")
            db.rollback()
            return {"success": False, "error": str(e), "synced": 0}
    
    def _create_asset_from_coingecko_data(self, coin_data: Dict[str, Any]) -> CryptoAsset:
        """Create a new CryptoAsset from CoinGecko data"""
        return CryptoAsset(
            id=coin_data.get("id", ""),
            symbol=coin_data.get("symbol", "").upper(),
            name=coin_data.get("name", ""),
            coingecko_id=coin_data.get("id", ""),
            current_price_usd=coin_data.get("current_price", 0),
            price_change_24h=coin_data.get("price_change_24h", 0),
            price_change_percentage_24h=coin_data.get("price_change_percentage_24h", 0),
            market_cap=coin_data.get("market_cap", 0),
            volume_24h=coin_data.get("total_volume", 0),
            circulating_supply=coin_data.get("circulating_supply", 0),
            total_supply=coin_data.get("total_supply", 0),
            max_supply=coin_data.get("max_supply", 0),
            logo_url=coin_data.get("image", ""),
            is_active=True
        )
    
    def _update_asset_from_coingecko_data(self, asset: CryptoAsset, coin_data: Dict[str, Any]) -> None:
        """Update existing CryptoAsset with fresh CoinGecko data"""
        asset.current_price_usd = coin_data.get("current_price", asset.current_price_usd)
        asset.price_change_24h = coin_data.get("price_change_24h", asset.price_change_24h)
        asset.price_change_percentage_24h = coin_data.get("price_change_percentage_24h", asset.price_change_percentage_24h)
        asset.market_cap = coin_data.get("market_cap", asset.market_cap)
        asset.volume_24h = coin_data.get("total_volume", asset.volume_24h)
        asset.circulating_supply = coin_data.get("circulating_supply", asset.circulating_supply)
        asset.total_supply = coin_data.get("total_supply", asset.total_supply)
        asset.max_supply = coin_data.get("max_supply", asset.max_supply)
        asset.logo_url = coin_data.get("image", asset.logo_url)
    
    async def ensure_assets_exist(
        self, 
        db: Session, 
        coin_ids: List[str]
    ) -> Dict[str, Any]:
        """
        Ensure that all specified coin IDs exist in the database.
        If not, sync them from CoinGecko.
        
        Args:
            db: Database session
            coin_ids: List of CoinGecko coin IDs to ensure exist
            
        Returns:
            Dict with results
        """
        print(f"🔍 [AssetSync] Ensuring assets exist: {coin_ids}")
        
        # Check which assets are missing
        existing_assets = db.query(CryptoAsset).filter(
            CryptoAsset.id.in_(coin_ids)
        ).all()
        
        existing_ids = {asset.id for asset in existing_assets}
        missing_ids = [coin_id for coin_id in coin_ids if coin_id not in existing_ids]
        
        if not missing_ids:
            print(f"✅ [AssetSync] All assets already exist in database")
            return {
                "success": True,
                "existing": len(existing_ids),
                "missing": 0,
                "synced": 0
            }
        
        print(f"🔄 [AssetSync] Missing assets: {missing_ids}, syncing from CoinGecko...")
        
        # Sync missing assets
        sync_result = await self.sync_assets_by_ids(db, missing_ids)
        
        return {
            "success": sync_result["success"],
            "existing": len(existing_ids),
            "missing": len(missing_ids),
            "synced": sync_result.get("synced", 0),
            "error": sync_result.get("error")
        }


# Global instance
asset_sync_service = AssetSyncService()
