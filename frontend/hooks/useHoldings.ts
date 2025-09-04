import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export function useHoldings(portfolioId: string) {
  const queryClient = useQueryClient();

  // Get portfolio holdings - 60s stale time
  const {
    data: holdings = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-holdings", portfolioId],
    queryFn: () => apiClient.getPortfolioHoldings(portfolioId),
    staleTime: 60 * 1000, // 60 seconds
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!portfolioId,
    placeholderData: (previousData) => previousData,
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
      toast.error("Failed to add holding");
    },
    onSettled: (data, error, { portfolioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });
    },
  });

  // Update holding mutation with optimistic updates
  const updateHoldingMutation = useMutation({
    mutationFn: ({
      portfolioId,
      holdingId,
      holding,
    }: {
      portfolioId: string;
      holdingId: string;
      holding: any;
    }) => apiClient.updatePortfolioHolding(portfolioId, holdingId, holding),
    onMutate: async ({ portfolioId, holdingId, holding }) => {
      await queryClient.cancelQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });

      const previousHoldings = queryClient.getQueryData([
        "portfolio-holdings",
        portfolioId,
      ]);

      // Optimistically update holding
      queryClient.setQueryData(
        ["portfolio-holdings", portfolioId],
        (old: any[] = []) =>
          old.map((h) => (h.id === holdingId ? { ...h, ...holding } : h))
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
      toast.error("Failed to update holding");
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
      toast.error("Failed to remove holding");
    },
    onSettled: (data, error, { portfolioId }) => {
      queryClient.invalidateQueries({
        queryKey: ["portfolio-holdings", portfolioId],
      });
    },
  });

  return {
    // Data
    holdings,
    isLoading,
    error,

    // Mutations
    addHolding: addHoldingMutation.mutate,
    updateHolding: updateHoldingMutation.mutate,
    removeHolding: removeHoldingMutation.mutate,

    // Mutation states
    isAdding: addHoldingMutation.isPending,
    isUpdating: updateHoldingMutation.isPending,
    isRemoving: removeHoldingMutation.isPending,

    // Utilities
    refetch,
  };
}
