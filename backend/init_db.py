"""
Database initialization script for Crypto Risk Dashboard
"""
import os
import sys
import asyncio
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.base import Base
from app.models import *


def init_database():
    """Initialize the database with tables and seed data"""
    print("🚀 Initializing Crypto Risk Dashboard Database...")
    
    # Create database engine
    engine = create_engine(settings.DATABASE_URL)
    
    try:
        # Test database connection
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            print(f"✅ Connected to PostgreSQL: {result.fetchone()[0]}")
            
            # Check if TimescaleDB extension is available
            try:
                result = conn.execute(text("SELECT default_version, installed_version FROM pg_available_extensions WHERE name = 'timescaledb'"))
                timescale_info = result.fetchone()
                if timescale_info and timescale_info[1]:
                    print(f"✅ TimescaleDB extension is installed: {timescale_info[1]}")
                else:
                    print("⚠️  TimescaleDB extension not found. Some features may not work properly.")
            except Exception as e:
                print(f"⚠️  Could not check TimescaleDB extension: {e}")
    
    except OperationalError as e:
        print(f"❌ Failed to connect to database: {e}")
        print("Please ensure PostgreSQL is running and the database exists.")
        return False
    
    # Create all tables
    print("📋 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Seed data
        print("🌱 Seeding database with initial data...")
        seed_database(db)
        print("✅ Database seeded successfully")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        return False
    
    finally:
        db.close()
    
    print("🎉 Database initialization completed successfully!")
    return True


def seed_database(db):
    """Seed the database with initial data"""
    
    # Create sample users
    print("  👥 Creating sample users...")
    users = create_sample_users(db)
    
    # Create sample crypto assets
    print("  🪙 Creating sample crypto assets...")
    crypto_assets = create_sample_crypto_assets(db)
    
    # Create sample portfolios
    print("  💼 Creating sample portfolios...")
    portfolios = create_sample_portfolios(db, users, crypto_assets)
    
    # Create sample portfolio holdings
    print("  📊 Creating sample portfolio holdings...")
    create_sample_portfolio_holdings(db, portfolios, crypto_assets)
    
    # Create sample price history
    print("  📈 Creating sample price history...")
    create_sample_price_history(db, crypto_assets)
    
    # Create sample risk metrics
    print("  ⚠️  Creating sample risk metrics...")
    create_sample_risk_metrics(db, crypto_assets, portfolios)
    
    # Create sample AI insights
    print("  🤖 Creating sample AI insights...")
    create_sample_ai_insights(db, users, portfolios, crypto_assets)
    
    # Create sample alerts
    print("  🔔 Creating sample alerts...")
    create_sample_alerts(db, users, portfolios, crypto_assets)
    
    # Create user settings
    print("  ⚙️  Creating user settings...")
    create_user_settings(db, users)
    
    db.commit()


def create_sample_users(db):
    """Create sample users"""
    from passlib.context import CryptContext
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    users = [
        {
            "email": "admin@cryptodashboard.com",
            "username": "admin",
            "hashed_password": pwd_context.hash("admin123"),
            "full_name": "Admin User",
            "is_active": True,
            "is_superuser": True
        },
        {
            "email": "user@cryptodashboard.com",
            "username": "user",
            "hashed_password": pwd_context.hash("user123"),
            "full_name": "Demo User",
            "is_active": True,
            "is_superuser": False
        }
    ]
    
    created_users = []
    for user_data in users:
        user = User(**user_data)
        db.add(user)
        db.flush()  # Get the ID
        created_users.append(user)
    
    return created_users


def create_sample_crypto_assets(db):
    """Create sample crypto assets"""
    crypto_assets = [
        {
            "symbol": "BTC",
            "name": "Bitcoin",
            "coingecko_id": "bitcoin",
            "blockchain": "Bitcoin",
            "current_price_usd": 45000.0,
            "market_cap": 850000000000,
            "volume_24h": 25000000000,
            "description": "Bitcoin is a decentralized cryptocurrency"
        },
        {
            "symbol": "ETH",
            "name": "Ethereum",
            "coingecko_id": "ethereum",
            "blockchain": "Ethereum",
            "current_price_usd": 2800.0,
            "market_cap": 350000000000,
            "volume_24h": 15000000000,
            "description": "Ethereum is a decentralized platform"
        },
        {
            "symbol": "ADA",
            "name": "Cardano",
            "coingecko_id": "cardano",
            "blockchain": "Cardano",
            "current_price_usd": 0.45,
            "market_cap": 15000000000,
            "volume_24h": 800000000,
            "description": "Cardano is a blockchain platform"
        }
    ]
    
    created_assets = []
    for asset_data in crypto_assets:
        asset = CryptoAsset(**asset_data)
        db.add(asset)
        db.flush()
        created_assets.append(asset)
    
    return created_assets


def create_sample_portfolios(db, users, crypto_assets):
    """Create sample portfolios"""
    portfolios = [
        {
            "user_id": users[1].id,  # Demo user
            "name": "My Crypto Portfolio",
            "description": "A diversified cryptocurrency portfolio",
            "is_default": True,
            "is_public": False,
            "total_value_usd": 10000.0,
            "total_invested_usd": 8000.0,
            "total_profit_loss_usd": 2000.0,
            "total_profit_loss_percentage": 25.0
        }
    ]
    
    created_portfolios = []
    for portfolio_data in portfolios:
        portfolio = Portfolio(**portfolio_data)
        db.add(portfolio)
        db.flush()
        created_portfolios.append(portfolio)
    
    return created_portfolios


def create_sample_portfolio_holdings(db, portfolios, crypto_assets):
    """Create sample portfolio holdings"""
    holdings = [
        {
            "portfolio_id": portfolios[0].id,
            "crypto_asset_id": crypto_assets[0].id,  # BTC
            "quantity": 0.2,
            "average_buy_price_usd": 40000.0,
            "total_invested_usd": 8000.0,
            "current_value_usd": 9000.0,
            "profit_loss_usd": 1000.0,
            "profit_loss_percentage": 12.5
        }
    ]
    
    for holding_data in holdings:
        holding = PortfolioHolding(**holding_data)
        db.add(holding)


def create_sample_price_history(db, crypto_assets):
    """Create sample price history data"""
    base_time = datetime.now() - timedelta(days=30)
    
    for asset in crypto_assets:
        for i in range(30):
            timestamp = base_time + timedelta(days=i)
            price = asset.current_price_usd * (1 + (i - 15) * 0.02)  # Simulate price movement
            
            price_data = {
                "crypto_asset_id": asset.id,
                "timestamp": timestamp,
                "price_usd": price,
                "volume_24h": asset.volume_24h * (0.8 + 0.4 * (i % 7) / 7),  # Simulate volume
                "market_cap": asset.market_cap * (price / asset.current_price_usd)
            }
            
            price_history = PriceHistory(**price_data)
            db.add(price_history)


def create_sample_risk_metrics(db, crypto_assets, portfolios):
    """Create sample risk metrics"""
    base_time = datetime.now() - timedelta(days=30)
    
    for asset in crypto_assets:
        for i in range(30):
            timestamp = base_time + timedelta(days=i)
            
            risk_data = {
                "crypto_asset_id": asset.id,
                "timestamp": timestamp,
                "volatility": 0.02 + (i % 10) * 0.001,
                "var_95": 0.05 + (i % 10) * 0.002,
                "sharpe_ratio": 1.2 + (i % 10) * 0.1,
                "max_drawdown": 0.15 + (i % 10) * 0.01
            }
            
            risk_metric = RiskMetric(**risk_data)
            db.add(risk_metric)
    
    # Portfolio risk metrics
    for portfolio in portfolios:
        for i in range(30):
            timestamp = base_time + timedelta(days=i)
            
            portfolio_risk_data = {
                "portfolio_id": portfolio.id,
                "timestamp": timestamp,
                "total_value_usd": portfolio.total_value_usd * (1 + (i - 15) * 0.01),
                "total_invested_usd": portfolio.total_invested_usd,
                "total_profit_loss_usd": portfolio.total_profit_loss_usd * (1 + (i - 15) * 0.02),
                "total_profit_loss_percentage": portfolio.total_profit_loss_percentage * (1 + (i - 15) * 0.02),
                "volatility": 0.025 + (i % 10) * 0.001,
                "var_95": 0.06 + (i % 10) * 0.002,
                "sharpe_ratio": 1.1 + (i % 10) * 0.1
            }
            
            portfolio_risk_metric = PortfolioRiskMetric(**portfolio_risk_data)
            db.add(portfolio_risk_metric)


def create_sample_ai_insights(db, users, portfolios, crypto_assets):
    """Create sample AI insights"""
    insights = [
        {
            "user_id": users[1].id,
            "portfolio_id": portfolios[0].id,
            "insight_type": "risk",
            "title": "Portfolio Diversification Alert",
            "summary": "Your portfolio is heavily concentrated in Bitcoin. Consider diversifying to reduce risk.",
            "detailed_analysis": "Bitcoin represents 90% of your portfolio value, which increases volatility and risk.",
            "confidence_score": 0.85,
            "risk_level": "medium",
            "actionable": "yes",
            "tags": ["diversification", "risk-management", "portfolio"]
        },
        {
            "user_id": users[1].id,
            "crypto_asset_id": crypto_assets[0].id,
            "insight_type": "opportunity",
            "title": "Bitcoin Price Momentum",
            "summary": "Bitcoin shows strong upward momentum with increasing volume.",
            "detailed_analysis": "Technical indicators suggest continued upward movement in the short term.",
            "confidence_score": 0.72,
            "risk_level": "low",
            "actionable": "yes",
            "tags": ["technical-analysis", "momentum", "bitcoin"]
        }
    ]
    
    for insight_data in insights:
        insight = AIInsight(**insight_data)
        db.add(insight)


def create_sample_alerts(db, users, portfolios, crypto_assets):
    """Create sample alerts"""
    alerts = [
        {
            "user_id": users[1].id,
            "portfolio_id": portfolios[0].id,
            "alert_type": "portfolio",
            "title": "Portfolio Value Alert",
            "message": "Your portfolio value has increased by 25% in the last 30 days.",
            "severity": "info",
            "condition_type": "percentage",
            "condition_value": "25%",
            "current_value": "25%",
            "is_active": True
        },
        {
            "user_id": users[1].id,
            "crypto_asset_id": crypto_assets[0].id,
            "alert_type": "price",
            "title": "Bitcoin Price Alert",
            "message": "Bitcoin price has reached $45,000.",
            "severity": "warning",
            "condition_type": "threshold",
            "condition_value": "45000",
            "current_value": "45000",
            "is_active": True
        }
    ]
    
    for alert_data in alerts:
        alert = Alert(**alert_data)
        db.add(alert)


def create_user_settings(db, users):
    """Create user settings"""
    for user in users:
        settings_data = {
            "user_id": user.id,
            "email_notifications": True,
            "push_notifications": True,
            "sms_notifications": False,
            "price_alerts": True,
            "risk_alerts": True,
            "portfolio_alerts": True,
            "risk_tolerance": "medium",
            "max_portfolio_risk": "medium",
            "default_currency": "USD",
            "timezone": "UTC",
            "theme": "light"
        }
        
        user_settings = UserSettings(**settings_data)
        db.add(user_settings)


if __name__ == "__main__":
    success = init_database()
    if success:
        print("\n🎯 Next steps:")
        print("1. Run migrations: alembic upgrade head")
        print("2. Start the application: python main.py")
        print("3. Access the API at: http://localhost:8000/docs")
    else:
        print("\n❌ Database initialization failed. Please check the error messages above.")
        sys.exit(1)
