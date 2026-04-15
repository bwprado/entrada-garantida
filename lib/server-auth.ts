import 'server-only'

import { api } from '@/convex/_generated/api'
import type { Doc } from '@/convex/_generated/dataModel'
import { convexAuthNextjsToken } from '@convex-dev/auth/nextjs/server'
import { fetchQuery } from 'convex/nextjs'
import { redirect } from 'next/navigation'

type UserRole = Doc<'users'>['role']

export async function getServerCurrentUser(): Promise<Doc<'users'> | null> {
  const token = await convexAuthNextjsToken()
  if (!token) return null
  return await fetchQuery(api.users.getCurrentUserProfile, {}, { token })
}

export async function requireServerUser(loginPath: string): Promise<Doc<'users'>> {
  const user = await getServerCurrentUser()
  if (!user) {
    redirect(loginPath)
  }
  return user
}

export async function requireServerRole(
  role: UserRole,
  loginPath: string
): Promise<Doc<'users'>> {
  const user = await requireServerUser(loginPath)
  if (user.role !== role) {
    redirect('/')
  }
  return user
}
