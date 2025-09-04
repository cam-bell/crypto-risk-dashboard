import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAIInsights, generateAIInsight } from "@/lib/api";
import { AIInsight } from "@/types";
import { toast } from "react-hot-toast";

// Query keys
export const aiInsightsKeys = {
  all: ["ai-insights"] as const,
  lists: () => [...aiInsightsKeys.all, "list"] as const,
  list: (portfolioId: string) =>
    [...aiInsightsKeys.lists(), portfolioId] as const,
  details: () => [...aiInsightsKeys.all, "detail"] as const,
  detail: (id: string) => [...aiInsightsKeys.details(), id] as const,
};

// Get AI insights for a portfolio
export function useAIInsights(portfolioId: string) {
  return useQuery({
    queryKey: aiInsightsKeys.list(portfolioId),
    queryFn: () => getAIInsights(portfolioId),
    enabled: !!portfolioId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Get latest AI insight
export function useLatestAIInsight(portfolioId: string) {
  return useQuery({
    queryKey: [...aiInsightsKeys.list(portfolioId), "latest"],
    queryFn: async () => {
      const insights = await getAIInsights(portfolioId);
      return insights.length > 0 ? insights[0] : null;
    },
    enabled: !!portfolioId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Generate new AI insight
export function useGenerateAIInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAIInsight,
    onSuccess: (newInsight, portfolioId) => {
      queryClient.invalidateQueries({
        queryKey: aiInsightsKeys.list(portfolioId),
      });
      toast.success("AI insight generated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to generate AI insight");
    },
  });
}

// Get AI insights with auto-refresh
export function useLiveAIInsights(
  portfolioId: string,
  refreshInterval = 300000
) {
  // 5 minutes
  return useQuery({
    queryKey: aiInsightsKeys.list(portfolioId),
    queryFn: () => getAIInsights(portfolioId),
    enabled: !!portfolioId,
    staleTime: 0, // Always consider stale
    refetchInterval: refreshInterval,
    refetchIntervalInBackground: true,
  });
}
