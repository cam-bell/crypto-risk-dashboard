import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700",
        "bg-[length:200%_100%] animate-gradient-shift",
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

// Metric Card Skeletons
export function MetricCardSkeleton() {
  return (
    <div className="card-gradient group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur-sm border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      <div className="relative z-10 flex items-center">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="ml-4 flex-1">
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-16 h-8" />
        </div>
      </div>
    </div>
  );
}

export function MetricCardWithTrendSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="ml-4 flex-1">
          <Skeleton className="w-24 h-4 mb-2" />
          <Skeleton className="w-16 h-8 mb-3" />
          <div className="flex items-center">
            <Skeleton className="w-4 h-4 mr-2" />
            <Skeleton className="w-16 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Portfolio Card Skeletons
export function PortfolioCardSkeleton() {
  return (
    <div className="card-glass group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-violet-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10 p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <Skeleton className="w-32 h-5 mb-2" />
            <Skeleton className="w-20 h-4" />
          </div>
          <div className="p-2 rounded-full bg-slate-700/50">
            <Skeleton className="w-5 h-5" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-24 h-6" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="w-16 h-6 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="w-16 h-4" />
            <Skeleton className="w-20 h-4" />
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex space-x-4">
            <Skeleton className="flex-1 h-8 rounded-lg" />
            <Skeleton className="flex-1 h-8 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Chart and Analysis Skeletons
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-20 h-8 rounded-md" />
      </div>
      <Skeleton className="w-full" height={height} />
    </div>
  );
}

export function HeatmapSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <Skeleton className="w-40 h-6 mb-4" />
      <div className="grid grid-cols-5 gap-1">
        {Array.from({ length: 25 }).map((_, i) => (
          <Skeleton key={i} className="w-8 h-8 rounded" />
        ))}
      </div>
    </div>
  );
}

export function CorrelationMatrixSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <Skeleton className="w-48 h-6 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex space-x-2">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="w-12 h-8 rounded" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VolatilityChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-32 h-6" />
        <div className="flex space-x-2">
          <Skeleton className="w-16 h-8 rounded-md" />
          <Skeleton className="w-16 h-8 rounded-md" />
        </div>
      </div>
      <Skeleton className="w-full h-48" />
      <div className="flex justify-between mt-4">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
    </div>
  );
}

// List and Table Skeletons
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div>
              <Skeleton className="w-24 h-4 mb-1" />
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
          <Skeleton className="w-20 h-4" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-4" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="w-20 h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Skeleton
export function EmptyStateSkeleton() {
  return (
    <div className="text-center py-12">
      <Skeleton className="w-16 h-16 mx-auto mb-4 rounded-full" />
      <Skeleton className="w-48 h-6 mx-auto mb-2" />
      <Skeleton className="w-80 h-4 mx-auto mb-6" />
      <Skeleton className="w-32 h-10 mx-auto rounded-lg" />
    </div>
  );
}

// Loading States
export function LoadingSpinner({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-slate-300 border-t-violet-600 dark:border-slate-600 dark:border-t-violet-400",
        sizeClasses[size],
        className
      )}
    />
  );
}

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex space-x-1", className)}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
