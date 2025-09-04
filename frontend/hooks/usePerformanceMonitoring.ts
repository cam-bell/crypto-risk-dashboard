import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface PerformanceMetrics {
  apiResponseTimes: {
    endpoint: string;
    avgResponseTime: number;
    p95ResponseTime: number;
    requestCount: number;
  }[];
  cacheHitRate: number;
  errorRate: number;
  activeUsers: number;
  memoryUsage: number;
  renderTime: number;
}

export interface PerformanceConfig {
  enableMonitoring?: boolean;
  sampleRate?: number;
  maxDataPoints?: number;
  alertThresholds?: {
    responseTime: number;
    errorRate: number;
    memoryUsage: number;
  };
}

export function usePerformanceMonitoring(config: PerformanceConfig = {}) {
  const queryClient = useQueryClient();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTimes: [],
    cacheHitRate: 0,
    errorRate: 0,
    activeUsers: 0,
    memoryUsage: 0,
    renderTime: 0,
  });

  const [alerts, setAlerts] = useState<
    Array<{
      type: string;
      message: string;
      severity: "low" | "medium" | "high" | "critical";
      timestamp: Date;
      value: number;
      threshold: number;
    }>
  >([]);

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);

  const dataPoints = useRef<
    Array<{
      timestamp: number;
      responseTime: number;
      memoryUsage: number;
      errorCount: number;
      requestCount: number;
    }>
  >([]);

  const configRef = useRef({
    enableMonitoring: true,
    sampleRate: 5000, // 5 seconds
    maxDataPoints: 1000,
    alertThresholds: {
      responseTime: 2000, // 2 seconds
      errorRate: 0.1, // 10%
      memoryUsage: 100 * 1024 * 1024, // 100MB
    },
    ...config,
  });

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setStartTime(Date.now());

    // Initial data point
    dataPoints.current = [
      {
        timestamp: Date.now(),
        responseTime: 0,
        memoryUsage: 0,
        errorCount: 0,
        requestCount: 0,
      },
    ];

    console.log("Performance monitoring started");
  }, [isMonitoring]);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    setIsMonitoring(false);
    console.log("Performance monitoring stopped");
  }, [isMonitoring]);

  // Record API request
  const recordApiRequest = useCallback(
    (endpoint: string, responseTime: number, success: boolean) => {
      if (!isMonitoring) return;

      const currentPoint = dataPoints.current[dataPoints.current.length - 1];
      if (currentPoint) {
        currentPoint.requestCount++;
        if (!success) currentPoint.errorCount++;

        // Update response time (rolling average)
        currentPoint.responseTime =
          (currentPoint.responseTime + responseTime) / 2;
      }
    },
    [isMonitoring]
  );

  // Record render time
  const recordRenderTime = useCallback(
    (renderTime: number) => {
      if (!isMonitoring) return;

      setMetrics((prev) => ({
        ...prev,
        renderTime: (prev.renderTime + renderTime) / 2,
      }));
    },
    [isMonitoring]
  );

  // Get memory usage
  const getMemoryUsage = useCallback(() => {
    if (typeof performance !== "undefined" && "memory" in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize;
    }
    return 0;
  }, []);

  // Calculate performance metrics
  const calculateMetrics = useCallback(() => {
    if (dataPoints.current.length === 0) return;

    const recentPoints = dataPoints.current.slice(-100); // Last 100 data points

    // Calculate response time metrics
    const responseTimes = recentPoints
      .map((p) => p.responseTime)
      .filter((t) => t > 0);
    const avgResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    const sortedResponseTimes = [...responseTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedResponseTimes.length * 0.95);
    const p95ResponseTime = sortedResponseTimes[p95Index] || 0;

    // Calculate error rate
    const totalRequests = recentPoints.reduce(
      (sum, p) => sum + p.requestCount,
      0
    );
    const totalErrors = recentPoints.reduce((sum, p) => sum + p.errorCount, 0);
    const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;

    // Calculate cache hit rate (simplified)
    const cacheHitRate = 0.85; // This would need to be calculated from actual cache stats

    // Get current memory usage
    const memoryUsage = getMemoryUsage();

    setMetrics((prev) => ({
      ...prev,
      apiResponseTimes: [
        {
          endpoint: "overall",
          avgResponseTime,
          p95ResponseTime,
          requestCount: totalRequests,
        },
      ],
      cacheHitRate,
      errorRate,
      memoryUsage,
    }));
  }, [getMemoryUsage]);

  // Check for performance alerts
  const checkAlerts = useCallback(() => {
    const newAlerts: typeof alerts = [];
    const thresholds = configRef.current.alertThresholds!;

    // Response time alert
    if (metrics.apiResponseTimes.length > 0) {
      const avgResponseTime = metrics.apiResponseTimes[0].avgResponseTime;
      if (avgResponseTime > thresholds.responseTime) {
        newAlerts.push({
          type: "response_time",
          message: `Average response time (${avgResponseTime.toFixed(0)}ms) exceeds threshold (${thresholds.responseTime}ms)`,
          severity:
            avgResponseTime > thresholds.responseTime * 2 ? "critical" : "high",
          timestamp: new Date(),
          value: avgResponseTime,
          threshold: thresholds.responseTime,
        });
      }
    }

    // Error rate alert
    if (metrics.errorRate > thresholds.errorRate) {
      newAlerts.push({
        type: "error_rate",
        message: `Error rate (${(metrics.errorRate * 100).toFixed(1)}%) exceeds threshold (${(thresholds.errorRate * 100).toFixed(1)}%)`,
        severity:
          metrics.errorRate > thresholds.errorRate * 2 ? "critical" : "high",
        timestamp: new Date(),
        value: metrics.errorRate,
        threshold: thresholds.errorRate,
      });
    }

    // Memory usage alert
    if (metrics.memoryUsage > thresholds.memoryUsage) {
      newAlerts.push({
        type: "memory_usage",
        message: `Memory usage (${(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB) exceeds threshold (${(thresholds.memoryUsage / 1024 / 1024).toFixed(1)}MB)`,
        severity:
          metrics.memoryUsage > thresholds.memoryUsage * 1.5
            ? "critical"
            : "high",
        timestamp: new Date(),
        value: metrics.memoryUsage,
        threshold: thresholds.memoryUsage,
      });
    }

    if (newAlerts.length > 0) {
      setAlerts((prev) => [...prev, ...newAlerts]);

      // Log critical alerts
      newAlerts
        .filter((alert) => alert.severity === "critical")
        .forEach((alert) => {
          console.error("Critical performance alert:", alert.message);
        });
    }
  }, [metrics, alerts]);

  // Clear old alerts
  const clearOldAlerts = useCallback(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    setAlerts((prev) =>
      prev.filter((alert) => alert.timestamp.getTime() > oneHourAgo)
    );
  }, []);

  // Optimize React Query cache
  const optimizeCache = useCallback(() => {
    // Remove queries that haven't been accessed recently
    const now = Date.now();
    const staleTime = 10 * 60 * 1000; // 10 minutes

    queryClient
      .getQueryCache()
      .getAll()
      .forEach((query) => {
        const lastAccessed = query.state.dataUpdatedAt;
        if (now - lastAccessed > staleTime) {
          queryClient.removeQueries({ queryKey: query.queryKey });
        }
      });

    console.log("Cache optimization completed");
  }, [queryClient]);

  // Performance monitoring interval
  useEffect(() => {
    if (!configRef.current.enableMonitoring || !isMonitoring) return;

    const interval = setInterval(() => {
      // Add new data point
      const newPoint = {
        timestamp: Date.now(),
        responseTime: 0,
        memoryUsage: getMemoryUsage(),
        errorCount: 0,
        requestCount: 0,
      };

      dataPoints.current.push(newPoint);

      // Keep only recent data points
      if (dataPoints.current.length > configRef.current.maxDataPoints!) {
        dataPoints.current = dataPoints.current.slice(
          -configRef.current.maxDataPoints!
        );
      }

      // Calculate metrics
      calculateMetrics();

      // Check for alerts
      checkAlerts();

      // Clear old alerts
      clearOldAlerts();
    }, configRef.current.sampleRate);

    return () => clearInterval(interval);
  }, [
    isMonitoring,
    calculateMetrics,
    checkAlerts,
    clearOldAlerts,
    getMemoryUsage,
  ]);

  // Auto-start monitoring when component mounts
  useEffect(() => {
    if (configRef.current.enableMonitoring) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [startMonitoring, stopMonitoring]);

  // Performance optimization interval
  useEffect(() => {
    if (!isMonitoring) return;

    const optimizationInterval = setInterval(
      () => {
        optimizeCache();
      },
      5 * 60 * 1000
    ); // Every 5 minutes

    return () => clearInterval(optimizationInterval);
  }, [isMonitoring, optimizeCache]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const uptime = startTime > 0 ? Date.now() - startTime : 0;

    return {
      uptime,
      dataPoints: dataPoints.current.length,
      alerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === "critical").length,
      highAlerts: alerts.filter((a) => a.severity === "high").length,
      isHealthy:
        alerts.filter((a) => a.severity === "critical" || a.severity === "high")
          .length === 0,
    };
  }, [startTime, alerts]);

  // Reset performance data
  const resetPerformanceData = useCallback(() => {
    dataPoints.current = [];
    setMetrics({
      apiResponseTimes: [],
      cacheHitRate: 0,
      errorRate: 0,
      activeUsers: 0,
      memoryUsage: 0,
      renderTime: 0,
    });
    setAlerts([]);
    setStartTime(Date.now());
  }, []);

  return {
    // State
    metrics,
    alerts,
    isMonitoring,

    // Actions
    startMonitoring,
    stopMonitoring,
    recordApiRequest,
    recordRenderTime,
    optimizeCache,
    resetPerformanceData,

    // Utilities
    getPerformanceSummary,
    getMemoryUsage,
  };
}
