'use client'

import { Header } from '@/components/header'
import { useConvexAuth } from 'convex/react'
import type { ReactNode } from 'react'

export function ConditionalHeader({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth()

  if (isLoading) {
    return (
      <>
        <Header />
        {children}
      </>
    )
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      {children}
    </>
  )
}
