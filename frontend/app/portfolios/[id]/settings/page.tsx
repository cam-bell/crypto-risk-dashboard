import { PortfolioLayout } from "@/components/layout/PortfolioLayout";
import { Settings } from "lucide-react";

interface SettingsPageProps {
  params: {
    id: string;
  };
}

export default function SettingsPage({ params }: SettingsPageProps) {
  return (
    <PortfolioLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Portfolio Settings
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Portfolio Configuration
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Configure portfolio settings, risk thresholds, and notification
                preferences.
              </p>
              <div className="text-center py-8">
                <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Settings configuration coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortfolioLayout>
  );
}
