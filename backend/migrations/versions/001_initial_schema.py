"""Initial database schema

Revision ID: 001
Revises: 
Create Date: 2024-12-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_superuser', sa.Boolean(), nullable=False),
        sa.Column('profile_picture_url', sa.String(length=500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # Create crypto_assets table
    op.create_table('crypto_assets',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('symbol', sa.String(length=20), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('coingecko_id', sa.String(length=100), nullable=True),
        sa.Column('contract_address', sa.String(length=255), nullable=True),
        sa.Column('blockchain', sa.String(length=50), nullable=True),
        sa.Column('decimals', sa.Float(), nullable=True),
        sa.Column('market_cap', sa.Float(), nullable=True),
        sa.Column('circulating_supply', sa.Float(), nullable=True),
        sa.Column('total_supply', sa.Float(), nullable=True),
        sa.Column('max_supply', sa.Float(), nullable=True),
        sa.Column('current_price_usd', sa.Float(), nullable=True),
        sa.Column('price_change_24h', sa.Float(), nullable=True),
        sa.Column('price_change_percentage_24h', sa.Float(), nullable=True),
        sa.Column('volume_24h', sa.Float(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('logo_url', sa.String(length=500), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('website_url', sa.String(length=500), nullable=True),
        sa.Column('whitepaper_url', sa.String(length=500), nullable=True),
        sa.Column('github_url', sa.String(length=500), nullable=True),
        sa.Column('twitter_url', sa.String(length=500), nullable=True),
        sa.Column('reddit_url', sa.String(length=500), nullable=True),
        sa.Column('telegram_url', sa.String(length=500), nullable=True),
        sa.Column('discord_url', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_crypto_assets_symbol', 'crypto_assets', ['symbol'], unique=True)
    op.create_index('ix_crypto_assets_coingecko_id', 'crypto_assets', ['coingecko_id'], unique=True)

    # Create portfolios table
    op.create_table('portfolios',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_default', sa.Boolean(), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False),
        sa.Column('total_value_usd', sa.Float(), nullable=False),
        sa.Column('total_invested_usd', sa.Float(), nullable=False),
        sa.Column('total_profit_loss_usd', sa.Float(), nullable=False),
        sa.Column('total_profit_loss_percentage', sa.Float(), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=True),
        sa.Column('volatility', sa.Float(), nullable=True),
        sa.Column('sharpe_ratio', sa.Float(), nullable=True),
        sa.Column('max_drawdown', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_portfolios_user_id', 'portfolios', ['user_id'], unique=False)

    # Create portfolio_holdings table
    op.create_table('portfolio_holdings',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('portfolio_id', sa.String(), nullable=False),
        sa.Column('crypto_asset_id', sa.String(), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('average_buy_price_usd', sa.Float(), nullable=False),
        sa.Column('total_invested_usd', sa.Float(), nullable=False),
        sa.Column('current_value_usd', sa.Float(), nullable=False),
        sa.Column('profit_loss_usd', sa.Float(), nullable=False),
        sa.Column('profit_loss_percentage', sa.Float(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_portfolio_holdings_portfolio_id', 'portfolio_holdings', ['portfolio_id'], unique=False)
    op.create_index('ix_portfolio_holdings_crypto_asset_id', 'portfolio_holdings', ['crypto_asset_id'], unique=False)

    # Create price_history table (will be converted to hypertable)
    op.create_table('price_history',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('crypto_asset_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('price_usd', sa.Float(), nullable=False),
        sa.Column('volume_24h', sa.Float(), nullable=True),
        sa.Column('market_cap', sa.Float(), nullable=True),
        sa.Column('price_change_24h', sa.Float(), nullable=True),
        sa.Column('price_change_percentage_24h', sa.Float(), nullable=True),
        sa.Column('high_24h', sa.Float(), nullable=True),
        sa.Column('low_24h', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_price_history_crypto_timestamp', 'price_history', ['crypto_asset_id', 'timestamp'], unique=False)
    op.create_index('idx_price_history_timestamp', 'price_history', ['timestamp'], unique=False)
    op.create_index('idx_price_history_crypto_asset', 'price_history', ['crypto_asset_id'], unique=False)

    # Create risk_metrics table (will be converted to hypertable)
    op.create_table('risk_metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('crypto_asset_id', sa.String(), nullable=True),
        sa.Column('portfolio_id', sa.String(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('volatility', sa.Float(), nullable=True),
        sa.Column('var_95', sa.Float(), nullable=True),
        sa.Column('var_99', sa.Float(), nullable=True),
        sa.Column('expected_shortfall', sa.Float(), nullable=True),
        sa.Column('sharpe_ratio', sa.Float(), nullable=True),
        sa.Column('sortino_ratio', sa.Float(), nullable=True),
        sa.Column('max_drawdown', sa.Float(), nullable=True),
        sa.Column('beta', sa.Float(), nullable=True),
        sa.Column('correlation_sp500', sa.Float(), nullable=True),
        sa.Column('correlation_btc', sa.Float(), nullable=True),
        sa.Column('skewness', sa.Float(), nullable=True),
        sa.Column('kurtosis', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_risk_metrics_timestamp', 'risk_metrics', ['timestamp'], unique=False)
    op.create_index('idx_risk_metrics_crypto_timestamp', 'risk_metrics', ['crypto_asset_id', 'timestamp'], unique=False)
    op.create_index('idx_risk_metrics_portfolio_timestamp', 'risk_metrics', ['portfolio_id', 'timestamp'], unique=False)

    # Create portfolio_risk_metrics table
    op.create_table('portfolio_risk_metrics',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('portfolio_id', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('total_value_usd', sa.Float(), nullable=False),
        sa.Column('total_invested_usd', sa.Float(), nullable=False),
        sa.Column('total_profit_loss_usd', sa.Float(), nullable=False),
        sa.Column('total_profit_loss_percentage', sa.Float(), nullable=False),
        sa.Column('volatility', sa.Float(), nullable=True),
        sa.Column('var_95', sa.Float(), nullable=True),
        sa.Column('var_99', sa.Float(), nullable=True),
        sa.Column('expected_shortfall', sa.Float(), nullable=True),
        sa.Column('sharpe_ratio', sa.Float(), nullable=True),
        sa.Column('sortino_ratio', sa.Float(), nullable=True),
        sa.Column('max_drawdown', sa.Float(), nullable=True),
        sa.Column('beta', sa.Float(), nullable=True),
        sa.Column('herfindahl_index', sa.Float(), nullable=True),
        sa.Column('effective_n', sa.Float(), nullable=True),
        sa.Column('correlation_matrix', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_portfolio_risk_metrics_portfolio_timestamp', 'portfolio_risk_metrics', ['portfolio_id', 'timestamp'], unique=False)
    op.create_index('idx_portfolio_risk_metrics_timestamp', 'portfolio_risk_metrics', ['timestamp'], unique=False)

    # Create ai_insights table
    op.create_table('ai_insights',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('portfolio_id', sa.String(), nullable=True),
        sa.Column('crypto_asset_id', sa.String(), nullable=True),
        sa.Column('insight_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('detailed_analysis', sa.Text(), nullable=True),
        sa.Column('confidence_score', sa.Float(), nullable=True),
        sa.Column('model_name', sa.String(length=100), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=True),
        sa.Column('prompt_used', sa.Text(), nullable=True),
        sa.Column('tags', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('risk_level', sa.String(length=20), nullable=True),
        sa.Column('actionable', sa.String(length=5), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_ai_insights_user_id', 'ai_insights', ['user_id'], unique=False)
    op.create_index('ix_ai_insights_portfolio_id', 'ai_insights', ['portfolio_id'], unique=False)
    op.create_index('ix_ai_insights_crypto_asset_id', 'ai_insights', ['crypto_asset_id'], unique=False)
    op.create_index('ix_ai_insights_insight_type', 'ai_insights', ['insight_type'], unique=False)

    # Create alerts table
    op.create_table('alerts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('portfolio_id', sa.String(), nullable=True),
        sa.Column('crypto_asset_id', sa.String(), nullable=True),
        sa.Column('alert_type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False),
        sa.Column('condition_type', sa.String(length=50), nullable=False),
        sa.Column('condition_value', sa.String(length=100), nullable=False),
        sa.Column('current_value', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False),
        sa.Column('is_sent', sa.Boolean(), nullable=False),
        sa.Column('metadata', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('triggered_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_alerts_user_id', 'alerts', ['user_id'], unique=False)
    op.create_index('ix_alerts_portfolio_id', 'alerts', ['portfolio_id'], unique=False)
    op.create_index('ix_alerts_crypto_asset_id', 'alerts', ['crypto_asset_id'], unique=False)
    op.create_index('ix_alerts_alert_type', 'alerts', ['alert_type'], unique=False)
    op.create_index('ix_alerts_severity', 'alerts', ['severity'], unique=False)

    # Create user_settings table
    op.create_table('user_settings',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('email_notifications', sa.Boolean(), nullable=False),
        sa.Column('push_notifications', sa.Boolean(), nullable=False),
        sa.Column('sms_notifications', sa.Boolean(), nullable=False),
        sa.Column('price_alerts', sa.Boolean(), nullable=False),
        sa.Column('risk_alerts', sa.Boolean(), nullable=False),
        sa.Column('portfolio_alerts', sa.Boolean(), nullable=False),
        sa.Column('risk_tolerance', sa.String(length=20), nullable=False),
        sa.Column('max_portfolio_risk', sa.String(length=20), nullable=False),
        sa.Column('default_currency', sa.String(length=3), nullable=False),
        sa.Column('timezone', sa.String(length=50), nullable=False),
        sa.Column('theme', sa.String(length=20), nullable=False),
        sa.Column('auto_rebalancing', sa.Boolean(), nullable=False),
        sa.Column('stop_loss_enabled', sa.Boolean(), nullable=False),
        sa.Column('take_profit_enabled', sa.Boolean(), nullable=False),
        sa.Column('custom_settings', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_user_settings_user_id', 'user_settings', ['user_id'], unique=True)

    # Add foreign key constraints
    op.create_foreign_key(None, 'portfolios', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'portfolio_holdings', 'portfolios', ['portfolio_id'], ['id'])
    op.create_foreign_key(None, 'portfolio_holdings', 'crypto_assets', ['crypto_asset_id'], ['id'])
    op.create_foreign_key(None, 'price_history', 'crypto_assets', ['crypto_asset_id'], ['id'])
    op.create_foreign_key(None, 'risk_metrics', 'crypto_assets', ['crypto_asset_id'], ['id'])
    op.create_foreign_key(None, 'risk_metrics', 'portfolios', ['portfolio_id'], ['id'])
    op.create_foreign_key(None, 'portfolio_risk_metrics', 'portfolios', ['portfolio_id'], ['id'])
    op.create_foreign_key(None, 'ai_insights', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'ai_insights', 'portfolios', ['portfolio_id'], ['id'])
    op.create_foreign_key(None, 'ai_insights', 'crypto_assets', ['crypto_asset_id'], ['id'])
    op.create_foreign_key(None, 'alerts', 'users', ['user_id'], ['id'])
    op.create_foreign_key(None, 'alerts', 'portfolios', ['portfolio_id'], ['id'])
    op.create_foreign_key(None, 'alerts', 'crypto_assets', ['crypto_asset_id'], ['id'])
    op.create_foreign_key(None, 'user_settings', 'users', ['user_id'], ['id'])

    # Convert tables to TimescaleDB hypertables
    op.execute("SELECT create_hypertable('price_history', 'timestamp', chunk_time_interval => INTERVAL '1 day')")
    op.execute("SELECT create_hypertable('risk_metrics', 'timestamp', chunk_time_interval => INTERVAL '1 day')")
    op.execute("SELECT create_hypertable('portfolio_risk_metrics', 'timestamp', chunk_time_interval => INTERVAL '1 day')")


def downgrade() -> None:
    # Drop foreign key constraints
    op.drop_constraint(None, 'user_settings', type_='foreignkey')
    op.drop_constraint(None, 'alerts', type_='foreignkey')
    op.drop_constraint(None, 'alerts', type_='foreignkey')
    op.drop_constraint(None, 'alerts', type_='foreignkey')
    op.drop_constraint(None, 'ai_insights', type_='foreignkey')
    op.drop_constraint(None, 'ai_insights', type_='foreignkey')
    op.drop_constraint(None, 'ai_insights', type_='foreignkey')
    op.drop_constraint(None, 'portfolio_risk_metrics', type_='foreignkey')
    op.drop_constraint(None, 'risk_metrics', type_='foreignkey')
    op.drop_constraint(None, 'risk_metrics', type_='foreignkey')
    op.drop_constraint(None, 'price_history', type_='foreignkey')
    op.drop_constraint(None, 'portfolio_holdings', type_='foreignkey')
    op.drop_constraint(None, 'portfolio_holdings', type_='foreignkey')
    op.drop_constraint(None, 'portfolios', type_='foreignkey')

    # Drop tables
    op.drop_table('user_settings')
    op.drop_table('alerts')
    op.drop_table('ai_insights')
    op.drop_table('portfolio_risk_metrics')
    op.drop_table('risk_metrics')
    op.drop_table('price_history')
    op.drop_table('portfolio_holdings')
    op.drop_table('portfolios')
    op.drop_table('crypto_assets')
    op.drop_table('users')
