# AI-Powered Portfolio Insights Integration

This document describes the comprehensive LangChain integration for AI-powered portfolio insights in the Crypto Risk Dashboard.

## 🎯 Overview

The AI Insights Engine provides intelligent analysis and recommendations for crypto portfolios using GPT-4 through LangChain. It generates actionable insights including risk analysis, rebalancing suggestions, market sentiment, and comparative analysis.

## ✨ Features

### 1. Weekly Portfolio Risk Analysis

- **Concentration Risk Assessment**: Analyzes portfolio concentration using Herfindahl Index
- **Volatility Analysis**: 30, 90, and 365-day volatility assessment
- **Risk Scoring**: 1-10 scale risk assessment with specific recommendations
- **Drawdown Analysis**: Maximum drawdown and recovery analysis

### 2. Personalized Investment Recommendations

- **Portfolio Rebalancing**: Specific allocation adjustments based on risk metrics
- **Diversification Strategies**: Recommendations for reducing concentration risk
- **Risk Tolerance Alignment**: Personalized suggestions based on user preferences

### 3. Market Sentiment Analysis

- **Overall Market Sentiment**: Current market conditions assessment
- **Sector-Specific Trends**: Analysis of different crypto sectors
- **Impact Assessment**: How market sentiment affects portfolio assets
- **Opportunity Identification**: Sentiment-driven investment opportunities

### 4. Risk Alert Generation

- **Natural Language Explanations**: Clear, actionable risk descriptions
- **Priority Classification**: High, medium, low, and critical risk levels
- **Actionable Recommendations**: Specific steps to mitigate risks
- **Confidence Scoring**: 0.0 to 1.0 confidence in analysis

### 5. Portfolio Rebalancing Suggestions

- **Current vs. Target Allocation**: Gap analysis and recommendations
- **Rebalancing Frequency**: Optimal timing for portfolio adjustments
- **Risk Impact Assessment**: Expected changes in risk metrics
- **Implementation Timeline**: Step-by-step rebalancing plan

### 6. Comparative Analysis

- **Benchmark Comparison**: Performance vs. market indices
- **Risk-Adjusted Returns**: Sharpe ratio and other metrics comparison
- **Diversification Effectiveness**: Portfolio diversification assessment
- **Market Timing Analysis**: Entry and exit timing insights

## 🏗️ Architecture

### Core Components

1. **AIInsightsEngine**: Main engine for generating insights
2. **PortfolioContext**: Data container for portfolio analysis
3. **AIInsightOutput**: Structured output for AI responses
4. **Prompt Templates**: Specialized prompts for different analysis types
5. **Background Tasks**: Celery tasks for async processing

### Data Flow

```
Portfolio Data → Risk Calculation → AI Analysis → Structured Output → Database Storage
     ↓              ↓                ↓              ↓              ↓
Portfolio +    Risk Metrics    GPT-4 +      Pydantic       AIInsight
Holdings      (Volatility,    LangChain    Validation     Model
              Sharpe, VaR)    Prompts
```

## 🚀 Setup

### 1. Install Dependencies

```bash
pip install -r requirements_api.txt
```

### 2. Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for Redis caching)
REDIS_URL=redis://localhost:6379
```

### 3. Database Migration

The AI insights table is already included in the existing schema. No additional migrations needed.

## 📡 API Endpoints

### Generate Weekly Risk Analysis

```http
POST /api/v1/ai-insights/weekly-analysis
```

**Request Body:**

```json
{
  "user_id": "user-123",
  "portfolio_id": "portfolio-456",
  "include_market_context": true,
  "risk_tolerance": "medium"
}
```

**Response:**

```json
{
  "id": "insight-789",
  "title": "High Concentration Risk Detected",
  "summary": "Your Bitcoin dominance at 65% creates significant concentration risk...",
  "detailed_analysis": "Portfolio analysis reveals high concentration in Bitcoin...",
  "risk_level": "high",
  "actionable": true,
  "confidence_score": 0.85,
  "tags": ["risk_analysis", "concentration", "bitcoin"],
  "created_at": "2024-01-15T10:30:00Z",
  "processing_time": 2.45
}
```

### Generate Rebalancing Suggestions

```http
POST /api/v1/ai-insights/rebalancing-suggestions
```

**Request Body:**

```json
{
  "user_id": "user-123",
  "portfolio_id": "portfolio-456",
  "target_allocation": {
    "BTC": 0.4,
    "ETH": 0.3,
    "ADA": 0.2,
    "DOT": 0.1
  },
  "rebalancing_frequency": "monthly"
}
```

### Generate Market Sentiment Analysis

```http
POST /api/v1/ai-insights/market-sentiment
```

**Request Body:**

```json
{
  "user_id": "user-123",
  "portfolio_id": "portfolio-456",
  "include_news_analysis": true,
  "time_horizon": "1w"
}
```

### Generate Comparative Analysis

```http
POST /api/v1/ai-insights/comparative-analysis
```

**Request Body:**

```json
{
  "user_id": "user-123",
  "portfolio_id": "portfolio-456",
  "benchmark_data": {
    "btc_performance": 0.15,
    "market_volatility": 0.25,
    "sp500_performance": 0.08
  },
  "comparison_metrics": ["returns", "volatility", "sharpe_ratio"]
}
```

### Retrieve Insights

```http
GET /api/v1/ai-insights/portfolio/{portfolio_id}?limit=10&offset=0
GET /api/v1/ai-insights/user/{user_id}?limit=20&offset=0
```

## 🔧 Background Tasks

### Celery Tasks

1. **Weekly Analysis**: Automated weekly portfolio analysis
2. **Rebalancing Suggestions**: Portfolio optimization recommendations
3. **Market Sentiment**: Regular sentiment analysis updates
4. **Risk Alerts**: Automated alert generation for high-risk insights
5. **Cleanup**: Old insights cleanup and storage management

### Task Scheduling

```python
# Schedule weekly analysis for all portfolios
from app.background_tasks.ai_insights_tasks import schedule_weekly_analysis

# Run every Monday at 9 AM
schedule_weekly_analysis.delay()
```

## 🎨 Customization

### Prompt Templates

The AI engine uses specialized prompt templates for different analysis types:

1. **Risk Analysis Prompt**: Focuses on risk identification and mitigation
2. **Rebalancing Prompt**: Emphasizes allocation optimization
3. **Sentiment Prompt**: Analyzes market sentiment and impact
4. **Comparative Prompt**: Benchmarks portfolio performance

### Adding New Insight Types

```python
from app.utils.ai_insights_engine import InsightType

# Add new insight type
class InsightType(Enum):
    # ... existing types ...
    CUSTOM_ANALYSIS = "custom_analysis"

# Implement generation method
async def generate_custom_analysis(self, portfolio_context):
    # Custom implementation
    pass
```

## 🧪 Testing

### Run Tests

```bash
# Run all AI insights tests
pytest tests/test_ai_insights.py -v

# Run specific test class
pytest tests/test_ai_insights.py::TestAIInsightsEngine -v

# Run with coverage
pytest tests/test_ai_insights.py --cov=app.utils.ai_insights_engine
```

### Test Coverage

The test suite covers:

- Engine initialization and configuration
- Portfolio context preparation
- Risk metrics formatting
- AI response parsing and validation
- Error handling and edge cases
- All insight generation methods

## 📊 Sample AI Insights

### Risk Analysis Example

```
Title: "High Concentration Risk Detected"
Summary: "Your Bitcoin dominance at 65% creates significant concentration risk.
Recent market volatility suggests reducing exposure to maintain portfolio stability."
Risk Level: High
Actionable: Yes
Recommendations:
- Reduce Bitcoin allocation from 65% to 40%
- Increase diversification with Ethereum and other major altcoins
- Consider adding stablecoin allocation for risk management
```

### Rebalancing Example

```
Title: "Portfolio Rebalancing Recommended"
Summary: "Current allocation shows 15% deviation from target.
Monthly rebalancing would improve risk-adjusted returns by 0.3% annually."
Risk Level: Medium
Actionable: Yes
Recommendations:
- Sell 2.5 BTC to reduce allocation to target 40%
- Purchase 15 ETH to increase allocation to target 30%
- Rebalance monthly to maintain target allocations
```

### Market Sentiment Example

```
Title: "Bullish Market Sentiment Detected"
Summary: "Overall market sentiment is positive with institutional adoption increasing.
Your portfolio is well-positioned to benefit from current trends."
Risk Level: Low
Actionable: No
Recommendations:
- Maintain current allocations
- Monitor for profit-taking opportunities
- Consider adding small positions in emerging sectors
```

## 🔒 Security & Privacy

### Data Handling

- All portfolio data is processed locally before AI analysis
- No sensitive financial data is sent to external AI services
- AI responses are validated and sanitized before storage
- User authentication required for all insight generation

### Rate Limiting

- OpenAI API rate limiting is handled automatically
- Redis caching reduces API calls for repeated analyses
- Background task queuing prevents system overload

## 🚨 Error Handling

### Common Errors

1. **API Key Issues**: Invalid or expired OpenAI API key
2. **Rate Limiting**: OpenAI API rate limit exceeded
3. **Parsing Errors**: AI response format validation failures
4. **Database Errors**: Storage or retrieval failures

### Error Recovery

- Automatic retry with exponential backoff
- Fallback responses for parsing failures
- Comprehensive error logging and monitoring
- Graceful degradation when AI services are unavailable

## 📈 Performance Optimization

### Caching Strategy

- Redis caching for LLM responses
- Portfolio context caching for repeated analyses
- Risk metrics caching to avoid recalculation

### Async Processing

- Non-blocking API endpoints
- Background task processing for long-running analyses
- Concurrent insight generation for multiple portfolios

### Resource Management

- Automatic cleanup of old insights
- Memory-efficient data processing
- Optimized database queries

## 🔮 Future Enhancements

### Planned Features

1. **Multi-Model Support**: Integration with other AI models
2. **Advanced Analytics**: Machine learning-based pattern recognition
3. **Real-time Alerts**: WebSocket-based real-time notifications
4. **Custom Prompts**: User-defined analysis criteria
5. **Historical Analysis**: Trend analysis over time

### Integration Opportunities

1. **News APIs**: Real-time news sentiment analysis
2. **Social Media**: Social sentiment integration
3. **Technical Indicators**: Advanced technical analysis
4. **Fundamental Data**: On-chain metrics and fundamentals

## 📚 Additional Resources

### Documentation

- [LangChain Documentation](https://python.langchain.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

### Examples

- [Sample AI Insights](examples/sample_insights.md)
- [Prompt Engineering Guide](examples/prompt_engineering.md)
- [Integration Examples](examples/integration_examples.md)

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

### Code Standards

- Follow PEP 8 style guidelines
- Include comprehensive docstrings
- Write unit tests for all new functionality
- Update documentation for API changes

## 📞 Support

For questions or issues with the AI insights integration:

1. Check the troubleshooting guide
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

---

**Note**: This AI insights integration requires an active OpenAI API key and internet connectivity for AI model access. Ensure compliance with OpenAI's usage policies and rate limits.
