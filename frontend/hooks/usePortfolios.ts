import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Portfolio } from "@/types";
import { useRealTimeData } from "./useRealTimeData";
import { toast } from "react-hot-toast";

export function usePortfolios() {
  const queryClient = useQueryClient();

  // Real-time data subscription
  const realTimeData = useRealTimeData({
    enablePortfolioUpdates: true,
    enableAlerts: true,
    showNotifications: true,
  });

  // Get all portfolios - longer cache time since this doesn't change frequently
  const {
    data: portfolios = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      console.log("🔄 usePortfolios: Fetching portfolios from API...");
      const result = await apiClient.getPortfolios();
      console.log("✅ usePortfolios: Received portfolios:", result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for portfolio list
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: false, // No automatic refetch
  });

  // Get single portfolio
  const usePortfolio = (id: string) => {
    return useQuery({
      queryKey: ["portfolio", id],
      queryFn: () => apiClient.getPortfolio(id),
      staleTime: 2 * 60 * 1000, // 2 minutes for portfolio details
      enabled: !!id,
    });
  };

  // Get portfolio with live data - shorter cache time for real-time data
  const usePortfolioLiveData = (id: string) => {
    return useQuery({
      queryKey: ["portfolio-live-data", id],
      queryFn: () => apiClient.getPortfolioLiveData(id),
      staleTime: 30 * 1000, // 30 seconds for live data
      enabled: !!id,
      refetchInterval: 60 * 1000, // Refetch every minute for live data
    });
  };

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: (data: Partial<Portfolio>) => apiClient.createPortfolio(data),
    onMutate: async (newPortfolio) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["portfolios"] });

      // Snapshot previous value
      const previousPortfolios = queryClient.getQueryData(["portfolios"]);

      // Optimistically update
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => [
        ...old,
        {
          id: `temp-${Date.now()}`,
          ...newPortfolio,
          total_value_usd: 0,
          total_invested_usd: 0,
          total_profit_loss_usd: 0,
          total_profit_loss_percentage: 0,
          risk_score: 0,
          holdings: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Portfolio,
      ]);

      return { previousPortfolios };
    },
    onError: (err, newPortfolio, context) => {
      // Rollback on error
      if (context?.previousPortfolios) {
        queryClient.setQueryData(["portfolios"], context.previousPortfolios);
      }
      toast.error("Failed to create portfolio");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Portfolio> }) =>
      apiClient.updatePortfolio(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["portfolio", id] });
      await queryClient.cancelQueries({ queryKey: ["portfolios"] });

      const previousPortfolio = queryClient.getQueryData(["portfolio", id]);
      const previousPortfolios = queryClient.getQueryData(["portfolios"]);

      // Optimistically update portfolio
      queryClient.setQueryData(
        ["portfolio", id],
        (old: Portfolio | undefined) => {
          if (!old) return old;
          return { ...old, ...data, updated_at: new Date().toISOString() };
        }
      );

      // Optimistically update portfolios list
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        return old.map((portfolio) =>
          portfolio.id === id
            ? { ...portfolio, ...data, updated_at: new Date().toISOString() }
            : portfolio
        );
      });

      return { previousPortfolio, previousPortfolios };
    },
    onError: (err, { id }, context) => {
      if (context?.previousPortfolio) {
        queryClient.setQueryData(["portfolio", id], context.previousPortfolio);
      }
      if (context?.previousPortfolios) {
        queryClient.setQueryData(["portfolios"], context.previousPortfolios);
      }
      toast.error("Failed to update portfolio");
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["portfolio", id] });
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: (id: string) => apiClient.deletePortfolio(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["portfolios"] });

      const previousPortfolios = queryClient.getQueryData(["portfolios"]);

      // Optimistically remove portfolio
      queryClient.setQueryData(["portfolios"], (old: Portfolio[] = []) => {
        return old.filter((portfolio) => portfolio.id !== id);
      });

      // Remove portfolio from cache
      queryClient.removeQueries({ queryKey: ["portfolio", id] });

      return { previousPortfolios };
    },
    onError: (err, id, context) => {
      if (context?.previousPortfolios) {
        queryClient.setQueryData(["portfolios"], context.previousPortfolios);
      }
      toast.error("Failed to delete portfolio");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Subscribe to real-time updates for specific portfolio
  const subscribeToPortfolio = (portfolioId: string) => {
    realTimeData.subscribe(portfolioId);
  };

  // Unsubscribe from real-time updates
  const unsubscribeFromPortfolio = (portfolioId: string) => {
    realTimeData.unsubscribe(portfolioId);
  };

  // Get portfolio summary statistics
  const getPortfolioStats = () => {
    if (!portfolios.length) return null;

    const totalValue = portfolios.reduce(
      (sum, p) => sum + (p.total_value_usd || 0),
      0
    );
    const totalCost = portfolios.reduce(
      (sum, p) => sum + (p.total_invested_usd || 0),
      0
    );
    const totalPnl = portfolios.reduce(
      (sum, p) => sum + (p.total_profit_loss_usd || 0),
      0
    );
    const avgRiskScore =
      portfolios.reduce((sum, p) => sum + (p.risk_score || 0), 0) /
      portfolios.length;

    return {
      totalValue,
      totalCost,
      totalPnl,
      totalPnlPercentage: totalCost > 0 ? (totalPnl / totalCost) * 100 : 0,
      avgRiskScore,
      portfolioCount: portfolios.length,
      profitablePortfolios: portfolios.filter(
        (p) => (p.total_profit_loss_usd || 0) > 0
      ).length,
      losingPortfolios: portfolios.filter(
        (p) => (p.total_profit_loss_usd || 0) < 0
      ).length,
    };
  };

  // Get top performing portfolios
  const getTopPerformers = (limit: number = 5) => {
    return [...portfolios]
      .sort(
        (a, b) =>
          (b.total_profit_loss_percentage || 0) -
          (a.total_profit_loss_percentage || 0)
      )
      .slice(0, limit);
  };

  // Get highest risk portfolios
  const getHighestRisk = (limit: number = 5) => {
    return [...portfolios]
      .sort((a, b) => (b.risk_score || 0) - (a.risk_score || 0))
      .slice(0, limit);
  };

  return {
    // Data
    portfolios,
    isLoading,
    error,

    // Queries
    usePortfolio,
    usePortfolioLiveData,

    // Mutations
    createPortfolio: createPortfolioMutation.mutate,
    createPortfolioMutation,
    updatePortfolio: updatePortfolioMutation.mutate,
    deletePortfolio: deletePortfolioMutation.mutate,

    // Mutation states
    isCreating: createPortfolioMutation.isPending,
    isUpdating: updatePortfolioMutation.isPending,
    isDeleting: deletePortfolioMutation.isPending,

    // Real-time
    realTimeData,
    subscribeToPortfolio,
    unsubscribeFromPortfolio,

    // Utilities
    refetch,
    getPortfolioStats,
    getTopPerformers,
    getHighestRisk,
  };
}
