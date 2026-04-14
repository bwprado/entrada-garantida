import type { LucideIcon } from 'lucide-react'
import { Building2, Home } from 'lucide-react'

export type NavLink = {
  label: string
  href: string
  icon: LucideIcon
}

export const navLinks: readonly NavLink[] = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Imóveis', href: '/imoveis', icon: Building2 }
]
