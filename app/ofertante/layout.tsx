import type { ReactNode } from 'react'

import { AuthenticatedHeaderActions } from '@/components/authenticated-header-actions'
import { Header } from '@/components/header'
import { getServerCurrentUser } from '@/lib/server-auth'
import { redirect } from 'next/navigation'

type Props = { children: ReactNode }

export default async function OfertanteLayout({ children }: Props) {
  const user = await getServerCurrentUser()
  if (user && user.role !== 'ofertante') redirect('/')

  return (
    <>
      <Header
        showLoginButton={false}
        actions={<AuthenticatedHeaderActions />}
      />
      {children}
    </>
  )
}
