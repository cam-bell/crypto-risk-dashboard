"use client";

import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MarketsChart } from "./MarketsChart";
import { MarketsTable } from "./MarketsTable";
import { TrendingSection } from "./TrendingSection";
import { MarketsSkeleton } from "./MarketsSkeleton";

interface MarketsData {
  global: {
    market_cap_usd: number;
    volume_24h_usd: number;
    btc_dominance: number;
    eth_dominance: number;
    coins: number;
    exchanges: number;
    market_cap_change_24h_pct: number;
  };
  top100: Array<{
    id: string;
    symbol: string;
    name: string;
    image: string;
    price: number;
    change_1h: number;
    change_24h: number;
    change_7d: number;
    market_cap: number;
    volume_24h: number;
    circulating_supply: number;
    sparkline_7d: number[];
  }>;
  trending: Array<{
    id: string;
    symbol: string;
    name: string;
    score: number;
  }>;
  partial?: boolean;
}

export function MarketsOverview() {
  const [data, setData] = useState<MarketsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastUpdated = useMemo(() => new Date(), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/markets/overview");

        if (!response.ok) {
          throw new Error(`Failed to fetch markets data: ${response.status}`);
        }

        const marketsData = await response.json();
        setData(marketsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching markets data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        // Set fallback data
        setData({
          global: {
            market_cap_usd: 0,
            volume_24h_usd: 0,
            btc_dominance: 0,
            eth_dominance: 0,
            coins: 0,
            exchanges: 0,
            market_cap_change_24h_pct: 0,
          },
          top100: [],
          trending: [],
          partial: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <MarketsSkeleton />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load markets data</p>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-3 w-3" />;
    if (value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getChangeVariant = (
    value: number
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (value > 0) return "default";
    if (value < 0) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-8">
      {/* Header with last updated */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Market Overview</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {format(lastUpdated, "MMM dd, yyyy 'at' HH:mm:ss")}
          </p>
        </div>
        {data.partial && (
          <Badge variant="outline" className="text-amber-600 border-amber-600">
            Partial Data
          </Badge>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Global Market Cap
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {getChangeIcon(data.global.market_cap_change_24h_pct)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.global.market_cap_usd)}
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <Badge
                variant={getChangeVariant(
                  data.global.market_cap_change_24h_pct
                )}
                size="sm"
              >
                {formatPercentage(data.global.market_cap_change_24h_pct)}
              </Badge>
              <span className="text-xs text-muted-foreground">24h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.global.volume_24h_usd)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {data.global.exchanges} exchanges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BTC Dominance</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.global.btc_dominance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Market share</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ETH Dominance</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.global.eth_dominance.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-2">Market share</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Cap Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Market Cap Trend (7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketsChart data={data.top100} />
        </CardContent>
      </Card>

      {/* Trending Section */}
      {data.trending && data.trending.length > 0 && (
        <TrendingSection trending={data.trending} />
      )}

      {/* Top 100 Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 100 Cryptocurrencies</CardTitle>
        </CardHeader>
        <CardContent>
          <MarketsTable data={data.top100} />
        </CardContent>
      </Card>
    </div>
  );
}
