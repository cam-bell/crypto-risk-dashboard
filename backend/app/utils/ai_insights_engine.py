"""
AI-Powered Portfolio Insights Engine using LangChain
Provides intelligent analysis and recommendations for crypto portfolios
"""

import json
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum

from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_community.cache import RedisCache
from langchain.globals import set_llm_cache
from pydantic import BaseModel, Field

from app.core.config import settings
from app.utils.risk_calculator import RiskMetrics
from app.models.portfolio import Portfolio
from app.models.portfolio_holding import PortfolioHolding
from app.models.ai_insights import AIInsight

logger = logging.getLogger(__name__)


class InsightType(Enum):
    """Types of AI insights"""
    RISK_ANALYSIS = "risk_analysis"
    OPPORTUNITY_ANALYSIS = "opportunity_analysis"
    MARKET_SENTIMENT = "market_sentiment"
    REBALANCING_SUGGESTION = "rebalancing_suggestion"
    TREND_ANALYSIS = "trend_analysis"
    CORRELATION_INSIGHT = "correlation_insight"


class RiskLevel(Enum):
    """Risk levels for insights"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


@dataclass
class PortfolioContext:
    """Portfolio context for AI analysis"""
    portfolio: Portfolio
    holdings: List[PortfolioHolding]
    risk_metrics: RiskMetrics
    market_data: Dict[str, Any]
    user_preferences: Dict[str, Any]


class AIInsightOutput(BaseModel):
    """Structured output for AI insights"""
    title: str = Field(
        description="Clear, actionable title for the insight"
    )
    summary: str = Field(
        description="2-3 sentence summary of the key finding"
    )
    detailed_analysis: str = Field(
        description="Detailed analysis with specific data points"
    )
    risk_level: str = Field(
        description="Risk level: low, medium, high, or critical"
    )
    actionable: bool = Field(
        description="Whether this insight requires immediate action"
    )
    confidence_score: float = Field(
        description="Confidence in the analysis (0.0 to 1.0)"
    )
    recommendations: List[str] = Field(
        description="Specific actionable recommendations"
    )
    tags: List[str] = Field(
        description="Relevant tags for categorization"
    )
    priority: int = Field(
        description="Priority level 1-5, where 1 is highest"
    )


class AIInsightsEngine:
    """Main engine for generating AI-powered portfolio insights"""
    
    def __init__(self):
        """Initialize the AI insights engine"""
        self.llm = ChatOpenAI(
            model="gpt-4",
            temperature=0.1,
            api_key=settings.OPENAI_API_KEY
        )
        
        # Setup Redis cache for LLM responses
        if settings.REDIS_URL:
            try:
                import redis
                redis_client = redis.from_url(settings.REDIS_URL)
                redis_cache = RedisCache(redis_client)
                set_llm_cache(redis_cache)
                logger.info("Redis cache enabled for AI insights")
            except Exception as e:
                logger.warning(
                    f"Failed to setup Redis cache: {e}"
                )
        
        # Initialize prompt templates
        self._setup_prompts()
        
        # Initialize output parser
        self.output_parser = PydanticOutputParser(pydantic_object=AIInsightOutput)
        
        logger.info("AI Insights Engine initialized successfully")
    
    def _setup_prompts(self):
        """Setup prompt templates for different analysis types"""
        
        # Base portfolio analysis prompt
        self.portfolio_analysis_prompt = ChatPromptTemplate.from_template("""
You are an expert crypto portfolio analyst and risk manager. Analyze the following portfolio data and provide actionable insights.

PORTFOLIO CONTEXT:
{portfolio_context}

RISK METRICS:
{risk_metrics}

MARKET DATA:
{market_data}

USER PREFERENCES:
{user_preferences}

ANALYSIS TYPE: {analysis_type}

Please provide a comprehensive analysis following this structure:
1. Identify key risk factors and opportunities
2. Analyze portfolio composition and concentration
3. Assess market correlation and diversification
4. Provide specific, actionable recommendations
5. Assign appropriate risk levels and confidence scores

Focus on making insights actionable and personalized to this specific portfolio.
""")
        
        # Risk analysis specific prompt
        self.risk_analysis_prompt = ChatPromptTemplate.from_template("""
You are a crypto risk management expert. Analyze the portfolio's risk profile and identify potential threats and mitigation strategies.

PORTFOLIO DATA:
{portfolio_data}

RISK METRICS:
{risk_metrics}

Focus on:
- Concentration risk (Herfindahl Index: {herfindahl_index})
- Volatility analysis (30d: {vol_30d}%, 90d: {vol_90d}%, 365d: {vol_365d}%)
- Maximum drawdown: {max_drawdown}%
- Value at Risk (95%): {var_95}%
- Correlation with Bitcoin: {beta_btc}
- Overall risk score: {risk_score}/10

Provide specific risk mitigation strategies and portfolio adjustments.
""")
        
        # Rebalancing suggestion prompt
        self.rebalancing_prompt = ChatPromptTemplate.from_template("""
You are a portfolio optimization specialist. Analyze the current portfolio allocation and suggest rebalancing strategies.

CURRENT ALLOCATION:
{current_allocation}

RISK METRICS:
{risk_metrics}

MARKET CONDITIONS:
{market_conditions}

Provide:
1. Specific allocation adjustments
2. Rebalancing frequency recommendations
3. Risk tolerance considerations
4. Implementation timeline
5. Expected impact on risk metrics
""")
        
        # Market sentiment prompt
        self.sentiment_prompt = ChatPromptTemplate.from_template("""
You are a crypto market analyst. Assess current market sentiment and its impact on the portfolio.

PORTFOLIO ASSETS:
{portfolio_assets}

MARKET INDICATORS:
{market_indicators}

RECENT EVENTS:
{recent_events}

Analyze:
1. Overall market sentiment
2. Sector-specific trends
3. Impact on portfolio assets
4. Sentiment-driven opportunities
5. Risk factors to monitor
""")
    
    async def generate_weekly_risk_analysis(
        self, 
        portfolio_context: PortfolioContext
    ) -> AIInsightOutput:
        """Generate weekly portfolio risk analysis"""
        
        try:
            # Prepare context data
            context_data = self._prepare_portfolio_context(portfolio_context)
            
            # Create prompt with risk analysis focus
            prompt = self.risk_analysis_prompt.format(
                portfolio_data=context_data,
                risk_metrics=self._format_risk_metrics(portfolio_context.risk_metrics),
                herfindahl_index=f"{portfolio_context.risk_metrics.herfindahl_index:.3f}",
                vol_30d=f"{portfolio_context.risk_metrics.volatility_30d:.2f}",
                vol_90d=f"{portfolio_context.risk_metrics.volatility_90d:.2f}",
                vol_365d=f"{portfolio_context.risk_metrics.volatility_365d:.2f}",
                max_drawdown=f"{portfolio_context.risk_metrics.max_drawdown:.2f}",
                var_95=f"{portfolio_context.risk_metrics.var_95:.2f}",
                beta_btc=f"{portfolio_context.risk_metrics.beta_btc:.3f}",
                risk_score=portfolio_context.risk_metrics.risk_score
            )
            
            # Generate insight
            response = await self.llm.ainvoke(prompt)
            
            # Parse and validate output
            insight = self._parse_ai_response(response.content)
            
            return insight
            
        except Exception as e:
            logger.error(f"Error generating weekly risk analysis: {e}")
            raise
    
    async def generate_rebalancing_suggestions(
        self, 
        portfolio_context: PortfolioContext
    ) -> AIInsightOutput:
        """Generate portfolio rebalancing suggestions"""
        
        try:
            # Prepare allocation data
            allocation_data = self._prepare_allocation_data(portfolio_context)
            
            # Create prompt
            prompt = self.rebalancing_prompt.format(
                current_allocation=allocation_data,
                risk_metrics=self._format_risk_metrics(portfolio_context.risk_metrics),
                market_conditions=self._get_market_conditions()
            )
            
            # Generate insight
            response = await self.llm.ainvoke(prompt)
            
            # Parse and validate output
            insight = self._parse_ai_response(response.content)
            
            return insight
            
        except Exception as e:
            logger.error(f"Error generating rebalancing suggestions: {e}")
            raise
    
    async def generate_market_sentiment_analysis(
        self, 
        portfolio_context: PortfolioContext
    ) -> AIInsightOutput:
        """Generate market sentiment analysis"""
        
        try:
            # Prepare market data
            market_data = self._prepare_market_data(portfolio_context)
            
            # Create prompt
            prompt = self.sentiment_prompt.format(
                portfolio_assets=market_data["portfolio_assets"],
                market_indicators=market_data["market_indicators"],
                recent_events=market_data["recent_events"]
            )
            
            # Generate insight
            response = await self.llm.ainvoke(prompt)
            
            # Parse and validate output
            insight = self._parse_ai_response(response.content)
            
            return insight
            
        except Exception as e:
            logger.error(f"Error generating market sentiment analysis: {e}")
            raise
    
    async def generate_comparative_analysis(
        self, 
        portfolio_context: PortfolioContext,
        benchmark_data: Dict[str, Any]
    ) -> AIInsightOutput:
        """Generate comparative analysis with market trends"""
        
        try:
            # Create comparative analysis prompt
            prompt = f"""
You are a crypto portfolio analyst. Compare this portfolio's performance and risk profile with market benchmarks.

PORTFOLIO PERFORMANCE:
{self._format_portfolio_performance(portfolio_context)}

BENCHMARK DATA:
{json.dumps(benchmark_data, indent=2)}

Analyze:
1. Relative performance vs benchmarks
2. Risk-adjusted returns comparison
3. Diversification effectiveness
4. Market timing analysis
5. Specific improvement opportunities

Provide actionable insights for portfolio optimization.
"""
            
            # Generate insight
            response = await self.llm.ainvoke(prompt)
            
            # Parse and validate output
            insight = self._parse_ai_response(response.content)
            
            return insight
            
        except Exception as e:
            logger.error(f"Error generating comparative analysis: {e}")
            raise
    
    def _prepare_portfolio_context(self, context: PortfolioContext) -> str:
        """Prepare portfolio context for AI analysis"""
        
        portfolio = context.portfolio
        holdings = context.holdings
        
        # Calculate total value
        total_value = sum(h.current_value_usd for h in holdings)
        
        # Format holdings
        holdings_text = "\n".join([
            f"- {h.crypto_asset.symbol}: {h.quantity:.6f} ({h.current_value_usd / total_value * 100:.1f}%)"
            for h in holdings
        ])
        
        return f"""
Portfolio: {portfolio.name}
Total Value: ${total_value:,.2f}
Number of Assets: {len(holdings)}
Creation Date: {portfolio.created_at}

Holdings:
{holdings_text}
"""
    
    def _format_risk_metrics(self, metrics: RiskMetrics) -> str:
        """Format risk metrics for AI analysis"""
        
        return f"""
Risk Metrics Summary:
- 30-day Volatility: {metrics.volatility_30d:.2f}%
- 90-day Volatility: {metrics.volatility_90d:.2f}%
- 365-day Volatility: {metrics.volatility_365d:.2f}%
- Sharpe Ratio: {metrics.sharpe_ratio:.3f}
- Maximum Drawdown: {metrics.max_drawdown:.2f}%
- Beta vs Bitcoin: {metrics.beta_btc:.3f}
- Beta vs S&P 500: {metrics.beta_sp500:.3f}
- Herfindahl Index: {metrics.herfindahl_index:.3f}
- VaR (95%): {metrics.var_95:.2f}%
- VaR (99%): {metrics.var_99:.2f}%
- Expected Shortfall: {metrics.expected_shortfall:.2f}%
- Risk Score: {metrics.risk_score}/10
- Skewness: {metrics.skewness:.3f}
- Kurtosis: {metrics.kurtosis:.3f}
"""
    
    def _prepare_allocation_data(self, context: PortfolioContext) -> str:
        """Prepare allocation data for rebalancing analysis"""
        
        holdings = context.holdings
        total_value = sum(h.current_value_usd for h in holdings)
        
        allocation_lines = []
        for h in holdings:
            percentage = (h.current_value_usd / total_value) * 100
            allocation_lines.append(
                f"{h.crypto_asset.symbol}: {percentage:.1f}% (${h.current_value_usd:,.2f})"
            )
        
        return "\n".join(allocation_lines)
    
    def _get_market_conditions(self) -> str:
        """Get current market conditions summary"""
        
        # This would typically fetch real-time market data
        # For now, return a placeholder
        return """
Current Market Conditions:
- Bitcoin dominance: ~50%
- Overall market sentiment: Neutral to slightly bullish
- Volatility index: Moderate
- Institutional adoption: Increasing
- Regulatory environment: Evolving
"""
    
    def _prepare_market_data(self, context: PortfolioContext) -> Dict[str, Any]:
        """Prepare market data for sentiment analysis"""
        
        return {
            "portfolio_assets": [h.crypto_asset.symbol for h in context.holdings],
            "market_indicators": {
                "btc_dominance": "~50%",
                "market_cap": "$2.5T+",
                "fear_greed_index": "65 (Greed)"
            },
            "recent_events": [
                "Bitcoin ETF approvals",
                "Institutional adoption increase",
                "Regulatory clarity in major markets"
            ]
        }
    
    def _format_portfolio_performance(self, context: PortfolioContext) -> str:
        """Format portfolio performance for comparative analysis"""
        
        metrics = context.risk_metrics
        
        return f"""
Portfolio Performance:
- Sharpe Ratio: {metrics.sharpe_ratio:.3f}
- Volatility: {metrics.volatility_365d:.2f}%
- Maximum Drawdown: {metrics.max_drawdown:.2f}%
- Risk Score: {metrics.risk_score}/10
- Beta vs Bitcoin: {metrics.beta_btc:.3f}
"""
    
    def _parse_ai_response(self, response: str) -> AIInsightOutput:
        """Parse and validate AI response"""
        
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_start = response.find("```json") + 7
                json_end = response.find("```", json_start)
                json_str = response[json_start:json_end].strip()
            else:
                # Try to find JSON-like structure
                json_str = response
            
            # Parse the response
            insight_data = json.loads(json_str)
            
            # Create AIInsightOutput instance
            return AIInsightOutput(**insight_data)
            
        except (json.JSONDecodeError, KeyError) as e:
            logger.error(f"Failed to parse AI response: {e}")
            logger.error(f"Raw response: {response}")
            
            # Return a fallback insight
            return AIInsightOutput(
                title="Analysis Generated",
                summary="AI analysis completed but parsing failed. Please review manually.",
                detailed_analysis=response,
                risk_level="medium",
                actionable=False,
                confidence_score=0.5,
                recommendations=["Review analysis manually", "Contact support if issues persist"],
                tags=["ai_analysis", "parsing_error"],
                priority=3
            )
    
    async def generate_insight(
        self,
        insight_type: InsightType,
        portfolio_context: PortfolioContext,
        **kwargs
    ) -> AIInsightOutput:
        """Generate insight based on type"""
        
        if insight_type == InsightType.RISK_ANALYSIS:
            return await self.generate_weekly_risk_analysis(portfolio_context)
        elif insight_type == InsightType.REBALANCING_SUGGESTION:
            return await self.generate_rebalancing_suggestions(portfolio_context)
        elif insight_type == InsightType.MARKET_SENTIMENT:
            return await self.generate_market_sentiment_analysis(portfolio_context)
        elif insight_type == InsightType.TREND_ANALYSIS:
            return await self.generate_comparative_analysis(portfolio_context, kwargs.get('benchmark_data', {}))
        else:
            raise ValueError(f"Unsupported insight type: {insight_type}")
    
    def create_ai_insight_model(
        self,
        insight_output: AIInsightOutput,
        user_id: str,
        portfolio_id: Optional[str] = None,
        crypto_asset_id: Optional[str] = None
    ) -> AIInsight:
        """Create AIInsight model from AI output"""
        
        return AIInsight(
            user_id=user_id,
            portfolio_id=portfolio_id,
            crypto_asset_id=crypto_asset_id,
            insight_type=insight_output.tags[0] if insight_output.tags else "ai_analysis",
            title=insight_output.title,
            summary=insight_output.summary,
            detailed_analysis=insight_output.detailed_analysis,
            confidence_score=insight_output.confidence_score,
            model_name="gpt-4",
            model_version="1.0",
            tags=insight_output.tags,
            risk_level=insight_output.risk_level,
            actionable=insight_output.actionable
        )
