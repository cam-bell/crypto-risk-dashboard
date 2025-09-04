import { MarketsOverview } from "./components/MarketsOverview";
import { MarketsSkeleton } from "./components/MarketsSkeleton";

// Revalidate every 60 seconds
export const revalidate = 60;

export default function MarketsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Markets Overview</h1>
        <p className="text-muted-foreground mt-2">
          Real-time cryptocurrency market data and analytics
        </p>
      </div>

      <MarketsOverview />
    </div>
  );
}
