"""
Unit tests for risk calculation engine
"""

import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

from app.utils.risk_calculator import (
    PortfolioRiskCalculator,
    AssetRiskCalculator,
    RiskPeriod,
    RiskMetrics
)


class TestPortfolioRiskCalculator:
    """Test portfolio risk calculation engine"""
    
    def setup_method(self):
        """Setup test data"""
        self.calculator = PortfolioRiskCalculator(risk_free_rate=0.02)
        
        # Create sample price data
        dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
        
        # Generate sample returns for multiple assets
        np.random.seed(42)  # For reproducible tests
        
        # Asset 1: Higher volatility
        returns1 = np.random.normal(0.001, 0.03, len(dates))
        
        # Asset 2: Lower volatility
        returns2 = np.random.normal(0.0008, 0.02, len(dates))
        
        # Asset 3: Medium volatility
        returns3 = np.random.normal(0.0009, 0.025, len(dates))
        
        # Create portfolio data
        self.portfolio_data = pd.DataFrame([
            {
                'timestamp': date,
                'asset_id': 'asset1',
                'returns': ret
            }
            for date, ret in zip(dates, returns1)
        ] + [
            {
                'timestamp': date,
                'asset_id': 'asset2',
                'returns': ret
            }
            for date, ret in zip(dates, returns2)
        ] + [
            {
                'timestamp': date,
                'asset_id': 'asset3',
                'returns': ret
            }
            for date, ret in zip(dates, returns3)
        ])
        
        # Portfolio weights
        self.weights = {
            'asset1': 0.4,
            'asset2': 0.35,
            'asset3': 0.25
        }
        
        # Benchmark data (Bitcoin-like returns)
        benchmark_returns = np.random.normal(0.0012, 0.04, len(dates))
        self.benchmark_data = {
            'btc': pd.Series(benchmark_returns, index=dates)
        }
    
    def test_calculate_portfolio_returns(self):
        """Test portfolio returns calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        assert isinstance(portfolio_returns, pd.Series)
        assert len(portfolio_returns) > 0
        assert not portfolio_returns.isna().all()
        
        # Check that returns are reasonable
        assert portfolio_returns.std() > 0
        assert portfolio_returns.std() < 1  # Should not exceed 100% daily volatility
    
    def test_calculate_volatility(self):
        """Test volatility calculation for different periods"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        # Test 30-day volatility
        vol_30d = self.calculator.calculate_volatility(
            portfolio_returns, RiskPeriod.DAYS_30
        )
        assert isinstance(vol_30d, float)
        assert vol_30d > 0
        assert not np.isnan(vol_30d)
        
        # Test 90-day volatility
        vol_90d = self.calculator.calculate_volatility(
            portfolio_returns, RiskPeriod.DAYS_90
        )
        assert isinstance(vol_90d, float)
        assert vol_90d > 0
        assert not np.isnan(vol_90d)
        
        # Test 365-day volatility
        vol_365d = self.calculator.calculate_volatility(
            portfolio_returns, RiskPeriod.DAYS_365
        )
        assert isinstance(vol_365d, float)
        assert vol_365d > 0
        assert not np.isnan(vol_365d)
        
        # Test non-annualized volatility
        vol_non_annual = self.calculator.calculate_volatility(
            portfolio_returns, RiskPeriod.DAYS_30, annualize=False
        )
        assert vol_non_annual < vol_30d  # Non-annualized should be lower
    
    def test_calculate_sharpe_ratio(self):
        """Test Sharpe ratio calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        sharpe_ratio = self.calculator.calculate_sharpe_ratio(portfolio_returns)
        
        assert isinstance(sharpe_ratio, float)
        assert not np.isnan(sharpe_ratio)
        
        # Sharpe ratio can be negative, but should be finite
        assert np.isfinite(sharpe_ratio)
        
        # Test with custom risk-free rate
        custom_sharpe = self.calculator.calculate_sharpe_ratio(
            portfolio_returns, risk_free_rate=0.05
        )
        assert isinstance(custom_sharpe, float)
        assert not np.isnan(custom_sharpe)
    
    def test_calculate_max_drawdown(self):
        """Test maximum drawdown calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        max_drawdown = self.calculator.calculate_max_drawdown(portfolio_returns)
        
        assert isinstance(max_drawdown, float)
        assert max_drawdown <= 0  # Drawdown should be negative or zero
        assert not np.isnan(max_drawdown)
        
        # Test with all positive returns (should have zero drawdown)
        positive_returns = pd.Series([0.01, 0.02, 0.01, 0.03])
        zero_drawdown = self.calculator.calculate_max_drawdown(positive_returns)
        assert zero_drawdown == 0.0
    
    def test_calculate_beta(self):
        """Test beta calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        beta = self.calculator.calculate_beta(
            portfolio_returns, self.benchmark_data['btc']
        )
        
        assert isinstance(beta, float)
        assert not np.isnan(beta)
        assert np.isfinite(beta)
        
        # Beta should be reasonable (typically between -5 and 5 for crypto)
        assert -10 < beta < 10
    
    def test_calculate_herfindahl_index(self):
        """Test Herfindahl index calculation"""
        # Test with equal weights
        equal_weights = {'asset1': 0.5, 'asset2': 0.5}
        hhi_equal = self.calculator.calculate_herfindahl_index(equal_weights)
        assert hhi_equal == 0.5  # 0.5^2 + 0.5^2 = 0.5
        
        # Test with concentrated weights
        concentrated_weights = {'asset1': 0.8, 'asset2': 0.2}
        hhi_concentrated = self.calculator.calculate_herfindahl_index(concentrated_weights)
        assert hhi_concentrated == 0.68  # 0.8^2 + 0.2^2 = 0.68
        assert hhi_concentrated > hhi_equal  # More concentrated = higher HHI
        
        # Test with single asset
        single_asset = {'asset1': 1.0}
        hhi_single = self.calculator.calculate_herfindahl_index(single_asset)
        assert hhi_single == 1.0  # Single asset = maximum concentration
        
        # Test with empty weights
        hhi_empty = self.calculator.calculate_herfindahl_index({})
        assert hhi_empty == 0.0
    
    def test_calculate_var(self):
        """Test Value at Risk calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        # Test historical VaR
        var_95 = self.calculator.calculate_var(portfolio_returns, 0.95)
        assert isinstance(var_95, float)
        assert not np.isnan(var_95)
        assert var_95 < 0  # VaR should be negative (loss)
        
        var_99 = self.calculator.calculate_var(portfolio_returns, 0.99)
        assert isinstance(var_99, float)
        assert not np.isnan(var_99)
        assert var_99 < 0  # VaR should be negative (loss)
        
        # 99% VaR should be more negative than 95% VaR
        assert var_99 < var_95
    
    def test_calculate_expected_shortfall(self):
        """Test Expected Shortfall calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        expected_shortfall = self.calculator.calculate_expected_shortfall(
            portfolio_returns, 0.95
        )
        
        assert isinstance(expected_shortfall, float)
        assert not np.isnan(expected_shortfall)
        assert expected_shortfall < 0  # Expected shortfall should be negative
        
        # Expected shortfall should be more negative than VaR
        var_95 = self.calculator.calculate_var(portfolio_returns, 0.95)
        assert expected_shortfall <= var_95
    
    def test_calculate_correlation_matrix(self):
        """Test correlation matrix calculation"""
        correlation_matrix = self.calculator.calculate_correlation_matrix(
            self.portfolio_data
        )
        
        assert isinstance(correlation_matrix, pd.DataFrame)
        assert not correlation_matrix.empty
        
        # Check that correlation matrix has correct dimensions
        expected_assets = ['asset1', 'asset2', 'asset3']
        assert list(correlation_matrix.columns) == expected_assets
        assert list(correlation_matrix.index) == expected_assets
        
        # Check diagonal values (should be 1.0)
        for asset in expected_assets:
            assert correlation_matrix.loc[asset, asset] == 1.0
        
        # Check that correlations are between -1 and 1
        for col in correlation_matrix.columns:
            for idx in correlation_matrix.index:
                corr_value = correlation_matrix.loc[idx, col]
                assert -1 <= corr_value <= 1
    
    def test_calculate_risk_score(self):
        """Test risk score calculation"""
        portfolio_returns = self.calculator.calculate_portfolio_returns(
            self.portfolio_data, self.weights
        )
        
        # Calculate all metrics first
        metrics = self.calculator.calculate_all_metrics(
            self.portfolio_data, self.weights, self.benchmark_data
        )
        
        risk_score = self.calculator.calculate_risk_score(metrics)
        
        assert isinstance(risk_score, int)
        assert 1 <= risk_score <= 10  # Risk score should be between 1 and 10
    
    def test_calculate_all_metrics(self):
        """Test calculation of all risk metrics"""
        metrics = self.calculator.calculate_all_metrics(
            self.portfolio_data, self.weights, self.benchmark_data
        )
        
        assert isinstance(metrics, RiskMetrics)
        
        # Check that all metrics are calculated
        assert hasattr(metrics, 'volatility_30d')
        assert hasattr(metrics, 'volatility_90d')
        assert hasattr(metrics, 'volatility_365d')
        assert hasattr(metrics, 'sharpe_ratio')
        assert hasattr(metrics, 'max_drawdown')
        assert hasattr(metrics, 'beta_btc')
        assert hasattr(metrics, 'herfindahl_index')
        assert hasattr(metrics, 'var_95')
        assert hasattr(metrics, 'var_99')
        assert hasattr(metrics, 'expected_shortfall')
        assert hasattr(metrics, 'risk_score')
        assert hasattr(metrics, 'skewness')
        assert hasattr(metrics, 'kurtosis')
        
        # Check that risk score is calculated
        assert metrics.risk_score > 0
        assert metrics.risk_score <= 10


class TestAssetRiskCalculator:
    """Test individual asset risk calculation engine"""
    
    def setup_method(self):
        """Setup test data"""
        self.calculator = AssetRiskCalculator(risk_free_rate=0.02)
        
        # Create sample asset returns
        dates = pd.date_range(start='2023-01-01', end='2023-12-31', freq='D')
        np.random.seed(42)
        
        # Generate sample returns
        returns = np.random.normal(0.001, 0.03, len(dates))
        self.asset_returns = pd.Series(returns, index=dates)
        
        # Benchmark returns
        benchmark_returns = np.random.normal(0.0012, 0.04, len(dates))
        self.benchmark_returns = pd.Series(benchmark_returns, index=dates)
    
    def test_calculate_asset_metrics(self):
        """Test asset risk metrics calculation"""
        metrics = self.calculator.calculate_asset_metrics(
            self.asset_returns, self.benchmark_returns
        )
        
        assert isinstance(metrics, dict)
        
        # Check that all expected metrics are present
        expected_keys = [
            'volatility_30d', 'volatility_90d', 'volatility_365d',
            'sharpe_ratio', 'max_drawdown', 'beta_btc',
            'var_95', 'var_99', 'expected_shortfall',
            'skewness', 'kurtosis', 'risk_score'
        ]
        
        for key in expected_keys:
            assert key in metrics
            assert isinstance(metrics[key], (float, int))
        
        # Check risk score range
        assert 1 <= metrics['risk_score'] <= 10
        
        # Check that volatility values are positive
        assert metrics['volatility_30d'] > 0
        assert metrics['volatility_90d'] > 0
        assert metrics['volatility_365d'] > 0
        
        # Check that drawdown is negative or zero
        assert metrics['max_drawdown'] <= 0
        
        # Check that VaR values are negative
        assert metrics['var_95'] < 0
        assert metrics['var_99'] < 0


class TestRiskPeriod:
    """Test risk period enumeration"""
    
    def test_risk_period_values(self):
        """Test risk period values"""
        assert RiskPeriod.DAYS_30.value == 30
        assert RiskPeriod.DAYS_90.value == 90
        assert RiskPeriod.DAYS_365.value == 365
    
    def test_risk_period_names(self):
        """Test risk period names"""
        assert RiskPeriod.DAYS_30.name == 'DAYS_30'
        assert RiskPeriod.DAYS_90.name == 'DAYS_90'
        assert RiskPeriod.DAYS_365.name == 'DAYS_365'


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def setup_method(self):
        """Setup test data"""
        self.calculator = PortfolioRiskCalculator()
    
    def test_empty_portfolio_data(self):
        """Test handling of empty portfolio data"""
        empty_data = pd.DataFrame(columns=['timestamp', 'asset_id', 'returns'])
        weights = {'asset1': 1.0}
        
        with pytest.raises(Exception):
            self.calculator.calculate_portfolio_returns(empty_data, weights)
    
    def test_insufficient_data_for_volatility(self):
        """Test volatility calculation with insufficient data"""
        # Create returns with less than 30 data points
        short_returns = pd.Series([0.01, 0.02, -0.01, 0.03, 0.01])
        
        vol_30d = self.calculator.calculate_volatility(
            short_returns, RiskPeriod.DAYS_30
        )
        assert np.isnan(vol_30d)
    
    def test_zero_returns(self):
        """Test calculation with zero returns"""
        zero_returns = pd.Series([0.0] * 100)
        
        # Volatility should be 0
        vol = self.calculator.calculate_volatility(
            zero_returns, RiskPeriod.DAYS_30
        )
        assert vol == 0.0
        
        # Sharpe ratio should be NaN (division by zero)
        sharpe = self.calculator.calculate_sharpe_ratio(zero_returns)
        assert np.isnan(sharpe)
    
    def test_single_return(self):
        """Test calculation with single return value"""
        single_return = pd.Series([0.01])
        
        # Max drawdown should be 0
        drawdown = self.calculator.calculate_max_drawdown(single_return)
        assert drawdown == 0.0
    
    def test_negative_weights(self):
        """Test handling of negative weights"""
        negative_weights = {'asset1': -0.5, 'asset2': 1.5}
        
        # Herfindahl index should handle negative weights
        hhi = self.calculator.calculate_herfindahl_index(negative_weights)
        assert hhi > 0
        assert not np.isnan(hhi)


class TestPerformance:
    """Test performance characteristics"""
    
    def setup_method(self):
        """Setup test data"""
        self.calculator = PortfolioRiskCalculator()
        
        # Create large dataset for performance testing
        dates = pd.date_range(start='2020-01-01', end='2023-12-31', freq='D')
        np.random.seed(42)
        
        # Generate returns for 10 assets over 4 years
        self.large_portfolio_data = pd.DataFrame([
            {
                'timestamp': date,
                'asset_id': f'asset{i}',
                'returns': np.random.normal(0.001, 0.03)
            }
            for date in dates
            for i in range(10)
        ])
        
        self.large_weights = {
            f'asset{i}': 1.0/10 for i in range(10)
        }
    
    def test_large_portfolio_performance(self):
        """Test performance with large portfolio"""
        import time
        
        start_time = time.time()
        
        metrics = self.calculator.calculate_all_metrics(
            self.large_portfolio_data, self.large_weights
        )
        
        end_time = time.time()
        calculation_time = end_time - start_time
        
        # Should complete within reasonable time (less than 5 seconds)
        assert calculation_time < 5.0
        
        # All metrics should be calculated
        assert not np.isnan(metrics.volatility_30d)
        assert not np.isnan(metrics.sharpe_ratio)
        assert not np.isnan(metrics.max_drawdown)
        assert not np.isnan(metrics.herfindahl_index)
        assert not np.isnan(metrics.var_95)
        assert not np.isnan(metrics.risk_score)
    
    def test_memory_efficiency(self):
        """Test memory efficiency with large datasets"""
        import psutil
        import os
        
        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Calculate metrics
        metrics = self.calculator.calculate_all_metrics(
            self.large_portfolio_data, self.large_weights
        )
        
        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory
        
        # Memory increase should be reasonable (less than 100 MB)
        assert memory_increase < 100.0
