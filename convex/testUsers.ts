import {
  createAccount,
  getAuthUserId,
  modifyAccountCredentials
} from '@convex-dev/auth/server'
import { ConvexError, v } from 'convex/values'
import { api } from './_generated/api'
import { action, mutation, query } from './_generated/server'
import { normalizeName } from './users'

const ENABLE_TEST_PASSWORD_AUTH =
  process.env.ENABLE_TEST_PASSWORD_AUTH === 'true'
const TEST_PASSWORD_BENEFICIARY_PROVIDER = 'password_test_beneficiary'
const TEST_PASSWORD_OFERTANTE_PROVIDER = 'password_test_ofertante'

function assertFeatureEnabled() {
  if (!ENABLE_TEST_PASSWORD_AUTH) {
    throw new ConvexError('Login de teste com senha está desabilitado')
  }
}

function providerForRole(role: 'beneficiary' | 'ofertante') {
  return role === 'beneficiary'
    ? TEST_PASSWORD_BENEFICIARY_PROVIDER
    : TEST_PASSWORD_OFERTANTE_PROVIDER
}

function buildTestCpf(role: 'beneficiary' | 'ofertante'): string {
  const roleDigit = role === 'beneficiary' ? '1' : '2'
  const suffix = `${Date.now()}`.slice(-10)
  return `${roleDigit}${suffix}`.slice(0, 11)
}

export const getTestAuthConfig = query({
  args: {},
  handler: async () => {
    return { enabled: ENABLE_TEST_PASSWORD_AUTH }
  }
})

export const listTestUsers = query({
  args: {},
  handler: async (ctx) => {
    assertFeatureEnabled()
    const adminId = await getAuthUserId(ctx)
    if (!adminId) {
      throw new ConvexError('Não autenticado')
    }
    const admin = await ctx.db.get(adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Permissão negada')
    }

    return await ctx.db
      .query('users')
      .withIndex('by_test_user', (q) => q.eq('isTestUser', true))
      .collect()
  }
})

export const createTestUser = action({
  args: {
    role: v.union(v.literal('beneficiary'), v.literal('ofertante')),
    email: v.string(),
    password: v.string(),
    nome: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    assertFeatureEnabled()
    const currentUser = await ctx.runQuery(api.users.getCurrentUserProfile, {})
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ConvexError(
        'Apenas administradores podem gerenciar usuários de teste'
      )
    }

    const email = args.email.trim().toLowerCase()
    if (!email) {
      throw new ConvexError('E-mail é obrigatório')
    }
    if (args.password.length < 8) {
      throw new ConvexError('Senha deve ter no mínimo 8 caracteres')
    }

    const nome =
      args.nome?.trim() ||
      (args.role === 'beneficiary'
        ? 'Beneficiário de teste'
        : 'Ofertante de teste')
    const now = Date.now()
    const provider = providerForRole(args.role)

    const created = await createAccount(ctx, {
      provider,
      account: { id: email, secret: args.password },
      profile: {
        role: args.role,
        cpf: buildTestCpf(args.role),
        nome,
        searchName: normalizeName(nome),
        email,
        status: args.role === 'beneficiary' ? 'active' : 'onboarding',
        isTestUser: true,
        criadoEm: now,
        atualizadoEm: now
      }
    })

    return { success: true as const, userId: created.user._id }
  }
})

export const resetTestUserPassword = action({
  args: {
    userId: v.id('users'),
    password: v.string()
  },
  handler: async (ctx, args) => {
    assertFeatureEnabled()
    const currentUser = await ctx.runQuery(api.users.getCurrentUserProfile, {})
    if (!currentUser || currentUser.role !== 'admin') {
      throw new ConvexError(
        'Apenas administradores podem gerenciar usuários de teste'
      )
    }
    if (args.password.length < 8) {
      throw new ConvexError('Senha deve ter no mínimo 8 caracteres')
    }

    const user = await ctx.runQuery(api.testUsers.getTestUserByIdForAdmin, {
      userId: args.userId
    })
    if (!user || !user.isTestUser) {
      throw new ConvexError('Usuário de teste não encontrado')
    }
    if (!user.email) {
      throw new ConvexError('Usuário sem e-mail cadastrado')
    }
    if (user.role !== 'beneficiary' && user.role !== 'ofertante') {
      throw new ConvexError('Apenas beneficiário e ofertante são suportados')
    }

    await modifyAccountCredentials(ctx, {
      provider: providerForRole(user.role),
      account: {
        id: user.email,
        secret: args.password
      }
    })

    return { success: true as const }
  }
})

export const getTestUserByIdForAdmin = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const adminId = await getAuthUserId(ctx)
    if (!adminId) {
      throw new ConvexError('Não autenticado')
    }
    const admin = await ctx.db.get(adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Permissão negada')
    }
    return await ctx.db.get(args.userId)
  }
})

export const deleteTestUser = mutation({
  args: {
    userId: v.id('users')
  },
  handler: async (ctx, args) => {
    assertFeatureEnabled()
    const adminId = await getAuthUserId(ctx)
    if (!adminId) {
      throw new ConvexError('Não autenticado')
    }
    const admin = await ctx.db.get(adminId)
    if (!admin || admin.role !== 'admin') {
      throw new ConvexError('Permissão negada')
    }

    const user = await ctx.db.get(args.userId)
    if (!user || !user.isTestUser) {
      throw new ConvexError('Usuário de teste não encontrado')
    }

    const sessions = await ctx.db
      .query('authSessions')
      .withIndex('userId', (q) => q.eq('userId', user._id))
      .collect()
    for (const session of sessions) {
      const tokens = await ctx.db
        .query('authRefreshTokens')
        .withIndex('sessionId', (q) => q.eq('sessionId', session._id))
        .collect()
      for (const token of tokens) {
        await ctx.db.delete(token._id)
      }
      const verifiers = await ctx.db
        .query('authVerifiers')
        .filter((q) => q.eq(q.field('sessionId'), session._id))
        .collect()
      for (const verifier of verifiers) {
        await ctx.db.delete(verifier._id)
      }
      await ctx.db.delete(session._id)
    }

    const accounts = await ctx.db
      .query('authAccounts')
      .filter((q) => q.eq(q.field('userId'), user._id))
      .collect()
    for (const account of accounts) {
      const codes = await ctx.db
        .query('authVerificationCodes')
        .withIndex('accountId', (q) => q.eq('accountId', account._id))
        .collect()
      for (const code of codes) {
        await ctx.db.delete(code._id)
      }
      await ctx.db.delete(account._id)
    }

    if (user.beneficiaryProfileId) {
      await ctx.db.delete(user.beneficiaryProfileId)
    }
    if (user.ofertanteProfileId) {
      await ctx.db.delete(user.ofertanteProfileId)
    }
    await ctx.db.delete(user._id)

    return { success: true as const }
  }
})
