'use client'

import { useEffect, useState } from 'react'
import { Dashboard } from '@/components/Dashboard'
import { TransactionForm } from '@/components/TransactionForm'
import { BudgetManager } from '@/components/BudgetManager'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { InstallPrompt } from '@/components/InstallPrompt'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { initializeDatabase } from '@/lib/db'
import { 
  LayoutDashboard, 
  PlusCircle, 
  Target,
  Menu,
  Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export default function Home() {
  const [initError, setInitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    let isMounted = true

    void initializeDatabase()
      .catch((error) => {
        console.error('App initialization failed:', error)
        if (isMounted) {
          setInitError('Storage initialization failed. The app is running in limited mode.')
        }
      })
      .finally(() => {
        return
      })

    return () => {
      isMounted = false
    }
  }, [])

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/20">
          B
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            BudgetPro
          </h1>
          <p className="text-xs text-slate-500">Offline-First PWA</p>
        </div>
      </div>

      <nav className="space-y-2">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${
            activeTab === 'dashboard' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard className="h-5 w-5" />
          Dashboard
        </Button>
        <Button
          variant={activeTab === 'transactions' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${
            activeTab === 'transactions' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          onClick={() => setActiveTab('transactions')}
        >
          <PlusCircle className="h-5 w-5" />
          Add Transaction
        </Button>
        <Button
          variant={activeTab === 'budgets' ? 'default' : 'ghost'}
          className={`w-full justify-start gap-3 ${
            activeTab === 'budgets' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          onClick={() => setActiveTab('budgets')}
        >
          <Target className="h-5 w-5" />
          Budgets
        </Button>
      </nav>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-slate-800 bg-slate-900/50 p-6 sticky top-0 h-screen">
        <NavContent />

        <div className="mt-auto pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-600 mt-2">v1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
                B
              </div>
              <span className="font-bold text-lg">BudgetPro</span>
            </div>

            <div className="flex items-center gap-2">
              <OfflineIndicator />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 bg-slate-900 border-slate-800 p-6">
                  <NavContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md h-16 items-center px-8">
          <div className="flex-1" />
          <OfflineIndicator />
        </header>

        {/* Content */}
        <div className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
          {initError && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              {initError}
            </div>
          )}

          <InstallPrompt />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="hidden lg:grid w-full grid-cols-3 bg-slate-900/50 border border-slate-800">
              <TabsTrigger value="dashboard" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="transactions" className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="budgets" className="gap-2">
                <Target className="h-4 w-4" />
                Budgets
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-4 mt-0">
              <Dashboard />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-4 mt-0">
              <TransactionForm />
            </TabsContent>

            <TabsContent value="budgets" className="space-y-4 mt-0">
              <BudgetManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Toaster />
    </div>
  )
}
