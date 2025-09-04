"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Settings,
  Plus,
  Filter,
  TrendingUp
} from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Alerts & Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor your portfolio with intelligent alerts and notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Alert</span>
          </Button>
        </div>
      </div>

      {/* Alert Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Alerts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolved Today
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Alerts
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                0
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Alerts Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Set up alerts to monitor your portfolio performance, risk levels, and market conditions.
          </p>
          <Button className="flex items-center space-x-2 mx-auto">
            <Plus className="h-4 w-4" />
            <span>Create Your First Alert</span>
          </Button>
        </div>
      </Card>

      {/* Alert Types Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Price Alerts
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get notified when your assets reach target prices or experience significant movements.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            • Price targets<br/>
            • Percentage changes<br/>
            • Volume spikes
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Risk Alerts
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Monitor portfolio risk levels and get alerts when risk thresholds are exceeded.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            • Risk score changes<br/>
            • Volatility spikes<br/>
            • Drawdown limits
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Portfolio Alerts
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Track portfolio performance, rebalancing opportunities, and allocation changes.
          </p>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            • Performance milestones<br/>
            • Rebalancing needs<br/>
            • Allocation drift
          </div>
        </Card>
      </div>

      {/* Coming Soon Features */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Coming Soon
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Advanced Alert Types</h4>
            <ul className="space-y-1">
              <li>• Technical indicator alerts</li>
              <li>• Correlation-based alerts</li>
              <li>• Market sentiment alerts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notification Channels</h4>
            <ul className="space-y-1">
              <li>• Email notifications</li>
              <li>• Push notifications</li>
              <li>• SMS alerts</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
