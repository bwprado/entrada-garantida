import { AdminAppShell } from '@/components/admin/admin-app-shell'
import { requireServerRole } from '@/lib/server-auth'
import type { ReactNode } from 'react'

export default async function AdminLayout({
  children
}: {
  children: ReactNode
}) {
  await requireServerRole('admin', '/login/admin')
  return <AdminAppShell>{children}</AdminAppShell>
}
