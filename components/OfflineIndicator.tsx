"use client"

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SyncCapableServiceWorkerRegistration = ServiceWorkerRegistration & {
  sync: {
    register(tag: string): Promise<void>
  }
}

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [canSync, setCanSync] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    void updateSyncAvailability()

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  async function updateSyncAvailability() {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      setCanSync(false)
      return
    }

    const registration = await navigator.serviceWorker.getRegistration()
    setCanSync(Boolean(registration && 'sync' in registration))
  }

  const handleSync = async () => {
    if (!('serviceWorker' in navigator)) return

    setIsSyncing(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration && 'sync' in registration) {
        await (registration as SyncCapableServiceWorkerRegistration).sync.register('sync-transactions')
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
      void updateSyncAvailability()
    }
  }

  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-sm border border-red-500/30">
        <WifiOff className="h-4 w-4" />
        <span className="hidden sm:inline">Offline</span>
      </div>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleSync}
      disabled={!canSync || isSyncing}
      className="text-slate-400 hover:text-slate-100"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
    </Button>
  )
}
