"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolios } from "@/hooks/usePortfolios";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { RiskHeatmap } from "@/components/RiskHeatmap";
import { RiskMetrics } from "@/components/RiskMetrics";
import {
  Shield,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Demo risk analysis data
const DEMO_RISK_DATA = {
  portfolio: {
    id: "demo-portfolio",
    name: "Demo Crypto Portfolio",
    description: "A diversified portfolio with major cryptocurrencies",
    total_value_usd: 125000,
    risk_score: 6.5,
    holdings: [
      { symbol: "BTC", name: "Bitcoin", allocation: 45.2, risk_score: 7.0 },
      { symbol: "ETH", name: "Ethereum", allocation: 28.8, risk_score: 6.5 },
      { symbol: "ADA", name: "Cardano", allocation: 15.6, risk_score: 5.5 },
      { symbol: "SOL", name: "Solana", allocation: 10.4, risk_score: 8.0 },
    ],
  },
  riskMetrics: {
    volatility_30d: 0.245,
    volatility_90d: 0.312,
    volatility_365d: 0.456,
    sharpe_ratio: 1.24,
    sortino_ratio: 1.67,
    max_drawdown: -0.234,
    var_95: -0.089,
    var_99: -0.156,
    expected_shortfall: -0.134,
    beta: 1.12,
    correlation_to_market: 0.78,
  },
  correlationMatrix: {
    correlation_matrix: {
      BTC: { BTC: 1.0, ETH: 0.72, ADA: 0.68, SOL: 0.75 },
      ETH: { BTC: 0.72, ETH: 1.0, ADA: 0.81, SOL: 0.83 },
      ADA: { BTC: 0.68, ETH: 0.81, ADA: 1.0, SOL: 0.79 },
      SOL: { BTC: 0.75, ETH: 0.83, ADA: 0.79, SOL: 1.0 },
    },
    assets: ["BTC", "ETH", "ADA", "SOL"],
  },
  historicalMetrics: [
    { date: "2024-01-01", volatility: 0.234, sharpe: 1.18, var_95: -0.082 },
    { date: "2024-02-01", volatility: 0.267, sharpe: 1.31, var_95: -0.095 },
    { date: "2024-03-01", volatility: 0.289, sharpe: 1.22, var_95: -0.103 },
    { date: "2024-04-01", volatility: 0.245, sharpe: 1.24, var_95: -0.089 },
  ],
};

export default function RiskAnalysisSelectorPage() {
  const router = useRouter();
  const { portfolios, isLoading } = usePortfolios();
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");

  const handleAnalyze = () => {
    if (selectedPortfolioId) {
      router.push(`/risk-analysis/${selectedPortfolioId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center">
          <Skeleton className="h-8 w-64 mx-auto mb-4" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  // If no portfolios exist, show demo risk analysis
  if (portfolios.length === 0) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Risk Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6">
            Comprehensive risk analysis including volatility, correlation, and
            value-at-risk calculations.
          </p>

          {/* Demo Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-2xl mx-auto mb-6">
            <div className="flex items-center justify-center space-x-2 text-blue-700 dark:text-blue-300">
              <Info className="h-5 w-5" />
              <span className="text-sm font-medium">
                Showing demo data. Create a portfolio to get personalized risk
                analysis.
              </span>
            </div>
          </div>
        </div>

        {/* Demo Risk Analysis */}
        <div className="space-y-6">
          {/* Portfolio Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Portfolio Overview
              </h2>
              <div className="flex items-center space-x-2">
                <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  Demo Data
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${DEMO_RISK_DATA.portfolio.total_value_usd.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Value
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {DEMO_RISK_DATA.portfolio.holdings.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Holdings
                </div>
              </div>
              <div className="text-center">
                <div
                  className={cn(
                    "text-2xl font-bold",
                    DEMO_RISK_DATA.portfolio.risk_score <= 3 &&
                      "text-green-600 dark:text-green-400",
                    DEMO_RISK_DATA.portfolio.risk_score > 3 &&
                      DEMO_RISK_DATA.portfolio.risk_score <= 6 &&
                      "text-yellow-600 dark:text-yellow-400",
                    DEMO_RISK_DATA.portfolio.risk_score > 6 &&
                      DEMO_RISK_DATA.portfolio.risk_score <= 8 &&
                      "text-orange-600 dark:text-orange-400",
                    DEMO_RISK_DATA.portfolio.risk_score > 8 &&
                      "text-red-600 dark:text-red-400"
                  )}
                >
                  {DEMO_RISK_DATA.portfolio.risk_score}/10
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Risk Score
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Metrics */}
          <RiskMetrics
            portfolioId="demo-portfolio"
            demoData={DEMO_RISK_DATA.riskMetrics}
            isDemo={true}
          />

          {/* Correlation Heatmap */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Asset Correlation Matrix
            </h2>
            <RiskHeatmap
              correlationMatrix={DEMO_RISK_DATA.correlationMatrix}
              isLoading={false}
              isDemo={true}
            />
          </Card>

          {/* Portfolio Composition */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Portfolio Composition
            </h2>
            <div className="space-y-4">
              {DEMO_RISK_DATA.portfolio.holdings.map((holding, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {holding.symbol}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {holding.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {holding.symbol}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {holding.allocation}%
                    </div>
                    <div
                      className={cn(
                        "text-sm",
                        holding.risk_score <= 3 &&
                          "text-green-600 dark:text-green-400",
                        holding.risk_score > 3 &&
                          holding.risk_score <= 6 &&
                          "text-yellow-600 dark:text-yellow-400",
                        holding.risk_score > 6 &&
                          holding.risk_score <= 8 &&
                          "text-orange-600 dark:text-orange-400",
                        holding.risk_score > 8 &&
                          "text-red-600 dark:text-red-400"
                      )}
                    >
                      Risk: {holding.risk_score}/10
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Call to Action */}
          <div className="text-center py-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Analyze Your Own Portfolio?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a portfolio with your actual holdings to get personalized
                risk analysis and insights.
              </p>
              <Button
                onClick={() => router.push("/portfolios")}
                size="lg"
                className="flex items-center space-x-2"
              >
                <span>Create Your Portfolio</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If portfolios exist, show the normal portfolio selection interface
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Risk Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select a portfolio to perform comprehensive risk analysis including
          volatility, correlation, and value-at-risk calculations.
        </p>
      </div>

      {/* Portfolio Selection */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Choose a Portfolio
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <Card
              key={portfolio.id}
              className={cn(
                "p-6 cursor-pointer transition-all duration-200 hover:shadow-lg",
                selectedPortfolioId === portfolio.id
                  ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              )}
              onClick={() => setSelectedPortfolioId(portfolio.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2",
                    selectedPortfolioId === portfolio.id
                      ? "bg-blue-500 border-blue-500"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {portfolio.name}
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {portfolio.description || "No description available"}
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Holdings:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {portfolio.holdings?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Total Value:
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${(portfolio.total_value_usd || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    Risk Score:
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      (portfolio.risk_score || 0) <= 3 &&
                        "text-green-600 dark:text-green-400",
                      (portfolio.risk_score || 0) > 3 &&
                        (portfolio.risk_score || 0) <= 6 &&
                        "text-yellow-600 dark:text-yellow-400",
                      (portfolio.risk_score || 0) > 6 &&
                        (portfolio.risk_score || 0) <= 8 &&
                        "text-orange-600 dark:text-orange-400",
                      (portfolio.risk_score || 0) > 8 &&
                        "text-red-600 dark:text-red-400"
                    )}
                  >
                    {portfolio.risk_score || 0}/10
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleAnalyze}
          disabled={!selectedPortfolioId}
          size="lg"
          className="flex items-center space-x-2"
        >
          <span>Analyze Risk</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Risk Analysis Features */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
          What You'll Get
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Volatility Analysis
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              30, 90, and 365-day volatility calculations with risk-adjusted
              returns
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Correlation Matrix
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Asset correlation analysis and portfolio composition breakdown
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Value at Risk
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              95% and 99% confidence level VaR with expected shortfall analysis
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
