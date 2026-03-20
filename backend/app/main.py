"""
IstiqamahBN Backend API
Main FastAPI application entry point
"""
import asyncio
import os
import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import routes
from app.api import push_routes
from app.core.logging import setup_logging
from app.notifications.push_service import get_push_service

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle — starts the push notification scheduler."""
    push_service = get_push_service()
    task = None

    if push_service.vapid_private_key:
        task = asyncio.create_task(push_service.run_scheduler())
        logger.info("Push notification scheduler started")
    else:
        logger.warning("VAPID keys not configured — push notifications disabled")

    yield

    if task:
        push_service.stop()
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


# Create FastAPI app
app = FastAPI(
    title="IstiqamahBN Prayer Times API",
    description="Backend API for IstiqamahBN — Prayer times for Brunei from MORA",
    version="1.1.0",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(routes.router)
app.include_router(push_routes.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "IstiqamahBN Prayer Times API",
        "version": "1.1.0",
        "status": "running",
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint for Docker healthcheck and monitoring"""
    push_service = get_push_service()
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "istiqamah-bn-api",
        "database": os.path.exists(os.getenv("DATABASE_PATH", "/app/data/prayer_times.db")),
        "push_enabled": bool(push_service.vapid_private_key),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
