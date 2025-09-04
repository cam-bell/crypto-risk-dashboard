import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export function useRiskAnalysis(portfolioId: string) {
  const queryClient = useQueryClient();

  // Calculate portfolio risk - 30s stale time for dynamic calculations
  const {
    data: riskMetrics,
    isLoading: riskLoading,
    error: riskError,
    refetch: refetchRisk,
  } = useQuery({
    queryKey: ["risk-analysis", portfolioId],
    queryFn: () => apiClient.calculatePortfolioRisk(portfolioId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Get correlation matrix - 5 minutes stale time
  const {
    data: correlationMatrix,
    isLoading: correlationLoading,
    error: correlationError,
  } = useQuery({
    queryKey: ["risk-correlation", portfolioId],
    queryFn: () => apiClient.getPortfolioCorrelation(portfolioId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Get portfolio composition - 60s stale time
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

  // Get historical risk metrics - 5 minutes stale time
  const {
    data: historicalMetrics,
    isLoading: historicalLoading,
    error: historicalError,
  } = useQuery({
    queryKey: ["risk-historical", portfolioId],
    queryFn: () => apiClient.getPortfolioHistoricalRisk(portfolioId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Calculate risk mutation
  const calculateRiskMutation = useMutation({
    mutationFn: ({ portfolioId, options }: { portfolioId: string; options?: any }) =>
      apiClient.calculatePortfolioRisk(portfolioId, options),
    onMutate: async ({ portfolioId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["risk-analysis", portfolioId],
      });

      // Snapshot previous values
      const previousRisk = queryClient.getQueryData([
        "risk-analysis",
        portfolioId,
      ]);

      return { previousRisk };
    },
    onError: (err, { portfolioId }, context) => {
      // Rollback on error
      if (context?.previousRisk) {
        queryClient.setQueryData(
          ["risk-analysis", portfolioId],
          context.previousRisk
        );
      }
      toast.error("Failed to calculate risk metrics");
    },
    onSettled: (data, error, { portfolioId }) => {
      // Invalidate and refetch risk data
      queryClient.invalidateQueries({
        queryKey: ["risk-analysis", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-correlation", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-composition", portfolioId],
      });
      queryClient.invalidateQueries({
        queryKey: ["risk-historical", portfolioId],
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
      var99: metrics.var_99 || 0,
      beta: metrics.beta_btc || 0,
      herfindahlIndex: metrics.herfindahl_index || 0,
    };
  };

  return {
    // Data
    riskMetrics,
    correlationMatrix,
    composition,
    historicalMetrics,

    // Loading states
    riskLoading,
    correlationLoading,
    compositionLoading,
    historicalLoading,
    isLoading: riskLoading || correlationLoading || compositionLoading || historicalLoading,

    // Errors
    riskError,
    correlationError,
    compositionError,
    historicalError,
    error: riskError || correlationError || compositionError || historicalError,

    // Mutations
    calculateRisk: calculateRiskMutation.mutate,

    // Mutation states
    isCalculating: calculateRiskMutation.isPending,

    // Utilities
    refetchRisk,
    getRiskLevel,
    getRiskSummary: () => getRiskSummary(riskMetrics),
  };
}
