import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { RiskMetrics } from "@/types";
import { useRealTimeData } from "./useRealTimeData";
import { toast } from "react-hot-toast";

export function useRiskMetrics() {
  const queryClient = useQueryClient();

  // Real-time data subscription for risk metrics updates
  const realTimeData = useRealTimeData({
    enableRiskMetricsUpdates: true,
    showNotifications: false,
  });

  // Get risk metrics for a portfolio
  const useRiskMetrics = (portfolioId: string) => {
    return useQuery({
      queryKey: ["risk-metrics", portfolioId],
      queryFn: () => apiClient.getRiskMetrics(portfolioId),
      staleTime: 30 * 1000, // 30 seconds for risk metrics
      enabled: !!portfolioId,
      refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes as fallback
    });
  };

  // Get risk metrics with live data
  const useRiskMetricsLive = (portfolioId: string) => {
    return useQuery({
      queryKey: ["risk-metrics-live", portfolioId],
      queryFn: () => apiClient.getPortfolioLiveData(portfolioId),
      staleTime: 15 * 1000, // 15 seconds for live data
      enabled: !!portfolioId,
      refetchInterval: 60 * 1000, // Refetch every minute
    });
  };

  // Get risk metrics history
  const useRiskMetricsHistory = (
    portfolioId: string,
    timeframe: string = "24h"
  ) => {
    return useQuery({
      queryKey: ["risk-metrics-history", portfolioId, timeframe],
      queryFn: () => apiClient.getRiskMetricsHistory(portfolioId, timeframe),
      staleTime: 5 * 60 * 1000, // 5 minutes for historical data
      enabled: !!portfolioId,
    });
  };

  // Calculate risk metrics mutation
  const calculateRiskMetricsMutation = useMutation({
    mutationFn: (portfolioId: string) =>
      apiClient.calculateRiskMetrics(portfolioId),
    onMutate: async (portfolioId) => {
      await queryClient.cancelQueries({
        queryKey: ["risk-metrics", portfolioId],
      });

      const previousMetrics = queryClient.getQueryData([
        "risk-metrics",
        portfolioId,
      ]);

      // Show loading state
      queryClient.setQueryData(
        ["risk-metrics", portfolioId],
        (old: RiskMetrics | undefined) => {
          if (!old) return old;
          return { ...old, calculated_at: "Calculating..." };
        }
      );

      return { previousMetrics };
    },
    onSuccess: (newMetrics, portfolioId) => {
      // Update cache with new metrics
      queryClient.setQueryData(["risk-metrics", portfolioId], newMetrics);
      toast.success("Risk metrics updated successfully");
    },
    onError: (error, portfolioId, context) => {
      // Rollback on error
      if (context?.previousMetrics) {
        queryClient.setQueryData(
          ["risk-metrics", portfolioId],
          context.previousMetrics
        );
      }
      toast.error("Failed to calculate risk metrics");
    },
    onSettled: (data, error, portfolioId) => {
      queryClient.invalidateQueries({
        queryKey: ["risk-metrics", portfolioId],
      });
    },
  });

  // Subscribe to real-time updates for specific portfolio
  const subscribeToRiskMetrics = (portfolioId: string) => {
    realTimeData.subscribe(portfolioId);
  };

  // Unsubscribe from real-time updates
  const unsubscribeFromRiskMetrics = (portfolioId: string) => {
    realTimeData.unsubscribe(portfolioId);
  };

  // Calculate portfolio risk score
  const calculateRiskScore = (metrics: RiskMetrics): number => {
    // Simple risk score calculation based on VaR and volatility
    const varScore = (metrics.var_95 / 100) * 40; // VaR contribution (40%)
    const volatilityScore = (metrics.volatility / 100) * 30; // Volatility contribution (30%)
    const drawdownScore = (Math.abs(metrics.max_drawdown) / 100) * 20; // Drawdown contribution (20%)
    const correlationScore = (1 - metrics.beta) * 10; // Beta contribution (10%)

    return Math.min(
      100,
      Math.max(0, varScore + volatilityScore + drawdownScore + correlationScore)
    );
  };

  // Get risk level classification
  const getRiskLevel = (
    riskScore: number
  ): "low" | "medium" | "high" | "critical" => {
    if (riskScore < 25) return "low";
    if (riskScore < 50) return "medium";
    if (riskScore < 75) return "high";
    return "critical";
  };

  // Get risk trend (improving, stable, deteriorating)
  const getRiskTrend = (
    currentMetrics: RiskMetrics,
    previousMetrics: RiskMetrics
  ): "improving" | "stable" | "deteriorating" => {
    if (!previousMetrics) return "stable";

    const currentScore = calculateRiskScore(currentMetrics);
    const previousScore = calculateRiskScore(previousMetrics);
    const change = currentScore - previousScore;

    if (change < -5) return "improving";
    if (change > 5) return "deteriorating";
    return "stable";
  };

  // Get risk breakdown by asset
  const getRiskBreakdown = (metrics: RiskMetrics) => {
    if (!metrics.risk_decomposition) return [];

    return metrics.risk_decomposition
      .sort((a, b) => b.contribution - a.contribution)
      .map((item) => ({
        ...item,
        riskLevel: getRiskLevel(item.contribution),
      }));
  };

  // Get correlation matrix insights
  const getCorrelationInsights = (metrics: RiskMetrics) => {
    if (!metrics.correlation_matrix) return [];

    const insights = [];
    const highCorrelation = 0.7;
    const lowCorrelation = 0.3;

    for (let i = 0; i < metrics.correlation_matrix.length; i++) {
      for (let j = i + 1; j < metrics.correlation_matrix[i].length; j++) {
        const correlation = metrics.correlation_matrix[i][j];

        if (Math.abs(correlation) > highCorrelation) {
          insights.push({
            type: "high_correlation",
            message: `High correlation (${correlation.toFixed(2)}) detected`,
            severity: "warning",
          });
        } else if (Math.abs(correlation) < lowCorrelation) {
          insights.push({
            type: "low_correlation",
            message: `Low correlation (${correlation.toFixed(2)}) detected`,
            severity: "info",
          });
        }
      }
    }

    return insights;
  };

  // Get risk alerts
  const getRiskAlerts = (
    metrics: RiskMetrics
  ): Array<{
    type: string;
    message: string;
    severity: "low" | "medium" | "high" | "critical";
    value: number;
    threshold: number;
  }> => {
    const alerts = [];

    // VaR alerts
    if (metrics.var_95 > 20) {
      alerts.push({
        type: "var_95",
        message: `VaR 95% exceeds 20% threshold`,
        severity: "high",
        value: metrics.var_95,
        threshold: 20,
      });
    }

    if (metrics.var_99 > 30) {
      alerts.push({
        type: "var_99",
        message: `VaR 99% exceeds 30% threshold`,
        severity: "critical",
        value: metrics.var_99,
        threshold: 30,
      });
    }

    // Volatility alerts
    if (metrics.volatility > 50) {
      alerts.push({
        type: "volatility",
        message: `Volatility exceeds 50% threshold`,
        severity: "high",
        value: metrics.volatility,
        threshold: 50,
      });
    }

    // Drawdown alerts
    if (Math.abs(metrics.max_drawdown) > 25) {
      alerts.push({
        type: "max_drawdown",
        message: `Maximum drawdown exceeds 25% threshold`,
        severity: "high",
        value: Math.abs(metrics.max_drawdown),
        threshold: 25,
      });
    }

    // Sharpe ratio alerts
    if (metrics.sharpe_ratio < 0.5) {
      alerts.push({
        type: "sharpe_ratio",
        message: `Sharpe ratio below 0.5 threshold`,
        severity: "medium",
        value: metrics.sharpe_ratio,
        threshold: 0.5,
      });
    }

    return alerts;
  };

  // Get risk summary
  const getRiskSummary = (metrics: RiskMetrics) => {
    const riskScore = calculateRiskScore(metrics);
    const riskLevel = getRiskLevel(riskScore);
    const alerts = getRiskAlerts(metrics);

    return {
      riskScore,
      riskLevel,
      alertCount: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
      highAlerts: alerts.filter((a) => a.severity === "high").length,
      mediumAlerts: alerts.filter((a) => a.severity === "medium").length,
      lowAlerts: alerts.filter((a) => a.severity === "low").length,
      alerts,
    };
  };

  return {
    // Queries
    useRiskMetrics,
    useRiskMetricsLive,
    useRiskMetricsHistory,

    // Mutations
    calculateRiskMetrics: calculateRiskMetricsMutation.mutate,
    isCalculating: calculateRiskMetricsMutation.isPending,

    // Real-time
    realTimeData,
    subscribeToRiskMetrics,
    unsubscribeFromRiskMetrics,

    // Utilities
    calculateRiskScore,
    getRiskLevel,
    getRiskTrend,
    getRiskBreakdown,
    getCorrelationInsights,
    getRiskAlerts,
    getRiskSummary,
  };
}
