'use client'

import Link from 'next/link'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { useAuth } from '@/lib/auth-context'
import {
  getHeaderQuickActionLinks,
  getProfileHref,
  getSelectedPropertiesHomeHref
} from '@/lib/app-links'
import { House, LayoutDashboard, LogOut, UserRound } from 'lucide-react'

function getInitials(value: string): string {
  const normalized = value.trim()
  if (!normalized) return 'AA'

  const words = normalized.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase()
  }

  const letters = normalized.replace(/[^a-zA-ZÀ-ÿ]/g, '')
  if (letters.length >= 2) {
    return letters.slice(0, 2).toUpperCase()
  }

  const digits = normalized.replace(/\D/g, '')
  if (digits.length >= 2) {
    return digits.slice(-2)
  }

  return normalized.slice(0, 2).toUpperCase()
}

export function AuthenticatedHeaderActions() {
  const { user, logout, isLoading } = useAuth()

  const fullName =
    user === undefined || isLoading
      ? 'Carregando usuário...'
      : (user?.nome ?? user?.phone ?? 'Usuário')
  const initials = getInitials(user?.nome ?? user?.phone ?? 'AA')
  const accountHref = getProfileHref(user?.role)
  const selectedPropertiesHref = getSelectedPropertiesHomeHref(user?.role)
  const quickLinks = getHeaderQuickActionLinks(user?.role)
  const isOfertante = user?.role === 'ofertante'
  const homeMenuLabel = isOfertante ? 'Painel' : 'Imóveis selecionados'
  const HomeMenuIcon = isOfertante ? LayoutDashboard : House

  return (
    <div className="flex items-center gap-2">
      {quickLinks.length > 0 ? (
        <div className="flex max-w-full flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {quickLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href + label}
              href={href}
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className: 'shrink-0 gap-1.5 max-sm:px-2'
              })}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>
      ) : null}

      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger>
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </HoverCardTrigger>
        <HoverCardContent
          className="flex w-64 flex-col gap-3"
          side="bottom"
          align="end"
        >
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <p className="truncate text-sm font-medium" title={fullName}>
              {fullName}
            </p>
          </div>
          <Link
            href={accountHref}
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'justify-start'
            })}
          >
            <UserRound className="size-4" />
            Minha conta
          </Link>

          <Link
            href={selectedPropertiesHref}
            className={buttonVariants({
              variant: 'outline',
              size: 'sm',
              className: 'justify-start'
            })}
          >
            <HomeMenuIcon className="size-4" />
            {homeMenuLabel}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void logout()}
            className="justify-start"
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
