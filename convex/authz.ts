import { getAuthUserId } from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

type AuthCtx = QueryCtx | MutationCtx

export async function verifyLogin(ctx: AuthCtx): Promise<Doc<'users'>> {
  const userId = await getAuthUserId(ctx)
  if (!userId) {
    throw new ConvexError('Não autenticado')
  }

  const user = await ctx.db.get(userId)
  if (!user) {
    throw new ConvexError('Usuário não encontrado')
  }

  return user
}

export async function verifyAdmin(ctx: AuthCtx): Promise<Doc<'users'>> {
  const user = await verifyLogin(ctx)
  if (user.role !== 'admin') {
    throw new ConvexError('Permissão negada')
  }
  return user
}

export async function verifySelfOrAdmin(
  ctx: AuthCtx,
  targetUserId: Id<'users'>
): Promise<Doc<'users'>> {
  const actor = await verifyLogin(ctx)
  if (actor._id !== targetUserId && actor.role !== 'admin') {
    throw new ConvexError('Permissão negada')
  }
  return actor
}

export function ensurePropertyOwnerOrAdmin(
  actor: Doc<'users'>,
  property: Doc<'properties'>
): void {
  const ownsAsOfertante = property.ofertanteId === actor._id
  const ownsAsConstrutor = property.construtorId === actor._id
  if (!ownsAsOfertante && !ownsAsConstrutor && actor.role !== 'admin') {
    throw new ConvexError('Permissão negada')
  }
}

export async function verifyPropertyOwnerOrAdmin(
  ctx: AuthCtx,
  property: Doc<'properties'>
): Promise<Doc<'users'>> {
  const actor = await verifyLogin(ctx)
  ensurePropertyOwnerOrAdmin(actor, property)
  return actor
}
