"""
Unit tests for AI Insights Engine
"""

import pytest
import json
from unittest.mock import Mock, patch, AsyncMock
from datetime import datetime

from app.utils.ai_insights_engine import (
    AIInsightsEngine,
    PortfolioContext,
    InsightType,
    RiskLevel,
    AIInsightOutput
)
from app.utils.risk_calculator import RiskMetrics
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.models.crypto_asset import CryptoAsset


class TestAIInsightsEngine:
    """Test AI Insights Engine functionality"""
    
    @pytest.fixture
    def mock_portfolio(self):
        """Mock portfolio for testing"""
        portfolio = Mock(spec=Portfolio)
        portfolio.id = "test-portfolio-id"
        portfolio.name = "Test Portfolio"
        portfolio.created_at = datetime.utcnow()
        return portfolio
    
    @pytest.fixture
    def mock_crypto_asset(self):
        """Mock crypto asset for testing"""
        asset = Mock(spec=CryptoAsset)
        asset.symbol = "BTC"
        asset.name = "Bitcoin"
        return asset
    
    @pytest.fixture
    def mock_holding(self, mock_crypto_asset):
        """Mock portfolio holding for testing"""
        holding = Mock(spec=PortfolioHolding)
        holding.crypto_asset_id = "btc-id"
        holding.crypto_asset = mock_crypto_asset
        holding.quantity = 1.5
        holding.current_price_usd = 50000.0
        return holding
    
    @pytest.fixture
    def mock_risk_metrics(self):
        """Mock risk metrics for testing"""
        metrics = Mock(spec=RiskMetrics)
        metrics.volatility_30d = 25.5
        metrics.volatility_90d = 30.2
        metrics.volatility_365d = 45.8
        metrics.sharpe_ratio = 1.2
        metrics.max_drawdown = -15.3
        metrics.beta_btc = 1.0
        metrics.beta_sp500 = 0.8
        metrics.herfindahl_index = 0.65
        metrics.var_95 = -8.5
        metrics.var_99 = -12.3
        metrics.expected_shortfall = -10.2
        metrics.risk_score = 7
        metrics.skewness = -0.5
        metrics.kurtosis = 2.1
        return metrics
    
    @pytest.fixture
    def portfolio_context(self, mock_portfolio, mock_holding, mock_risk_metrics):
        """Portfolio context for testing"""
        return PortfolioContext(
            portfolio=mock_portfolio,
            holdings=[mock_holding],
            risk_metrics=mock_risk_metrics,
            market_data={},
            user_preferences={}
        )
    
    @pytest.fixture
    def mock_ai_response(self):
        """Mock AI response for testing"""
        return {
            "title": "High Concentration Risk Detected",
            "summary": "Your Bitcoin dominance at 65% creates significant concentration risk.",
            "detailed_analysis": "Portfolio analysis reveals high concentration in Bitcoin...",
            "risk_level": "high",
            "actionable": True,
            "confidence_score": 0.85,
            "recommendations": [
                "Consider reducing Bitcoin allocation to 40%",
                "Diversify into other major cryptocurrencies",
                "Monitor correlation with traditional markets"
            ],
            "tags": ["risk_analysis", "concentration", "bitcoin"],
            "priority": 1
        }
    
    @pytest.fixture
    def ai_engine(self):
        """AI Insights Engine instance for testing"""
        with patch('app.utils.ai_insights_engine.settings') as mock_settings:
            mock_settings.OPENAI_API_KEY = "test-api-key"
            mock_settings.REDIS_URL = "redis://localhost:6379"
            return AIInsightsEngine()
    
    def test_ai_insights_engine_initialization(self, ai_engine):
        """Test AI Insights Engine initialization"""
        assert ai_engine.llm is not None
        assert ai_engine.output_parser is not None
        assert hasattr(ai_engine, 'portfolio_analysis_prompt')
        assert hasattr(ai_engine, 'risk_analysis_prompt')
        assert hasattr(ai_engine, 'rebalancing_prompt')
        assert hasattr(ai_engine, 'sentiment_prompt')
    
    def test_prepare_portfolio_context(self, ai_engine, portfolio_context):
        """Test portfolio context preparation"""
        context_text = ai_engine._prepare_portfolio_context(portfolio_context)
        
        assert "Test Portfolio" in context_text
        assert "Total Value: $75,000.00" in context_text
        assert "Number of Assets: 1" in context_text
        assert "BTC: 1.500000 (100.0%)" in context_text
    
    def test_format_risk_metrics(self, ai_engine, mock_risk_metrics):
        """Test risk metrics formatting"""
        metrics_text = ai_engine._format_risk_metrics(mock_risk_metrics)
        
        assert "30-day Volatility: 25.50%" in metrics_text
        assert "Sharpe Ratio: 1.200" in metrics_text
        assert "Risk Score: 7/10" in metrics_text
        assert "Herfindahl Index: 0.650" in metrics_text
    
    def test_prepare_allocation_data(self, ai_engine, portfolio_context):
        """Test allocation data preparation"""
        allocation_text = ai_engine._prepare_allocation_data(portfolio_context)
        
        assert "BTC: 100.0% ($75,000.00)" in allocation_text
    
    def test_get_market_conditions(self, ai_engine):
        """Test market conditions retrieval"""
        conditions = ai_engine._get_market_conditions()
        
        assert "Bitcoin dominance" in conditions
        assert "market sentiment" in conditions
        assert "volatility index" in conditions
    
    def test_prepare_market_data(self, ai_engine, portfolio_context):
        """Test market data preparation"""
        market_data = ai_engine._prepare_market_data(portfolio_context)
        
        assert "portfolio_assets" in market_data
        assert "market_indicators" in market_data
        assert "recent_events" in market_data
        assert "BTC" in market_data["portfolio_assets"]
    
    def test_format_portfolio_performance(self, ai_engine, portfolio_context):
        """Test portfolio performance formatting"""
        performance_text = ai_engine._format_portfolio_performance(portfolio_context)
        
        assert "Sharpe Ratio: 1.200" in performance_text
        assert "Volatility: 45.80%" in performance_text
        assert "Risk Score: 7/10" in performance_text
    
    def test_parse_ai_response_valid_json(self, ai_engine, mock_ai_response):
        """Test parsing valid AI response"""
        response_text = f"```json\n{json.dumps(mock_ai_response)}\n```"
        
        parsed_insight = ai_engine._parse_ai_response(response_text)
        
        assert isinstance(parsed_insight, AIInsightOutput)
        assert parsed_insight.title == "High Concentration Risk Detected"
        assert parsed_insight.risk_level == "high"
        assert parsed_insight.actionable is True
        assert parsed_insight.confidence_score == 0.85
    
    def test_parse_ai_response_invalid_json(self, ai_engine):
        """Test parsing invalid AI response"""
        invalid_response = "This is not valid JSON"
        
        parsed_insight = ai_engine._parse_ai_response(invalid_response)
        
        assert isinstance(parsed_insight, AIInsightOutput)
        assert parsed_insight.title == "Analysis Generated"
        assert parsed_insight.actionable is False
        assert "parsing_error" in parsed_insight.tags
    
    def test_parse_ai_response_malformed_json(self, ai_engine):
        """Test parsing malformed AI response"""
        malformed_response = '{"title": "Test", "invalid_field": }'
        
        parsed_insight = ai_engine._parse_ai_response(malformed_response)
        
        assert isinstance(parsed_insight, AIInsightOutput)
        assert parsed_insight.title == "Analysis Generated"
        assert parsed_insight.actionable is False
    
    @pytest.mark.asyncio
    async def test_generate_weekly_risk_analysis(self, ai_engine, portfolio_context, mock_ai_response):
        """Test weekly risk analysis generation"""
        with patch.object(ai_engine.llm, 'ainvoke') as mock_llm:
            mock_llm.return_value = Mock(content=json.dumps(mock_ai_response))
            
            insight = await ai_engine.generate_weekly_risk_analysis(portfolio_context)
            
            assert isinstance(insight, AIInsightOutput)
            assert insight.title == "High Concentration Risk Detected"
            assert insight.risk_level == "high"
    
    @pytest.mark.asyncio
    async def test_generate_rebalancing_suggestions(self, ai_engine, portfolio_context, mock_ai_response):
        """Test rebalancing suggestions generation"""
        with patch.object(ai_engine.llm, 'ainvoke') as mock_llm:
            mock_llm.return_value = Mock(content=json.dumps(mock_ai_response))
            
            insight = await ai_engine.generate_rebalancing_suggestions(portfolio_context)
            
            assert isinstance(insight, AIInsightOutput)
            assert insight.title == "High Concentration Risk Detected"
    
    @pytest.mark.asyncio
    async def test_generate_market_sentiment_analysis(self, ai_engine, portfolio_context, mock_ai_response):
        """Test market sentiment analysis generation"""
        with patch.object(ai_engine.llm, 'ainvoke') as mock_llm:
            mock_llm.return_value = Mock(content=json.dumps(mock_ai_response))
            
            insight = await ai_engine.generate_market_sentiment_analysis(portfolio_context)
            
            assert isinstance(insight, AIInsightOutput)
            assert insight.title == "High Concentration Risk Detected"
    
    @pytest.mark.asyncio
    async def test_generate_comparative_analysis(self, ai_engine, portfolio_context, mock_ai_response):
        """Test comparative analysis generation"""
        benchmark_data = {"btc_performance": 0.15, "market_volatility": 0.25}
        
        with patch.object(ai_engine.llm, 'ainvoke') as mock_llm:
            mock_llm.return_value = Mock(content=json.dumps(mock_ai_response))
            
            insight = await ai_engine.generate_comparative_analysis(
                portfolio_context, 
                benchmark_data
            )
            
            assert isinstance(insight, AIInsightOutput)
            assert insight.title == "High Concentration Risk Detected"
    
    def test_create_ai_insight_model(self, ai_engine, mock_ai_response):
        """Test AI insight model creation"""
        insight_output = AIInsightOutput(**mock_ai_response)
        
        ai_insight = ai_engine.create_ai_insight_model(
            insight_output=insight_output,
            user_id="test-user-id",
            portfolio_id="test-portfolio-id"
        )
        
        assert ai_insight.user_id == "test-user-id"
        assert ai_insight.portfolio_id == "test-portfolio-id"
        assert ai_insight.title == "High Concentration Risk Detected"
        assert ai_insight.insight_type == "risk_analysis"
        assert ai_insight.model_name == "gpt-4"
    
    def test_generate_insight_unsupported_type(self, ai_engine, portfolio_context):
        """Test generating insight with unsupported type"""
        with pytest.raises(ValueError, match="Unsupported insight type"):
            ai_engine.generate_insight(
                InsightType.CORRELATION_INSIGHT,  # Not implemented
                portfolio_context
            )
    
    @pytest.mark.asyncio
    async def test_ai_engine_error_handling(self, ai_engine, portfolio_context):
        """Test AI engine error handling"""
        with patch.object(ai_engine.llm, 'ainvoke') as mock_llm:
            mock_llm.side_effect = Exception("API Error")
            
            with pytest.raises(Exception, match="API Error"):
                await ai_engine.generate_weekly_risk_analysis(portfolio_context)


class TestAIInsightOutput:
    """Test AI Insight Output model"""
    
    def test_ai_insight_output_creation(self):
        """Test AI Insight Output creation"""
        insight = AIInsightOutput(
            title="Test Insight",
            summary="Test summary",
            detailed_analysis="Detailed analysis",
            risk_level="medium",
            actionable=True,
            confidence_score=0.8,
            recommendations=["Test recommendation"],
            tags=["test", "insight"],
            priority=2
        )
        
        assert insight.title == "Test Insight"
        assert insight.summary == "Test summary"
        assert insight.risk_level == "medium"
        assert insight.actionable is True
        assert insight.confidence_score == 0.8
        assert insight.priority == 2
    
    def test_ai_insight_output_validation(self):
        """Test AI Insight Output validation"""
        with pytest.raises(ValueError):
            AIInsightOutput(
                title="Test",
                summary="Test",
                detailed_analysis="Test",
                risk_level="invalid_level",  # Invalid risk level
                actionable=True,
                confidence_score=1.5,  # Invalid confidence score
                recommendations=[],
                tags=[],
                priority=6  # Invalid priority
            )


class TestPortfolioContext:
    """Test Portfolio Context dataclass"""
    
    def test_portfolio_context_creation(self, mock_portfolio, mock_holding, mock_risk_metrics):
        """Test Portfolio Context creation"""
        context = PortfolioContext(
            portfolio=mock_portfolio,
            holdings=[mock_holding],
            risk_metrics=mock_risk_metrics,
            market_data={"test": "data"},
            user_preferences={"risk_tolerance": "medium"}
        )
        
        assert context.portfolio == mock_portfolio
        assert len(context.holdings) == 1
        assert context.risk_metrics == mock_risk_metrics
        assert context.market_data == {"test": "data"}
        assert context.user_preferences == {"risk_tolerance": "medium"}


class TestInsightType:
    """Test Insight Type enum"""
    
    def test_insight_type_values(self):
        """Test Insight Type enum values"""
        assert InsightType.RISK_ANALYSIS == "risk_analysis"
        assert InsightType.OPPORTUNITY_ANALYSIS == "opportunity_analysis"
        assert InsightType.MARKET_SENTIMENT == "market_sentiment"
        assert InsightType.REBALANCING_SUGGESTION == "rebalancing_suggestion"
        assert InsightType.TREND_ANALYSIS == "trend_analysis"
        assert InsightType.CORRELATION_INSIGHT == "correlation_insight"


class TestRiskLevel:
    """Test Risk Level enum"""
    
    def test_risk_level_values(self):
        """Test Risk Level enum values"""
        assert RiskLevel.LOW == "low"
        assert RiskLevel.MEDIUM == "medium"
        assert RiskLevel.HIGH == "high"
        assert RiskLevel.CRITICAL == "critical"
