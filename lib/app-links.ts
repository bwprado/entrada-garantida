import type { Doc } from '@/convex/_generated/dataModel'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, PlusCircle } from 'lucide-react'

export type AppUserRole = Doc<'users'>['role']

/** Admin section pathnames — keep in sync with `app/admin` routes. */
export const adminPaths = {
  dashboard: '/admin/dashboard',
  perfil: '/admin/perfil',
  imoveis: '/admin/imoveis',
  beneficiariosUpload: '/admin/beneficiarios/upload'
} as const

export function getProfileHref(
  role: AppUserRole | string | undefined
): string {
  if (role === 'admin') return adminPaths.perfil
  if (role === 'ofertante') return '/ofertante/perfil'
  return '/beneficiario/perfil'
}

/**
 * “Imóveis selecionados” / role home: dashboard (or equivalent) per role.
 * Non-admin, non-ofertante (e.g. beneficiary, construtor) → beneficiário dashboard.
 */
export function getSelectedPropertiesHomeHref(
  role: AppUserRole | string | undefined
): string {
  if (role === 'admin') return adminPaths.dashboard
  if (role === 'ofertante') return '/ofertante/dashboard'
  return '/beneficiario/dashboard'
}

export type OfertanteActionLink = {
  label: string
  href: string
  icon: LucideIcon
}

export function getOfertanteActionLinks(): readonly OfertanteActionLink[] {
  return [
    {
      label: 'Painel',
      href: '/ofertante/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Novo imóvel',
      href: '/ofertante/imoveis/cadastro',
      icon: PlusCircle
    }
  ]
}
