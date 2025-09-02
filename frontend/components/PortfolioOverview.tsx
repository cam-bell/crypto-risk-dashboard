'use client'

import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

export function PortfolioOverview() {
  // Sample data - replace with real API calls
  const portfolioData = {
    totalValue: 125000,
    change24h: 2500,
    changePercent: 2.04,
    assets: [
      { symbol: 'BTC', name: 'Bitcoin', value: 50000, allocation: 40, change24h: 3.2 },
      { symbol: 'ETH', name: 'Ethereum', value: 37500, allocation: 30, change24h: -1.5 },
      { symbol: 'ADA', name: 'Cardano', value: 18750, allocation: 15, change24h: 5.8 },
      { symbol: 'DOT', name: 'Polkadot', value: 12500, allocation: 10, change24h: -2.1 },
      { symbol: 'LINK', name: 'Chainlink', value: 6250, allocation: 5, change24h: 1.7 },
    ]
  }

  const isPositive = portfolioData.change24h >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Portfolio Overview
        </h2>
        <button className="btn-primary">
          Add Asset
        </button>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${portfolioData.totalValue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                24h Change
              </p>
              <div className="flex items-center space-x-2">
                <p className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : ''}${portfolioData.change24h.toLocaleString()}
                </p>
                <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  ({isPositive ? '+' : ''}{portfolioData.changePercent}%)
                </span>
              </div>
            </div>
            {isPositive ? (
              <TrendingUp className="h-8 w-8 text-green-600" />
            ) : (
              <TrendingDown className="h-8 w-8 text-red-600" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Assets
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {portfolioData.assets.length}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-primary-600" />
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Asset Allocation
        </h3>
        <div className="space-y-4">
          {portfolioData.assets.map((asset) => (
            <div key={asset.symbol} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                    {asset.symbol}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{asset.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{asset.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-medium text-gray-900 dark:text-white">
                  ${asset.value.toLocaleString()}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {asset.allocation}%
                  </span>
                  <span className={`text-sm ${asset.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {asset.change24h >= 0 ? '+' : ''}{asset.change24h}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
