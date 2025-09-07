"use client";

import { TrendingUp, Search, Upload } from "lucide-react";

interface PortfolioCreateTabsProps {
  activeTab: "discover" | "search" | "import";
  onTabChange: (tab: "discover" | "search" | "import") => void;
}

export function PortfolioCreateTabs({
  activeTab,
  onTabChange,
}: PortfolioCreateTabsProps) {
  const tabs = [
    {
      id: "discover" as const,
      label: "Discover",
      icon: TrendingUp,
      description: "Trending & categories",
    },
    {
      id: "search" as const,
      label: "Search",
      icon: Search,
      description: "Find specific assets",
    },
    {
      id: "import" as const,
      label: "Import",
      icon: Upload,
      description: "CSV & wallet import",
    },
  ];

  return (
    <div className="flex">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-900/20"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
