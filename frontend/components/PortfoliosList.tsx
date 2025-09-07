"use client";

import { useState } from "react";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PortfolioCreateDrawer } from "./portfolio-creation/PortfolioCreateDrawer";
import {
  MetricCardSkeleton,
  PortfolioCardSkeleton,
} from "@/components/ui/Skeleton";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Shield,
  ArrowRight,
  Plus,
} from "lucide-react";
import { getRiskGradientClass, getRiskLabel } from "@/lib/colors";

export function PortfoliosList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    portfolios,
    isLoading: portfoliosLoading,
    getPortfolioStats,
    getTopPerformers,
    getHighestRisk,
    createPortfolioWithHoldingsMutation,
    isCreatingWithHoldings,
    refetch,
  } = usePortfolios();

  const portfolioStats = getPortfolioStats();

  // Mapping from frontend asset IDs to database UUIDs
  const assetIdMapping: Record<string, string> = {
    bitcoin: "93c19608-441b-454c-af58-3d3c3846aa5d",
    ethereum: "3d79dad5-e930-4a17-a035-878031e68a6a",
    cardano: "158c9204-1b0e-4b78-8a39-80ba975a5759",
    // Add more assets as needed - XRP not in database yet
  };

  const handleCreatePortfolio = async (portfolioData: {
    name: string;
    description: string;
    assets: Array<{
      asset_id: string;
      symbol: string;
      name: string;
      quantity: number;
      average_price: number;
    }>;
  }) => {
    console.log(
      "🚀 [PortfoliosList] handleCreatePortfolio called with:",
      portfolioData
    );

    try {
      // Use the new mutation that handles both portfolio and holdings creation
      console.log("📡 [PortfoliosList] Calling createPortfolioWithHoldings...");
      const createdPortfolio =
        await createPortfolioWithHoldingsMutation.mutateAsync(portfolioData);

      console.log(
        "✅ [PortfoliosList] Portfolio with holdings created successfully:",
        createdPortfolio
      );

      // Wait a moment for the cache to update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Force a refetch to ensure we have the latest data
      console.log("🔄 [PortfoliosList] Forcing refetch of portfolios...");
      await refetch();

      // Show success message
      alert(
        `Portfolio "${portfolioData.name}" created successfully with ${portfolioData.assets.length} assets!`
      );
    } catch (error: any) {
      console.error("❌ [PortfoliosList] Error creating portfolio:", error);
      console.error("❌ [PortfoliosList] Error details:", {
        message: error?.message || "Unknown error",
        stack: error?.stack,
        portfolioData,
      });
      alert(`Failed to create portfolio: ${error?.message || "Unknown error"}`);
    }
  };

  // Remove old risk functions as they're now imported from colors.ts

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Portfolios</h1>
              <p className="text-violet-100 text-lg">
                Manage and monitor your cryptocurrency portfolios
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-gradient-secondary hover:shadow-glow-purple transition-all duration-300 px-6 py-3 rounded-xl flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              disabled={isCreatingWithHoldings}
            >
              <Plus className="w-5 h-5" />
              <span>
                {isCreatingWithHoldings ? "Creating..." : "New Portfolio"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Portfolio Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {portfoliosLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <div className="card-gradient group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500/10 to-blue-500/10 backdrop-blur-sm border border-white/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-xl">
                    <Wallet className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total Portfolios
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {portfolios.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-gradient group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-sm border border-white/20 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      ${portfolioStats?.totalValue.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-gradient group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center">
                  <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                    <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Avg Risk Score
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {portfolioStats?.avgRiskScore.toFixed(1) || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Portfolios Grid */}
        {portfoliosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <PortfolioCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {portfolios.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolios.map((portfolio) => {
                  const riskScore = portfolio.risk_score || 5;
                  const riskLevel = getRiskLabel(riskScore);

                  return (
                    <div
                      key={portfolio.id}
                      className="card-glass group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-violet-400/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-violet-500/10 p-6"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      {/* Card content with enhanced styling */}
                      <div className="relative z-10">
                        {/* Header with portfolio name and arrow */}
                        <Link
                          href={`/portfolios/${portfolio.id}`}
                          className="block"
                        >
                          <div className="flex items-start justify-between mb-6">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                                {portfolio.name}
                              </h3>
                              <p className="text-sm text-slate-400">
                                {portfolio.holdings.length} assets
                              </p>
                            </div>
                            <div className="p-2 rounded-full bg-slate-700/50 group-hover:bg-violet-500/20 transition-colors">
                              <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-400 transition-colors" />
                            </div>
                          </div>

                          {/* Metrics with enhanced styling */}
                          <div className="space-y-4">
                            {/* Total Value with large, prominent display */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-400">
                                Total Value
                              </span>
                              <span className="text-2xl font-bold text-white">
                                $
                                {(
                                  portfolio.total_value_usd || 0
                                ).toLocaleString()}
                              </span>
                            </div>

                            {/* Risk Level with gradient badge */}
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-400">
                                Risk Level
                              </span>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskGradientClass(riskScore)}`}
                              >
                                {riskLevel}
                              </span>
                            </div>

                            {/* Performance with trend indicator */}
                            {portfolio.total_profit_loss_percentage !==
                              undefined && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-400">
                                  24h P&L
                                </span>
                                <div className="flex items-center space-x-2">
                                  <TrendingUp
                                    className={`w-4 h-4 ${(portfolio.total_profit_loss_percentage || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                                  />
                                  <span
                                    className={`font-semibold ${(portfolio.total_profit_loss_percentage || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
                                  >
                                    {(portfolio.total_profit_loss_percentage ||
                                      0) >= 0
                                      ? "+"
                                      : ""}
                                    {(
                                      portfolio.total_profit_loss_percentage ||
                                      0
                                    ).toFixed(2)}
                                    %
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Action buttons with enhanced styling */}
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                          <div className="flex space-x-4">
                            <Link
                              href={`/portfolios/${portfolio.id}/risk`}
                              className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-blue-500/20 border border-violet-500/30 text-violet-300 hover:from-violet-500/30 hover:to-blue-500/30 hover:border-violet-400/50 transition-all duration-300 text-sm font-medium"
                            >
                              Risk Analysis
                            </Link>
                            <Link
                              href={`/portfolios/${portfolio.id}/insights`}
                              className="flex-1 text-center px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400/50 transition-all duration-300 text-sm font-medium"
                            >
                              AI Insights
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="card-glass relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 backdrop-blur-xl border border-slate-700/30 p-12 max-w-md mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5"></div>
                  <div className="relative z-10">
                    <div className="p-4 bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                      <Wallet className="w-10 h-10 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      No portfolios yet
                    </h3>
                    <p className="text-slate-400 mb-8">
                      Create your first portfolio to start monitoring your
                      crypto investments
                    </p>
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="btn-gradient-secondary hover:shadow-glow-purple transition-all duration-300 px-8 py-3 rounded-xl font-medium"
                    >
                      Create Portfolio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Portfolio Creation Drawer */}
      <PortfolioCreateDrawer
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePortfolio={handleCreatePortfolio}
        existingPortfolios={portfolios}
      />
    </div>
  );
}
