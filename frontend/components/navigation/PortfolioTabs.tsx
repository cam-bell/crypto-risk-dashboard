"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Brain, Wallet, Bell, Settings } from "lucide-react";

interface PortfolioTabsProps {
  portfolioId: string;
  currentPath: string;
}

export function PortfolioTabs({
  portfolioId,
  currentPath,
}: PortfolioTabsProps) {
  const tabs = [
    {
      id: "overview",
      name: "Overview",
      href: `/portfolios/${portfolioId}`,
      icon: Wallet,
    },
    {
      id: "risk",
      name: "Risk Analysis",
      href: `/portfolios/${portfolioId}/risk`,
      icon: BarChart3,
    },
    {
      id: "insights",
      name: "AI Insights",
      href: `/portfolios/${portfolioId}/insights`,
      icon: Brain,
    },
    {
      id: "alerts",
      name: "Alerts",
      href: `/portfolios/${portfolioId}/alerts`,
      icon: Bell,
    },
    {
      id: "settings",
      name: "Settings",
      href: `/portfolios/${portfolioId}/settings`,
      icon: Settings,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/portfolios/${portfolioId}`) {
      return currentPath === href;
    }
    return currentPath.startsWith(href);
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="flex space-x-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex items-center space-x-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                active
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
