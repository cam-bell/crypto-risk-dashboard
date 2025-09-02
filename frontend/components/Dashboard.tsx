'use client'

import { useState } from 'react'
import { PortfolioOverview } from './PortfolioOverview'
import { RiskMetrics } from './RiskMetrics'
import { AIInsights } from './AIInsights'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PortfolioOverview />
      case 'risk':
        return <RiskMetrics />
      case 'insights':
        return <AIInsights />
      default:
        return <PortfolioOverview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
