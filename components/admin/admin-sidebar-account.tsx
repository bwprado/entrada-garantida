'use client'

import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import type { Doc } from '@/convex/_generated/dataModel'
import { adminPaths } from '@/lib/app-links'
import { useAuth, type UserWithProfile } from '@/lib/auth-context'
import { normalizePhone } from '@/lib/normalize-phone'
import { getInitials } from '@/lib/user-display'
import { cn } from '@/lib/utils'
import { LogOut, Settings2, UserRound } from 'lucide-react'

function isAdminProfile(
  p: UserWithProfile['profile']
): p is Doc<'adminProfiles'> {
  return Boolean(p && typeof p === 'object' && 'nivelAcesso' in p)
}

function roleLabel(role: UserWithProfile['role'] | undefined): string {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'beneficiary':
      return 'Beneficiário'
    case 'ofertante':
      return 'Ofertante'
    case 'construtor':
      return 'Construtor'
    default:
      return 'Usuário'
  }
}

function nivelAcessoLabel(n: Doc<'adminProfiles'>['nivelAcesso']): string {
  switch (n) {
    case 'super':
      return 'Super'
    case 'moderador':
      return 'Moderador'
    case 'leitor':
      return 'Leitor'
    default:
      return String(n)
  }
}

function PhoneBlock({ phone }: { phone: string }) {
  const n = normalizePhone(phone)
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Telefone
      </span>
      {n.isValid() ? (
        <a
          href={`tel:${n.sms()}`}
          className="text-xs tabular-nums text-sidebar-foreground underline-offset-2 hover:underline"
        >
          {n.display()}
        </a>
      ) : (
        <span className="truncate text-xs tabular-nums">{phone}</span>
      )}
    </div>
  )
}

export function AdminSidebarAccount() {
  const { user, logout, isLoading } = useAuth()
  const { isMobile, state } = useSidebar()
  const compactRail = !isMobile && state === 'collapsed'

  const handleLogout = async () => {
    await logout('/login/admin')
  }

  if (compactRail) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Perfil">
            <Link href={adminPaths.perfil}>
              <UserRound />
              <span className="sr-only">Perfil</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild tooltip="Configurações">
            <Link href={adminPaths.configuracoes}>
              <Settings2 />
              <span className="sr-only">Configurações</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => void handleLogout()}
            tooltip="Sair"
          >
            <LogOut />
            <span className="sr-only">Sair</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (isLoading || user === undefined) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex flex-col gap-3 px-2 py-2">
            <div className="flex items-center gap-3">
              <Skeleton className="size-11 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const initials = getInitials(user?.nome ?? user?.phone ?? 'AA')
  const adminProf = isAdminProfile(user?.profile) ? user.profile : null
  const papel =
    user?.role === 'admin' && adminProf
      ? `${roleLabel(user.role)} · ${nivelAcessoLabel(adminProf.nivelAcesso)}`
      : roleLabel(user?.role)

  const cargoLine = [adminProf?.cargo, adminProf?.departamento]
    .filter(Boolean)
    .join(' · ')

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <div
          className={cn(
            'mx-2 mb-2 space-y-3 rounded-xl border border-sidebar-border/80 bg-sidebar-accent/25 p-3',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] dark:border-white/10 dark:bg-sidebar-accent/30'
          )}
        >
          <div className="flex gap-3">
            <Avatar className="size-11 shrink-0">
              {user?.image ? (
                <AvatarImage src={user.image} alt="" />
              ) : null}
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p
                className="truncate text-sm font-semibold text-sidebar-foreground"
                title={user?.nome ?? user?.phone ?? ''}
              >
                {user?.nome ?? user?.phone ?? '—'}
              </p>
              <p className="text-xs text-muted-foreground">{papel}</p>
              {cargoLine ? (
                <p
                  className="line-clamp-2 text-xs text-muted-foreground"
                  title={cargoLine}
                >
                  {cargoLine}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2 border-t border-sidebar-border/60 pt-3 dark:border-white/10">
            {user?.email ? (
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  E-mail
                </span>
                <a
                  href={`mailto:${user.email}`}
                  className="truncate text-xs text-sidebar-foreground underline-offset-2 hover:underline"
                >
                  {user.email}
                </a>
              </div>
            ) : null}
            {user?.phone ? <PhoneBlock phone={user.phone} /> : null}
          </div>

          <div className="flex flex-col gap-2 border-t border-sidebar-border/60 pt-3 dark:border-white/10">
            <Link
              href={adminPaths.perfil}
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className:
                  'w-full justify-start gap-2 bg-sidebar/40 transition-transform active:scale-[0.98] dark:bg-sidebar-accent/40'
              })}
            >
              <UserRound className="size-4 shrink-0" />
              Perfil
            </Link>
            <Link
              href={adminPaths.configuracoes}
              className={buttonVariants({
                variant: 'outline',
                size: 'sm',
                className:
                  'w-full justify-start gap-2 bg-sidebar/40 transition-transform active:scale-[0.98] dark:bg-sidebar-accent/40'
              })}
            >
              <Settings2 className="size-4 shrink-0" />
              Configurações
            </Link>
          </div>
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton onClick={() => void handleLogout()} tooltip="Sair">
          <LogOut />
          <span>Sair</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
