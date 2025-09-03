import logging
from celery import Celery
from celery.schedules import crontab
from app.core.api_config import api_config

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "crypto_risk_dashboard",
    broker=api_config.celery_broker_url,
    backend=api_config.celery_result_backend,
    include=[
        "app.background_tasks.tasks"
    ]
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    broker_connection_retry_on_startup=True,
    result_expires=3600,  # 1 hour
    task_always_eager=False,  # Set to True for testing
)

# Beat schedule for periodic tasks
celery_app.conf.beat_schedule = {
    "fetch-crypto-prices": {
        "task": "app.background_tasks.tasks.fetch_crypto_prices",
        "schedule": api_config.price_refresh_interval,
        "args": (),
    },
    "fetch-market-data": {
        "task": "app.background_tasks.tasks.fetch_market_data",
        "schedule": api_config.market_data_refresh_interval,
        "args": (),
    },
    "fetch-wallet-analysis": {
        "task": "app.background_tasks.tasks.fetch_wallet_analysis",
        "schedule": api_config.wallet_analysis_refresh_interval,
        "args": (),
    },
    "cleanup-cache": {
        "task": "app.background_tasks.tasks.cleanup_cache",
        "schedule": crontab(hour=2, minute=0),  # Daily at 2 AM
        "args": (),
    },
    "health-check-apis": {
        "task": "app.background_tasks.tasks.health_check_apis",
        "schedule": 300,  # Every 5 minutes
        "args": (),
    },
}

# Task routing
celery_app.conf.task_routes = {
    "app.background_tasks.tasks.fetch_crypto_prices": {"queue": "crypto_data"},
    "app.background_tasks.tasks.fetch_market_data": {"queue": "market_data"},
            "app.background_tasks.tasks.fetch_wallet_analysis": {
            "queue": "blockchain_data"
        },
    "app.background_tasks.tasks.cleanup_cache": {"queue": "maintenance"},
    "app.background_tasks.tasks.health_check_apis": {"queue": "monitoring"},
}


# Error handling
@celery_app.task(bind=True)
def debug_task(self):
    """Debug task for testing"""
    logger.info(f"Request: {self.request!r}")


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """Setup periodic tasks after Celery configuration"""
    logger.info("Setting up periodic tasks")
    
    # Add custom periodic tasks if needed
    # Note: fetch_crypto_prices is imported in tasks.py
    pass


def get_celery_app():
    """Get Celery app instance"""
    return celery_app
