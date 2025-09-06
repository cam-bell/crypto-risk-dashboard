"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRiskMetrics } from "@/hooks/useRiskMetrics";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Shield,
  Activity,
  RefreshCw,
  TrendingDown,
  Target,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatPercentage, formatNumber, getRiskColor } from "@/lib/utils";

interface RiskMetricsProps {
  portfolioId: string;
  demoData?: any;
  isDemo?: boolean;
}

export function RiskMetrics({
  portfolioId,
  demoData,
  isDemo = false,
}: RiskMetricsProps) {
  const [timeframe, setTimeframe] = useState<"1d" | "1w" | "1m" | "3m">("1w");
  const { riskMetrics, isLoading, error, refetch } =
    useRiskMetrics(portfolioId);

  // Use demo data if provided
  const currentRiskMetrics = isDemo ? demoData : riskMetrics;

  if (isLoading && !isDemo) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !isDemo) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Error loading risk metrics
        </h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!currentRiskMetrics) {
    return (
      <div className="text-center py-8">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          No Risk Metrics Available
        </h3>
        <p className="text-muted-foreground">
          Calculate risk metrics for this portfolio
        </p>
      </div>
    );
  }

  const {
    var_95,
    var_99,
    sharpe_ratio,
    sortino_ratio,
    max_drawdown,
    volatility,
    beta,
    risk_decomposition,
    volatility_30d,
    volatility_90d,
    volatility_365d,
    expected_shortfall,
    correlation_to_market,
  } = currentRiskMetrics;

  // Prepare data for charts
  const riskDecompositionData =
    risk_decomposition?.map((item: any, index: number) => ({
      asset: item.asset,
      contribution: item.contribution,
      percentage: item.percentage,
      color: `hsl(${index * 60}, 70%, 50%)`,
    })) || [];

  const riskMetricsData = [
    { metric: "VaR (95%)", value: var_95, color: "#ef4444" },
    { metric: "VaR (99%)", value: var_99, color: "#dc2626" },
    { metric: "Max Drawdown", value: max_drawdown, color: "#f59e0b" },
    {
      metric: "Volatility",
      value: volatility || volatility_30d,
      color: "#8b5cf6",
    },
  ];

  const performanceMetricsData = [
    { metric: "Sharpe Ratio", value: sharpe_ratio, color: "#10b981" },
    { metric: "Sortino Ratio", value: sortino_ratio, color: "#059669" },
    { metric: "Beta", value: beta, color: "#3b82f6" },
  ];

  const volatilityData = [
    { period: "30D", value: volatility_30d || volatility, color: "#3b82f6" },
    { period: "90D", value: volatility_90d, color: "#8b5cf6" },
    { period: "365D", value: volatility_365d, color: "#ef4444" },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatPercentage(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getRiskLevel = (value: number, metric: string) => {
    if (
      metric.includes("VaR") ||
      metric.includes("Drawdown") ||
      metric.includes("Volatility")
    ) {
      if (value <= 0.1)
        return { level: "Low", color: "text-green-600 dark:text-green-400" };
      if (value <= 0.25)
        return {
          level: "Medium",
          color: "text-yellow-600 dark:text-yellow-400",
        };
      return { level: "High", color: "text-red-600 dark:text-red-400" };
    }

    if (metric.includes("Sharpe") || metric.includes("Sortino")) {
      if (value >= 1.5)
        return {
          level: "Excellent",
          color: "text-green-600 dark:text-green-400",
        };
      if (value >= 1.0)
        return { level: "Good", color: "text-blue-600 dark:text-blue-400" };
      if (value >= 0.5)
        return { level: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
      return { level: "Poor", color: "text-red-600 dark:text-red-400" };
    }

    if (metric.includes("Beta")) {
      if (value <= 0.8)
        return {
          level: "Low Volatility",
          color: "text-green-600 dark:text-green-400",
        };
      if (value <= 1.2)
        return {
          level: "Market Average",
          color: "text-blue-600 dark:text-blue-400",
        };
      return {
        level: "High Volatility",
        color: "text-red-600 dark:text-red-400",
      };
    }

    return { level: "Normal", color: "text-gray-600 dark:text-gray-400" };
  };

  return (
    <div className="space-y-6">
      {/* Demo Notice */}
      {isDemo && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">
              Demo Risk Metrics - Create a portfolio to get personalized
              analysis
            </span>
          </div>
        </div>
      )}

      {/* Timeframe selector */}
      {!isDemo && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={timeframe === "1d" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("1d")}
            >
              1D
            </Button>
            <Button
              variant={timeframe === "1w" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("1w")}
            >
              1W
            </Button>
            <Button
              variant={timeframe === "1m" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("1m")}
            >
              1M
            </Button>
            <Button
              variant={timeframe === "3m" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("3m")}
            >
              3M
            </Button>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      )}

      {/* Key risk indicators */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Value at Risk (95%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPercentage(var_95 * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Maximum expected loss with 95% confidence
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Maximum Drawdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatPercentage(max_drawdown * 100)}
            </div>
            <p className="text-xs text-muted-foreground">
              Largest peak-to-trough decline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getRiskColor(getRiskLevel(sharpe_ratio, "Sharpe").level)}`}
            >
              {formatNumber(sharpe_ratio, 2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Risk-adjusted return measure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Portfolio Beta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getRiskColor(getRiskLevel(beta, "Beta").level)}`}
            >
              {formatNumber(beta, 2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Volatility vs market benchmark
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volatility Analysis */}
      {volatilityData.some((v) => v.value) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Volatility Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volatilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk decomposition chart */}
      {riskDecompositionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Risk Contribution by Asset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDecompositionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="asset" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="percentage" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk metrics comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Metrics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskMetricsData.map((item) => {
              const riskLevel = getRiskLevel(item.value, item.metric);
              return (
                <div
                  key={item.metric}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.metric}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${riskLevel.color}`}>
                      {formatPercentage(item.value * 100)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {riskLevel.level}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceMetricsData.map((item) => {
              const riskLevel = getRiskLevel(item.value, item.metric);
              return (
                <div
                  key={item.metric}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.metric}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${riskLevel.color}`}>
                      {formatNumber(item.value, 3)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {riskLevel.level}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
