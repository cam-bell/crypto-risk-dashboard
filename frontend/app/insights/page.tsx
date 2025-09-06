"use client";

import { useState } from "react";
import { useAIInsightsHub } from "@/hooks/useAIInsightsHub";
import { usePortfolios } from "@/hooks/usePortfolios";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Brain,
  TrendingUp,
  RefreshCw,
  Trash2,
  Calendar,
  BarChart3,
  Target,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");

  const { portfolios } = usePortfolios();
  const {
    weeklyAnalysis,
    marketSentiment,
    rebalancingSuggestions,
    isLoading,
    weeklyLoading,
    sentimentLoading,
    rebalancingLoading,
    generateWeeklyAnalysis,
    generateMarketSentiment,
    generateRebalancingSuggestions,
    deleteInsight,
    isGeneratingWeekly,
    isGeneratingSentiment,
    isGeneratingRebalancing,
    isDeleting,
  } = useAIInsightsHub();

  const handleGenerateWeekly = () => {
    generateWeeklyAnalysis(selectedPortfolioId || undefined);
  };

  const handleGenerateSentiment = () => {
    generateMarketSentiment(selectedPortfolioId || undefined);
  };

  const handleGenerateRebalancing = () => {
    generateRebalancingSuggestions(selectedPortfolioId || undefined);
  };

  const handleDeleteInsight = (insightId: string) => {
    deleteInsight(insightId);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Insights Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered analysis and recommendations for your crypto portfolio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Powered by AI
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleGenerateWeekly}
          disabled={isGeneratingWeekly}
          className="flex items-center space-x-2"
        >
          <Calendar className="h-4 w-4" />
          <span>
            {isGeneratingWeekly ? "Generating..." : "Weekly Analysis"}
          </span>
        </Button>

        <Button
          onClick={handleGenerateSentiment}
          disabled={isGeneratingSentiment}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>
            {isGeneratingSentiment ? "Analyzing..." : "Market Sentiment"}
          </span>
        </Button>

        <div className="flex items-center space-x-2">
          <select
            value={selectedPortfolioId}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">Select Portfolio</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </select>
          <Button
            onClick={handleGenerateRebalancing}
            disabled={isGeneratingRebalancing || !selectedPortfolioId}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Target className="h-4 w-4" />
            <span>
              {isGeneratingRebalancing ? "Generating..." : "Rebalancing"}
            </span>
          </Button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Analysis */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Weekly Analysis
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleGenerateWeekly}
                disabled={isGeneratingWeekly}
                size="sm"
                variant="ghost"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isGeneratingWeekly && "animate-spin"
                  )}
                />
              </Button>
              {weeklyAnalysis?.id && (
                <Button
                  onClick={() => handleDeleteInsight(weeklyAnalysis.id)}
                  disabled={isDeleting}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {weeklyLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : weeklyAnalysis ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {weeklyAnalysis.summary ||
                  "Weekly market analysis and portfolio insights."}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Generated:{" "}
                {new Date(weeklyAnalysis.generated_at).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No weekly analysis available. Click "Weekly Analysis" to generate.
            </p>
          )}
        </Card>

        {/* Market Sentiment */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Market Sentiment
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleGenerateSentiment}
                disabled={isGeneratingSentiment}
                size="sm"
                variant="ghost"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isGeneratingSentiment && "animate-spin"
                  )}
                />
              </Button>
              {marketSentiment?.id && (
                <Button
                  onClick={() => handleDeleteInsight(marketSentiment.id)}
                  disabled={isDeleting}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {sentimentLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : marketSentiment ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {marketSentiment.summary ||
                  "Current market sentiment analysis and trends."}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Generated:{" "}
                {new Date(marketSentiment.generated_at).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No market sentiment available. Click "Market Sentiment" to
              generate.
            </p>
          )}
        </Card>

        {/* Rebalancing Suggestions */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rebalancing Suggestions
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleGenerateRebalancing}
                disabled={isGeneratingRebalancing || !selectedPortfolioId}
                size="sm"
                variant="ghost"
              >
                <RefreshCw
                  className={cn(
                    "h-4 w-4",
                    isGeneratingRebalancing && "animate-spin"
                  )}
                />
              </Button>
              {rebalancingSuggestions?.id && (
                <Button
                  onClick={() => handleDeleteInsight(rebalancingSuggestions.id)}
                  disabled={isDeleting}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {rebalancingLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : rebalancingSuggestions ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rebalancingSuggestions.summary ||
                  "AI-powered rebalancing recommendations for optimal portfolio allocation."}
              </p>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Generated:{" "}
                {new Date(
                  rebalancingSuggestions.generated_at
                ).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No rebalancing suggestions available.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Select a portfolio and click "Rebalancing" to generate
                AI-powered suggestions.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Portfolio Insights Section */}
      {portfolios.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Portfolio-Specific Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                onClick={() => setSelectedPortfolioId(portfolio.id)}
              >
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {portfolio.name}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {portfolio.holdings?.length || 0} holdings
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Risk Score: {portfolio.risk_score || 0}/10
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* AI Status */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              AI Insights Engine
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Our AI analyzes market data, portfolio performance, and risk
              metrics to provide personalized insights and recommendations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
