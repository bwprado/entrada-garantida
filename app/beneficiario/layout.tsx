import { Header } from '@/components/header'
import { ImoveisHeaderActions } from '@/components/imoveis-header-actions'
import { getServerCurrentUser } from '@/lib/server-auth'
import { redirect } from 'next/navigation'

export default async function BeneficiarioLayout({
  children
}: {
  children: React.ReactNode
}) {
  const user = await getServerCurrentUser()
  if (user && user.role !== 'beneficiary') redirect('/')
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-linear-to-br from-primary/5 via-background to-secondary/5">
      {user ? (
        <Header showLoginButton={false} actions={<ImoveisHeaderActions />} />
      ) : (
        <Header />
      )}
      <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
    </div>
  )
}
