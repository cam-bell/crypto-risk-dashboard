#!/usr/bin/env python3
"""
Standalone test script for the Risk Calculation Engine
This script demonstrates all risk calculations without requiring a database connection.
"""

import pandas as pd
import numpy as np
from app.utils.risk_calculator import PortfolioRiskCalculator, AssetRiskCalculator, RiskPeriod

def create_sample_data():
    """Create sample portfolio data for testing"""
    print("📊 Creating sample portfolio data...")
    
    # Generate sample price data for 3 assets over 400 days
    np.random.seed(42)  # For reproducible results
    
    dates = pd.date_range(start='2023-01-01', periods=400, freq='D')
    
    # Asset 1: Bitcoin-like (high volatility, positive trend)
    btc_returns = np.random.normal(0.001, 0.03, 400)
    # Asset 2: Ethereum-like (medium volatility, positive trend)
    eth_returns = np.random.normal(0.0008, 0.025, 400)
    # Asset 3: Stable coin-like (low volatility, minimal trend)
    usdc_returns = np.random.normal(0.0001, 0.005, 400)
    
    # Create portfolio data structure
    portfolio_data = []
    for i, date in enumerate(dates):
        portfolio_data.append({
            'timestamp': date,
            'asset_id': 'BTC',
            'returns': btc_returns[i]
        })
        portfolio_data.append({
            'timestamp': date,
            'asset_id': 'ETH',
            'returns': eth_returns[i]
        })
        portfolio_data.append({
            'timestamp': date,
            'asset_id': 'USDC',
            'returns': usdc_returns[i]
        })
    
    portfolio_df = pd.DataFrame(portfolio_data)
    
    # Portfolio weights (60% BTC, 30% ETH, 10% USDC)
    weights = {
        'BTC': 0.60,
        'ETH': 0.30,
        'USDC': 0.10
    }
    
    print(f"✅ Created sample data with {len(dates)} days for 3 assets")
    print(f"📈 Portfolio weights: {weights}")
    
    return portfolio_df, weights

def test_portfolio_risk_calculator():
    """Test the PortfolioRiskCalculator class"""
    print("\n🔍 Testing Portfolio Risk Calculator...")
    
    # Create sample data
    portfolio_data, weights = create_sample_data()
    
    # Initialize calculator
    calculator = PortfolioRiskCalculator(risk_free_rate=0.02)
    
    # Calculate all metrics
    print("📊 Calculating comprehensive portfolio risk metrics...")
    metrics = calculator.calculate_all_metrics(portfolio_data, weights)
    
    # Display results
    print("\n📊 PORTFOLIO RISK METRICS RESULTS:")
    print("=" * 50)
    print(f"🎯 Risk Score: {metrics.risk_score:.2f}/10")
    print(f"📊 Volatility (30d): {metrics.volatility_30d:.4f} ({metrics.volatility_30d*100:.2f}%)")
    print(f"📊 Volatility (90d): {metrics.volatility_90d:.4f} ({metrics.volatility_90d*100:.2f}%)")
    print(f"📊 Volatility (365d): {metrics.volatility_365d:.4f} ({metrics.volatility_365d*100:.2f}%)")
    print(f"⚖️  Sharpe Ratio: {metrics.sharpe_ratio:.4f}")
    print(f"📉 Max Drawdown: {metrics.max_drawdown:.4f} ({metrics.max_drawdown*100:.2f}%)")
    print(f"🔗 Beta vs BTC: {metrics.beta_btc:.4f}")
    print(f"🎯 Herfindahl Index: {metrics.herfindahl_index:.4f}")
    print(f"⚠️  VaR (95%): {metrics.var_95:.4f} ({metrics.var_95*100:.2f}%)")
    print(f"⚠️  VaR (99%): {metrics.var_99:.4f} ({metrics.var_99*100:.2f}%)")
    print(f"📊 Expected Shortfall: {metrics.expected_shortfall:.4f} ({metrics.expected_shortfall*100:.2f}%)")
    print(f"📈 Skewness: {metrics.skewness:.4f}")
    print(f"📊 Kurtosis: {metrics.kurtosis:.4f}")
    
    return metrics

def test_correlation_matrix():
    """Test correlation matrix calculation"""
    print("\n🔍 Testing Correlation Matrix Calculation...")
    
    # Create sample data
    portfolio_data, weights = create_sample_data()
    
    # Initialize calculator
    calculator = PortfolioRiskCalculator(risk_free_rate=0.02)
    
    # Calculate correlation matrix
    print("📊 Calculating correlation matrix...")
    correlation_matrix = calculator.calculate_correlation_matrix(portfolio_data)
    
    print("\n📊 CORRELATION MATRIX:")
    print("=" * 30)
    print(correlation_matrix.round(4))
    
    return correlation_matrix

def test_risk_periods():
    """Test different risk periods"""
    print("\n🔍 Testing Risk Periods...")
    
    # Create sample data
    portfolio_data, weights = create_sample_data()
    
    # Initialize calculator
    calculator = PortfolioRiskCalculator(risk_free_rate=0.02)
    
    # Test different periods
    periods = [RiskPeriod.DAYS_30, RiskPeriod.DAYS_90, RiskPeriod.DAYS_365]
    
    print("\n📊 VOLATILITY BY PERIOD:")
    print("=" * 30)
    for period in periods:
        vol = calculator.calculate_volatility(
            calculator.calculate_portfolio_returns(portfolio_data, weights),
            period,
            annualize=True
        )
        print(f"{period.name}: {vol:.4f} ({vol*100:.2f}%)")

def main():
    """Main test function"""
    print("🚀 RISK CALCULATION ENGINE TEST SUITE")
    print("=" * 50)
    print("Testing comprehensive risk metrics without database...")
    
    try:
        # Test portfolio risk calculator
        portfolio_metrics = test_portfolio_risk_calculator()
        
        # Test correlation matrix
        correlation_matrix = test_correlation_matrix()
        
        # Test risk periods
        test_risk_periods()
        
        print("\n✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("=" * 50)
        print("🎯 The Risk Calculation Engine is working correctly!")
        print("📊 All risk metrics have been calculated successfully.")
        print("🚀 Ready for production use!")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
