"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Target,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useAIInsights, useGenerateAIInsight } from "@/hooks/useAIInsights";
import { AIInsight } from "@/types";
import { formatPercentage } from "@/lib/utils";

interface AIInsightsProps {
  portfolioId: string;
}

export function AIInsights({ portfolioId }: AIInsightsProps) {
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(
    null
  );
  const {
    data: insights,
    isLoading,
    error,
    refetch,
  } = useAIInsights(portfolioId);
  const { mutate: generateInsight, isPending: isGenerating } =
    useGenerateAIInsight();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          Error loading AI insights
        </h3>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={() => refetch()} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const latestInsight = insights?.[0];
  const hasInsights = insights && insights.length > 0;

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "bullish":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case "bearish":
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "bullish":
        return "text-green-600 dark:text-green-400";
      case "bearish":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const handleGenerateInsight = () => {
    if (portfolioId) {
      generateInsight(portfolioId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with generate button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-primary" />
          <span className="font-medium">AI Portfolio Analysis</span>
        </div>
        <Button
          onClick={handleGenerateInsight}
          disabled={isGenerating}
          size="sm"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? "Generating..." : "Generate Insight"}
        </Button>
      </div>

      {!hasInsights ? (
        <Card>
          <CardContent className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No AI Insights Available
            </h3>
            <p className="text-muted-foreground mb-4">
              Generate your first AI-powered portfolio analysis to get started
            </p>
            <Button onClick={handleGenerateInsight} disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate First Insight"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Latest insight summary */}
          {latestInsight && (
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedInsight(latestInsight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>{latestInsight.title}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getSentimentIcon(latestInsight.market_sentiment)}
                    <span
                      className={`text-sm font-medium ${getSentimentColor(latestInsight.market_sentiment)}`}
                    >
                      {latestInsight.market_sentiment}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {latestInsight.summary}
                </p>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${getConfidenceColor(latestInsight.confidence_score)}`}
                    >
                      {formatPercentage(latestInsight.confidence_score * 100)}
                    </div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {latestInsight.recommendations?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommendations
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {latestInsight.risk_factors?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Risk Factors
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Generated{" "}
                      {new Date(
                        latestInsight.generated_at
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous insights */}
          {insights && insights.length > 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Previous Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.slice(1, 4).map((insight) => (
                    <div
                      key={insight.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setSelectedInsight(insight)}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            insight.market_sentiment === "bullish"
                              ? "bg-green-500"
                              : insight.market_sentiment === "bearish"
                                ? "bg-red-500"
                                : "bg-gray-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{insight.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              insight.generated_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-medium ${getSentimentColor(insight.market_sentiment)}`}
                        >
                          {insight.market_sentiment}
                        </span>
                        <span
                          className={`text-xs ${getConfidenceColor(insight.confidence_score)}`}
                        >
                          {formatPercentage(insight.confidence_score * 100)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Detailed insight modal */}
      {selectedInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedInsight.title}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedInsight(null)}
                >
                  ×
                </Button>
              </div>

              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Summary</h3>
                  <p className="text-muted-foreground">
                    {selectedInsight.summary}
                  </p>
                </div>

                {/* Detailed Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Detailed Analysis
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedInsight.detailed_analysis}
                  </p>
                </div>

                {/* Recommendations */}
                {selectedInsight.recommendations &&
                  selectedInsight.recommendations.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Recommendations
                      </h3>
                      <div className="space-y-2">
                        {selectedInsight.recommendations.map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm">{rec}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Risk Factors */}
                {selectedInsight.risk_factors &&
                  selectedInsight.risk_factors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">
                        Risk Factors
                      </h3>
                      <div className="space-y-2">
                        {selectedInsight.risk_factors.map((risk, index) => (
                          <div
                            key={index}
                            className="flex items-start space-x-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Metadata */}
                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Market Sentiment
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getSentimentIcon(selectedInsight.market_sentiment)}
                      <span
                        className={`font-medium ${getSentimentColor(selectedInsight.market_sentiment)}`}
                      >
                        {selectedInsight.market_sentiment}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Confidence Score
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${getConfidenceColor(selectedInsight.confidence_score)}`}
                    >
                      {formatPercentage(selectedInsight.confidence_score * 100)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Generated
                    </p>
                    <p className="text-sm mt-1">
                      {new Date(selectedInsight.generated_at).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Expires
                    </p>
                    <p className="text-sm mt-1">
                      {new Date(
                        selectedInsight.expires_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
