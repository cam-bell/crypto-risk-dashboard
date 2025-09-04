"use client";

import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { usePortfolio } from "@/hooks/usePortfolio";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskAnalysisPageProps {
  params: {
    id: string;
  };
}

export default function RiskAnalysisPage({ params }: RiskAnalysisPageProps) {
  const { id: portfolioId } = params;
  
  const { portfolio, isLoading: portfolioLoading } = usePortfolio(portfolioId);
  const {
    riskMetrics,
    correlationMatrix,
    composition,
    historicalMetrics,
    isLoading,
    riskLoading,
    correlationLoading,
    compositionLoading,
    historicalLoading,
    calculateRisk,
    isCalculating,
    getRiskSummary,
  } = useRiskAnalysis(portfolioId);

  const riskSummary = getRiskSummary();

  const handleCalculateRisk = () => {
    calculateRisk({ portfolioId });
  };

  if (portfolioLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Risk Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {portfolio?.name || "Portfolio"} - Comprehensive risk assessment
          </p>
        </div>
        <Button
          onClick={handleCalculateRisk}
          disabled={isCalculating}
          className="flex items-center space-x-2"
        >
          <Calculator className="h-4 w-4" />
          <span>{isCalculating ? "Calculating..." : "Run Risk Analysis"}</span>
        </Button>
      </div>

      {/* Risk Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Risk Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Risk Score
              </p>
              {riskLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskSummary?.riskScore || 0}/10
                </p>
              )}
            </div>
            <div className={cn(
              "p-3 rounded-full",
              riskSummary?.riskLevel === "low" && "bg-green-100 dark:bg-green-900/20",
              riskSummary?.riskLevel === "medium" && "bg-yellow-100 dark:bg-yellow-900/20",
              riskSummary?.riskLevel === "high" && "bg-orange-100 dark:bg-orange-900/20",
              riskSummary?.riskLevel === "critical" && "bg-red-100 dark:bg-red-900/20"
            )}>
              <AlertTriangle className={cn(
                "h-6 w-6",
                riskSummary?.riskLevel === "low" && "text-green-600 dark:text-green-400",
                riskSummary?.riskLevel === "medium" && "text-yellow-600 dark:text-yellow-400",
                riskSummary?.riskLevel === "high" && "text-orange-600 dark:text-orange-400",
                riskSummary?.riskLevel === "critical" && "text-red-600 dark:text-red-400"
              )} />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 capitalize">
            {riskSummary?.riskLevel || "Unknown"} Risk
          </p>
        </Card>

        {/* Volatility */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                30-Day Volatility
              </p>
              {riskLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskSummary?.volatility ? `${(riskSummary.volatility * 100).toFixed(1)}%` : "N/A"}
                </p>
              )}
            </div>
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Price volatility
          </p>
        </Card>

        {/* Sharpe Ratio */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Sharpe Ratio
              </p>
              {riskLoading ? (
                <Skeleton className="h-8 w-16 mt-2" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskSummary?.sharpeRatio ? riskSummary.sharpeRatio.toFixed(2) : "N/A"}
                </p>
              )}
            </div>
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Risk-adjusted returns
          </p>
        </Card>

        {/* Max Drawdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Max Drawdown
              </p>
              {riskLoading ? (
                <Skeleton className="h-8 w-20 mt-2" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskSummary?.maxDrawdown ? `${(riskSummary.maxDrawdown * 100).toFixed(1)}%` : "N/A"}
                </p>
              )}
            </div>
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Peak-to-trough loss
          </p>
        </Card>
      </div>

      {/* Detailed Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Correlation Matrix */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Correlation Matrix
            </h3>
          </div>
          {correlationLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : correlationMatrix ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Correlation analysis shows the relationship between portfolio holdings.</p>
              <p className="mt-2">
                {correlationMatrix.assets?.length || 0} assets analyzed
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No correlation data available. Run risk analysis to generate.
            </p>
          )}
        </Card>

        {/* Portfolio Composition */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Portfolio Composition
            </h3>
          </div>
          {compositionLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : composition ? (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>Portfolio allocation and concentration analysis.</p>
              <p className="mt-2">
                Herfindahl Index: {composition.herfindahl_index?.toFixed(3) || "N/A"}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No composition data available. Run risk analysis to generate.
            </p>
          )}
        </Card>
      </div>

      {/* Value at Risk */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Value at Risk (VaR)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              95% Confidence Level
            </p>
            {riskLoading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {riskSummary?.var95 ? `${(riskSummary.var95 * 100).toFixed(2)}%` : "N/A"}
              </p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              99% Confidence Level
            </p>
            {riskLoading ? (
              <Skeleton className="h-6 w-20 mt-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {riskSummary?.var99 ? `${(riskSummary.var99 * 100).toFixed(2)}%` : "N/A"}
              </p>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          VaR represents the maximum expected loss over a specified time period with a given confidence level.
        </p>
      </Card>

      {/* Historical Risk Metrics */}
      {historicalMetrics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historical Risk Trends
          </h3>
          {historicalLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Historical risk metrics over time will be displayed here.
            </p>
          )}
        </Card>
      )}
    </div>
  );
}
