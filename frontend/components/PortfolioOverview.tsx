"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  EyeOff,
  MoreHorizontal,
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
  portfolio?: Portfolio | null;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export function PortfolioOverview({ portfolio }: PortfolioOverviewProps) {
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [showValues, setShowValues] = useState(true);

  if (!portfolio) {
    return (
      <div className="text-center py-8">
        <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Portfolio Selected</h3>
        <p className="text-muted-foreground">
          Please select a portfolio to view its overview
        </p>
      </div>
    );
  }

  const { holdings, total_value, total_cost, total_pnl, total_pnl_percentage } =
    portfolio;

  // Prepare data for pie chart
  const pieChartData = holdings.map((holding, index) => ({
    name: holding.asset.symbol,
    value: holding.current_value,
    percentage: holding.allocation_percentage,
    color: COLORS[index % COLORS.length],
    asset: holding.asset,
  }));

  // Sort holdings by value (descending)
  const sortedHoldings = [...holdings].sort(
    (a, b) => b.current_value - a.current_value
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
              {formatCurrency(total_value)}
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
              {formatCurrency(total_cost)}
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
              className={`text-2xl font-bold ${getChangeColor(total_pnl_percentage)}`}
            >
              {formatCurrency(total_pnl)}
            </div>
            <p className={`text-xs ${getChangeColor(total_pnl_percentage)}`}>
              {total_pnl >= 0 ? "+" : ""}
              {formatPercentage(total_pnl_percentage)}
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
                          src={holding.asset.image}
                          alt={holding.asset.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <p className="font-medium">{holding.asset.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCompactNumber(holding.quantity)}{" "}
                            {holding.asset.symbol}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(holding.current_value)}
                      </p>
                      <p
                        className={`text-sm ${getChangeColor(holding.unrealized_pnl_percentage)}`}
                      >
                        {holding.unrealized_pnl_percentage >= 0 ? "+" : ""}
                        {formatPercentage(holding.unrealized_pnl_percentage)}
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
                            src={holding.asset.image}
                            alt={holding.asset.name}
                            className="w-8 h-8 rounded-full"
                          />
                          <div>
                            <p className="font-medium">
                              {holding.asset.symbol}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {holding.asset.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCompactNumber(holding.quantity)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(holding.average_price)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatCurrency(holding.asset.current_price)}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(holding.current_value)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div
                          className={`${getChangeColor(holding.unrealized_pnl_percentage)}`}
                        >
                          <p className="font-medium">
                            {formatCurrency(holding.unrealized_pnl)}
                          </p>
                          <p className="text-sm">
                            {holding.unrealized_pnl_percentage >= 0 ? "+" : ""}
                            {formatPercentage(
                              holding.unrealized_pnl_percentage
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {formatPercentage(holding.allocation_percentage)}
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
