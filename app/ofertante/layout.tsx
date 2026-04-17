import type { ReactNode } from 'react'

import { Header } from '@/components/header'
import { OfertanteHeaderActions } from '@/components/ofertante-header-actions'
import { getServerCurrentUser } from '@/lib/server-auth'
import { redirect } from 'next/navigation'
import { ImoveisHeaderActions } from '@/components/imoveis-header-actions'

type Props = { children: ReactNode }

const HeaderActions = () => {
  return (
    <div className="flex items-center gap-2">
      <OfertanteHeaderActions />
      <ImoveisHeaderActions />
    </div>
  )
}
export default async function OfertanteLayout({ children }: Props) {
  const user = await getServerCurrentUser()
  if (user && user.role !== 'ofertante') redirect('/')

  return (
    <>
      <Header showLoginButton={false} actions={<HeaderActions />} />
      {children}
    </>
  )
}
