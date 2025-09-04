"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CoinData {
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
}

interface MarketsChartProps {
  data: CoinData[];
}

interface ChartDataPoint {
  day: string;
  marketCap: number;
  volume: number;
}

export function MarketsChart({ data }: MarketsChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Create a pseudo-series from averaged top 100 sparklines
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const chartPoints: ChartDataPoint[] = [];

    // Calculate average market cap trend from sparklines
    for (let i = 0; i < 7; i++) {
      let totalMarketCap = 0;
      let totalVolume = 0;
      let validCoins = 0;

      data.forEach((coin) => {
        if (coin.sparkline_7d && coin.sparkline_7d.length > i) {
          const price = coin.sparkline_7d[i];
          const marketCap = price * coin.circulating_supply;
          totalMarketCap += marketCap;
          totalVolume += coin.volume_24h;
          validCoins++;
        }
      });

      if (validCoins > 0) {
        chartPoints.push({
          day: days[i],
          marketCap: totalMarketCap / validCoins,
          volume: totalVolume / validCoins,
        });
      }
    }

    return chartPoints;
  }, [data]);

  const formatValue = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return `$${value.toFixed(0)}`;
  };

  if (chartData.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-muted-foreground">
        No chart data available
      </div>
    );
  }

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="marketCapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            className="text-xs"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            className="text-xs"
            tickFormatter={formatValue}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-3">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-blue-600">
                      Market Cap: {formatValue(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="marketCap"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#marketCapGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
