import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatPct, formatDominance } from "@/lib/format";
import { getPctBadgeVariant } from "@/lib/colors";

interface KPICardProps {
  title: string;
  value: number;
  change?: number;
  changeLabel?: string;
  format?: "currency" | "percentage" | "dominance";
  icon?: React.ReactNode;
  description?: string;
}

export function KPICard({
  title,
  value,
  change,
  changeLabel = "24h",
  format = "currency",
  icon,
  description,
}: KPICardProps) {
  const getChangeIcon = (changeValue: number) => {
    if (changeValue > 0) return <TrendingUp className="h-3 w-3" />;
    if (changeValue < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatCurrency(val);
      case "percentage":
        return formatDominance(val);
      case "dominance":
        return formatDominance(val);
      default:
        return formatCurrency(val);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant={getPctBadgeVariant(change)} size="sm">
              {formatPct(change)}
            </Badge>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
