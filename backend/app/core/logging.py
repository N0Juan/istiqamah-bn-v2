"""
Logging configuration for IstiqamahBN Backend
"""
import logging
import sys
from pathlib import Path


def setup_logging(log_level: str = "INFO"):
    """
    Configure application logging

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    """
    # Create logs directory if it doesn't exist
    # Use /app/logs in Docker, ./logs locally
    import os
    if os.path.exists("/app"):
        log_dir = Path("/app/logs")
    else:
        log_dir = Path(__file__).parent.parent.parent / "logs"

    log_dir.mkdir(parents=True, exist_ok=True)

    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler
            logging.FileHandler(log_dir / "istiqamah-bn.log")
        ]
    )

    # Set specific log levels for libraries
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("urllib3").setLevel(logging.WARNING)

    logger = logging.getLogger(__name__)
    logger.info(f"Logging configured with level: {log_level}")
