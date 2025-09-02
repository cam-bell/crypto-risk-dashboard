'use client'

import { AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react'

export function RiskMetrics() {
  // Sample risk data - replace with real API calls
  const riskData = {
    volatility: 0.25,
    sharpeRatio: 1.8,
    maxDrawdown: -0.15,
    var95: -0.08,
    concentrationRisk: 0.45,
    correlationRisk: 0.32,
    riskScore: 7.2,
    riskLevel: 'Medium',
    recommendations: [
      'Consider reducing Bitcoin allocation to diversify risk',
      'Add stablecoins to reduce portfolio volatility',
      'Monitor correlation between ETH and BTC positions'
    ]
  }

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600 bg-green-100 dark:bg-green-900'
    if (score <= 6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
    return 'text-red-600 bg-red-100 dark:bg-red-900'
  }

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900'
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900'
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Risk Analysis
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Risk Score:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskData.riskScore)}`}>
            {riskData.riskScore}/10
          </span>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Volatility
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {(riskData.volatility * 100).toFixed(1)}%
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sharpe Ratio
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {riskData.sharpeRatio}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Max Drawdown
              </p>
              <p className="text-2xl font-bold text-red-600">
                {(riskData.maxDrawdown * 100).toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                VaR (95%)
              </p>
              <p className="text-2xl font-bold text-red-600">
                {(riskData.var95 * 100).toFixed(1)}%
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Risk Heatmap */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Risk Heatmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Concentration Risk
            </h4>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${riskData.concentrationRisk * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {(riskData.concentrationRisk * 100).toFixed(1)}% - Moderate Risk
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Correlation Risk
            </h4>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${riskData.correlationRisk * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {(riskData.correlationRisk * 100).toFixed(1)}% - Low Risk
            </p>
          </div>
        </div>
      </div>

      {/* Risk Recommendations */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-6 w-6 text-primary-600" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Risk Recommendations
          </h3>
        </div>
        <div className="space-y-3">
          {riskData.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
