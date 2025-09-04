export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  volume_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number | null;
  image: string;
  last_updated: string;
}

export interface PortfolioHolding {
  id: string;
  asset_id: string;
  asset: CryptoAsset;
  quantity: number;
  average_price: number;
  current_value: number;
  total_cost: number;
  unrealized_pnl: number;
  unrealized_pnl_percentage: number;
  allocation_percentage: number;
  risk_score: number;
  last_updated: string;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  total_value: number;
  total_cost: number;
  total_pnl: number;
  total_pnl_percentage: number;
  risk_score: number;
  holdings: PortfolioHolding[];
  created_at: string;
  updated_at: string;
}

export interface RiskMetrics {
  id: string;
  portfolio_id: string;
  var_95: number;
  var_99: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  volatility: number;
  beta: number;
  correlation_matrix: number[][];
  risk_decomposition: {
    asset: string;
    contribution: number;
    percentage: number;
  }[];
  calculated_at: string;
}

export interface AIInsight {
  id: string;
  portfolio_id: string;
  title: string;
  summary: string;
  detailed_analysis: string;
  recommendations: string[];
  risk_factors: string[];
  market_sentiment: "bullish" | "bearish" | "neutral";
  confidence_score: number;
  generated_at: string;
  expires_at: string;
}

export interface Alert {
  id: string;
  portfolio_id: string;
  type: "price" | "risk" | "pnl" | "allocation";
  condition: "above" | "below" | "equals";
  threshold: number;
  asset_id?: string;
  message: string;
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  currency: string;
  risk_tolerance: "low" | "medium" | "high";
  notification_preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  chart_preferences: {
    default_timeframe: string;
    show_grid: boolean;
    show_legend: boolean;
  };
  updated_at: string;
}

export interface PriceHistory {
  id: string;
  asset_id: string;
  timestamp: string;
  price: number;
  volume: number;
  market_cap: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface HeatmapData {
  x: string;
  y: string;
  value: number;
  color: string;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface SortConfig {
  key: string;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  key: string;
  value: string | number | boolean;
  operator: "equals" | "contains" | "greater" | "less" | "between";
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  retry?: () => void;
}

export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "select"
    | "textarea"
    | "checkbox";
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  options?: { value: string; label: string }[];
}

export interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface Theme {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
}
