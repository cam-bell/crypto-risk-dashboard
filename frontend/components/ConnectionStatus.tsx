"use client";

import { useState, useEffect } from "react";
import {
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";
import { websocketClient } from "@/lib/websocket";
import { apiClient } from "@/lib/api";

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

export function ConnectionStatus({
  showDetails = false,
  className = "",
}: ConnectionStatusProps) {
  const [status, setStatus] = useState({
    connected: false,
    connecting: false,
    subscriptionCount: 0,
    lastUpdate: null as Date | null,
    error: null as string | null,
  });

  const [performance, setPerformance] = useState({
    responseTime: 0,
    uptime: 0,
    activeConnections: 0,
    messageRate: 0,
  });

  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const wsStatus = websocketClient.getConnectionStatus();
      setStatus((prev) => ({
        ...prev,
        connected: wsStatus.connected,
        connecting: wsStatus.connecting,
        subscriptionCount: websocketClient.getSubscriptionCount(),
      }));
    };

    const handleConnected = () => {
      updateStatus();
      setStatus((prev) => ({ ...prev, error: null }));
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

    const handleHeartbeat = () => {
      setLastHeartbeat(new Date());
      setStatus((prev) => ({ ...prev, lastUpdate: new Date() }));
    };

    // Initial status update
    updateStatus();

    // Set up event listeners
    websocketClient.on("connected", handleConnected);
    websocketClient.on("disconnected", handleDisconnected);
    websocketClient.on("error", handleError);
    websocketClient.on("heartbeat", handleHeartbeat);

    // Performance monitoring interval
    const performanceInterval = setInterval(async () => {
      try {
        const health = await apiClient.healthCheck();
        const wsStatus = await apiClient.getWebSocketStatus();

        setPerformance({
          responseTime: health.performance?.response_time || 0,
          uptime: health.performance?.uptime || 0,
          activeConnections: wsStatus.active_connections || 0,
          messageRate: wsStatus.message_rate || 0,
        });
      } catch (error) {
        console.error("Failed to fetch performance metrics:", error);
      }
    }, 10000); // Update every 10 seconds

    return () => {
      websocketClient.off("connected", handleConnected);
      websocketClient.off("disconnected", handleDisconnected);
      websocketClient.off("error", handleError);
      websocketClient.off("heartbeat", handleHeartbeat);
      clearInterval(performanceInterval);
    };
  }, []);

  const getStatusColor = () => {
    if (status.error) return "text-red-500";
    if (status.connected) return "text-green-500";
    if (status.connecting) return "text-yellow-500";
    return "text-gray-500";
  };

  const getStatusIcon = () => {
    if (status.error) return <AlertCircle className="w-4 h-4" />;
    if (status.connected) return <CheckCircle className="w-4 h-4" />;
    if (status.connecting) return <Clock className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getConnectionText = () => {
    if (status.error) return "Error";
    if (status.connected) return "Connected";
    if (status.connecting) return "Connecting";
    return "Disconnected";
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 100) return `${ms.toFixed(0)}ms`;
    if (ms < 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {status.connected ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-gray-500" />
        )}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getConnectionText()}
        </span>
      </div>

      {showDetails && (
        <>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Activity className="w-3 h-3" />
            <span>{status.subscriptionCount} subs</span>
          </div>

          {status.lastUpdate && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>
                {Math.floor((Date.now() - status.lastUpdate.getTime()) / 1000)}s
                ago
              </span>
            </div>
          )}

          {performance.responseTime > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>⚡</span>
              <span>{formatResponseTime(performance.responseTime)}</span>
            </div>
          )}

          {performance.uptime > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>🕒</span>
              <span>{formatUptime(performance.uptime)}</span>
            </div>
          )}

          {performance.activeConnections > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>👥</span>
              <span>{performance.activeConnections}</span>
            </div>
          )}

          {performance.messageRate > 0 && (
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <span>📡</span>
              <span>{performance.messageRate.toFixed(1)}/s</span>
            </div>
          )}
        </>
      )}

      {status.error && (
        <div className="flex items-center space-x-1 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          <span>{status.error}</span>
        </div>
      )}
    </div>
  );
}
