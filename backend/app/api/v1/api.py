"""
Main API router for v1 endpoints
"""

from fastapi import APIRouter

from app.api.v1.risk_metrics import router as risk_metrics_router

api_router = APIRouter()

# Include risk metrics router
api_router.include_router(
    risk_metrics_router,
    prefix="/risk-metrics",
    tags=["risk-metrics"]
)

# TODO: Add other API routers here
# api_router.include_router(portfolios_router, prefix="/portfolios", tags=["portfolios"])
# api_router.include_router(assets_router, prefix="/assets", tags=["assets"])
# api_router.include_router(users_router, prefix="/users", tags=["users"])
