"use client";

import { usePortfolios } from "@/hooks/usePortfolios";
import { MetricCardSkeleton } from "@/components/ui/Skeleton";
import { Shield } from "lucide-react";

export function OverallRiskCard() {
  const { portfolios, getPortfolioStats, isLoading } = usePortfolios();

  const portfolioStats = getPortfolioStats();

  if (isLoading) {
    return <MetricCardSkeleton />;
  }

  const avgRiskScore = portfolioStats?.avgRiskScore || 0;

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return "text-green-600 bg-green-100 dark:bg-green-900";
    if (riskScore <= 6)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
    if (riskScore <= 8)
      return "text-orange-600 bg-orange-100 dark:bg-orange-900";
    return "text-red-600 bg-red-100 dark:bg-red-900";
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore <= 3) return "Low";
    if (riskScore <= 6) return "Medium";
    if (riskScore <= 8) return "High";
    return "Critical";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
          <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Overall Risk
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {avgRiskScore.toFixed(1)}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${(avgRiskScore / 10) * 100}%`,
            }}
          ></div>
        </div>
        <div className="mt-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskColor(
              avgRiskScore
            )}`}
          >
            {getRiskLabel(avgRiskScore)}
          </span>
        </div>
      </div>
    </div>
  );
}
