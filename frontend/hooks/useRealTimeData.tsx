import React from "react";
import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

// Simplified interfaces without WebSocket dependencies
export interface PriceUpdate {
  asset_id: string;
  symbol: string;
  price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  volume_24h: number;
  market_cap: number;
  timestamp: string;
}

export interface PortfolioUpdate {
  portfolio_id: string;
  total_value: number;
  total_pnl: number;
  total_pnl_percentage: number;
  risk_score: number;
  updated_at: string;
}

export interface RiskMetricsUpdate {
  portfolio_id: string;
  var_95: number;
  var_99: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  volatility: number;
  beta: number;
  calculated_at: string;
}

export interface AlertNotification {
  id: string;
  type: "price" | "risk" | "pnl" | "allocation";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  asset_id?: string;
  portfolio_id?: string;
}

export interface RealTimeConfig {
  enablePriceUpdates?: boolean;
  enablePortfolioUpdates?: boolean;
  enableRiskMetricsUpdates?: boolean;
  enableAlerts?: boolean;
  autoReconnect?: boolean;
  showNotifications?: boolean;
}

export interface RealTimeStatus {
  connected: boolean;
  connecting: boolean;
  subscriptionCount: number;
  lastUpdate: Date | null;
  error: string | null;
}

export function useRealTimeData(config: RealTimeConfig = {}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealTimeStatus>({
    connected: true, // Simulate connected state
    connecting: false,
    subscriptionCount: 0,
    lastUpdate: new Date(),
    error: null,
  });

  const updateRef = useRef<{
    priceUpdates: Map<string, PriceUpdate>;
    portfolioUpdates: Map<string, PortfolioUpdate>;
    riskMetricsUpdates: Map<string, RiskMetricsUpdate>;
    alerts: AlertNotification[];
  }>({
    priceUpdates: new Map(),
    portfolioUpdates: new Map(),
    riskMetricsUpdates: new Map(),
    alerts: [],
  });

  // Simulate real-time updates with polling
  const updateStatus = useCallback(() => {
    setStatus((prev) => ({
      ...prev,
      lastUpdate: new Date(),
    }));
  }, []);

  // Handle price updates (simulated)
  const handlePriceUpdate = useCallback(
    (update: PriceUpdate) => {
      updateRef.current.priceUpdates.set(update.asset_id, update);

      // Optimistically update React Query cache
      queryClient.setQueryData(
        ["crypto-asset", update.asset_id],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            current_price: update.price,
            price_change_24h: update.price_change_24h,
            price_change_percentage_24h: update.price_change_percentage_24h,
            volume_24h: update.volume_24h,
            market_cap: update.market_cap,
            last_updated: update.timestamp,
          };
        }
      );

      // Update crypto assets list cache
      queryClient.setQueryData(["crypto-assets"], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map((asset) =>
          asset.id === update.asset_id
            ? {
                ...asset,
                current_price: update.price,
                price_change_24h: update.price_change_24h,
                price_change_percentage_24h: update.price_change_percentage_24h,
                volume_24h: update.volume_24h,
                market_cap: update.market_cap,
                last_updated: update.timestamp,
              }
            : asset
        );
      });

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient]
  );

  // Handle portfolio updates (simulated)
  const handlePortfolioUpdate = useCallback(
    (update: PortfolioUpdate) => {
      updateRef.current.portfolioUpdates.set(update.portfolio_id, update);

      // Update portfolio cache
      queryClient.setQueryData(
        ["portfolio", update.portfolio_id],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            total_value: update.total_value,
            total_pnl: update.total_pnl,
            total_pnl_percentage: update.total_pnl_percentage,
            risk_score: update.risk_score,
            updated_at: update.updated_at,
          };
        }
      );

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient]
  );

  // Handle risk metrics updates (simulated)
  const handleRiskMetricsUpdate = useCallback(
    (update: RiskMetricsUpdate) => {
      updateRef.current.riskMetricsUpdates.set(update.portfolio_id, update);

      // Update risk metrics cache
      queryClient.setQueryData(
        ["risk-metrics", update.portfolio_id],
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            ...update,
          };
        }
      );

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient]
  );

  // Handle alert notifications (simulated)
  const handleAlertNotification = useCallback(
    (alert: AlertNotification) => {
      updateRef.current.alerts.unshift(alert);

      // Keep only last 100 alerts
      if (updateRef.current.alerts.length > 100) {
        updateRef.current.alerts = updateRef.current.alerts.slice(0, 100);
      }

      // Update alerts cache
      queryClient.setQueryData(
        ["alerts", alert.portfolio_id || "all"],
        (oldData: any[]) => {
          if (!oldData) return [alert];
          return [alert, ...oldData];
        }
      );

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient]
  );

  // Subscribe to real-time channels (simulated)
  const subscribe = useCallback(
    (portfolioId?: string) => {
      // Simulate subscription by updating status
      setStatus((prev) => ({
        ...prev,
        subscriptionCount: prev.subscriptionCount + 1,
        lastUpdate: new Date(),
      }));
    },
    [config, updateStatus]
  );

  // Unsubscribe from real-time channels (simulated)
  const unsubscribe = useCallback(
    (portfolioId?: string) => {
      // Simulate unsubscription by updating status
      setStatus((prev) => ({
        ...prev,
        subscriptionCount: Math.max(0, prev.subscriptionCount - 1),
        lastUpdate: new Date(),
      }));
    },
    [config, updateStatus]
  );

  // Get latest updates
  const getLatestUpdates = useCallback(
    () => ({
      priceUpdates: Array.from(updateRef.current.priceUpdates.values()),
      portfolioUpdates: Array.from(updateRef.current.portfolioUpdates.values()),
      riskMetricsUpdates: Array.from(
        updateRef.current.riskMetricsUpdates.values()
      ),
      alerts: updateRef.current.alerts,
    }),
    []
  );

  // Clear updates
  const clearUpdates = useCallback(() => {
    updateRef.current.priceUpdates.clear();
    updateRef.current.portfolioUpdates.clear();
    updateRef.current.riskMetricsUpdates.clear();
    updateRef.current.alerts = [];
    setStatus((prev) => ({ ...prev, lastUpdate: null }));
  }, []);

  // Setup simulated real-time updates
  useEffect(() => {
    if (
      config.enablePriceUpdates ||
      config.enablePortfolioUpdates ||
      config.enableRiskMetricsUpdates
    ) {
      const interval = setInterval(() => {
        updateStatus();
      }, 300000); // Update every 5 minutes

      return () => clearInterval(interval);
    }
  }, [config, updateStatus]);

  return {
    status,
    subscribe,
    unsubscribe,
    getLatestUpdates,
    clearUpdates,
    handlePriceUpdate,
    handlePortfolioUpdate,
    handleRiskMetricsUpdate,
    handleAlertNotification,
  };
}
