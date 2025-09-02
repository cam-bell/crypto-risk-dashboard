"""
Crypto Risk Dashboard Backend API
FastAPI application for portfolio management and risk analysis
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers (will be created)
# from app.api.v1.api import api_router
# from app.core.config import settings
# from app.db.session import engine
# from app.db.base import Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Crypto Risk Dashboard API...")
    
    # Create database tables
    # Base.metadata.create_all(bind=engine)
    
    print("✅ API startup complete")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Crypto Risk Dashboard API...")
    print("✅ API shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="Crypto Risk Dashboard API",
    description="AI-Powered Crypto Portfolio Risk Analysis API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

# Include API router
# app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Crypto Risk Dashboard API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": "2024-12-01T00:00:00Z"
    }

@app.get("/api/v1/portfolios")
async def get_portfolios():
    """Get user portfolios - placeholder endpoint"""
    return {
        "portfolios": [
            {
                "id": "sample-uuid",
                "name": "Sample Portfolio",
                "description": "This is a sample portfolio",
                "total_value": 50000.0,
                "created_at": "2024-12-01T00:00:00Z"
            }
        ]
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "status_code": 500}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("DEBUG", "true").lower() == "true"
    )
