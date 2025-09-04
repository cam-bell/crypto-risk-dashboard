import React from "react";
import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  websocketClient,
  PriceUpdate,
  PortfolioUpdate,
  RiskMetricsUpdate,
  AlertNotification,
} from "@/lib/websocket";
import { toast } from "react-hot-toast";

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
    connected: false,
    connecting: false,
    subscriptionCount: 0,
    lastUpdate: null,
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

  // Update status from WebSocket client
  const updateStatus = useCallback(() => {
    const wsStatus = websocketClient.getConnectionStatus();
    setStatus((prev) => ({
      ...prev,
      connected: wsStatus.connected,
      connecting: wsStatus.connecting,
      subscriptionCount: websocketClient.getSubscriptionCount(),
      error: null,
    }));
  }, []);

  // Handle price updates
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

  // Handle portfolio updates
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

      // Update portfolios list cache
      queryClient.setQueryData(["portfolios"], (oldData: any[]) => {
        if (!oldData) return oldData;
        return oldData.map((portfolio) =>
          portfolio.id === update.portfolio_id
            ? {
                ...portfolio,
                total_value: update.total_value,
                total_pnl: update.total_pnl,
                total_pnl_percentage: update.total_pnl_percentage,
                risk_score: update.risk_score,
                updated_at: update.updated_at,
              }
            : portfolio
        );
      });

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient]
  );

  // Handle risk metrics updates
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

  // Handle alert notifications
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

      // Show toast notification if enabled
      if (config.showNotifications) {
        const severityColors = {
          low: "bg-blue-500",
          medium: "bg-yellow-500",
          high: "bg-orange-500",
          critical: "bg-red-500",
        };

        toast.custom(
          (t) => (
            <div
              className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full ${severityColors[alert.severity]} shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-start">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-white">
                      {alert.type.toUpperCase()} Alert
                    </p>
                    <p className="mt-1 text-sm text-white">{alert.message}</p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-gray-700">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  ×
                </button>
              </div>
            </div>
          ),
          {
            duration: 6000,
          }
        );
      }

      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    },
    [queryClient, config.showNotifications]
  );

  // Subscribe to real-time channels
  const subscribe = useCallback(
    (portfolioId?: string) => {
      if (config.enablePriceUpdates) {
        websocketClient.subscribe("price_updates");
      }

      if (config.enablePortfolioUpdates && portfolioId) {
        websocketClient.subscribe("portfolio_updates", {
          portfolio_id: portfolioId,
        });
      }

      if (config.enableRiskMetricsUpdates && portfolioId) {
        websocketClient.subscribe("risk_metrics_updates", {
          portfolio_id: portfolioId,
        });
      }

      if (config.enableAlerts && portfolioId) {
        websocketClient.subscribe("alerts", { portfolio_id: portfolioId });
      }

      updateStatus();
    },
    [config, updateStatus]
  );

  // Unsubscribe from real-time channels
  const unsubscribe = useCallback(
    (portfolioId?: string) => {
      if (config.enablePriceUpdates) {
        websocketClient.unsubscribe("price_updates");
      }

      if (config.enablePortfolioUpdates && portfolioId) {
        websocketClient.unsubscribe("portfolio_updates", {
          portfolio_id: portfolioId,
        });
      }

      if (config.enableRiskMetricsUpdates && portfolioId) {
        websocketClient.subscribe("risk_metrics_updates", {
          portfolio_id: portfolioId,
        });
      }

      if (config.enableAlerts && portfolioId) {
        websocketClient.unsubscribe("alerts", { portfolio_id: portfolioId });
      }

      updateStatus();
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

  // Setup WebSocket event listeners
  useEffect(() => {
    const handleConnected = () => {
      updateStatus();
      if (config.autoReconnect !== false) {
        // Resubscribe to channels on reconnect
        subscribe();
      }
    };

    const handleDisconnected = () => {
      updateStatus();
    };

    const handleError = (error: any) => {
      setStatus((prev) => ({
        ...prev,
        error: error.message || "WebSocket error",
      }));
    };

    websocketClient.on("connected", handleConnected);
    websocketClient.on("disconnected", handleDisconnected);
    websocketClient.on("error", handleError);

    if (config.enablePriceUpdates) {
      websocketClient.on("price_update", handlePriceUpdate);
    }

    if (config.enablePortfolioUpdates) {
      websocketClient.on("portfolio_update", handlePortfolioUpdate);
    }

    if (config.enableRiskMetricsUpdates) {
      websocketClient.on("risk_metrics_update", handleRiskMetricsUpdate);
    }

    if (config.enableAlerts) {
      websocketClient.on("alert_notification", handleAlertNotification);
    }

    // Initial status update
    updateStatus();

    return () => {
      websocketClient.off("connected", handleConnected);
      websocketClient.off("disconnected", handleDisconnected);
      websocketClient.off("error", handleError);

      if (config.enablePriceUpdates) {
        websocketClient.off("price_update", handlePriceUpdate);
      }

      if (config.enablePortfolioUpdates) {
        websocketClient.off("portfolio_update", handlePortfolioUpdate);
      }

      if (config.enableRiskMetricsUpdates) {
        websocketClient.off("risk_metrics_update", handleRiskMetricsUpdate);
      }

      if (config.enableAlerts) {
        websocketClient.off("alert_notification", handleAlertNotification);
      }
    };
  }, [
    config.enablePriceUpdates,
    config.enablePortfolioUpdates,
    config.enableRiskMetricsUpdates,
    config.enableAlerts,
    config.autoReconnect,
    handlePriceUpdate,
    handlePortfolioUpdate,
    handleRiskMetricsUpdate,
    handleAlertNotification,
    subscribe,
    updateStatus,
  ]);

  return {
    status,
    subscribe,
    unsubscribe,
    getLatestUpdates,
    clearUpdates,
    websocketClient,
  };
}
