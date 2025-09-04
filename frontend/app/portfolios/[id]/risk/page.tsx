import { PortfolioLayout } from "@/components/layout/PortfolioLayout";
import { RiskMetrics } from "@/components/RiskMetrics";

interface RiskPageProps {
  params: {
    id: string;
  };
}

export default function RiskPage({ params }: RiskPageProps) {
  return (
    <PortfolioLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Risk Analysis
        </h2>
        <RiskMetrics portfolioId={params.id} />
      </div>
    </PortfolioLayout>
  );
}
