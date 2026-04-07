import { AdminAppShell } from '@/components/admin/admin-app-shell'
import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAppShell>{children}</AdminAppShell>
}
