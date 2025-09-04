import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRiskMetrics, calculateRiskMetrics } from "@/lib/api";
import { RiskMetrics } from "@/types";
import { toast } from "react-hot-toast";

// Query keys
export const riskMetricsKeys = {
  all: ["risk-metrics"] as const,
  details: () => [...riskMetricsKeys.all, "detail"] as const,
  detail: (portfolioId: string) =>
    [...riskMetricsKeys.details(), portfolioId] as const,
};

// Get risk metrics for a portfolio
export function useRiskMetrics(portfolioId: string) {
  return useQuery({
    queryKey: riskMetricsKeys.detail(portfolioId),
    queryFn: () => getRiskMetrics(portfolioId),
    enabled: !!portfolioId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Calculate risk metrics for a portfolio
export function useCalculateRiskMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calculateRiskMetrics,
    onSuccess: (newMetrics, portfolioId) => {
      queryClient.invalidateQueries({
        queryKey: riskMetricsKeys.detail(portfolioId),
      });
      toast.success("Risk metrics calculated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to calculate risk metrics");
    },
  });
}

// Get risk metrics with auto-refresh
export function useLiveRiskMetrics(
  portfolioId: string,
  refreshInterval = 30000
) {
  return useQuery({
    queryKey: riskMetricsKeys.detail(portfolioId),
    queryFn: () => getRiskMetrics(portfolioId),
    enabled: !!portfolioId,
    staleTime: 0, // Always consider stale
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });
}
