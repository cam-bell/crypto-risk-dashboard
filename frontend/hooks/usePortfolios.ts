import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} from "@/lib/api";
import { Portfolio } from "@/types";
import { toast } from "react-hot-toast";

// Query keys
export const portfolioKeys = {
  all: ["portfolios"] as const,
  lists: () => [...portfolioKeys.all, "list"] as const,
  list: (filters: string) => [...portfolioKeys.lists(), { filters }] as const,
  details: () => [...portfolioKeys.all, "detail"] as const,
  detail: (id: string) => [...portfolioKeys.details(), id] as const,
};

// Get all portfolios
export function usePortfolios() {
  return useQuery({
    queryKey: portfolioKeys.lists(),
    queryFn: getPortfolios,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get single portfolio
export function usePortfolio(id: string) {
  return useQuery({
    queryKey: portfolioKeys.detail(id),
    queryFn: () => getPortfolio(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Create portfolio
export function useCreatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortfolio,
    onSuccess: (newPortfolio) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      toast.success("Portfolio created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create portfolio");
    },
  });
}

// Update portfolio
export function useUpdatePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
      updatePortfolio(id, data),
    onSuccess: (updatedPortfolio) => {
      queryClient.invalidateQueries({
        queryKey: portfolioKeys.detail(updatedPortfolio.id),
      });
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      toast.success("Portfolio updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update portfolio");
    },
  });
}

// Delete portfolio
export function useDeletePortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePortfolio,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.lists() });
      queryClient.removeQueries({ queryKey: portfolioKeys.detail(deletedId) });
      toast.success("Portfolio deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete portfolio");
    },
  });
}

// Optimistic updates for portfolio
export function useOptimisticPortfolioUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
      updatePortfolio(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: portfolioKeys.detail(id) });

      // Snapshot previous value
      const previousPortfolio = queryClient.getQueryData(
        portfolioKeys.detail(id)
      );

      // Optimistically update
      queryClient.setQueryData(
        portfolioKeys.detail(id),
        (old: Portfolio | undefined) => {
          if (!old) return old;
          return { ...old, ...data, updated_at: new Date().toISOString() };
        }
      );

      return { previousPortfolio };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousPortfolio) {
        queryClient.setQueryData(
          portfolioKeys.detail(id),
          context.previousPortfolio
        );
      }
      toast.error("Failed to update portfolio");
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: portfolioKeys.detail(id) });
    },
  });
}
