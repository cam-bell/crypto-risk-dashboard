# Crypto Portfolio Risk Calculation Engine

A comprehensive, high-performance risk calculation engine for crypto portfolios built with FastAPI, NumPy, and Pandas. This engine provides real-time calculation of advanced risk metrics for cryptocurrency portfolios and individual assets.

## 🚀 Features

### Core Risk Metrics

- **Portfolio Volatility**: Rolling 30, 90, and 365-day volatility calculations
- **Risk-Adjusted Returns**: Sharpe ratio and Sortino ratio calculations
- **Drawdown Analysis**: Maximum drawdown and current drawdown tracking
- **Beta Calculations**: Beta vs Bitcoin and major market indices
- **Concentration Risk**: Herfindahl-Hirschman Index (HHI) for portfolio concentration
- **Value at Risk (VaR)**: 95% and 99% confidence level VaR calculations
- **Expected Shortfall**: Conditional VaR for tail risk assessment
- **Correlation Analysis**: Full correlation matrix between portfolio holdings
- **Statistical Measures**: Skewness and kurtosis analysis

### Advanced Features

- **Real-time Calculation**: Sub-second response times for portfolio risk metrics
- **Background Processing**: Celery-based background jobs for bulk calculations
- **Historical Analysis**: Time-series risk metrics with trend analysis
- **Benchmark Comparison**: Performance vs Bitcoin and market indices
- **Risk Scoring**: 1-10 scale risk assessment with detailed breakdown
- **Performance Optimization**: Efficient algorithms for large portfolios (100+ assets)

## 🏗️ Architecture

### Core Components

1. **Risk Calculator Engine** (`app/utils/risk_calculator.py`)
   - `PortfolioRiskCalculator`: Main portfolio risk calculation engine
   - `AssetRiskCalculator`: Individual asset risk metrics
   - Optimized NumPy/Pandas implementations

2. **API Endpoints** (`app/api/v1/risk_metrics.py`)
   - RESTful FastAPI endpoints for all risk calculations
   - Async processing with background task support
   - Comprehensive error handling and validation

3. **Background Tasks** (`app/background_tasks/risk_calculation_tasks.py`)
   - Celery-based background job processing
   - Periodic risk updates (hourly/daily)
   - Bulk portfolio calculations

4. **Data Models** (`app/schemas/risk_metrics.py`)
   - Pydantic schemas for request/response validation
   - Comprehensive data models for all risk metrics

## 📊 API Endpoints

### Portfolio Risk Calculations

#### Calculate Portfolio Risk Metrics

```http
POST /api/v1/risk-metrics/portfolio/calculate
```

**Request Body:**

```json
{
  "portfolio_id": "uuid-string",
  "include_benchmarks": true,
  "risk_free_rate": 0.02,
  "calculation_method": "historical"
}
```

**Response:**

```json
{
  "portfolio_id": "uuid-string",
  "timestamp": "2024-01-01T00:00:00Z",
  "volatility_30d": 0.45,
  "volatility_90d": 0.52,
  "volatility_365d": 0.48,
  "sharpe_ratio": 1.2,
  "max_drawdown": -0.25,
  "beta_btc": 0.85,
  "herfindahl_index": 0.35,
  "var_95": -0.08,
  "var_99": -0.12,
  "risk_score": 6,
  "risk_level": "Medium"
}
```

#### Get Portfolio Correlation Matrix

```http
GET /api/v1/risk-metrics/portfolio/{portfolio_id}/correlation
```

#### Get Portfolio Composition Analysis

```http
GET /api/v1/risk-metrics/portfolio/{portfolio_id}/composition
```

#### Get Historical Risk Metrics

```http
GET /api/v1/risk-metrics/portfolio/{portfolio_id}/historical
```

### Individual Asset Risk

#### Calculate Asset Risk Metrics

```http
POST /api/v1/risk-metrics/asset/calculate
```

**Request Body:**

```json
{
  "asset_id": "bitcoin",
  "period_days": 365,
  "include_benchmarks": true,
  "risk_free_rate": 0.02
}
```

### Bulk Operations

#### Bulk Risk Calculation

```http
POST /api/v1/risk-metrics/bulk/calculate
```

**Request Body:**

```json
{
  "portfolio_ids": ["uuid1", "uuid2", "uuid3"],
  "include_benchmarks": true,
  "risk_free_rate": 0.02,
  "priority": "normal"
}
```

#### Get Calculation Job Status

```http
GET /api/v1/risk-metrics/job/{job_id}/status
```

## 🔧 Installation & Setup

### Prerequisites

- Python 3.8+
- PostgreSQL with TimescaleDB extension
- Redis (for Celery background tasks)

### Dependencies

```bash
pip install -r requirements_api.txt
```

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/crypto_risk_db

# Redis
REDIS_URL=redis://localhost:6379

# API Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=true
CORS_ORIGINS=http://localhost:3000
```

### Database Setup

```bash
# Run database migrations
alembic upgrade head

# Initialize database
python init_db.py
```

### Start Services

```bash
# Start Redis
docker run -d -p 6379:6379 redis:7-alpine

# Start Celery worker
celery -A app.background_tasks.celery_app worker --loglevel=info

# Start Celery beat (for periodic tasks)
celery -A app.background_tasks.celery_app beat --loglevel=info

# Start FastAPI server
python main.py
```

## 📈 Usage Examples

### Python Client Example

```python
import requests
import json

# Calculate portfolio risk
def calculate_portfolio_risk(portfolio_id):
    url = "http://localhost:8000/api/v1/risk-metrics/portfolio/calculate"

    payload = {
        "portfolio_id": portfolio_id,
        "include_benchmarks": True,
        "risk_free_rate": 0.02
    }

    response = requests.post(url, json=payload)
    return response.json()

# Get correlation matrix
def get_correlation_matrix(portfolio_id):
    url = f"http://localhost:8000/api/v1/risk-metrics/portfolio/{portfolio_id}/correlation"

    response = requests.get(url)
    return response.json()

# Example usage
portfolio_id = "your-portfolio-uuid"
risk_metrics = calculate_portfolio_risk(portfolio_id)
correlation = get_correlation_matrix(portfolio_id)

print(f"Portfolio Risk Score: {risk_metrics['risk_score']}/10")
print(f"30-day Volatility: {risk_metrics['volatility_30d']:.2%}")
print(f"Sharpe Ratio: {risk_metrics['sharpe_ratio']:.2f}")
```

### JavaScript/TypeScript Client

```typescript
interface RiskCalculationRequest {
  portfolio_id: string;
  include_benchmarks: boolean;
  risk_free_rate: number;
  calculation_method: string;
}

interface RiskMetricsResponse {
  portfolio_id: string;
  volatility_30d: number;
  sharpe_ratio: number;
  risk_score: number;
  risk_level: string;
}

async function calculatePortfolioRisk(
  request: RiskCalculationRequest
): Promise<RiskMetricsResponse> {
  const response = await fetch(
    "http://localhost:8000/api/v1/risk-metrics/portfolio/calculate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Example usage
const riskMetrics = await calculatePortfolioRisk({
  portfolio_id: "your-portfolio-uuid",
  include_benchmarks: true,
  risk_free_rate: 0.02,
  calculation_method: "historical",
});

console.log(`Risk Score: ${riskMetrics.risk_score}/10`);
```

## 🧪 Testing

### Run Unit Tests

```bash
# Run all tests
pytest tests/

# Run specific test file
pytest tests/test_risk_calculator.py

# Run with coverage
pytest --cov=app tests/

# Run with verbose output
pytest -v tests/
```

### Test Coverage

The test suite covers:

- All risk calculation algorithms
- Edge cases and error handling
- Performance characteristics
- API endpoint functionality
- Background task processing

## 📊 Performance Characteristics

### Calculation Speed

- **Small Portfolio (5 assets)**: < 100ms
- **Medium Portfolio (20 assets)**: < 500ms
- **Large Portfolio (100+ assets)**: < 2s

### Memory Usage

- **Base Memory**: ~50MB
- **Per Portfolio**: ~5-10MB
- **Large Dataset (4 years, 100 assets)**: < 200MB

### Scalability

- **Concurrent Requests**: 100+ simultaneous calculations
- **Background Processing**: 1000+ portfolios per hour
- **Database Performance**: Optimized with TimescaleDB hypertables

## 🔒 Security Features

- Input validation with Pydantic schemas
- SQL injection protection with SQLAlchemy ORM
- Rate limiting support (configurable)
- CORS configuration for frontend integration
- Error handling without information leakage

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements_api.txt .
RUN pip install -r requirements_api.txt

COPY . .
EXPOSE 8000

CMD ["python", "main.py"]
```

### Production Considerations

- Use production-grade database (PostgreSQL with connection pooling)
- Implement Redis clustering for high availability
- Set up monitoring and alerting
- Configure proper logging levels
- Use reverse proxy (nginx) for load balancing

## 🤝 Contributing

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd crypto-risk-dashboard

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install development dependencies
pip install -r requirements_api.txt
pip install -r requirements-dev.txt

# Run pre-commit hooks
pre-commit install
```

### Code Style

- Follow PEP 8 guidelines
- Use type hints throughout
- Write comprehensive docstrings
- Maintain test coverage > 90%

## 📚 API Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🆘 Support

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL environment variable
   - Ensure TimescaleDB extension is installed

2. **Redis Connection Errors**
   - Verify Redis is running on port 6379
   - Check REDIS_URL environment variable

3. **Import Errors**
   - Ensure all dependencies are installed
   - Check Python path and virtual environment

4. **Performance Issues**
   - Monitor database query performance
   - Check Redis memory usage
   - Verify Celery worker processes

### Getting Help

- Check the logs for detailed error messages
- Review the test suite for usage examples
- Open an issue with detailed error description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with FastAPI, NumPy, Pandas, and SQLAlchemy
- Inspired by modern portfolio theory and risk management practices
- Designed for real-time crypto portfolio analysis
