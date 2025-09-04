"use client";

import { TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  score: number;
}

interface TrendingSectionProps {
  trending: TrendingCoin[];
}

export function TrendingSection({ trending }: TrendingSectionProps) {
  if (!trending || trending.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <span>Trending Now</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {trending.slice(0, 10).map((coin) => (
            <Badge
              key={coin.id}
              variant="outline"
              className="px-3 py-1 text-sm hover:bg-muted transition-colors cursor-pointer"
            >
              <span className="font-medium">{coin.name}</span>
              <span className="text-muted-foreground ml-1">
                ({coin.symbol.toUpperCase()})
              </span>
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Based on search volume and social media activity
        </p>
      </CardContent>
    </Card>
  );
}
