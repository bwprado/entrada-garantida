'use client'

import type { ReactNode } from 'react'

import { Header } from '@/components/header'
import { OfertanteHeaderActions } from '@/components/ofertante-header-actions'

type Props = { children: ReactNode }

/**
 * When authenticated, ConditionalHeader renders children only (no global Header).
 * We inject the program Header here for ofertante routes except the public
 * construtor registration at /ofertante/cadastro.
 */
export default function OfertanteLayout({ children }: Props) {
  return (
    <>
      <Header showLoginButton={false} actions={<OfertanteHeaderActions />} />
      {children}
    </>
  )
}
