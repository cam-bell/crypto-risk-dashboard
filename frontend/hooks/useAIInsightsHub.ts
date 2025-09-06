import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export function useAIInsightsHub() {
  const queryClient = useQueryClient();

  // Weekly analysis - 2 minutes stale time
  const {
    data: weeklyAnalysis,
    isLoading: weeklyLoading,
    error: weeklyError,
    refetch: refetchWeekly,
  } = useQuery({
    queryKey: ["ai-insights", "weekly-analysis"],
    queryFn: () => apiClient.getWeeklyAnalysis(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    placeholderData: (previousData) => previousData,
  });

  // Market sentiment - 1 minute stale time
  const {
    data: marketSentiment,
    isLoading: sentimentLoading,
    error: sentimentError,
    refetch: refetchSentiment,
  } = useQuery({
    queryKey: ["ai-insights", "market-sentiment"],
    queryFn: () => apiClient.getMarketSentiment(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: (previousData) => previousData,
  });

  // Rebalancing suggestions - 5 minutes stale time
  const {
    data: rebalancingSuggestions,
    isLoading: rebalancingLoading,
    error: rebalancingError,
    refetch: refetchRebalancing,
  } = useQuery({
    queryKey: ["ai-insights", "rebalancing-suggestions"],
    queryFn: () => apiClient.getRebalancingSuggestions(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    placeholderData: (previousData) => previousData,
  });

  // Generate weekly analysis mutation
  const generateWeeklyAnalysisMutation = useMutation({
    mutationFn: (portfolioId?: string) =>
      apiClient.getWeeklyAnalysis(portfolioId),
    onSuccess: () => {
      toast.success("Weekly analysis generated successfully");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["ai-insights", "weekly-analysis"],
      });

      const previousWeekly = queryClient.getQueryData([
        "ai-insights",
        "weekly-analysis",
      ]);

      return { previousWeekly };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousWeekly) {
        queryClient.setQueryData(
          ["ai-insights", "weekly-analysis"],
          context.previousWeekly
        );
      }
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate weekly analysis";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-insights", "weekly-analysis"],
      });
    },
  });

  // Generate market sentiment mutation
  const generateMarketSentimentMutation = useMutation({
    mutationFn: (portfolioId?: string) =>
      apiClient.getMarketSentiment(portfolioId),
    onSuccess: () => {
      toast.success("Market sentiment analysis generated successfully");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["ai-insights", "market-sentiment"],
      });

      const previousSentiment = queryClient.getQueryData([
        "ai-insights",
        "market-sentiment",
      ]);

      return { previousSentiment };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousSentiment) {
        queryClient.setQueryData(
          ["ai-insights", "market-sentiment"],
          context.previousSentiment
        );
      }
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate market sentiment";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-insights", "market-sentiment"],
      });
    },
  });

  // Generate rebalancing suggestions mutation
  const generateRebalancingSuggestionsMutation = useMutation({
    mutationFn: (portfolioId?: string) =>
      apiClient.getRebalancingSuggestions(portfolioId),
    onSuccess: () => {
      toast.success("Rebalancing suggestions generated successfully");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["ai-insights", "rebalancing-suggestions"],
      });

      const previousRebalancing = queryClient.getQueryData([
        "ai-insights",
        "rebalancing-suggestions",
      ]);

      return { previousRebalancing };
    },
    onError: (err: any, variables, context) => {
      if (context?.previousRebalancing) {
        queryClient.setQueryData(
          ["ai-insights", "rebalancing-suggestions"],
          context.previousRebalancing
        );
      }
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to generate rebalancing suggestions";
      toast.error(errorMessage);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-insights", "rebalancing-suggestions"],
      });
    },
  });

  // Delete insight mutation
  const deleteInsightMutation = useMutation({
    mutationFn: (insightId: string) => apiClient.deleteAIInsight(insightId),
    onSuccess: () => {
      toast.success("Insight deleted successfully");
      // Invalidate all AI insights queries
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete insight");
    },
  });

  return {
    // Data
    weeklyAnalysis,
    marketSentiment,
    rebalancingSuggestions,

    // Loading states
    weeklyLoading,
    sentimentLoading,
    rebalancingLoading,
    isLoading: weeklyLoading || sentimentLoading || rebalancingLoading,

    // Errors
    weeklyError,
    sentimentError,
    rebalancingError,
    error: weeklyError || sentimentError || rebalancingError,

    // Mutations
    generateWeeklyAnalysis: generateWeeklyAnalysisMutation.mutate,
    generateMarketSentiment: generateMarketSentimentMutation.mutate,
    generateRebalancingSuggestions:
      generateRebalancingSuggestionsMutation.mutate,
    deleteInsight: deleteInsightMutation.mutate,

    // Mutation states
    isGeneratingWeekly: generateWeeklyAnalysisMutation.isPending,
    isGeneratingSentiment: generateMarketSentimentMutation.isPending,
    isGeneratingRebalancing: generateRebalancingSuggestionsMutation.isPending,
    isDeleting: deleteInsightMutation.isPending,

    // Utilities
    refetchWeekly,
    refetchSentiment,
    refetchRebalancing,
  };
}
