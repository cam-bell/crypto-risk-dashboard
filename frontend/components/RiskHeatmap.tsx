"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface RiskHeatmapProps {
  correlationMatrix?: {
    correlation_matrix: Record<string, Record<string, number>>;
    assets: string[];
  };
  isLoading?: boolean;
  className?: string;
  isDemo?: boolean;
}

interface HeatmapCellProps {
  value: number;
  asset1: string;
  asset2: string;
  isDiagonal: boolean;
}

function HeatmapCell({ value, asset1, asset2, isDiagonal }: HeatmapCellProps) {
  const getColorIntensity = (correlation: number) => {
    if (isDiagonal) return "bg-gray-200 dark:bg-gray-700";

    const absValue = Math.abs(correlation);
    if (absValue >= 0.8) return "bg-red-500";
    if (absValue >= 0.6) return "bg-orange-400";
    if (absValue >= 0.4) return "bg-yellow-400";
    if (absValue >= 0.2) return "bg-green-400";
    return "bg-green-200 dark:bg-green-800";
  };

  const getTextColor = (correlation: number) => {
    if (isDiagonal) return "text-gray-500 dark:text-gray-400";

    const absValue = Math.abs(correlation);
    if (absValue >= 0.6) return "text-white";
    return "text-gray-900 dark:text-white";
  };

  return (
    <div
      className={cn(
        "w-12 h-12 flex items-center justify-center text-xs font-medium rounded border",
        getColorIntensity(value),
        getTextColor(value)
      )}
      title={`${asset1} vs ${asset2}: ${value.toFixed(3)}`}
    >
      {isDiagonal ? "1.0" : value.toFixed(2)}
    </div>
  );
}

export function RiskHeatmap({
  correlationMatrix,
  isLoading,
  className,
  isDemo = false,
}: RiskHeatmapProps) {
  const heatmapData = useMemo(() => {
    if (!correlationMatrix?.correlation_matrix || !correlationMatrix?.assets) {
      return null;
    }

    const { correlation_matrix, assets } = correlationMatrix;
    const matrix = assets.map((asset1) =>
      assets.map((asset2) => ({
        value: correlation_matrix[asset1]?.[asset2] || 0,
        asset1,
        asset2,
        isDiagonal: asset1 === asset2,
      }))
    );

    return { matrix, assets };
  }, [correlationMatrix]);

  if (isLoading && !isDemo) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Correlation Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Loading correlation data...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!heatmapData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">Correlation Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">No Correlation Data</h3>
            <p className="text-sm text-muted-foreground">
              Run risk analysis to generate correlation matrix
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { matrix, assets } = heatmapData;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Correlation Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Asset correlation matrix showing relationships between portfolio
          holdings
        </p>
        {isDemo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-300">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs font-medium">
                Demo correlation data - Create a portfolio for personalized
                analysis
              </span>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Header row with asset names */}
              <div className="flex mb-2">
                <div className="w-20 flex-shrink-0"></div>
                {assets.map((asset) => (
                  <div
                    key={asset}
                    className="w-12 text-xs font-medium text-center text-muted-foreground"
                  >
                    {asset.toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Heatmap rows */}
              {matrix.map((row, rowIndex) => (
                <div key={assets[rowIndex]} className="flex items-center mb-1">
                  {/* Asset name */}
                  <div className="w-20 flex-shrink-0 text-xs font-medium text-muted-foreground text-right pr-2">
                    {assets[rowIndex].toUpperCase()}
                  </div>

                  {/* Correlation values */}
                  {row.map((cell, colIndex) => (
                    <HeatmapCell
                      key={`${cell.asset1}-${cell.asset2}`}
                      value={cell.value}
                      asset1={cell.asset1}
                      asset2={cell.asset2}
                      isDiagonal={cell.isDiagonal}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Correlation Strength</h4>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Strong (≥0.8)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span>Moderate (≥0.6)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span>Weak (≥0.4)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span>Very Weak (≥0.2)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-200 dark:bg-green-800 rounded"></div>
                <span>Minimal (&lt;0.2)</span>
              </div>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Correlation
              </p>
              <p className="text-lg font-semibold">
                {matrix
                  .flat()
                  .filter((cell) => !cell.isDiagonal)
                  .reduce((sum, cell) => sum + Math.abs(cell.value), 0) /
                  (assets.length * (assets.length - 1)).toFixed(3)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                High Correlation Pairs
              </p>
              <p className="text-lg font-semibold">
                {
                  matrix
                    .flat()
                    .filter(
                      (cell) => !cell.isDiagonal && Math.abs(cell.value) >= 0.7
                    ).length
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
