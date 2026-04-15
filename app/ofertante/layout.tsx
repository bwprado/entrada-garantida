import type { ReactNode } from 'react'

import { Header } from '@/components/header'
import { OfertanteHeaderActions } from '@/components/ofertante-header-actions'
import { getServerCurrentUser } from '@/lib/server-auth'
import { redirect } from 'next/navigation'

type Props = { children: ReactNode }

/**
 * When authenticated, ConditionalHeader renders children only (no global Header).
 * We inject the program Header here for ofertante routes except the public
 * construtor registration at /ofertante/cadastro.
 */
export default async function OfertanteLayout({ children }: Props) {
  const user = await getServerCurrentUser()
  if (user && user.role !== 'ofertante') redirect('/')

  return (
    <>
      <Header showLoginButton={false} actions={<OfertanteHeaderActions />} />
      {children}
    </>
  )
}
