# Crypto Risk Dashboard Database Schema

## Overview

This document describes the complete database schema for the Crypto Risk Dashboard, built using PostgreSQL with TimescaleDB for time-series data management.

## Database Architecture

### Technology Stack

- **Database**: PostgreSQL 15 with TimescaleDB extension
- **ORM**: SQLAlchemy 2.0+
- **Migrations**: Alembic
- **Caching**: Redis
- **Containerization**: Docker & Docker Compose

### Key Features

- **Time-series optimization** with TimescaleDB hypertables
- **Comprehensive indexing** for query performance
- **Referential integrity** with foreign key constraints
- **Scalable design** for high-frequency crypto data
- **AI insights storage** and management
- **Real-time alerting** system

## Database Schema

### Core Tables

#### 1. Users (`users`)

Stores user authentication and profile information.

```sql
CREATE TABLE users (
    id VARCHAR PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    profile_picture_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    last_login TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_users_email` (UNIQUE)
- `ix_users_username` (UNIQUE)

#### 2. Crypto Assets (`crypto_assets`)

Stores cryptocurrency information and metadata.

```sql
CREATE TABLE crypto_assets (
    id VARCHAR PRIMARY KEY,
    symbol VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    coingecko_id VARCHAR(100) UNIQUE,
    contract_address VARCHAR(255),
    blockchain VARCHAR(50),
    decimals FLOAT,
    market_cap FLOAT,
    circulating_supply FLOAT,
    total_supply FLOAT,
    max_supply FLOAT,
    current_price_usd FLOAT,
    price_change_24h FLOAT,
    price_change_percentage_24h FLOAT,
    volume_24h FLOAT,
    is_active BOOLEAN DEFAULT TRUE,
    logo_url VARCHAR(500),
    description TEXT,
    website_url VARCHAR(500),
    whitepaper_url VARCHAR(500),
    github_url VARCHAR(500),
    twitter_url VARCHAR(500),
    reddit_url VARCHAR(500),
    telegram_url VARCHAR(500),
    discord_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_crypto_assets_symbol` (UNIQUE)
- `ix_crypto_assets_coingecko_id` (UNIQUE)

#### 3. Portfolios (`portfolios`)

User portfolio management and tracking.

```sql
CREATE TABLE portfolios (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    total_value_usd FLOAT DEFAULT 0.0,
    total_invested_usd FLOAT DEFAULT 0.0,
    total_profit_loss_usd FLOAT DEFAULT 0.0,
    total_profit_loss_percentage FLOAT DEFAULT 0.0,
    risk_score FLOAT,
    volatility FLOAT,
    sharpe_ratio FLOAT,
    max_drawdown FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_portfolios_user_id`

#### 4. Portfolio Holdings (`portfolio_holdings`)

Individual crypto holdings within portfolios.

```sql
CREATE TABLE portfolio_holdings (
    id VARCHAR PRIMARY KEY,
    portfolio_id VARCHAR NOT NULL REFERENCES portfolios(id),
    crypto_asset_id VARCHAR NOT NULL REFERENCES crypto_assets(id),
    quantity FLOAT NOT NULL,
    average_buy_price_usd FLOAT NOT NULL,
    total_invested_usd FLOAT NOT NULL,
    current_value_usd FLOAT NOT NULL,
    profit_loss_usd FLOAT NOT NULL,
    profit_loss_percentage FLOAT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_portfolio_holdings_portfolio_id`
- `ix_portfolio_holdings_crypto_asset_id`

### Time-Series Tables (TimescaleDB Hypertables)

#### 5. Price History (`price_history`)

Historical price data for cryptocurrencies.

```sql
CREATE TABLE price_history (
    id VARCHAR PRIMARY KEY,
    crypto_asset_id VARCHAR NOT NULL REFERENCES crypto_assets(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    price_usd FLOAT NOT NULL,
    volume_24h FLOAT,
    market_cap FLOAT,
    price_change_24h FLOAT,
    price_change_percentage_24h FLOAT,
    high_24h FLOAT,
    low_24h FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('price_history', 'timestamp',
    chunk_time_interval => INTERVAL '1 day');
```

**Indexes:**

- `idx_price_history_crypto_timestamp` (crypto_asset_id, timestamp)
- `idx_price_history_timestamp` (timestamp)
- `idx_price_history_crypto_asset` (crypto_asset_id)

#### 6. Risk Metrics (`risk_metrics`)

Time-series risk metrics for assets and portfolios.

```sql
CREATE TABLE risk_metrics (
    id VARCHAR PRIMARY KEY,
    crypto_asset_id VARCHAR REFERENCES crypto_assets(id),
    portfolio_id VARCHAR REFERENCES portfolios(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    volatility FLOAT,
    var_95 FLOAT,  -- Value at Risk 95%
    var_99 FLOAT,  -- Value at Risk 99%
    expected_shortfall FLOAT,
    sharpe_ratio FLOAT,
    sortino_ratio FLOAT,
    max_drawdown FLOAT,
    beta FLOAT,
    correlation_sp500 FLOAT,
    correlation_btc FLOAT,
    skewness FLOAT,
    kurtosis FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('risk_metrics', 'timestamp',
    chunk_time_interval => INTERVAL '1 day');
```

**Indexes:**

- `idx_risk_metrics_timestamp` (timestamp)
- `idx_risk_metrics_crypto_timestamp` (crypto_asset_id, timestamp)
- `idx_risk_metrics_portfolio_timestamp` (portfolio_id, timestamp)

#### 7. Portfolio Risk Metrics (`portfolio_risk_metrics`)

Portfolio-level risk metrics over time.

```sql
CREATE TABLE portfolio_risk_metrics (
    id VARCHAR PRIMARY KEY,
    portfolio_id VARCHAR NOT NULL REFERENCES portfolios(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    total_value_usd FLOAT NOT NULL,
    total_invested_usd FLOAT NOT NULL,
    total_profit_loss_usd FLOAT NOT NULL,
    total_profit_loss_percentage FLOAT NOT NULL,
    volatility FLOAT,
    var_95 FLOAT,
    var_99 FLOAT,
    expected_shortfall FLOAT,
    sharpe_ratio FLOAT,
    sortino_ratio FLOAT,
    max_drawdown FLOAT,
    beta FLOAT,
    herfindahl_index FLOAT,
    effective_n FLOAT,
    correlation_matrix VARCHAR,  -- JSON string
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('portfolio_risk_metrics', 'timestamp',
    chunk_time_interval => INTERVAL '1 day');
```

**Indexes:**

- `idx_portfolio_risk_metrics_portfolio_timestamp` (portfolio_id, timestamp)
- `idx_portfolio_risk_metrics_timestamp` (timestamp)

### AI and Analytics Tables

#### 8. AI Insights (`ai_insights`)

AI-generated insights and analysis.

```sql
CREATE TABLE ai_insights (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    portfolio_id VARCHAR REFERENCES portfolios(id),
    crypto_asset_id VARCHAR REFERENCES crypto_assets(id),
    insight_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    detailed_analysis TEXT,
    confidence_score FLOAT,
    model_name VARCHAR(100),
    model_version VARCHAR(50),
    prompt_used TEXT,
    tags JSONB,
    risk_level VARCHAR(20),
    actionable VARCHAR(5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_ai_insights_user_id`
- `ix_ai_insights_portfolio_id`
- `ix_ai_insights_crypto_asset_id`
- `ix_ai_insights_insight_type`

#### 9. Alerts (`alerts`)

User notifications and alerts system.

```sql
CREATE TABLE alerts (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(id),
    portfolio_id VARCHAR REFERENCES portfolios(id),
    crypto_asset_id VARCHAR REFERENCES crypto_assets(id),
    alert_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    condition_type VARCHAR(50) NOT NULL,
    condition_value VARCHAR(100) NOT NULL,
    current_value VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_read BOOLEAN DEFAULT FALSE,
    is_sent BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_alerts_user_id`
- `ix_alerts_portfolio_id`
- `ix_alerts_crypto_asset_id`
- `ix_alerts_alert_type`
- `ix_alerts_severity`

#### 10. User Settings (`user_settings`)

User preferences and configurations.

```sql
CREATE TABLE user_settings (
    id VARCHAR PRIMARY KEY,
    user_id VARCHAR NOT NULL UNIQUE REFERENCES users(id),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    price_alerts BOOLEAN DEFAULT TRUE,
    risk_alerts BOOLEAN DEFAULT TRUE,
    portfolio_alerts BOOLEAN DEFAULT TRUE,
    risk_tolerance VARCHAR(20) DEFAULT 'medium',
    max_portfolio_risk VARCHAR(20) DEFAULT 'medium',
    default_currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR(50) DEFAULT 'UTC',
    theme VARCHAR(20) DEFAULT 'light',
    auto_rebalancing BOOLEAN DEFAULT FALSE,
    stop_loss_enabled BOOLEAN DEFAULT FALSE,
    take_profit_enabled BOOLEAN DEFAULT FALSE,
    custom_settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Indexes:**

- `ix_user_settings_user_id` (UNIQUE)

## Database Relationships

### Entity Relationship Diagram

```
users (1) ←→ (N) portfolios
portfolios (1) ←→ (N) portfolio_holdings
crypto_assets (1) ←→ (N) portfolio_holdings
crypto_assets (1) ←→ (N) price_history
crypto_assets (1) ←→ (N) risk_metrics
portfolios (1) ←→ (N) risk_metrics
portfolios (1) ←→ (N) portfolio_risk_metrics
users (1) ←→ (N) ai_insights
users (1) ←→ (N) alerts
users (1) ←→ (1) user_settings
```

### Foreign Key Constraints

All relationships are enforced with foreign key constraints:

- `portfolios.user_id` → `users.id`
- `portfolio_holdings.portfolio_id` → `portfolios.id`
- `portfolio_holdings.crypto_asset_id` → `crypto_assets.id`
- `price_history.crypto_asset_id` → `crypto_assets.id`
- `risk_metrics.crypto_asset_id` → `crypto_assets.id`
- `risk_metrics.portfolio_id` → `portfolios.id`
- `portfolio_risk_metrics.portfolio_id` → `portfolios.id`
- `ai_insights.user_id` → `users.id`
- `ai_insights.portfolio_id` → `portfolios.id`
- `ai_insights.crypto_asset_id` → `crypto_assets.id`
- `alerts.user_id` → `users.id`
- `alerts.portfolio_id` → `portfolios.id`
- `alerts.crypto_asset_id` → `crypto_assets.id`
- `user_settings.user_id` → `users.id`

## TimescaleDB Features

### Hypertables

- **price_history**: Optimized for high-frequency price data
- **risk_metrics**: Time-series risk analysis data
- **portfolio_risk_metrics**: Portfolio performance tracking

### Chunk Management

- Default chunk interval: 1 day
- Automatic chunk creation and management
- Efficient time-range queries

### Compression

- Automatic compression of old data
- Configurable compression policies
- Reduced storage costs

## Indexing Strategy

### Primary Indexes

- All tables use UUID primary keys
- Optimized for insert performance

### Secondary Indexes

- **Time-based**: All timestamp columns are indexed
- **Composite**: Asset + timestamp combinations
- **Foreign keys**: All foreign key columns are indexed
- **Search**: Text fields for AI insights and alerts

### Query Optimization

- **Time-range queries**: Optimized with TimescaleDB
- **Asset-specific queries**: Composite indexes
- **User-specific queries**: User ID indexes
- **Portfolio queries**: Portfolio ID indexes

## Data Types and Constraints

### UUIDs

- All primary keys use UUIDs for scalability
- Generated using `uuid.uuid4()`

### Timestamps

- All timestamps include timezone information
- Default to UTC
- Automatic creation and update tracking

### Numeric Fields

- **Prices**: FLOAT for precision
- **Percentages**: FLOAT for decimal accuracy
- **Quantities**: FLOAT for fractional crypto amounts

### Text Fields

- **Descriptions**: TEXT for unlimited length
- **URLs**: VARCHAR(500) for web addresses
- **Names**: VARCHAR(100) for human-readable names

## Performance Considerations

### Partitioning

- Time-series data partitioned by day
- Automatic partition management
- Efficient historical data queries

### Compression

- Old data automatically compressed
- Configurable compression policies
- Balance between storage and query performance

### Caching

- Redis for session management
- Query result caching
- Real-time data caching

## Security Features

### Authentication

- Password hashing with bcrypt
- JWT token management
- Session management with Redis

### Authorization

- User-based access control
- Portfolio privacy settings
- API endpoint protection

### Data Validation

- SQLAlchemy model validation
- Pydantic schema validation
- Input sanitization

## Backup and Recovery

### Automated Backups

- Daily database backups
- Point-in-time recovery support
- Backup verification

### Disaster Recovery

- Multi-region deployment support
- Automated failover
- Data replication

## Monitoring and Maintenance

### Health Checks

- Database connection monitoring
- Query performance tracking
- Resource usage monitoring

### Maintenance Tasks

- Automatic vacuum operations
- Index maintenance
- Statistics updates

## Development and Testing

### Local Development

- Docker Compose setup
- Sample data generation
- Development database

### Testing

- Test database isolation
- Fixture data management
- Performance testing

## Deployment

### Production Setup

- High-availability configuration
- Load balancing
- Monitoring and alerting

### Scaling

- Read replicas
- Connection pooling
- Query optimization

## Troubleshooting

### Common Issues

- Connection timeouts
- Memory usage
- Query performance

### Debugging

- Query logging
- Performance analysis
- Error tracking

## Future Enhancements

### Planned Features

- Multi-tenant support
- Advanced analytics
- Machine learning integration
- Real-time streaming

### Scalability Improvements

- Sharding support
- Advanced partitioning
- Cloud-native features

## Conclusion

This database schema provides a robust foundation for the Crypto Risk Dashboard, with:

- **Scalability**: TimescaleDB for time-series data
- **Performance**: Comprehensive indexing strategy
- **Reliability**: ACID compliance and constraints
- **Flexibility**: JSON fields for extensibility
- **Security**: Authentication and authorization
- **Monitoring**: Health checks and performance tracking

The schema is designed to handle high-frequency crypto data while maintaining query performance and data integrity.
