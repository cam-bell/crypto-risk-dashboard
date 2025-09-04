"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback } from "react";

export function usePortfolioNavigation() {
  const router = useRouter();
  const params = useParams();

  const navigateToPortfolio = useCallback(
    (portfolioId: string, tab?: string) => {
      if (tab) {
        router.push(`/portfolios/${portfolioId}/${tab}`);
      } else {
        router.push(`/portfolios/${portfolioId}`);
      }
    },
    [router]
  );

  const navigateToTab = useCallback(
    (tab: string) => {
      const portfolioId = params.id as string;
      if (portfolioId) {
        if (tab === "overview") {
          router.push(`/portfolios/${portfolioId}`);
        } else {
          router.push(`/portfolios/${portfolioId}/${tab}`);
        }
      }
    },
    [router, params.id]
  );

  const getCurrentTab = useCallback(() => {
    const pathname = window.location.pathname;
    const portfolioId = params.id as string;

    if (pathname === `/portfolios/${portfolioId}`) {
      return "overview";
    }

    const tabMatch = pathname.match(`/portfolios/${portfolioId}/(.+)$`);
    return tabMatch ? tabMatch[1] : "overview";
  }, [params.id]);

  const getCurrentPortfolioId = useCallback(() => {
    return params.id as string;
  }, [params.id]);

  return {
    navigateToPortfolio,
    navigateToTab,
    getCurrentTab,
    getCurrentPortfolioId,
    currentPortfolioId: params.id as string,
  };
}
