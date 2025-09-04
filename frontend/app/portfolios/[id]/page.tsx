import { PortfolioLayout } from "@/components/layout/PortfolioLayout";
import { PortfolioOverview } from "@/components/PortfolioOverview";

interface PortfolioPageProps {
  params: {
    id: string;
  };
}

export default function PortfolioPage({ params }: PortfolioPageProps) {
  return (
    <PortfolioLayout>
      <PortfolioOverview portfolioId={params.id} />
    </PortfolioLayout>
  );
}
