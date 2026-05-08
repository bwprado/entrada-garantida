'use client'

import { AdminSidebarAccount } from '@/components/admin/admin-sidebar-account'
import { AppHeader } from '@/components/admin/app-header'
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
  SidebarSeparator
} from '@/components/ui/sidebar'
import { adminPaths } from '@/lib/app-links'
import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  Home,
  LayoutDashboard,
  Settings2,
  Shield,
  Upload,
  UserRoundCog,
  Users
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

const nav: Array<{
  href: string
  label: string
  icon: LucideIcon
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
    href: adminPaths.beneficiarios,
    label: 'Beneficiários',
    icon: Users
  },
  {
    href: adminPaths.ofertantes,
    label: 'Ofertantes',
    icon: Home,
    matchPrefix: adminPaths.ofertantes
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
    href: adminPaths.testUsers,
    label: 'Usuários de teste',
    icon: UserRoundCog
  },
  {
    href: adminPaths.configuracoes,
    label: 'Configurações',
    icon: Settings2
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
            <div className="flex min-w-0 flex-1 flex-col leading-none group-data-[collapsible=icon]:hidden">
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
          <AdminSidebarAccount />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <div className="flex min-h-0 flex-1 flex-col p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
