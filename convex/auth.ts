import {
  AuthProviderConfig,
  convexAuth,
  type GenericActionCtxWithAuthConfig,
  type PhoneConfig
} from '@convex-dev/auth/server'
import { ConvexError } from 'convex/values'
import { normalizePhone } from '../lib/normalize-phone'
import { internal } from './_generated/api'

import type { AnyDataModel } from 'convex/server'
import type { GenericId } from 'convex/values'
import type { QueryCtx } from './_generated/server'

const PHONE_OTP_MAX_AGE_SEC = 60 * 5

// Role configuration for phone authentication providers
const ROLE_CONFIG = {
  phone_admin: {
    requiredRole: 'admin' as const,
    notFoundMessage: 'Número de telefone não encontrado',
    wrongRoleMessage: 'Este número não está cadastrado como administrador'
  },
  phone_ofertante: {
    requiredRole: 'ofertante' as const,
    notFoundMessage:
      'Cadastre-se antes: informe seu nome na etapa de cadastro.',
    wrongRoleMessage:
      'Este telefone já está cadastrado para outro tipo de usuário'
  },
  phone_beneficiary: {
    requiredRole: 'beneficiary' as const,
    notFoundMessage: 'Número não encontrado na base de beneficiários.',
    wrongRoleMessage: 'Este telefone não está cadastrado como beneficiário'
  }
} as const

type PhoneProviderId = keyof typeof ROLE_CONFIG

async function findUserByPhone(
  ctx: QueryCtx,
  phone: string
): Promise<{ _id: GenericId<'users'>; role: string } | null> {
  // Query by telefone field (app field)
  const user = await ctx.db
    .query('users')
    .withIndex('by_telefone', (q) => q.eq('telefone', phone))
    .first()

  if (user) return user

  // Fallback: check phone field (Convex Auth)
  return await ctx.db
    .query('users')
    .withIndex('phone', (q) => q.eq('phone', phone))
    .first()
}

function validateUserRole(
  user: { role: string } | null,
  config: (typeof ROLE_CONFIG)[PhoneProviderId]
): asserts user is { _id: GenericId<'users'>; role: string } {
  if (!user) {
    throw new ConvexError(config.notFoundMessage)
  }

  if (user.role !== config.requiredRole) {
    throw new ConvexError(config.wrongRoleMessage)
  }
}

function createPhoneProvider(id: PhoneProviderId): AuthProviderConfig {
  return {
    id,
    type: 'phone',
    maxAge: PHONE_OTP_MAX_AGE_SEC,
    generateVerificationToken: async () =>
      Math.floor(100000 + Math.random() * 900000).toString(),
    normalizeIdentifier: (identifier: string) => {
      const n = normalizePhone(identifier)
      if (!n.isValid()) {
        throw new ConvexError('Telefone inválido')
      }
      return n.sms()
    },
    authorize: async (params, account) => {
      if (typeof params.phone !== 'string') {
        throw new Error('Informe o telefone em signIn.')
      }
      if (account.providerAccountId !== params.phone) {
        throw new Error('O telefone deve ser o mesmo da solicitação do código.')
      }
    },
    sendVerificationRequest: async (
      params,
      ctx: GenericActionCtxWithAuthConfig<AnyDataModel>
    ) => {
      const message = `Código de verificação Aquisição Assistida: ${params.token}. Válido por 5 minutos. Não compartilhe este código.`
      await ctx.runAction(internal.twilio.sendVerificationSms, {
        to: params.identifier,
        body: message
      })
    },
    options: {}
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    createPhoneProvider('phone_admin'),
    createPhoneProvider('phone_ofertante'),
    createPhoneProvider('phone_beneficiary')
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const { type, provider, profile, existingUserId } = args

      if (type === 'phone' && typeof profile.phone === 'string') {
        const user = await findUserByPhone(ctx, profile.phone)
        validateUserRole(user, ROLE_CONFIG[provider.id as PhoneProviderId])

        // Update phone field and timestamp
        await ctx.db.patch(user._id, {
          phone: profile.phone,
          atualizadoEm: Date.now()
        })

        return user._id
      }

      if (type === 'verification') {
        if (
          profile.phoneVerified === true &&
          typeof profile.phone === 'string'
        ) {
          if (existingUserId === null) {
            throw new Error(
              'Falha na verificação: usuário não encontrado (existingUserId is null)'
            )
          }

          await ctx.db.patch(existingUserId, {
            phone: profile.phone,
            phoneVerificationTime: Date.now()
          })

          return existingUserId
        }

        throw new Error(
          `Verification failed: no existing user found for ${profile.phone}`
        )
      }

      throw new Error(`Fluxo de auth não suportado: ${type}`)
    }
  }
})
