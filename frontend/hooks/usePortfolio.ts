import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Portfolio } from "@/types";

export function usePortfolio(portfolioId: string) {
  const queryClient = useQueryClient();

  // Portfolio data - 60s stale time, longer cache for static data
  const {
    data: portfolio,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: () => apiClient.getPortfolio(portfolioId),
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData, // Show last successful result
  });

  // Portfolio live data - 30s stale time for real-time updates
  const {
    data: liveData,
    isLoading: liveDataLoading,
    error: liveDataError,
  } = useQuery({
    queryKey: ["portfolio-live-data", portfolioId],
    queryFn: () => apiClient.getPortfolioLiveData(portfolioId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!portfolioId,
    refetchInterval: 30000, // Refetch every 30 seconds
    placeholderData: (previousData) => previousData,
  });

  // Portfolio holdings - 60s stale time
  const {
    data: holdings,
    isLoading: holdingsLoading,
    error: holdingsError,
  } = useQuery({
    queryKey: ["portfolio-holdings", portfolioId],
    queryFn: () => apiClient.getPortfolioHoldings(portfolioId),
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
  });

  // Update portfolio mutation with optimistic updates
  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
      apiClient.updatePortfolio(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] });
      await queryClient.cancelQueries({
        queryKey: ["portfolio-live-data", id],
      });

      // Snapshot previous values
      const previousPortfolio = queryClient.getQueryData(["portfolio", id]);
      const previousLiveData = queryClient.getQueryData([
        "portfolio-live-data",
        id,
      ]);

      // Optimistically update portfolio
      queryClient.setQueryData(
        ["portfolio", id],
        (old: Portfolio | undefined) => {
          if (!old) return old;
          return { ...old, ...data, updated_at: new Date().toISOString() };
        }
      );

      // Optimistically update live data if it exists
      if (previousLiveData) {
        queryClient.setQueryData(["portfolio-live-data", id], (old: any) => {
          if (!old) return old;
          return { ...old, ...data, updated_at: new Date().toISOString() };
        });
      }

      return { previousPortfolio, previousLiveData };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousPortfolio) {
        queryClient.setQueryData(["portfolio", id], context.previousPortfolio);
      }
      if (context?.previousLiveData) {
        queryClient.setQueryData(
          ["portfolio-live-data", id],
          context.previousLiveData
        );
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-live-data", id] });
    },
  });

  // Add holding mutation with optimistic updates
  const addHoldingMutation = useMutation({
    mutationFn: ({
      portfolioId,
      holding,
    }: {
      portfolioId: string;
      holding: any;
    }) => apiClient.addPortfolioHolding(portfolioId, holding),
    onMutate: async ({ portfolioId, holding }) => {
      await queryClient.cancelQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });

      const previousHoldings = queryClient.getQueryData([
        "portfolio-holdings",
        portfolioId,
      ]);

      // Optimistically add holding
      queryClient.setQueryData(
        ["portfolio-holdings", portfolioId],
        (old: any[] = []) => [...old, { ...holding, id: `temp-${Date.now()}` }]
      );

      return { previousHoldings };
    },
    onError: (err, { portfolioId }, context) => {
      if (context?.previousHoldings) {
        queryClient.setQueryData(
          ["portfolio-holdings", portfolioId],
          context.previousHoldings
        );
      }
    },
    onSettled: (data, error, { portfolioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });
    },
  });

  // Remove holding mutation with optimistic updates
  const removeHoldingMutation = useMutation({
    mutationFn: ({
      portfolioId,
      holdingId,
    }: {
      portfolioId: string;
      holdingId: string;
    }) => apiClient.removePortfolioHolding(portfolioId, holdingId),
    onMutate: async ({ portfolioId, holdingId }) => {
      await queryClient.cancelQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });

      const previousHoldings = queryClient.getQueryData([
        "portfolio-holdings",
        portfolioId,
      ]);

      // Optimistically remove holding
      queryClient.setQueryData(
        ["portfolio-holdings", portfolioId],
        (old: any[] = []) => old.filter((h) => h.id !== holdingId)
      );

      return { previousHoldings };
    },
    onError: (err, { portfolioId }, context) => {
      if (context?.previousHoldings) {
        queryClient.setQueryData(
          ["portfolio-holdings", portfolioId],
          context.previousHoldings
        );
      }
    },
    onSettled: (data, error, { portfolioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });
    },
  });

  return {
    // Data
    portfolio,
    liveData,
    holdings,

    // Loading states
    isLoading,
    liveDataLoading,
    holdingsLoading,

    // Errors
    error,
    liveDataError,
    holdingsError,

    // Mutations
    updatePortfolio: updatePortfolioMutation.mutate,
    addHolding: addHoldingMutation.mutate,
    removeHolding: removeHoldingMutation.mutate,

    // Mutation states
    isUpdating: updatePortfolioMutation.isPending,
    isAddingHolding: addHoldingMutation.isPending,
    isRemovingHolding: removeHoldingMutation.isPending,

    // Utilities
    refetch,
  };
}
