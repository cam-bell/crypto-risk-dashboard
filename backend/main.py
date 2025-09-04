"""
Crypto Risk Dashboard Backend API
FastAPI application for portfolio management and risk analysis
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from dotenv import load_dotenv
import json
from typing import List

# Import routers
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.base import Base
from app.core.config import settings

# Load environment variables
load_dotenv()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                # Remove disconnected connections
                self.active_connections.remove(connection)


manager = ConnectionManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Crypto Risk Dashboard API...")
    
    # Create database tables
    Base.metadata.create_all(bind=engine)
    
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
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "0.0.0.0"]
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


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


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            # Wait for messages from client
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                
                # Handle different message types
                if message.get("type") == "subscribe":
                    # Handle subscription
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "subscribed",
                            "data": message.get("data"),
                            "timestamp": message.get("timestamp")
                        }),
                        websocket
                    )
                elif message.get("type") == "heartbeat":
                    # Respond to heartbeat
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "heartbeat",
                            "data": {"timestamp": message.get("timestamp")},
                            "timestamp": message.get("timestamp")
                        }),
                        websocket
                    )
                else:
                    # Echo back other messages
                    await manager.send_personal_message(data, websocket)
                    
            except json.JSONDecodeError:
                await manager.send_personal_message(
                    json.dumps({
                        "type": "error",
                        "data": "Invalid JSON format",
                        "timestamp": "2024-12-01T00:00:00Z"
                    }),
                    websocket
                )
                
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)




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
