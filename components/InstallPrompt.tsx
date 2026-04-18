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
  const [isDismissed, setIsDismissed] = useState(false)
  const [supportsBrowserPrompt, setSupportsBrowserPrompt] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [browserName, setBrowserName] = useState('your browser')

  useEffect(() => {
    setIsDismissed(sessionStorage.getItem('installPromptDismissed') === 'true')

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isAndroidDevice = /android/.test(userAgent)
    const isEdge = userAgent.includes('edg/')
    const isChrome = userAgent.includes('chrome') && !isEdge
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome')

    setIsIos(isIosDevice)
    setIsAndroid(isAndroidDevice)

    if (isEdge) {
      setBrowserName('Edge')
    } else if (isChrome) {
      setBrowserName('Chrome')
    } else if (isSafari) {
      setBrowserName('Safari')
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setSupportsBrowserPrompt(true)
      setIsVisible(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          setIsVisible(true)
        }
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowInstructions(true)
      return
    }

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsVisible(false)
    } else {
      setShowInstructions(true)
    }
  }

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // Don't show again for this session
    sessionStorage.setItem('installPromptDismissed', 'true')
  }

  if (!isVisible || isInstalled || isDismissed) {
    return null
  }

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Install BudgetPro</h3>
              <p className="text-sm text-white/80">
                {supportsBrowserPrompt
                  ? 'Add to home screen for offline access'
                  : 'Install this app from your browser menu for a native app experience'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleInstall}
              variant="secondary" 
              size="sm"
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              {deferredPrompt ? 'Install' : 'Show install steps'}
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
        </div>

        {showInstructions && !deferredPrompt && (
          <div className="rounded-xl bg-white/15 p-3 text-sm text-white/90">
            {isIos && (
              <p>On iPhone or iPad, open this site in Safari, tap Share, then choose Add to Home Screen.</p>
            )}
            {!isIos && isAndroid && (
              <p>On Android in {browserName}, open the browser menu and choose Install app or Add to Home screen.</p>
            )}
            {!isIos && !isAndroid && (
              <p>In {browserName}, open the browser menu or address bar options and choose Install BudgetPro or Apps to install this site as an app.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
