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
    <div className="flex flex-col gap-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4 justify-center">
      {children}
    </div>
  )
}
