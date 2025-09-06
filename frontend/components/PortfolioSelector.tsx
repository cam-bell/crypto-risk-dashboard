"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePortfolios } from "@/hooks/usePortfolios";
import { ChevronDown, Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PortfolioSelectorProps {
  currentPortfolioId?: string;
  onPortfolioChange?: (portfolioId: string) => void;
}

export function PortfolioSelector({
  currentPortfolioId,
  onPortfolioChange,
}: PortfolioSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { portfolios, isLoading } = usePortfolios();

  const currentPortfolio = portfolios.find((p) => p.id === currentPortfolioId);

  const handlePortfolioSelect = (portfolioId: string) => {
    if (onPortfolioChange) {
      onPortfolioChange(portfolioId);
    }
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground">
        <Wallet className="h-4 w-4" />
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
      >
        <Wallet className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentPortfolio ? currentPortfolio.name : "Select Portfolio"}
        </span>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-50">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Portfolios
            </div>

            {portfolios.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No portfolios found
              </div>
            ) : (
              <div className="space-y-1">
                {portfolios.map((portfolio) => (
                  <button
                    key={portfolio.id}
                    onClick={() => handlePortfolioSelect(portfolio.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      currentPortfolioId === portfolio.id
                        ? "bg-accent text-accent-foreground"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{portfolio.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ${(portfolio.total_value_usd || 0).toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-border mt-2 pt-2">
              <Link
                href="/portfolios"
                className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Plus className="h-4 w-4" />
                <span>Create New Portfolio</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
