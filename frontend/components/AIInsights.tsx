'use client'

import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'

export function AIInsights() {
  // Sample AI insights - replace with real API calls
  const aiInsights = {
    lastUpdated: '2024-12-01T10:30:00Z',
    portfolioHealth: 'Good',
    riskTrend: 'Decreasing',
    insights: [
      {
        id: 1,
        type: 'risk',
        title: 'Portfolio Concentration Risk',
        description: 'Your portfolio shows moderate concentration risk with 40% allocation to Bitcoin. Consider diversifying into other asset classes.',
        impact: 'Medium',
        confidence: 85,
        recommendations: [
          'Reduce BTC allocation to 25-30%',
          'Add DeFi tokens for diversification',
          'Consider stablecoin allocation for stability'
        ]
      },
      {
        id: 2,
        type: 'opportunity',
        title: 'Market Timing Opportunity',
        description: 'Current market conditions suggest good entry points for Ethereum and Layer 2 tokens.',
        impact: 'High',
        confidence: 78,
        recommendations: [
          'Consider increasing ETH position',
          'Look into Polygon (MATIC) and Arbitrum',
          'Dollar-cost average over next 2 weeks'
        ]
      },
      {
        id: 3,
        type: 'warning',
        title: 'Correlation Risk Alert',
        description: 'High correlation detected between your major holdings (BTC, ETH, ADA). This increases portfolio risk.',
        impact: 'High',
        confidence: 92,
        recommendations: [
          'Add uncorrelated assets (gold, commodities)',
          'Consider inverse correlation strategies',
          'Review allocation strategy quarterly'
        ]
      }
    ]
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'opportunity': return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default: return <Lightbulb className="h-5 w-5 text-blue-500" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Insights
          </h2>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Generate New Insights</span>
        </button>
      </div>

      {/* Portfolio Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Portfolio Health
              </p>
              <p className="text-2xl font-bold text-green-600">
                {aiInsights.portfolioHealth}
              </p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Risk Trend
              </p>
              <p className="text-2xl font-bold text-green-600">
                {aiInsights.riskTrend}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Last Updated
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDate(aiInsights.lastUpdated)}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* AI Insights List */}
      <div className="space-y-6">
        {aiInsights.insights.map((insight) => (
          <div key={insight.id} className="card">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                      {insight.impact} Impact
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {insight.description}
                </p>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Recommendations:
                  </h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Disclaimer */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-300">
              AI-Generated Insights
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              These insights are generated by AI analysis of your portfolio data and market conditions. 
              They should not be considered as financial advice. Always do your own research and consider 
              consulting with a financial advisor before making investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
