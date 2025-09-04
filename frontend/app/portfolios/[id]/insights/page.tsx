import { PortfolioLayout } from "@/components/layout/PortfolioLayout";
import { AIInsights } from "@/components/AIInsights";

interface InsightsPageProps {
  params: {
    id: string;
  };
}

export default function InsightsPage({ params }: InsightsPageProps) {
  return (
    <PortfolioLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          AI Insights
        </h2>
        <AIInsights portfolioId={params.id} />
      </div>
    </PortfolioLayout>
  );
}
