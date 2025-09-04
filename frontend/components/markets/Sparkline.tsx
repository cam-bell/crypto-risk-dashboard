"use client";

import { useMemo } from "react";
import { LineChart, Line } from "recharts";
import { getPctHexColor } from "@/lib/colors";

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  width = 64,
  height = 32,
  className = "",
}: SparklineProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((value, index) => ({
      index,
      value,
    }));
  }, [data]);

  const strokeColor = useMemo(() => {
    if (data.length < 2) return "#6b7280"; // gray-500

    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    const change = ((lastValue - firstValue) / firstValue) * 100;

    return getPctHexColor(change);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div
        className={`flex items-center justify-center text-muted-foreground ${className}`}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        —
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <LineChart width={width} height={height} data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
}
