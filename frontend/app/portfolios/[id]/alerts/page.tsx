import { PortfolioLayout } from "@/components/layout/PortfolioLayout";
import { Bell } from "lucide-react";

interface AlertsPageProps {
  params: {
    id: string;
  };
}

export default function AlertsPage({ params }: AlertsPageProps) {
  return (
    <PortfolioLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Alerts & Notifications
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-8">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No active alerts at the moment
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Alerts will appear here when risk thresholds are exceeded or
              important events occur
            </p>
          </div>
        </div>
      </div>
    </PortfolioLayout>
  );
}
