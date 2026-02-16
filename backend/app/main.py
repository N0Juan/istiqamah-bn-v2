"""
IstiqamahBN Backend API
Main FastAPI application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os
import logging

from app.api import routes
from app.core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="IstiqamahBN Prayer Times API",
    description="Backend API for IstiqamahBN iOS app - Prayer times for Brunei from MORA",
    version="1.0.0",
)

# Configure CORS for iOS app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(routes.router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "IstiqamahBN Prayer Times API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    """Health check endpoint for Docker healthcheck and monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "istiqamah-bn-api",
        "database": os.path.exists(os.getenv("DATABASE_PATH", "/app/data/prayer_times.db"))
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
