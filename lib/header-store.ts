'use client'

import { useEffect, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'

type HeaderMobileAction = {
  label: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  disabled?: boolean
}

export type HeaderConfig = {
  title?: string
  subtitle?: string
  showBack?: boolean
  actions?: ReactNode
  filters?: ReactNode
  hasActiveFilters?: boolean
  onBack?: () => void
  mobileActions?: HeaderMobileAction[]
}

type HeaderStoreState = {
  config: HeaderConfig | null
}

let state: HeaderStoreState = { config: null }
const listeners = new Set<() => void>()

function notify() {
  listeners.forEach((listener) => listener())
}

export function setHeaderConfig(config: HeaderConfig | null) {
  state = { ...state, config }
  notify()
}

export function clearHeaderConfig() {
  setHeaderConfig(null)
}

export function useHeaderStore() {
  const [snapshot, setSnapshot] = useState(state)

  useEffect(() => {
    const listener = () => setSnapshot(state)
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return snapshot
}
