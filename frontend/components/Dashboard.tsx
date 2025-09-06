"use client";

import { useState, useEffect } from "react";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useCryptoAssets } from "@/hooks/useCryptoAssets";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import { PortfolioOverview } from "./PortfolioOverview";
import { RiskMetrics } from "./RiskMetrics";
import { AIInsights } from "./AIInsights";
import { MetricCardSkeleton } from "@/components/ui/Skeleton";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  Brain,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";

export function Dashboard() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(
    null
  );
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds
  const [activeTab, setActiveTab] = useState("dashboard");

  const {
    portfolios,
    isLoading: portfoliosLoading,
    getPortfolioStats,
    getTopPerformers,
    getHighestRisk,
    realTimeData: portfolioRealTime,
    subscribeToPortfolio,
    unsubscribeFromPortfolio,
  } = usePortfolios();

  const {
    assets,
    isLoading: assetsLoading,
    getTopGainers,
    getTopLosers,
    getHighestVolume,
    getMarketSentiment,
    getPriceChangeStats,
    realTimeData: assetsRealTime,
    subscribeToAssets,
    unsubscribeFromAssets,
  } = useCryptoAssets();

  const {
    riskMetrics,
    historicalMetrics,
    correlationMatrix,
    composition,
    isLoading: riskLoading,
    calculateRisk,
    getRiskLevel,
    getRiskSummary,
  } = useRiskMetrics(selectedPortfolioId || "");

  // Auto-select first portfolio if available
  useEffect(() => {
    if (portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolioId]);

  // Subscribe to real-time updates for selected portfolio
  useEffect(() => {
    if (selectedPortfolioId) {
      subscribeToPortfolio(selectedPortfolioId);
      // Risk metrics are automatically loaded via useRiskMetrics hook

      // Subscribe to price updates for portfolio assets
      const portfolio = portfolios.find((p) => p.id === selectedPortfolioId);
      if (portfolio) {
        const assetIds = portfolio.holdings.map((h) => h.crypto_asset_id);
        subscribeToAssets(assetIds);
      }
    }

    return () => {
      if (selectedPortfolioId) {
        unsubscribeFromPortfolio(selectedPortfolioId);
        // Risk metrics cleanup handled by useRiskMetrics hook

        const portfolio = portfolios.find((p) => p.id === selectedPortfolioId);
        if (portfolio) {
          const assetIds = portfolio.holdings.map((h) => h.crypto_asset_id);
          unsubscribeFromAssets(assetIds);
        }
      }
    };
  }, [selectedPortfolioId, portfolios]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Trigger refetch of key data
      window.dispatchEvent(new CustomEvent("dashboard-refresh"));
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const portfolioStats = getPortfolioStats();
  const topPerformers = getTopPerformers(5);
  const highestRisk = getHighestRisk(5);
  const topGainers = getTopGainers(5);
  const topLosers = getTopLosers(5);
  const marketSentiment = getMarketSentiment();
  const priceChangeStats = getPriceChangeStats();

  const selectedPortfolio = portfolios.find(
    (p) => p.id === selectedPortfolioId
  );
  // riskMetrics is already available from the useRiskMetrics hook above
  const riskSummary = getRiskSummary();

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "text-green-500";
      case "bearish":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-4 h-4" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header with Connection Status */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crypto Risk Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Real-time portfolio monitoring and risk analysis
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label
                  htmlFor="auto-refresh"
                  className="text-sm text-gray-600 dark:text-gray-400"
                >
                  Auto-refresh
                </label>
              </div>

              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={15}>15s</option>
                  <option value={30}>30s</option>
                  <option value={60}>1m</option>
                  <option value={300}>5m</option>
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "dashboard", name: "Dashboard", icon: BarChart3 },
              { id: "risk", name: "Risk Analysis", icon: TrendingUp },
              { id: "insights", name: "AI Insights", icon: Brain },
              { id: "portfolio", name: "Portfolio", icon: Wallet },
              { id: "alerts", name: "Alerts", icon: Bell },
              { id: "settings", name: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Selection */}
        <div className="mb-8">
          <label
            htmlFor="portfolio-select"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Select Portfolio
          </label>
          <select
            id="portfolio-select"
            value={selectedPortfolioId || ""}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
            className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Choose a portfolio</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name} (${portfolio.total_value_usd.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {portfoliosLoading || assetsLoading ? (
                <>
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                  <MetricCardSkeleton />
                </>
              ) : (
                <>
                  {/* Total Portfolio Value */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Total Value
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${portfolioStats?.totalValue.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                    {portfolioStats && (
                      <div className="mt-4 flex items-center text-sm">
                        {portfolioStats.totalPnl >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={
                            portfolioStats.totalPnl >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {portfolioStats.totalPnl >= 0 ? "+" : ""}
                          {portfolioStats.totalPnlPercentage.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Risk Score */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                        <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Risk Score
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {riskSummary?.riskScore.toFixed(1) || "N/A"}
                        </p>
                      </div>
                    </div>
                    {riskSummary && (
                      <div className="mt-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            riskSummary.riskLevel === "low"
                              ? "bg-green-100 text-green-800"
                              : riskSummary.riskLevel === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : riskSummary.riskLevel === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                        >
                          {riskSummary.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Market Sentiment */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Market Sentiment
                        </p>
                        <div className="flex items-center mt-1">
                          {getSentimentIcon(marketSentiment)}
                          <span
                            className={`ml-2 text-lg font-bold ${getSentimentColor(marketSentiment)}`}
                          >
                            {marketSentiment.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                    {priceChangeStats && (
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        {priceChangeStats.gainers} gainers,{" "}
                        {priceChangeStats.losers} losers
                      </div>
                    )}
                  </div>

                  {/* Active Alerts */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Active Alerts
                        </p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {riskSummary?.alertCount || 0}
                        </p>
                      </div>
                    </div>
                    {riskSummary && riskSummary.criticalAlerts > 0 && (
                      <div className="mt-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {riskSummary.criticalAlerts} Critical
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Portfolio Overview */}
              <div className="lg:col-span-2">
                {selectedPortfolioId && (
                  <PortfolioOverview portfolioId={selectedPortfolioId} />
                )}
              </div>

              {/* Right Column - Risk Metrics & Insights */}
              <div className="space-y-8">
                {selectedPortfolioId && (
                  <>
                    <RiskMetrics portfolioId={selectedPortfolioId} />

                    <AIInsights portfolioId={selectedPortfolioId} />
                  </>
                )}
              </div>
            </div>

            {/* Market Overview Section */}
            <div className="mt-12">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Market Overview
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Gainers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                    Top Gainers
                  </h3>
                  <div className="space-y-3">
                    {topGainers.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <img
                            src={asset.image}
                            alt={asset.name}
                            className="w-6 h-6 rounded-full mr-3"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {asset.symbol}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          +{asset.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Losers */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <TrendingDown className="w-5 h-5 text-red-500 mr-2" />
                    Top Losers
                  </h3>
                  <div className="space-y-3">
                    {topLosers.map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <img
                            src={asset.image}
                            alt={asset.name}
                            className="w-6 h-6 rounded-full mr-3"
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {asset.symbol}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {asset.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Risk Analysis Tab */}
        {activeTab === "risk" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Risk Analysis
            </h2>
            {selectedPortfolioId ? (
              <RiskMetrics portfolioId={selectedPortfolioId} />
            ) : (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Please select a portfolio to view risk analysis
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Insights
            </h2>
            {selectedPortfolioId ? (
              <AIInsights portfolioId={selectedPortfolioId} />
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-white">
                  Please select a portfolio to view AI insights
                </p>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Portfolio Management
            </h2>
            {selectedPortfolioId ? (
              <PortfolioOverview portfolioId={selectedPortfolioId} />
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Please select a portfolio to view details
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Alerts & Notifications
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center py-8">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No active alerts at the moment
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Alerts will appear here when risk thresholds are exceeded or
                  important events occur
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Settings
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Auto-refresh Settings
                  </h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      id="auto-refresh-settings"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="auto-refresh-settings"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      Enable auto-refresh
                    </label>
                  </div>
                  {autoRefresh && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Refresh Interval
                      </label>
                      <select
                        value={refreshInterval}
                        onChange={(e) =>
                          setRefreshInterval(Number(e.target.value))
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value={15}>15 seconds</option>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={300}>5 minutes</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
