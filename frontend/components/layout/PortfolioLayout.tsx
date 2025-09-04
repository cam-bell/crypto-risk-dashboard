"use client";

import { ReactNode } from "react";
import { useParams, usePathname } from "next/navigation";
import { usePortfolios } from "@/hooks/usePortfolios";
import { Breadcrumbs } from "../navigation/Breadcrumbs";
import { PortfolioTabs } from "../navigation/PortfolioTabs";
import { StickyFilterBar } from "../navigation/StickyFilterBar";
import { Header } from "../Header";

interface PortfolioLayoutProps {
  children: ReactNode;
}

export function PortfolioLayout({ children }: PortfolioLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const portfolioId = params.id as string;

  const { portfolios, isLoading } = usePortfolios();
  const portfolio = portfolios.find((p) => p.id === portfolioId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading portfolio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Portfolio Not Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              The portfolio you're looking for doesn't exist.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      {/* Sticky Filter Bar */}
      <StickyFilterBar portfolioId={portfolioId} />

      <main className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Portfolios", href: "/portfolios" },
            { label: portfolio.name, href: `/portfolios/${portfolioId}` },
          ]}
        />

        {/* Portfolio Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {portfolio.name}
          </h1>
          <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
            <span>Portfolio ID: {portfolio.id}</span>
            <span>${portfolio.total_value.toLocaleString()}</span>
            <span>{portfolio.holdings.length} assets</span>
          </div>
        </div>

        {/* Portfolio Tabs */}
        <PortfolioTabs portfolioId={portfolioId} currentPath={pathname} />

        {/* Page Content */}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}
