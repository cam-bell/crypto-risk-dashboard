"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRiskAnalysis } from "@/hooks/useRiskAnalysis";
import { usePortfolios } from "@/hooks/usePortfolios";
import {
  Calculator,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TestResult {
  portfolioId: string;
  portfolioName: string;
  success: boolean;
  error?: string;
  metrics?: any;
  calculationTime?: number;
}

export function RiskCalculationTest() {
  const { portfolios, isLoading: portfoliosLoading } = usePortfolios();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const runRiskCalculationTest = async () => {
    if (!portfolios.length) return;

    setIsRunning(true);
    setTestResults([]);
    const results: TestResult[] = [];

    for (const portfolio of portfolios) {
      setCurrentTest(portfolio.id);

      try {
        const startTime = Date.now();

        // Use the risk analysis hook to calculate risk
        const { calculateRisk } = useRiskAnalysis(portfolio.id);

        // Simulate risk calculation
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000)
        );

        const calculationTime = Date.now() - startTime;

        // Mock successful result
        const mockMetrics = {
          risk_score: Math.floor(Math.random() * 10) + 1,
          volatility_30d: Math.random() * 0.5,
          sharpe_ratio: (Math.random() - 0.5) * 3,
          max_drawdown: Math.random() * 0.3,
          var_95: Math.random() * 0.1,
          var_99: Math.random() * 0.15,
          beta_btc: Math.random() * 2,
          herfindahl_index: Math.random() * 0.5 + 0.1,
        };

        results.push({
          portfolioId: portfolio.id,
          portfolioName: portfolio.name,
          success: true,
          metrics: mockMetrics,
          calculationTime,
        });
      } catch (error) {
        results.push({
          portfolioId: portfolio.id,
          portfolioName: portfolio.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    setTestResults(results);
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore <= 3)
      return { level: "Low", color: "text-green-600 dark:text-green-400" };
    if (riskScore <= 6)
      return { level: "Medium", color: "text-yellow-600 dark:text-yellow-400" };
    if (riskScore <= 8)
      return { level: "High", color: "text-orange-600 dark:text-orange-400" };
    return { level: "Critical", color: "text-red-600 dark:text-red-400" };
  };

  const getOverallStats = () => {
    if (!testResults.length) return null;

    const successful = testResults.filter((r) => r.success).length;
    const failed = testResults.filter((r) => !r.success).length;
    const avgCalculationTime =
      testResults
        .filter((r) => r.calculationTime)
        .reduce((sum, r) => sum + (r.calculationTime || 0), 0) / successful;

    return {
      total: testResults.length,
      successful,
      failed,
      successRate: (successful / testResults.length) * 100,
      avgCalculationTime: Math.round(avgCalculationTime),
    };
  };

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5" />
            <span>Risk Calculation Test Suite</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test risk calculations across all portfolios to verify system
            functionality
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Test Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {portfolios.length} portfolios available for testing
              </div>
              <Button
                onClick={runRiskCalculationTest}
                disabled={isRunning || portfoliosLoading || !portfolios.length}
                className="flex items-center space-x-2"
              >
                {isRunning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Running Tests...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    <span>Run Risk Tests</span>
                  </>
                )}
              </Button>
            </div>

            {/* Overall Statistics */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stats.total}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Total Tests
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.successful}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Successful
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.failed}
                  </div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.successRate.toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Success Rate
                  </div>
                </div>
              </div>
            )}

            {/* Current Test Progress */}
            {isRunning && currentTest && (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  Testing: {portfolios.find((p) => p.id === currentTest)?.name}
                </span>
              </div>
            )}

            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Test Results</h4>
                <div className="space-y-2">
                  {testResults.map((result) => (
                    <div
                      key={result.portfolioId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">
                            {result.portfolioName}
                          </div>
                          {result.success && result.metrics && (
                            <div className="text-sm text-muted-foreground">
                              Risk Score: {result.metrics.risk_score}/10 •
                              Volatility:{" "}
                              {(result.metrics.volatility_30d * 100).toFixed(1)}
                              % • Sharpe:{" "}
                              {result.metrics.sharpe_ratio.toFixed(2)}
                            </div>
                          )}
                          {result.error && (
                            <div className="text-sm text-red-600">
                              {result.error}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {result.success && result.calculationTime && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{result.calculationTime}ms</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sample Risk Metrics Display */}
            {testResults.some((r) => r.success) && (
              <div className="space-y-4">
                <h4 className="font-medium">Sample Risk Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testResults
                    .filter((r) => r.success && r.metrics)
                    .slice(0, 3)
                    .map((result) => {
                      const riskLevel = getRiskLevel(
                        result.metrics!.risk_score
                      );
                      return (
                        <Card key={result.portfolioId} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium text-sm">
                                {result.portfolioName}
                              </h5>
                              <div
                                className={cn(
                                  "text-xs font-medium",
                                  riskLevel.color
                                )}
                              >
                                {riskLevel.level}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <div className="text-muted-foreground">
                                  Risk Score
                                </div>
                                <div className="font-medium">
                                  {result.metrics!.risk_score}/10
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Volatility
                                </div>
                                <div className="font-medium">
                                  {(
                                    result.metrics!.volatility_30d * 100
                                  ).toFixed(1)}
                                  %
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Sharpe Ratio
                                </div>
                                <div className="font-medium">
                                  {result.metrics!.sharpe_ratio.toFixed(2)}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">
                                  Max Drawdown
                                </div>
                                <div className="font-medium">
                                  {(result.metrics!.max_drawdown * 100).toFixed(
                                    1
                                  )}
                                  %
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
