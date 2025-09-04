"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePortfolios } from "@/hooks/usePortfolios";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { 
  Shield, 
  ArrowRight, 
  TrendingUp,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  if (portfolios.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No Portfolios Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            You need to create a portfolio before you can perform risk analysis.
          </p>
          <Button onClick={() => router.push("/portfolios")}>
            Create Your First Portfolio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Risk Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select a portfolio to perform comprehensive risk analysis including volatility, 
          correlation, and value-at-risk calculations.
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
                <div className={cn(
                  "w-4 h-4 rounded-full border-2",
                  selectedPortfolioId === portfolio.id
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300 dark:border-gray-600"
                )} />
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {portfolio.name}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {portfolio.description || "No description available"}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Holdings:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {portfolio.holdings?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Value:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${portfolio.total_value?.toLocaleString() || "0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Risk Score:</span>
                  <span className={cn(
                    "font-medium",
                    portfolio.risk_score <= 3 && "text-green-600 dark:text-green-400",
                    portfolio.risk_score > 3 && portfolio.risk_score <= 6 && "text-yellow-600 dark:text-yellow-400",
                    portfolio.risk_score > 6 && portfolio.risk_score <= 8 && "text-orange-600 dark:text-orange-400",
                    portfolio.risk_score > 8 && "text-red-600 dark:text-red-400"
                  )}>
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
              30, 90, and 365-day volatility calculations with risk-adjusted returns
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
