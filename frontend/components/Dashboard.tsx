"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Target,
} from "lucide-react";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useMarketOverview } from "@/hooks/useCryptoAssets";
import { formatCurrency, formatPercentage, getChangeColor } from "@/lib/utils";
import { PortfolioOverview } from "./PortfolioOverview";
import { RiskMetrics } from "./RiskMetrics";
import { AIInsights } from "./AIInsights";

export function Dashboard() {
  const {
    data: portfolios,
    isLoading: portfoliosLoading,
    error: portfoliosError,
  } = usePortfolios();
  const { data: marketData, isLoading: marketLoading } = useMarketOverview();

  const selectedPortfolio = portfolios?.[0]; // For now, just use the first portfolio
  const totalValue = selectedPortfolio?.total_value || 0;
  const totalPnl = selectedPortfolio?.total_pnl || 0;
  const totalPnlPercentage = selectedPortfolio?.total_pnl_percentage || 0;
  const riskScore = selectedPortfolio?.risk_score || 0;

  const getRiskLevel = (score: number) => {
    if (score <= 0.3)
      return { level: "Low", color: "text-green-600 dark:text-green-400" };
    if (score <= 0.7)
      return { level: "Medium", color: "text-yellow-600 dark:text-yellow-400" };
    return { level: "High", color: "text-red-600 dark:text-red-400" };
  };

  const riskLevel = getRiskLevel(riskScore);

  if (portfoliosLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (portfoliosError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Error loading portfolios
          </h3>
          <p className="text-muted-foreground mb-4">
            {portfoliosError.message}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your crypto portfolio performance and risk metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Target className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      {/* Key metrics grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Portfolio Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {portfolios?.length || 0} portfolio
              {portfolios?.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            {totalPnl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getChangeColor(totalPnlPercentage)}`}
            >
              {formatCurrency(totalPnl)}
            </div>
            <p className={`text-xs ${getChangeColor(totalPnlPercentage)}`}>
              {totalPnl >= 0 ? "+" : ""}
              {formatPercentage(totalPnlPercentage)}
            </p>
          </CardContent>
        </Card>

        {/* Risk Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${riskLevel.color}`}>
              {formatPercentage(riskScore * 100, 1)}
            </div>
            <p className={`text-xs ${riskLevel.color}`}>
              {riskLevel.level} Risk
            </p>
          </CardContent>
        </Card>

        {/* Market Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {marketData
                ? `$${(marketData.total_market_cap / 1e12).toFixed(1)}T`
                : "--"}
            </div>
            <p className="text-xs text-muted-foreground">
              {marketData
                ? `${marketData.top_gainers?.length || 0} assets tracked`
                : "Loading..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Portfolio Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PortfolioOverview portfolio={selectedPortfolio} />
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RiskMetrics portfolioId={selectedPortfolio?.id} />
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AIInsights portfolioId={selectedPortfolio?.id} />
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Rebalance Portfolio
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Set Risk Alerts
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Add New Asset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
