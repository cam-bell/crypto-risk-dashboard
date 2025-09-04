import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRealTimeData } from '@/hooks/useRealTimeData'
import { websocketClient } from '@/lib/websocket'
import { toast } from 'react-hot-toast'

// Mock dependencies
jest.mock('@/lib/websocket')
jest.mock('react-hot-toast')

const mockWebsocketClient = websocketClient as jest.Mocked<typeof websocketClient>

describe('useRealTimeData', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    // Reset mocks
    jest.clearAllMocks()
    
    // Mock WebSocket client methods
    mockWebsocketClient.getConnectionStatus.mockReturnValue({
      connected: false,
      connecting: false,
    })
    mockWebsocketClient.getSubscriptionCount.mockReturnValue(0)
    mockWebsocketClient.on.mockReturnValue(mockWebsocketClient)
    mockWebsocketClient.off.mockReturnValue(mockWebsocketClient)
    mockWebsocketClient.subscribe.mockImplementation(() => {})
    mockWebsocketClient.unsubscribe.mockImplementation(() => {})
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useRealTimeData(), { wrapper })

    expect(result.current.status).toEqual({
      connected: false,
      connecting: false,
      subscriptionCount: 0,
      lastUpdate: null,
      error: null,
    })
  })

  it('should subscribe to WebSocket events on mount', () => {
    renderHook(() => useRealTimeData(), { wrapper })

    expect(mockWebsocketClient.on).toHaveBeenCalledWith('connected', expect.any(Function))
    expect(mockWebsocketClient.on).toHaveBeenCalledWith('disconnected', expect.any(Function))
    expect(mockWebsocketClient.on).toHaveBeenCalledWith('error', expect.any(Function))
  })

  it('should handle WebSocket connection status updates', () => {
    mockWebsocketClient.getConnectionStatus.mockReturnValue({
      connected: true,
      connecting: false,
    })
    mockWebsocketClient.getSubscriptionCount.mockReturnValue(2)

    const { result } = renderHook(() => useRealTimeData(), { wrapper })

    // Simulate connection event
    const connectedHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'connected'
    )?.[1] as Function

    act(() => {
      connectedHandler()
    })

    expect(result.current.status.connected).toBe(true)
    expect(result.current.status.subscriptionCount).toBe(2)
  })

  it('should handle price updates and update cache', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
    }), { wrapper })

    // Simulate price update event
    const priceUpdateHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'price_update'
    )?.[1] as Function

    const mockPriceUpdate = {
      asset_id: 'bitcoin',
      symbol: 'BTC',
      price: 50000,
      price_change_24h: 1000,
      price_change_percentage_24h: 2.0,
      volume_24h: 1000000,
      market_cap: 1000000000,
      timestamp: '2024-01-01T00:00:00Z',
    }

    act(() => {
      priceUpdateHandler(mockPriceUpdate)
    })

    expect(result.current.status.lastUpdate).toBeInstanceOf(Date)
  })

  it('should handle portfolio updates and update cache', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePortfolioUpdates: true,
    }), { wrapper })

    // Simulate portfolio update event
    const portfolioUpdateHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'portfolio_update'
    )?.[1] as Function

    const mockPortfolioUpdate = {
      portfolio_id: 'portfolio-1',
      total_value: 100000,
      total_pnl: 5000,
      total_pnl_percentage: 5.0,
      risk_score: 0.3,
      updated_at: '2024-01-01T00:00:00Z',
    }

    act(() => {
      portfolioUpdateHandler(mockPortfolioUpdate)
    })

    expect(result.current.status.lastUpdate).toBeInstanceOf(Date)
  })

  it('should handle risk metrics updates and update cache', () => {
    const { result } = renderHook(() => useRealTimeData({
      enableRiskMetricsUpdates: true,
    }), { wrapper })

    // Simulate risk metrics update event
    const riskMetricsUpdateHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'risk_metrics_update'
    )?.[1] as Function

    const mockRiskMetricsUpdate = {
      portfolio_id: 'portfolio-1',
      var_95: 15.0,
      var_99: 25.0,
      sharpe_ratio: 1.2,
      sortino_ratio: 1.5,
      max_drawdown: 10.0,
      volatility: 20.0,
      beta: 0.8,
      calculated_at: '2024-01-01T00:00:00Z',
    }

    act(() => {
      riskMetricsUpdateHandler(mockRiskMetricsUpdate)
    })

    expect(result.current.status.lastUpdate).toBeInstanceOf(Date)
  })

  it('should handle alert notifications with toast display', () => {
    const { result } = renderHook(() => useRealTimeData({
      enableAlerts: true,
      showNotifications: true,
    }), { wrapper })

    // Simulate alert notification event
    const alertNotificationHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'alert_notification'
    )?.[1] as Function

    const mockAlert = {
      id: 'alert-1',
      type: 'price' as const,
      message: 'Bitcoin price dropped below $45,000',
      severity: 'high' as const,
      timestamp: '2024-01-01T00:00:00Z',
      asset_id: 'bitcoin',
      portfolio_id: 'portfolio-1',
    }

    act(() => {
      alertNotificationHandler(mockAlert)
    })

    expect(toast.custom).toHaveBeenCalled()
    expect(result.current.status.lastUpdate).toBeInstanceOf(Date)
  })

  it('should subscribe to channels when subscribe is called', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
      enablePortfolioUpdates: true,
    }), { wrapper })

    act(() => {
      result.current.subscribe('portfolio-1')
    })

    expect(mockWebsocketClient.subscribe).toHaveBeenCalledWith('price_updates')
    expect(mockWebsocketClient.subscribe).toHaveBeenCalledWith('portfolio_updates', { portfolio_id: 'portfolio-1' })
  })

  it('should unsubscribe from channels when unsubscribe is called', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
      enablePortfolioUpdates: true,
    }), { wrapper })

    act(() => {
      result.current.unsubscribe('portfolio-1')
    })

    expect(mockWebsocketClient.unsubscribe).toHaveBeenCalledWith('price_updates')
    expect(mockWebsocketClient.unsubscribe).toHaveBeenCalledWith('portfolio_updates', { portfolio_id: 'portfolio-1' })
  })

  it('should get latest updates from internal state', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
      enablePortfolioUpdates: true,
    }), { wrapper })

    const updates = result.current.getLatestUpdates()

    expect(updates).toEqual({
      priceUpdates: [],
      portfolioUpdates: [],
      riskMetricsUpdates: [],
      alerts: [],
    })
  })

  it('should clear updates when clearUpdates is called', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
    }), { wrapper })

    // First, trigger an update
    const priceUpdateHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'price_update'
    )?.[1] as Function

    act(() => {
      priceUpdateHandler({
        asset_id: 'bitcoin',
        symbol: 'BTC',
        price: 50000,
        price_change_24h: 1000,
        price_change_percentage_24h: 2.0,
        volume_24h: 1000000,
        market_cap: 1000000000,
        timestamp: '2024-01-01T00:00:00Z',
      })
    })

    expect(result.current.status.lastUpdate).toBeInstanceOf(Date)

    // Then clear updates
    act(() => {
      result.current.clearUpdates()
    })

    expect(result.current.status.lastUpdate).toBeNull()
    expect(result.current.getLatestUpdates().priceUpdates).toHaveLength(0)
  })

  it('should handle WebSocket errors', () => {
    const { result } = renderHook(() => useRealTimeData(), { wrapper })

    // Simulate error event
    const errorHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'error'
    )?.[1] as Function

    const mockError = new Error('WebSocket connection failed')

    act(() => {
      errorHandler(mockError)
    })

    expect(result.current.status.error).toBe('WebSocket connection failed')
  })

  it('should resubscribe to channels on reconnection when autoReconnect is enabled', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
      autoReconnect: true,
    }), { wrapper })

    // Simulate connection event
    const connectedHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'connected'
    )?.[1] as Function

    act(() => {
      connectedHandler()
    })

    // Should automatically resubscribe
    expect(mockWebsocketClient.subscribe).toHaveBeenCalledWith('price_updates')
  })

  it('should not resubscribe to channels on reconnection when autoReconnect is disabled', () => {
    const { result } = renderHook(() => useRealTimeData({
      enablePriceUpdates: true,
      autoReconnect: false,
    }), { wrapper })

    // Simulate connection event
    const connectedHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'connected'
    )?.[1] as Function

    act(() => {
      connectedHandler()
    })

    // Should not automatically resubscribe
    expect(mockWebsocketClient.subscribe).not.toHaveBeenCalled()
  })

  it('should limit alerts to last 100 entries', () => {
    const { result } = renderHook(() => useRealTimeData({
      enableAlerts: true,
    }), { wrapper })

    // Simulate alert notification event
    const alertNotificationHandler = mockWebsocketClient.on.mock.calls.find(
      call => call[0] === 'alert_notification'
    )?.[1] as Function

    // Add 110 alerts
    for (let i = 0; i < 110; i++) {
      act(() => {
        alertNotificationHandler({
          id: `alert-${i}`,
          type: 'price' as const,
          message: `Alert ${i}`,
          severity: 'low' as const,
          timestamp: '2024-01-01T00:00:00Z',
        })
      })
    }

    const updates = result.current.getLatestUpdates()
    expect(updates.alerts).toHaveLength(100)
    expect(updates.alerts[0].id).toBe('alert-109') // Most recent first
  })

  it('should cleanup event listeners on unmount', () => {
    const { unmount } = renderHook(() => useRealTimeData(), { wrapper })

    unmount()

    expect(mockWebsocketClient.off).toHaveBeenCalledWith('connected', expect.any(Function))
    expect(mockWebsocketClient.off).toHaveBeenCalledWith('disconnected', expect.any(Function))
    expect(mockWebsocketClient.off).toHaveBeenCalledWith('error', expect.any(Function))
  })
})
