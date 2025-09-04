import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

/**
 * Skeleton for KPI cards
 */
export function KPICardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for market cap chart
 */
export function MarketCapChartSkeleton({ height = 220 }: { height?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="w-full" style={{ height: `${height}px` }} />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for trending section
 */
export function TrendingSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-3 w-64 mt-3" />
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for table header
 */
export function TableHeaderSkeleton({ columns = 10 }: { columns?: number }) {
  return (
    <div className="bg-muted/50 px-4 py-3 border-b">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-16" />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for table row
 */
export function TableRowSkeleton({ columns = 10 }: { columns?: number }) {
  return (
    <div className="px-4 py-3 border-b">
      <div className="flex space-x-4 items-center">
        <Skeleton className="h-4 w-8" />
        <div className="flex items-center space-x-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

/**
 * Skeleton for the entire table
 */
export function Top100TableSkeleton({
  rows = 10,
  columns = 10,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <TableHeaderSkeleton columns={columns} />
          <div className="divide-y">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-16" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton for sparkline
 */
export function SparklineSkeleton({
  width = 64,
  height = 32,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Skeleton
      className="rounded"
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  );
}

/**
 * Complete markets page skeleton
 */
export function MarketsPageSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      {/* KPI Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Chart skeleton */}
      <MarketCapChartSkeleton />

      {/* Trending skeleton */}
      <TrendingSkeleton />

      {/* Table skeleton */}
      <Top100TableSkeleton />
    </div>
  );
}
