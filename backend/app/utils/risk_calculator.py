"""
Comprehensive Risk Calculation Engine for Crypto Portfolios
Implements advanced risk metrics and calculations using NumPy/Pandas
"""

import numpy as np
import pandas as pd
from typing import Dict, Optional
import logging
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)


class RiskPeriod(Enum):
    """Risk calculation periods"""
    DAYS_30 = 30
    DAYS_90 = 90
    DAYS_365 = 365


@dataclass
class RiskMetrics:
    """Container for calculated risk metrics"""
    volatility_30d: float
    volatility_90d: float
    volatility_365d: float
    sharpe_ratio: float
    max_drawdown: float
    beta_btc: float
    beta_sp500: float
    herfindahl_index: float
    var_95: float
    var_99: float
    expected_shortfall: float
    correlation_matrix: pd.DataFrame
    risk_score: int
    skewness: float
    kurtosis: float


class PortfolioRiskCalculator:
    """Advanced portfolio risk calculation engine"""
    
    def __init__(self, risk_free_rate: float = 0.02):
        """
        Initialize risk calculator
        
        Args:
            risk_free_rate: Annual risk-free rate (default: 2%)
        """
        self.risk_free_rate = risk_free_rate
        self.logger = logging.getLogger(__name__)
    
    def calculate_portfolio_returns(
        self, 
        portfolio_data: pd.DataFrame,
        weights: Dict[str, float]
    ) -> pd.Series:
        """
        Calculate portfolio returns from individual asset returns
        
        Args:
            portfolio_data: DataFrame with asset returns
            weights: Dictionary mapping asset_id to portfolio weight
            
        Returns:
            Portfolio returns series
        """
        try:
            # Pivot data to get returns by asset
            returns_matrix = portfolio_data.pivot(
                index='timestamp', 
                columns='asset_id', 
                values='returns'
            ).fillna(0)
            
            # Apply weights and sum
            weighted_returns = returns_matrix * pd.Series(weights)
            portfolio_returns = weighted_returns.sum(axis=1)
            
            return portfolio_returns
            
        except Exception as e:
            self.logger.error(f"Error calculating portfolio returns: {e}")
            raise
    
    def calculate_volatility(
        self, 
        returns: pd.Series, 
        period: RiskPeriod,
        annualize: bool = True
    ) -> float:
        """
        Calculate rolling volatility for specified period
        
        Args:
            returns: Asset or portfolio returns
            period: Risk period (30, 90, or 365 days)
            annualize: Whether to annualize the volatility
            
        Returns:
            Volatility as float
        """
        try:
            if len(returns) < period.value:
                return np.nan
            
            # Calculate rolling volatility
            rolling_vol = returns.rolling(window=period.value).std()
            latest_vol = rolling_vol.iloc[-1]
            
            if pd.isna(latest_vol):
                return np.nan
            
            if annualize:
                # Annualize by multiplying by sqrt(252) for daily returns
                latest_vol *= np.sqrt(252)
            
            return float(latest_vol)
            
        except Exception as e:
            self.logger.error(f"Error calculating volatility: {e}")
            return np.nan
    
    def calculate_sharpe_ratio(
        self, 
        returns: pd.Series, 
        risk_free_rate: Optional[float] = None
    ) -> float:
        """
        Calculate Sharpe ratio
        
        Args:
            returns: Asset or portfolio returns
            risk_free_rate: Annual risk-free rate (uses instance default if None)
            
        Returns:
            Sharpe ratio as float
        """
        try:
            if risk_free_rate is None:
                risk_free_rate = self.risk_free_rate
            
            if len(returns) < 30:  # Need sufficient data
                return np.nan
            
            # Calculate excess returns
            daily_rf_rate = (1 + risk_free_rate) ** (1/252) - 1
            excess_returns = returns - daily_rf_rate
            
            # Calculate Sharpe ratio
            mean_excess_return = excess_returns.mean()
            std_excess_return = excess_returns.std()
            
            if std_excess_return == 0:
                return np.nan
            
            sharpe_ratio = mean_excess_return / std_excess_return
            
            # Annualize
            sharpe_ratio *= np.sqrt(252)
            
            return float(sharpe_ratio)
            
        except Exception as e:
            self.logger.error(f"Error calculating Sharpe ratio: {e}")
            return np.nan
    
    def calculate_max_drawdown(self, returns: pd.Series) -> float:
        """
        Calculate maximum drawdown
        
        Args:
            returns: Asset or portfolio returns
            
        Returns:
            Maximum drawdown as percentage
        """
        try:
            if len(returns) < 2:
                return 0.0
            
            # Calculate cumulative returns
            cumulative_returns = (1 + returns).cumprod()
            
            # Calculate running maximum
            running_max = cumulative_returns.expanding().max()
            
            # Calculate drawdown
            drawdown = (cumulative_returns - running_max) / running_max
            
            # Get maximum drawdown
            max_drawdown = drawdown.min()
            
            return float(max_drawdown)
            
        except Exception as e:
            self.logger.error(f"Error calculating max drawdown: {e}")
            return 0.0
    
    def calculate_beta(
        self, 
        asset_returns: pd.Series, 
        benchmark_returns: pd.Series
    ) -> float:
        """
        Calculate beta relative to benchmark
        
        Args:
            asset_returns: Asset or portfolio returns
            benchmark_returns: Benchmark returns (e.g., Bitcoin, S&P 500)
            
        Returns:
            Beta coefficient
        """
        try:
            if len(asset_returns) < 30 or len(benchmark_returns) < 30:
                return np.nan
            
            # Align data by timestamp
            aligned_data = pd.concat(
                [asset_returns, benchmark_returns], axis=1
            ).dropna()
            
            if len(aligned_data) < 30:
                return np.nan
            
            asset_ret = aligned_data.iloc[:, 0]
            bench_ret = aligned_data.iloc[:, 1]
            
            # Calculate covariance and variance
            covariance = np.cov(asset_ret, bench_ret)[0, 1]
            benchmark_variance = np.var(bench_ret)
            
            if benchmark_variance == 0:
                return np.nan
            
            beta = covariance / benchmark_variance
            
            return float(beta)
            
        except Exception as e:
            self.logger.error(f"Error calculating beta: {e}")
            return np.nan
    
    def calculate_herfindahl_index(self, weights: Dict[str, float]) -> float:
        """
        Calculate Herfindahl-Hirschman Index for concentration risk
        
        Args:
            weights: Dictionary mapping asset_id to portfolio weight
            
        Returns:
            Herfindahl index (0-1, higher = more concentrated)
        """
        try:
            if not weights:
                return 0.0
            
            # Convert weights to list and ensure they sum to 1
            weight_values = list(weights.values())
            total_weight = sum(weight_values)
            
            if total_weight == 0:
                return 0.0
            
            # Normalize weights to sum to 1
            normalized_weights = [w / total_weight for w in weight_values]
            
            # Calculate HHI
            hhi = sum(w ** 2 for w in normalized_weights)
            
            return float(hhi)
            
        except Exception as e:
            self.logger.error(f"Error calculating Herfindahl index: {e}")
            return 0.0
    
    def calculate_var(
        self, 
        returns: pd.Series, 
        confidence_level: float = 0.95,
        method: str = "historical"
    ) -> float:
        """
        Calculate Value at Risk (VaR)
        
        Args:
            returns: Asset or portfolio returns
            confidence_level: VaR confidence level (e.g., 0.95 for 95%)
            method: Calculation method ("historical" or "parametric")
            
        Returns:
            VaR as percentage
        """
        try:
            if len(returns) < 30:
                return np.nan
            
            if method == "historical":
                # Historical VaR
                var_percentile = (1 - confidence_level) * 100
                var = np.percentile(returns, var_percentile)
                
            elif method == "parametric":
                # Parametric VaR (assumes normal distribution)
                mean_return = returns.mean()
                std_return = returns.std()
                z_score = norm.ppf(1 - confidence_level)
                var = mean_return - z_score * std_return
                
            else:
                raise ValueError(f"Unknown VaR method: {method}")
            
            return float(var)
            
        except Exception as e:
            self.logger.error(f"Error calculating VaR: {e}")
            return np.nan
    
    def calculate_expected_shortfall(
        self, 
        returns: pd.Series, 
        confidence_level: float = 0.95
    ) -> float:
        """
        Calculate Expected Shortfall (Conditional VaR)
        
        Args:
            returns: Asset or portfolio returns
            confidence_level: ES confidence level
            
        Returns:
            Expected shortfall as percentage
        """
        try:
            if len(returns) < 30:
                return np.nan
            
            # Calculate VaR threshold
            var_threshold = self.calculate_var(returns, confidence_level)
            
            # Calculate expected shortfall
            tail_returns = returns[returns <= var_threshold]
            
            if len(tail_returns) == 0:
                return var_threshold
            
            expected_shortfall = tail_returns.mean()
            
            return float(expected_shortfall)
            
        except Exception as e:
            self.logger.error(f"Error calculating expected shortfall: {e}")
            return np.nan
    
    def calculate_correlation_matrix(
        self, 
        portfolio_data: pd.DataFrame
    ) -> pd.DataFrame:
        """
        Calculate correlation matrix between portfolio holdings
        
        Args:
            portfolio_data: DataFrame with asset returns
            
        Returns:
            Correlation matrix as DataFrame
        """
        try:
            # Pivot data to get returns by asset
            returns_matrix = portfolio_data.pivot(
                index='timestamp', 
                columns='asset_id', 
                values='returns'
            ).fillna(0)
            
            # Calculate correlation matrix
            correlation_matrix = returns_matrix.corr()
            
            return correlation_matrix
            
        except Exception as e:
            self.logger.error(f"Error calculating correlation matrix: {e}")
            return pd.DataFrame()
    
    def calculate_risk_score(self, metrics: RiskMetrics) -> int:
        """
        Calculate overall risk score (1-10 scale)
        
        Args:
            metrics: Calculated risk metrics
            
        Returns:
            Risk score from 1 (lowest) to 10 (highest)
        """
        try:
            score = 1  # Start with lowest risk
            
            # Volatility scoring (30-day)
            if metrics.volatility_30d > 0.8:  # >80% annualized
                score += 3
            elif metrics.volatility_30d > 0.5:  # >50% annualized
                score += 2
            elif metrics.volatility_30d > 0.3:  # >30% annualized
                score += 1
            
            # Sharpe ratio scoring
            if metrics.sharpe_ratio < 0:
                score += 2
            elif metrics.sharpe_ratio < 0.5:
                score += 1
            
            # Maximum drawdown scoring
            if metrics.max_drawdown < -0.5:  # >50% drawdown
                score += 2
            elif metrics.max_drawdown < -0.3:  # >30% drawdown
                score += 1
            
            # Beta scoring
            if abs(metrics.beta_btc) > 2.0:
                score += 2
            elif abs(metrics.beta_btc) > 1.5:
                score += 1
            
            # Concentration risk scoring
            if metrics.herfindahl_index > 0.5:  # Highly concentrated
                score += 2
            elif metrics.herfindahl_index > 0.3:  # Moderately concentrated
                score += 1
            
            # VaR scoring
            if metrics.var_95 < -0.1:  # >10% daily VaR
                score += 1
            
            # Ensure score is within 1-10 range
            return max(1, min(10, score))
            
        except Exception as e:
            self.logger.error(f"Error calculating risk score: {e}")
            return 5  # Default to medium risk
    
    def calculate_all_metrics(
        self, 
        portfolio_data: pd.DataFrame,
        weights: Dict[str, float],
        benchmark_data: Optional[Dict[str, pd.Series]] = None
    ) -> RiskMetrics:
        """
        Calculate all risk metrics for a portfolio
        
        Args:
            portfolio_data: DataFrame with asset returns
            weights: Portfolio weights by asset
            benchmark_data: Optional benchmark returns
            
        Returns:
            RiskMetrics object with all calculated metrics
        """
        try:
            # Calculate portfolio returns
            portfolio_returns = self.calculate_portfolio_returns(
                portfolio_data, weights
            )
            
            # Calculate volatility for different periods
            volatility_30d = self.calculate_volatility(
                portfolio_returns, RiskPeriod.DAYS_30
            )
            volatility_90d = self.calculate_volatility(
                portfolio_returns, RiskPeriod.DAYS_90
            )
            volatility_365d = self.calculate_volatility(
                portfolio_returns, RiskPeriod.DAYS_365
            )
            
            # Calculate other metrics
            sharpe_ratio = self.calculate_sharpe_ratio(portfolio_returns)
            max_drawdown = self.calculate_max_drawdown(portfolio_returns)
            herfindahl_index = self.calculate_herfindahl_index(weights)
            var_95 = self.calculate_var(portfolio_returns, 0.95)
            var_99 = self.calculate_var(portfolio_returns, 0.99)
            expected_shortfall = self.calculate_expected_shortfall(
                portfolio_returns, 0.95
            )
            correlation_matrix = self.calculate_correlation_matrix(portfolio_data)
            
            # Calculate betas if benchmark data provided
            beta_btc = np.nan
            beta_sp500 = np.nan
            
            if benchmark_data:
                if 'btc' in benchmark_data:
                    beta_btc = self.calculate_beta(
                        portfolio_returns, benchmark_data['btc']
                    )
                if 'sp500' in benchmark_data:
                    beta_sp500 = self.calculate_beta(
                        portfolio_returns, benchmark_data['sp500']
                    )
            
            # Calculate additional statistical measures
            skewness = float(portfolio_returns.skew()) if len(portfolio_returns) > 2 else np.nan
            kurtosis = float(portfolio_returns.kurtosis()) if len(portfolio_returns) > 2 else np.nan
            
            # Create metrics object
            metrics = RiskMetrics(
                volatility_30d=volatility_30d,
                volatility_90d=volatility_90d,
                volatility_365d=volatility_365d,
                sharpe_ratio=sharpe_ratio,
                max_drawdown=max_drawdown,
                beta_btc=beta_btc,
                beta_sp500=beta_sp500,
                herfindahl_index=herfindahl_index,
                var_95=var_95,
                var_99=var_99,
                expected_shortfall=expected_shortfall,
                correlation_matrix=correlation_matrix,
                risk_score=0,  # Will be calculated below
                skewness=skewness,
                kurtosis=kurtosis
            )
            
            # Calculate overall risk score
            metrics.risk_score = self.calculate_risk_score(metrics)
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error calculating all metrics: {e}")
            raise


class AssetRiskCalculator:
    """Individual asset risk calculation engine"""
    
    def __init__(self, risk_free_rate: float = 0.02):
        self.risk_free_rate = risk_free_rate
        self.logger = logging.getLogger(__name__)
    
    def calculate_asset_metrics(
        self, 
        asset_returns: pd.Series,
        benchmark_returns: Optional[pd.Series] = None
    ) -> Dict[str, float]:
        """
        Calculate risk metrics for individual asset
        
        Args:
            asset_returns: Asset returns series
            benchmark_returns: Optional benchmark returns for beta calculation
            
        Returns:
            Dictionary of calculated metrics
        """
        try:
            calculator = PortfolioRiskCalculator(self.risk_free_rate)
            
            # Create portfolio data structure for single asset
            portfolio_data = pd.DataFrame({
                'timestamp': asset_returns.index,
                'asset_id': 'asset',
                'returns': asset_returns.values
            })
            
            weights = {'asset': 1.0}
            
            # Calculate metrics
            metrics = calculator.calculate_all_metrics(portfolio_data, weights)
            
            return {
                'volatility_30d': metrics.volatility_30d,
                'volatility_90d': metrics.volatility_90d,
                'volatility_365d': metrics.volatility_365d,
                'sharpe_ratio': metrics.sharpe_ratio,
                'max_drawdown': metrics.max_drawdown,
                'beta_btc': metrics.beta_btc,
                'var_95': metrics.var_95,
                'var_99': metrics.var_99,
                'expected_shortfall': metrics.expected_shortfall,
                'skewness': metrics.skewness,
                'kurtosis': metrics.kurtosis,
                'risk_score': metrics.risk_score
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating asset metrics: {e}")
            raise


# Import scipy for parametric VaR calculations
try:
    from scipy.stats import norm
except ImportError:
    # Fallback if scipy not available
    def norm_ppf(p):
        """Simple normal distribution inverse CDF approximation"""
        return np.sqrt(2) * np.erfinv(2 * p - 1)
    
    class norm:
        @staticmethod
        def ppf(p):
            return norm_ppf(p)
