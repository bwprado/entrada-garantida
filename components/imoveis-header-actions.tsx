'use client'

import Link from 'next/link'
import { LogOut, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { useAuth } from '@/lib/auth-context'

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
    user === undefined || isLoading ? 'Carregando usuário...' : (user?.nome ?? user?.phone ?? 'Usuário')
  const initials = getInitials(user?.nome ?? user?.phone ?? 'AA')
  const accountHref = getAccountHref(user?.role)
  const selectedPropertiesHref = getSelectedPropertiesHref(user?.role)

  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-1"
          aria-label="Abrir menu do usuário"
        >
          <Avatar>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="flex w-64 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <p className="truncate text-sm font-medium" title={fullName}>
            {fullName}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="justify-start">
          <Link href={accountHref}>
            <UserRound className="mr-2 size-4" />
            Minha conta
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="justify-start">
          <Link href={selectedPropertiesHref}>Imóveis selecionados</Link>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => void logout()} className="justify-start">
          <LogOut className="mr-2 size-4" />
          Sair
        </Button>
      </HoverCardContent>
    </HoverCard>
  )
}
