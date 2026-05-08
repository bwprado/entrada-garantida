'use client'

import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { UserWithProfile } from '@/lib/auth-context'
import {
  getHeaderQuickActionLinks,
  getProfileHref,
  getSelectedPropertiesHomeHref,
  type OfertanteActionLink
} from '@/lib/app-links'
import { getInitials } from '@/lib/user-display'
import { normalizePhone } from '@/lib/normalize-phone'
import { House, LayoutDashboard, LogOut, UserRound } from 'lucide-react'

import { cn } from '@/lib/utils'

export type AccountMenuPanelProps = {
  user: UserWithProfile | null | undefined
  isLoading: boolean
  onLogout: () => void
  /** Close mobile sheet after navigating */
  onNavigate?: () => void
  className?: string
}

function PhoneRow({
  phone,
  onNavigate
}: {
  phone: string
  onNavigate?: () => void
}) {
  const n = normalizePhone(phone)
  if (!n.isValid()) {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-medium text-muted-foreground">
          Telefone
        </span>
        <span className="truncate text-sm tabular-nums" title={phone}>
          {phone}
        </span>
      </div>
    )
  }
  const tel = n.sms()
  const label = n.display()
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">
        Telefone
      </span>
      <a
        href={`tel:${tel}`}
        className="text-sm tabular-nums text-foreground underline-offset-2 hover:underline"
        onClick={onNavigate}
      >
        {label}
      </a>
    </div>
  )
}

function QuickLinkButton({
  item,
  onNavigate
}: {
  item: OfertanteActionLink
  onNavigate?: () => void
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={buttonVariants({
        variant: 'outline',
        size: 'sm',
        className:
          'w-full justify-start gap-2 transition-transform active:scale-[0.98]'
      })}
    >
      <Icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  )
}

export function AccountMenuPanel({
  user,
  isLoading,
  onLogout,
  onNavigate,
  className
}: AccountMenuPanelProps) {
  if (isLoading || user === undefined) {
    return (
      <div className={cn('flex flex-col gap-4', className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-[min(100%,12rem)]" />
            <Skeleton className="h-3 w-[min(100%,10rem)]" />
          </div>
        </div>
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    )
  }

  const fullName = user?.nome ?? user?.phone ?? 'Usuário'
  const initials = getInitials(user?.nome ?? user?.phone ?? 'AA')
  const accountHref = getProfileHref(user?.role)
  const selectedPropertiesHref = getSelectedPropertiesHomeHref(user?.role)
  const quickLinks = getHeaderQuickActionLinks(user?.role)
  const isOfertante = user?.role === 'ofertante'
  const homeMenuLabel = isOfertante ? 'Aplicação atual' : 'Imóveis selecionados'
  const HomeMenuIcon = isOfertante ? LayoutDashboard : House

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0">
          {user?.image ? (
            <AvatarImage src={user.image} alt="" />
          ) : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="truncate font-medium leading-tight" title={fullName}>
            {fullName}
          </p>
          {user?.email ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-muted-foreground">
                E-mail
              </span>
              <a
                href={`mailto:${user.email}`}
                className="truncate text-sm underline-offset-2 hover:underline"
                title={user.email}
                onClick={onNavigate}
              >
                {user.email}
              </a>
            </div>
          ) : null}
          {user?.phone ? (
            <PhoneRow phone={user.phone} onNavigate={onNavigate} />
          ) : null}
        </div>
      </div>

      {quickLinks.length > 0 ? (
        <div className="grid gap-2">
          {quickLinks.map((item) => (
            <QuickLinkButton
              key={`${item.href}-${item.label}`}
              item={item}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-2 border-t border-border pt-3">
        <Link
          href={accountHref}
          onClick={onNavigate}
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className:
              'justify-start gap-2 transition-transform active:scale-[0.98]'
          })}
        >
          <UserRound className="size-4 shrink-0" />
          Minha conta
        </Link>

        <Link
          href={selectedPropertiesHref}
          onClick={onNavigate}
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className:
              'justify-start gap-2 transition-transform active:scale-[0.98]'
          })}
        >
          <HomeMenuIcon className="size-4 shrink-0" />
          {homeMenuLabel}
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className="justify-start gap-2 transition-transform active:scale-[0.98]"
          onClick={() => void onLogout()}
        >
          <LogOut className="size-4 shrink-0" />
          Sair
        </Button>
      </div>
    </div>
  )
}
