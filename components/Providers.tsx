"use client"

import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const canRegisterServiceWorker = 'serviceWorker' in navigator && (window.isSecureContext || isLocalhost)

    if (!canRegisterServiceWorker) {
      return
    }

    if (navigator.serviceWorker.controller) {
      sessionStorage.removeItem('budgetpro-sw-reload')
    }

    const shouldReloadOnFirstControl =
      !navigator.serviceWorker.controller &&
      sessionStorage.getItem('budgetpro-sw-reload') !== 'done'

    const handleControllerChange = () => {
      if (!shouldReloadOnFirstControl) {
        return
      }

      sessionStorage.setItem('budgetpro-sw-reload', 'done')
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    void navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => registration.update())
      .catch((error) => {
        console.error('Service worker registration failed:', error)
      })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }
  }, [])

  return <>{children}</>
}
