"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePortfolios } from "@/hooks/usePortfolios";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Portfolio, PortfolioHolding } from "@/types";
import {
  formatCurrency,
  formatPercentage,
  getChangeColor,
  formatCompactNumber,
} from "@/lib/utils";

interface PortfolioOverviewProps {
  portfolioId: string;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export function PortfolioOverview({ portfolioId }: PortfolioOverviewProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [showValues, setShowValues] = useState(true);

  const { portfolios, isLoading } = usePortfolios();
  const portfolio = portfolios.find((p) => p.id === portfolioId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-600">Loading portfolio...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Portfolio Not Found</h3>
        <p className="text-muted-foreground">
          The requested portfolio could not be found
        </p>
      </div>
    );
  }

  const {
    holdings,
    total_value_usd,
    total_invested_usd,
    total_profit_loss_usd,
    total_profit_loss_percentage,
  } = portfolio;

  // Prepare data for pie chart
  const pieChartData = holdings.map((holding, index) => ({
    name: holding.crypto_asset?.symbol || "Unknown",
    value: holding.current_value_usd,
    percentage: (holding.current_value_usd / total_value_usd) * 100, // Calculate allocation percentage
    color: COLORS[index % COLORS.length],
    asset: holding.crypto_asset,
  }));

  // Sort holdings by value (descending)
  const sortedHoldings = [...holdings].sort(
    (a, b) => b.current_value_usd - a.current_value_usd
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Value: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Allocation: {formatPercentage(data.percentage)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Portfolio summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_value_usd)}
            </div>
            <p className="text-xs text-muted-foreground">
              {holdings.length} asset{holdings.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(total_invested_usd)}
            </div>
            <p className="text-xs text-muted-foreground">Average cost basis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getChangeColor(total_profit_loss_percentage)}`}
            >
              {formatCurrency(total_profit_loss_usd)}
            </div>
            <p
              className={`text-xs ${getChangeColor(total_profit_loss_percentage)}`}
            >
              {total_profit_loss_usd >= 0 ? "+" : ""}
              {formatPercentage(total_profit_loss_percentage)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "chart" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("chart")}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Chart View
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Table View
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowValues(!showValues)}
          >
            {showValues ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart view */}
      {viewMode === "chart" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        showValues
                          ? `${name} ${formatPercentage(percentage)}`
                          : name
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top holdings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Holdings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedHoldings.slice(0, 5).map((holding, index) => (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <div className="flex items-center space-x-2">
                        <img
                          src={holding.crypto_asset?.logo_url || ""}
                          alt={holding.crypto_asset?.name || "Unknown"}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <p className="font-medium">
                            {holding.crypto_asset?.symbol || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatCompactNumber(holding.quantity)}{" "}
                            {holding.crypto_asset?.symbol || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(holding.current_value_usd)}
                      </p>
                      <p
                        className={`text-sm ${getChangeColor(holding.profit_loss_percentage)}`}
                      >
                        {holding.profit_loss_percentage >= 0 ? "+" : ""}
                        {formatPercentage(holding.profit_loss_percentage)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table view */}
      {viewMode === "table" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Holdings Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Asset</th>
                    <th className="text-right py-3 px-4 font-medium">
                      Quantity
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Avg Price
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Current Price
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Current Value
                    </th>
                    <th className="text-right py-3 px-4 font-medium">P&L</th>
                    <th className="text-right py-3 px-4 font-medium">
                      Allocation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHoldings.map((holding) => (
                    <tr key={holding.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={holding.crypto_asset?.logo_url || ""}
                            alt={holding.crypto_asset?.name || "Unknown"}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium">
                              {holding.crypto_asset?.symbol || "Unknown"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {holding.crypto_asset?.name || "Unknown"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCompactNumber(holding.quantity)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(holding.average_buy_price_usd)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(
                          holding.crypto_asset?.current_price_usd || 0
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(holding.current_value_usd)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className={`${getChangeColor(holding.profit_loss_percentage)}`}
                        >
                          <p className="font-medium">
                            {formatCurrency(holding.profit_loss_usd)}
                          </p>
                          <p className="text-sm">
                            {holding.profit_loss_percentage >= 0 ? "+" : ""}
                            {formatPercentage(holding.profit_loss_percentage)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatPercentage(
                          (holding.current_value_usd / total_value_usd) * 100
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
