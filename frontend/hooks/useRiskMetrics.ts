import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export function useRiskMetrics(portfolioId: string) {
  const queryClient = useQueryClient();

  // Risk metrics - 60s stale time for static risk data
  const {
    data: riskMetrics,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["risk-metrics", portfolioId],
    queryFn: () => apiClient.getRiskMetrics(portfolioId),
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Historical risk metrics - 5 minutes stale time for historical data
  const {
    data: historicalMetrics,
    isLoading: historicalLoading,
    error: historicalError,
  } = useQuery({
    queryKey: ["risk-metrics-historical", portfolioId],
    queryFn: () => apiClient.getRiskMetricsHistory(portfolioId, "30d"),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Correlation matrix - 5 minutes stale time
  const {
    data: correlationMatrix,
    isLoading: correlationLoading,
    error: correlationError,
  } = useQuery({
    queryKey: ["risk-correlation", portfolioId],
    queryFn: () => apiClient.getCorrelationMatrix(portfolioId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Portfolio composition analysis - 60s stale time
  const {
    data: composition,
    isLoading: compositionLoading,
    error: compositionError,
  } = useQuery({
    queryKey: ["risk-composition", portfolioId],
    queryFn: () => apiClient.getPortfolioComposition(portfolioId),
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Calculate risk metrics mutation
  const calculateRiskMutation = useMutation({
    mutationFn: ({
      portfolioId,
      options,
    }: {
      portfolioId: string;
      options?: any;
    }) => apiClient.calculateRiskMetrics(portfolioId, options),
    onMutate: async ({ portfolioId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["risk-metrics", portfolioId],
      });
      await queryClient.cancelQueries({
        queryKey: ["risk-metrics-historical", portfolioId],
      });

      // Snapshot previous values
      const previousMetrics = queryClient.getQueryData([
        "risk-metrics",
        portfolioId,
      ]);
      const previousHistorical = queryClient.getQueryData([
        "risk-metrics-historical",
        portfolioId,
      ]);

      return { previousMetrics, previousHistorical };
    },
    onError: (err, { portfolioId }, context) => {
      // Rollback on error
      if (context?.previousMetrics) {
        queryClient.setQueryData(
          ["risk-metrics", portfolioId],
          context.previousMetrics
        );
      }
      if (context?.previousHistorical) {
        queryClient.setQueryData(
          ["risk-metrics-historical", portfolioId],
          context.previousHistorical
        );
      }
    },
    onSettled: (data, error, { portfolioId }) => {
      // Invalidate and refetch risk data
      queryClient.invalidateQueries({
        queryKey: ["risk-metrics", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-metrics-historical", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-correlation", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-composition", portfolioId],
      });
    },
  });

  // Get risk level classification
  const getRiskLevel = (riskScore: number) => {
    if (riskScore <= 3) return "low";
    if (riskScore <= 6) return "medium";
    if (riskScore <= 8) return "high";
    return "critical";
  };

  // Get risk summary for display
  const getRiskSummary = (metrics: any) => {
    if (!metrics) return null;

    return {
      riskScore: metrics.risk_score || 0,
      riskLevel: getRiskLevel(metrics.risk_score || 0),
      volatility: metrics.volatility_30d || 0,
      sharpeRatio: metrics.sharpe_ratio || 0,
      maxDrawdown: metrics.max_drawdown || 0,
      var95: metrics.var_95 || 0,
      alertCount: metrics.alert_count || 0,
      criticalAlerts: metrics.critical_alerts || 0,
    };
  };

  return {
    // Data
    riskMetrics,
    historicalMetrics,
    correlationMatrix,
    composition,

    // Loading states
    isLoading,
    historicalLoading,
    correlationLoading,
    compositionLoading,

    // Errors
    error,
    historicalError,
    correlationError,
    compositionError,

    // Mutations
    calculateRisk: calculateRiskMutation.mutate,

    // Mutation states
    isCalculating: calculateRiskMutation.isPending,

    // Utilities
    refetch,
    getRiskLevel,
    getRiskSummary: () => getRiskSummary(riskMetrics),
  };
}
