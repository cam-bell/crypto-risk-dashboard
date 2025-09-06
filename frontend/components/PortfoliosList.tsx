"use client";

import { useState } from "react";
import { usePortfolios } from "@/hooks/usePortfolios";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PortfolioCreationModal } from "./PortfolioCreationModal";
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

export function PortfoliosList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    portfolios,
    isLoading: portfoliosLoading,
    getPortfolioStats,
    getTopPerformers,
    getHighestRisk,
    createPortfolioMutation,
    isCreating,
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
    console.log("🚀 handleCreatePortfolio called with:", portfolioData);
    try {
      // Create the portfolio using the API
      console.log("📡 Calling createPortfolio...");
      const createdPortfolio = await createPortfolioMutation.mutateAsync({
        name: portfolioData.name,
        description: portfolioData.description,
        // Backend will set these values automatically
      });

      console.log("✅ Portfolio created successfully:", createdPortfolio);

      // Create holdings for each asset
      for (const asset of portfolioData.assets) {
        const cryptoAssetId = assetIdMapping[asset.asset_id];

        if (!cryptoAssetId) {
          console.warn(`Asset ID ${asset.asset_id} not found in mapping`);
          continue;
        }

        try {
          console.log(`🔄 Adding holding for ${asset.name}:`, {
            portfolioId: createdPortfolio.id,
            cryptoAssetId,
            quantity: asset.quantity,
            average_price: asset.average_price,
          });

          // We need to get the holdings hook for this portfolio
          // For now, we'll use the API client directly
          const { apiClient } = await import("@/lib/api");
          const holdingResult = await apiClient.addPortfolioHolding(
            createdPortfolio.id,
            {
              crypto_asset_id: cryptoAssetId,
              quantity: asset.quantity,
              average_buy_price_usd: asset.average_price,
              notes: `Added via portfolio creation`,
            }
          );

          console.log(
            `✅ Holding created successfully for ${asset.name}:`,
            holdingResult
          );
        } catch (holdingError) {
          console.error(
            `❌ Error creating holding for ${asset.name}:`,
            holdingError
          );
        }
      }

      // Invalidate cache to refresh portfolio data with holdings
      console.log("🔄 Invalidating React Query cache...");
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
      console.log("✅ Cache invalidated, should trigger refetch");

      // Show success message
      alert(
        `Portfolio "${portfolioData.name}" created successfully with ${portfolioData.assets.length} assets!`
      );
    } catch (error) {
      console.error("❌ Outer catch - Error creating portfolio:", error);
      alert("Failed to create portfolio. Please try again.");
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return "text-green-600 bg-green-100 dark:bg-green-900";
    if (riskScore <= 6)
      return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900";
    if (riskScore <= 8)
      return "text-orange-600 bg-orange-100 dark:bg-orange-900";
    return "text-red-600 bg-red-100 dark:bg-red-900";
  };

  const getRiskLabel = (riskScore: number) => {
    if (riskScore <= 3) return "Low";
    if (riskScore <= 6) return "Medium";
    if (riskScore <= 8) return "High";
    return "Critical";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Portfolios
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage and monitor your cryptocurrency portfolios
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {portfoliosLoading ? (
            <>
              <MetricCardSkeleton />
              <MetricCardSkeleton />
              <MetricCardSkeleton />
            </>
          ) : (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Portfolios
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {portfolios.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${portfolioStats?.totalValue.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                    <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Avg Risk Score
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
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
                    <Link
                      key={portfolio.id}
                      href={`/portfolios/${portfolio.id}`}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {portfolio.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {portfolio.holdings.length} assets
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>

                      <div className="space-y-3">
                        {/* Portfolio Value */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Total Value
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            ${(portfolio.total_value_usd || 0).toLocaleString()}
                          </span>
                        </div>

                        {/* Risk Score */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            Risk Level
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                              riskScore
                            )}`}
                          >
                            {riskLevel}
                          </span>
                        </div>

                        {/* Performance */}
                        {portfolio.total_profit_loss_percentage !==
                          undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              24h P&L
                            </span>
                            <span
                              className={`font-semibold ${
                                (portfolio.total_profit_loss_percentage || 0) >=
                                0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {(portfolio.total_profit_loss_percentage || 0) >=
                              0
                                ? "+"
                                : ""}
                              {(
                                portfolio.total_profit_loss_percentage || 0
                              ).toFixed(2)}
                              %
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex space-x-2">
                          <Link
                            href={`/portfolios/${portfolio.id}/risk`}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Risk Analysis
                          </Link>
                          <span className="text-gray-300">•</span>
                          <Link
                            href={`/portfolios/${portfolio.id}/insights`}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            onClick={(e) => e.stopPropagation()}
                          >
                            AI Insights
                          </Link>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No portfolios yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Create your first portfolio to start monitoring your crypto
                  investments
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  Create Portfolio
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Portfolio Creation Modal */}
      <PortfolioCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePortfolio={handleCreatePortfolio}
      />
    </div>
  );
}
