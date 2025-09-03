# Crypto Risk Dashboard - API Integration Layer

This document describes the comprehensive API integration layer for the Crypto Risk Dashboard, which provides robust data fetching from multiple cryptocurrency and blockchain data sources.

## Overview

The API integration layer consists of:
- **API Clients**: Individual clients for CoinGecko, Etherscan, and Alpha Vantage
- **Caching Layer**: Redis-based caching for improved performance and rate limit management
- **Background Tasks**: Celery-based task scheduling for automated data fetching
- **Data Models**: Pydantic models for API response validation and structure
- **Integration Service**: Unified service coordinating all API interactions

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App  │    │  Background     │    │   Redis Cache   │
│                 │    │  Tasks (Celery) │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Integration Service                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ CoinGecko   │  │ Etherscan   │  │ Alpha      │           │
│  │ Client      │  │ Client      │  │ Vantage    │           │
│  │             │  │             │  │ Client     │           │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
└─────────────────────────────────────────────────────────────────┘
```

## Features

### 🔄 **Automatic Data Refresh**
- Crypto prices: Every 5 minutes
- Market data: Every 10 minutes  
- Wallet analysis: Every hour
- Cache cleanup: Daily at 2 AM

### 🚀 **Performance & Reliability**
- Redis caching with configurable TTL
- Rate limiting for all APIs
- Automatic retry with exponential backoff
- Circuit breaker pattern for fault tolerance

### 🛡️ **Error Handling & Monitoring**
- Comprehensive error logging
- API health monitoring
- Fallback mechanisms
- Performance metrics

## API Clients

### 1. CoinGecko Client (`coingecko_client.py`)
**Purpose**: Fetch cryptocurrency prices, market data, and trends

**Key Methods**:
- `get_coin_price()` - Current prices for multiple coins
- `get_coin_market_data()` - Market cap, volume, rankings
- `get_coin_price_history()` - Historical price data
- `get_global_market_data()` - Overall market statistics

**Rate Limits**: 50 calls per minute

### 2. Etherscan Client (`etherscan_client.py`)
**Purpose**: Ethereum blockchain data and wallet analysis

**Key Methods**:
- `get_account_balance()` - Wallet ETH balance
- `get_account_transactions()` - Transaction history
- `get_erc20_token_transfers()` - Token transfer history
- `get_nft_transfers()` - NFT transfer history

**Rate Limits**: 5 calls per second

### 3. Alpha Vantage Client (`alphavantage_client.py`)
**Purpose**: Additional financial metrics and market sentiment

**Key Methods**:
- `get_crypto_price()` - Real-time crypto exchange rates
- `get_crypto_daily()` - Daily price data
- `get_market_sentiment()` - News sentiment analysis
- `get_sector_performance()` - Market sector data

**Rate Limits**: 5 calls per minute (free tier)

## Caching Layer

### Redis Cache (`redis_cache.py`)
- **TTL**: 5 minutes default (configurable)
- **Key Format**: `api:{api_name}:{endpoint}:{params_hash}`
- **Features**: Automatic expiration, pattern-based invalidation
- **Statistics**: Memory usage, hit rates, connection status

### Cache Strategy
1. **First Request**: Fetch from API, store in cache
2. **Subsequent Requests**: Return cached data if valid
3. **Cache Miss**: Fetch fresh data and update cache
4. **Expiration**: Automatic cleanup of stale data

## Background Tasks

### Celery Configuration (`celery_app.py`)
- **Broker**: Redis
- **Result Backend**: Redis
- **Task Routing**: Separate queues for different data types
- **Monitoring**: Task tracking and performance metrics

### Scheduled Tasks
```python
# Price data refresh
"fetch-crypto-prices": Every 5 minutes

# Market data refresh  
"fetch-market-data": Every 10 minutes

# Wallet analysis
"fetch-wallet-analysis": Every hour

# Cache maintenance
"cleanup-cache": Daily at 2 AM

# API health monitoring
"health-check-apis": Every 5 minutes
```

## Data Models

### Response Validation
All API responses are validated using Pydantic models:

- **CoinGecko Models**: `CoinGeckoCoin`, `CoinGeckoMarketData`, etc.
- **Etherscan Models**: `EtherscanTransaction`, `EtherscanTokenTransfer`, etc.
- **Alpha Vantage Models**: `AlphaVantageExchangeRate`, `AlphaVantageCryptoDaily`, etc.

### Benefits
- Type safety and validation
- Automatic serialization/deserialization
- Clear data structure documentation
- Error handling for malformed responses

## Configuration

### Environment Variables
```bash
# CoinGecko API
API_COINGECKO_API_KEY=your_api_key_here
API_COINGECKO_RATE_LIMIT=50

# Etherscan API  
API_ETHERSCAN_API_KEY=your_api_key_here
API_ETHERSCAN_RATE_LIMIT=5

# Alpha Vantage API
API_ALPHAVANTAGE_API_KEY=your_api_key_here
API_ALPHAVANTAGE_RATE_LIMIT=5

# Redis Configuration
API_REDIS_URL=redis://localhost:6379
API_REDIS_DB=0
API_REDIS_PASSWORD=your_password_here

# Cache Settings
API_CACHE_TTL=300
API_CACHE_MAX_SIZE=1000

# Background Task Settings
API_CELERY_BROKER_URL=redis://localhost:6379/1
API_CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

## Usage Examples

### Basic API Client Usage
```python
from app.api_clients.coingecko_client import CoinGeckoClient

async with CoinGeckoClient() as client:
    # Get Bitcoin price
    response = await client.get_coin_price(["bitcoin"], ["usd"])
    if response.success:
        price = response.data["bitcoin"]["usd"]
        print(f"Bitcoin price: ${price}")
```

### Integration Service Usage
```python
from app.api_clients.integration_service import integration_service

# Get comprehensive crypto overview
overview = await integration_service.get_crypto_overview([
    "bitcoin", "ethereum", "binancecoin"
])

# Analyze wallet
wallet_data = await integration_service.get_wallet_analysis(
    "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
)
```

### Background Task Usage
```python
from app.background_tasks.tasks import fetch_crypto_prices

# Trigger immediate price fetch
result = fetch_crypto_prices.delay()

# Get result
prices = result.get()
```

## Testing

### Running Tests
```bash
# Install test dependencies
pip install -r requirements_api.txt

# Run all tests
pytest tests/test_api_clients.py -v

# Run with coverage
pytest tests/test_api_clients.py --cov=app.api_clients --cov-report=html
```

### Test Coverage
- Unit tests for all API clients
- Mock external API calls
- Test rate limiting and error handling
- Validate response models

## Monitoring & Health Checks

### API Health Monitoring
- Automatic health checks every 5 minutes
- Response time tracking
- Error rate monitoring
- Status reporting to monitoring systems

### Cache Performance
- Hit/miss ratio tracking
- Memory usage monitoring
- Connection status monitoring
- Performance metrics collection

## Error Handling

### Retry Logic
- **Max Retries**: 3 attempts
- **Backoff Strategy**: Exponential with jitter
- **Timeout Handling**: Configurable per API
- **Circuit Breaker**: Automatic fallback on repeated failures

### Fallback Mechanisms
- Return cached data when APIs are unavailable
- Graceful degradation of features
- User-friendly error messages
- Detailed logging for debugging

## Performance Optimization

### Caching Strategy
- **Hot Data**: Frequently accessed data cached longer
- **Cold Data**: Less accessed data shorter TTL
- **Pattern Invalidation**: Bulk cache clearing for related data
- **Memory Management**: Automatic cleanup of expired entries

### Rate Limit Management
- **Token Bucket**: Smooth request distribution
- **Queue Management**: Request queuing during high load
- **Priority Handling**: Critical requests prioritized
- **Load Balancing**: Distribute requests across time windows

## Security Considerations

### API Key Management
- Environment variable storage
- No hardcoded credentials
- Secure key rotation support
- Access logging and monitoring

### Rate Limit Compliance
- Respect all API rate limits
- Automatic throttling
- Request queuing
- Graceful degradation

## Deployment

### Docker Support
```dockerfile
# Redis for caching
redis:7-alpine

# Celery worker
celery -A app.background_tasks.celery_app worker --loglevel=info

# Celery beat scheduler
celery -A app.background_tasks.celery_app beat --loglevel=info
```

### Environment Setup
1. Install Redis server
2. Set environment variables
3. Start Celery worker and beat
4. Initialize cache connections
5. Run health checks

## Troubleshooting

### Common Issues
1. **API Rate Limits**: Check rate limit configuration
2. **Cache Connection**: Verify Redis connectivity
3. **Task Failures**: Check Celery worker logs
4. **Data Validation**: Review Pydantic model errors

### Debug Mode
```python
# Enable debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Check cache status
cache_stats = await cache.get_cache_stats()
print(cache_stats)

# Test API connectivity
health = await integration_service.health_check_all_apis()
print(health)
```

## Future Enhancements

### Planned Features
- **WebSocket Support**: Real-time data streaming
- **GraphQL API**: Flexible data querying
- **Machine Learning**: Predictive analytics
- **Advanced Caching**: Multi-level cache hierarchy
- **API Aggregation**: Additional data sources

### Scalability Improvements
- **Horizontal Scaling**: Multiple worker instances
- **Load Balancing**: Distributed request handling
- **Database Integration**: Persistent data storage
- **Event Streaming**: Kafka/RabbitMQ integration

## Contributing

### Development Guidelines
1. Follow PEP 8 style guidelines
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Use type hints throughout
5. Implement proper error handling

### Code Structure
```
app/
├── api_clients/          # API client implementations
├── cache/               # Caching layer
├── background_tasks/    # Celery tasks
├── schemas/             # Pydantic models
└── utils/               # Utility functions
```

## License

This API integration layer is part of the Crypto Risk Dashboard project and follows the same licensing terms.

## Support

For questions or issues:
1. Check the troubleshooting section
2. Review logs and error messages
3. Verify configuration settings
4. Test individual components
5. Contact the development team
