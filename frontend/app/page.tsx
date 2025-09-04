import { Dashboard } from '@/components/Dashboard'
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto">
        <Dashboard />
      </main>
    </div>
  )
}
