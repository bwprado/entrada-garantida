'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { getHeaderPageConfig } from '@/lib/header-pages'
import { useHeaderStore } from '@/lib/header-store'
import { ArrowLeft, Filter, MoreHorizontal } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

function renderActionNode(
  action: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    disabled?: boolean
  },
  key: string
) {
  return (
    <DropdownMenuItem key={key} onClick={action.onClick} disabled={action.disabled}>
      <action.icon className="h-4 w-4" />
      {action.label}
    </DropdownMenuItem>
  )
}

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { config } = useHeaderStore()
  const [filterOpen, setFilterOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const pageConfig = useMemo(() => getHeaderPageConfig(pathname), [pathname])

  const title = config?.title ?? pageConfig.title
  const subtitle = config?.subtitle ?? pageConfig.subtitle
  const showBack = config?.showBack ?? pageConfig.showBack
  const actions = config?.actions
  const filters = config?.filters
  const hasActiveFilters = config?.hasActiveFilters ?? false
  const mobileActions = config?.mobileActions ?? []

  const handleBack = config?.onBack ?? (() => router.back())

  useEffect(() => {
    setFilterOpen(false)
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!hasActiveFilters && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setFilterOpen(false)
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterOpen, hasActiveFilters])

  const hasHeaderContent = Boolean(title || subtitle || showBack || actions || filters || mobileActions.length > 0)

  if (!hasHeaderContent) {
    return null
  }

  return (
    <div ref={headerRef} className="sticky top-0 z-40">
      <header className="min-h-16 shrink-0 items-center gap-2 border-b bg-background px-4 py-2 md:hidden flex">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />

        {showBack && (
          <>
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        <div className="min-w-0 flex-1">
          {title && <h1 className="truncate text-lg font-semibold leading-tight">{title}</h1>}
          {subtitle && <p className="line-clamp-2 text-sm leading-tight text-muted-foreground">{subtitle}</p>}
        </div>

        {filters && (
          <Button
            variant={filterOpen ? 'secondary' : 'outline'}
            size="icon"
            onClick={(event) => {
              event.stopPropagation()
              setFilterOpen((prev) => !prev)
            }}
            aria-label="Abrir filtros"
          >
            <Filter className="h-5 w-5" />
          </Button>
        )}

        {mobileActions.length > 0 && (
          <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Ações">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {mobileActions.map((action, index) => renderActionNode(action, `${action.label}-${index}`))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <header className="hidden h-16 shrink-0 items-center gap-2 border-b bg-background px-4 md:flex">
        {showBack && (
          <>
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Separator orientation="vertical" className="h-4" />
          </>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          {title && <h1 className="truncate text-lg font-semibold">{title}</h1>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {filters && (
          <Button
            variant={filterOpen ? 'secondary' : 'outline'}
            size="icon"
            onClick={(event) => {
              event.stopPropagation()
              setFilterOpen((prev) => !prev)
            }}
            aria-label="Abrir filtros"
          >
            <Filter className="h-5 w-5" />
          </Button>
        )}

        {actions && <div className="flex items-center gap-2">{actions as ReactNode}</div>}
      </header>

      <div
        className={`grid drop-shadow-sm transition-[grid-template-rows] duration-300 ease-in-out ${
          filterOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-b bg-background px-4 py-4">{filters}</div>
        </div>
      </div>
    </div>
  )
}
