"use client"

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleSync = async () => {
    if (!('serviceWorker' in navigator)) return

    setIsSyncing(true)
    try {
      const registration = await navigator.serviceWorker.ready
      if ('sync' in registration) {
        await registration.sync.register('sync-transactions')
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setTimeout(() => setIsSyncing(false), 1000)
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
      className="text-slate-400 hover:text-slate-100"
    >
      <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
      <span className="hidden sm:inline">Sync</span>
    </Button>
  )
}
