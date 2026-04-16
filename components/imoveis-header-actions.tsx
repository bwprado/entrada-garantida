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
import { House, LogOut, UserRound } from 'lucide-react'

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

function getAccountHref(role?: string): string {
  if (role === 'admin') return '/admin/perfil'
  if (role === 'ofertante') return '/ofertante/perfil'
  return '/beneficiario/perfil'
}

function getSelectedPropertiesHref(role?: string): string {
  if (role === 'admin') return '/admin/dashboard'
  if (role === 'ofertante') return '/ofertante/dashboard'
  return '/beneficiario/dashboard'
}

export function ImoveisHeaderActions() {
  const { user, logout, isLoading } = useAuth()

  const fullName =
    user === undefined || isLoading
      ? 'Carregando usuário...'
      : (user?.nome ?? user?.phone ?? 'Usuário')
  const initials = getInitials(user?.nome ?? user?.phone ?? 'AA')
  const accountHref = getAccountHref(user?.role)
  const selectedPropertiesHref = getSelectedPropertiesHref(user?.role)

  return (
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
          <House className="size-4" />
          Imóveis selecionados
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
  )
}
