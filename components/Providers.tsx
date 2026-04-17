"use client"

import { useEffect } from 'react'
import { initializeDatabase } from '@/lib/db'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeDatabase()
  }, [])

  return <>{children}</>
}
