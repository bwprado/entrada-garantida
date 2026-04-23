'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth-context'
import { adminPaths } from '@/lib/app-links'
import {
  Building2,
  LayoutDashboard,
  LogOut,
  Shield,
  Upload
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const nav: Array<{
  href: string
  label: string
  icon: typeof LayoutDashboard
  disabled?: boolean
  /** If set, item is active when pathname starts with this (e.g. section routes). */
  matchPrefix?: string
}> = [
  {
    href: adminPaths.dashboard,
    label: 'Painel',
    icon: LayoutDashboard
  },
  {
    href: adminPaths.imoveis,
    label: 'Imóveis',
    icon: Building2,
    matchPrefix: adminPaths.imoveis
  },
  {
    href: adminPaths.beneficiariosUpload,
    label: 'Upload beneficiários',
    icon: Upload
  },
  {
    href: adminPaths.dashboard,
    label: 'Administradores',
    icon: Shield,
    disabled: true
  }
]

export function AdminAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { logout, user } = useAuth()

  const handleLogout = async () => {
    await logout('/login/admin')
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b border-sidebar-border">
          <Link
            href={adminPaths.dashboard}
            className="flex items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 hover:bg-sidebar-accent/50"
          >
            <div className="relative size-9 shrink-0">
              <Image
                src="/icon.png"
                alt=""
                fill
                className="object-contain"
                sizes="36px"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold text-sidebar-foreground">
                Aquisição Assistida
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Administração SECID
              </span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const Icon = item.icon
                  const active =
                    !item.disabled &&
                    (item.matchPrefix
                      ? pathname === item.href ||
                        pathname?.startsWith(`${item.matchPrefix}/`)
                      : item.href === adminPaths.dashboard
                        ? pathname === adminPaths.dashboard
                        : pathname === item.href)

                  if (item.disabled) {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          disabled
                          className="opacity-50"
                          tooltip="Em breve"
                        >
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  return (
                    <SidebarMenuItem key={item.label}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="truncate px-2 py-1.5 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
                {user?.nome ?? user?.phone ?? '—'}
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => void handleLogout()}
                tooltip="Sair"
              >
                <LogOut />
                <span>Sair</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4 md:hidden">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium">Painel admin</span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
