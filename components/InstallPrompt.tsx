"use client"

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsVisible(false)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true')
  }

  if (!isVisible || isInstalled || sessionStorage.getItem('installPromptDismissed')) {
    return null
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Install BudgetPro</h3>
            <p className="text-sm text-white/80">Add to home screen for offline access</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleInstall}
            variant="secondary" 
            size="sm"
            className="bg-white text-blue-600 hover:bg-white/90"
          >
            Install
          </Button>
          <Button 
            onClick={handleDismiss}
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
