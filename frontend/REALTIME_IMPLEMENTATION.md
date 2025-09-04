# Real-Time Data Integration Implementation

This document describes the comprehensive real-time data integration system implemented for the Crypto Risk Dashboard frontend.

## Overview

The real-time system provides live updates for cryptocurrency prices, portfolio values, risk metrics, and alerts through WebSocket connections, React Query integration, and PWA features.

## Architecture

### 1. WebSocket Layer (`/lib/websocket.ts`)

**Features:**

- Automatic reconnection with exponential backoff
- Heartbeat mechanism for connection health
- Message queuing during disconnections
- Event-driven architecture with TypeScript support
- Subscription management for different data channels

**Key Components:**

```typescript
export class WebSocketClient extends EventEmitter {
  // Connection management
  connect(): Promise<void>;
  disconnect(): void;

  // Subscription management
  subscribe(channel: string, params?: any): void;
  unsubscribe(channel: string, params?: any): void;

  // Status monitoring
  getConnectionStatus(): { connected: boolean; connecting: boolean };
  getSubscriptionCount(): number;
}
```

**Supported Channels:**

- `price_updates` - Real-time cryptocurrency price updates
- `portfolio_updates` - Portfolio value and performance changes
- `risk_metrics_updates` - Risk calculation updates
- `alerts` - Real-time alert notifications

### 2. React Query Integration (`/app/providers.tsx`)

**Enhanced Configuration:**

- Reduced stale time for real-time data (30 seconds)
- Automatic query invalidation on WebSocket reconnection
- Optimized retry logic with exponential backoff
- Background refetching for critical data

**Key Features:**

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds for real-time data
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});
```

### 3. Real-Time Data Hook (`/hooks/useRealTimeData.ts`)

**Core Functionality:**

- Automatic WebSocket event subscription
- React Query cache updates for real-time data
- Optimistic updates for better UX
- Configurable notification system
- Automatic reconnection handling

**Usage Example:**

```typescript
const realTimeData = useRealTimeData({
  enablePriceUpdates: true,
  enablePortfolioUpdates: true,
  enableAlerts: true,
  showNotifications: true,
  autoReconnect: true,
});

// Subscribe to specific portfolio
realTimeData.subscribe("portfolio-id");

// Get latest updates
const updates = realTimeData.getLatestUpdates();
```

**Configuration Options:**

- `enablePriceUpdates` - Enable real-time price updates
- `enablePortfolioUpdates` - Enable portfolio updates
- `enableRiskMetricsUpdates` - Enable risk metrics updates
- `enableAlerts` - Enable alert notifications
- `autoReconnect` - Automatic reconnection on disconnect
- `showNotifications` - Display toast notifications for alerts

### 4. Enhanced API Client (`/lib/api.ts`)

**New Real-Time Endpoints:**

```typescript
// Live price data
async getLivePrices(assetIds: string[]): Promise<CryptoAsset[]>

// Market ticker with real-time data
async getMarketTicker(): Promise<MarketTickerData>

// Portfolio live data
async getPortfolioLiveData(portfolioId: string): Promise<PortfolioLiveData>

// Risk metrics history
async getRiskMetricsHistory(portfolioId: string, timeframe: string): Promise<RiskMetricsHistory[]>
```

**Performance Features:**

- Request timing and performance monitoring
- Automatic retry with exponential backoff
- Enhanced error handling with detailed error information
- Request/response interceptors for monitoring

### 5. Portfolio Management (`/hooks/usePortfolios.ts`)

**Real-Time Features:**

- Live portfolio value updates
- Optimistic updates for mutations
- Real-time subscription management
- Performance statistics and analytics

**Key Methods:**

```typescript
const {
  // Real-time data
  realTimeData,
  subscribeToPortfolio,
  unsubscribeFromPortfolio,

  // Portfolio statistics
  getPortfolioStats,
  getTopPerformers,
  getHighestRisk,

  // Mutations with optimistic updates
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
} = usePortfolios();
```

### 6. Crypto Assets Management (`/hooks/useCryptoAssets.ts`)

**Real-Time Features:**

- Live price updates for all assets
- Market sentiment analysis
- Top gainers/losers tracking
- Watchlist management with real-time updates

**Key Methods:**

```typescript
const {
  // Real-time data
  realTimeData,
  subscribeToAssets,
  unsubscribeFromAssets,

  // Market analysis
  getMarketSentiment,
  getTopGainers,
  getTopLosers,
  getPriceChangeStats,

  // Watchlist management
  addToWatchlist,
  removeFromWatchlist,
} = useCryptoAssets();
```

### 7. Risk Metrics (`/hooks/useRiskMetrics.ts`)

**Real-Time Features:**

- Live risk calculation updates
- Risk level classification
- Trend analysis (improving/stable/deteriorating)
- Automatic alert generation

**Risk Analysis:**

```typescript
const {
  // Risk calculations
  calculateRiskScore,
  getRiskLevel,
  getRiskTrend,
  getRiskBreakdown,

  // Alerts and monitoring
  getRiskAlerts,
  getRiskSummary,

  // Real-time updates
  subscribeToRiskMetrics,
  unsubscribeFromRiskMetrics,
} = useRiskMetrics();
```

### 8. Performance Monitoring (`/hooks/usePerformanceMonitoring.ts`)

**Monitoring Features:**

- API response time tracking
- Memory usage monitoring
- Cache hit rate analysis
- Automatic performance alerts
- React Query cache optimization

**Usage:**

```typescript
const {
  metrics,
  alerts,
  isMonitoring,

  // Performance actions
  startMonitoring,
  stopMonitoring,
  optimizeCache,

  // Performance summary
  getPerformanceSummary,
} = usePerformanceMonitoring();
```

### 9. PWA Features

**Service Worker (`/public/sw.js`):**

- Offline support with intelligent caching
- Background sync for offline actions
- Push notification handling
- Cache management and optimization

**PWA Manifest (`/public/manifest.json`):**

- App installation prompts
- Offline functionality
- Native app-like experience
- Cross-platform compatibility

**Service Worker Registration (`/components/ServiceWorkerRegistration.tsx`):**

- Automatic service worker registration
- Installation prompts
- Notification permission management
- Online/offline status monitoring

## Data Flow

### 1. Real-Time Updates Flow

```
WebSocket Server → WebSocket Client → Event Handlers → React Query Cache → UI Components
```

### 2. Optimistic Updates Flow

```
User Action → Optimistic Cache Update → API Request → Success/Error → Cache Sync
```

### 3. Offline Support Flow

```
Offline Action → Service Worker Storage → Background Sync → API Update → Cache Sync
```

## Performance Optimizations

### 1. Caching Strategy

- **Static Assets**: Cache-first with long TTL
- **API Data**: Network-first with short TTL for real-time data
- **Navigation**: Network-first with cache fallback
- **Offline Actions**: Queue in IndexedDB for background sync

### 2. Memory Management

- Automatic cleanup of old data points
- Limited alert history (100 entries max)
- React Query garbage collection optimization
- Service worker cache size limits

### 3. Network Optimization

- WebSocket connection pooling
- Automatic reconnection with backoff
- Request deduplication
- Background sync for offline actions

## Error Handling

### 1. WebSocket Errors

- Automatic reconnection with exponential backoff
- Fallback to HTTP polling on persistent failures
- User notification of connection issues
- Graceful degradation of real-time features

### 2. API Errors

- Retry logic for transient failures
- Optimistic update rollback on errors
- User-friendly error messages
- Fallback to cached data when available

### 3. Performance Errors

- Automatic performance monitoring
- Alert thresholds for critical issues
- Cache optimization on performance degradation
- User notification of performance issues

## Testing

### 1. Unit Tests

- Hook testing with React Testing Library
- WebSocket client mocking
- Event handler testing
- Performance monitoring validation

### 2. Integration Tests

- End-to-end data flow testing
- Cache synchronization testing
- Offline functionality testing
- Performance regression testing

## Configuration

### 1. Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws

# Real-time Configuration
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_REALTIME_UPDATE_INTERVAL=5000
NEXT_PUBLIC_MAX_RECONNECT_ATTEMPTS=10

# Performance Configuration
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=true
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=5000
```

### 2. Feature Flags

- Real-time updates enable/disable
- Performance monitoring configuration
- PWA features enable/disable
- Debug logging enable/disable

## Deployment Considerations

### 1. WebSocket Server

- Ensure WebSocket endpoint is accessible
- Configure proper CORS headers
- Set up load balancing for WebSocket connections
- Monitor connection limits and performance

### 2. Service Worker

- Ensure proper caching headers
- Test offline functionality
- Monitor cache storage usage
- Validate PWA installation flow

### 3. Performance Monitoring

- Set appropriate alert thresholds
- Monitor memory usage in production
- Track API response times
- Alert on performance degradation

## Troubleshooting

### 1. Common Issues

**WebSocket Connection Failures:**

- Check server availability
- Verify CORS configuration
- Check network connectivity
- Review reconnection logic

**Performance Issues:**

- Monitor memory usage
- Check cache hit rates
- Review API response times
- Validate optimization settings

**Offline Functionality:**

- Verify service worker registration
- Check cache storage limits
- Validate background sync
- Test offline action queuing

### 2. Debug Tools

- React Query DevTools
- Service Worker debugging
- Performance monitoring dashboard
- WebSocket connection status
- Cache inspection tools

## Future Enhancements

### 1. Planned Features

- Real-time chart updates
- Advanced caching strategies
- Machine learning performance optimization
- Enhanced offline capabilities
- Multi-language support

### 2. Scalability Improvements

- WebSocket connection pooling
- Advanced load balancing
- Real-time data compression
- Edge caching strategies
- Microservice architecture

## Conclusion

The real-time data integration system provides a robust, scalable foundation for live cryptocurrency portfolio monitoring. With comprehensive error handling, performance optimization, and PWA features, it delivers a smooth, responsive user experience that rivals native applications.

The system is designed to be maintainable, testable, and extensible, allowing for future enhancements while maintaining high performance and reliability standards.
