import {
  AuthProviderConfig,
  convexAuth,
  type GenericActionCtxWithAuthConfig,
  type PhoneConfig
} from '@convex-dev/auth/server'
import { Password } from '@convex-dev/auth/providers/Password'
import { ConvexError } from 'convex/values'
import { normalizePhone } from '../lib/normalize-phone'
import { normalizeName } from './users'
import { internal } from './_generated/api'

import type { AnyDataModel } from 'convex/server'
import type { GenericId } from 'convex/values'
import type { MutationCtx, QueryCtx } from './_generated/server'

const PHONE_OTP_MAX_AGE_SEC = 60 * 5
const TEST_PASSWORD_BENEFICIARY_PROVIDER = 'password_test_beneficiary'
const TEST_PASSWORD_OFERTANTE_PROVIDER = 'password_test_ofertante'
const ENABLE_TEST_PASSWORD_AUTH =
  process.env.ENABLE_TEST_PASSWORD_AUTH === 'true'

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
  console.log('findUserByPhone', phone)
  // Query by canonical phone field.
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

function getTestRoleFromProviderId(
  providerId: string
): 'beneficiary' | 'ofertante' | null {
  if (providerId === TEST_PASSWORD_BENEFICIARY_PROVIDER) return 'beneficiary'
  if (providerId === TEST_PASSWORD_OFERTANTE_PROVIDER) return 'ofertante'
  return null
}

async function createTestRoleProfile(
  ctx: MutationCtx,
  userId: GenericId<'users'>,
  role: 'beneficiary' | 'ofertante',
  now: number
): Promise<void> {
  if (role === 'beneficiary') {
    const profileId = await ctx.db.insert('beneficiaryProfiles', {
      userId,
      rg: '',
      nomeMae: '',
      nomePai: '',
      sexo: 'nao_informado',
      identidadeGenero: 'nao_informado',
      raca: 'nao_informado',
      deficiencias: ['nao_possui'],
      profissao: '',
      tipoRenda: 'nao_informado',
      rendaFamiliarFaixa: 'ate_2',
      pessoasFamilia: 1,
      mesesAluguelSocial: 0,
      possuiIdosoFamilia: false,
      chefiaFeminina: false,
      cep: '',
      endereco: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
      empreendimento: '',
      dddTelefoneFixo: '',
      telefoneFixo: '',
      dddTelefoneRecado: '',
      telefoneRecado: '',
      falarCom: '',
      aceitaComunicacoes: false,
      propriedadesInteresse: [],
      criadoEm: now,
      atualizadoEm: now
    })
    await ctx.db.patch(userId, { beneficiaryProfileId: profileId })
    return
  }

  const profileId = await ctx.db.insert('ofertanteProfiles', {
    userId,
    rg: '',
    dataNascimento: '',
    estadoCivil: 'solteiro',
    profissao: '',
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    onboardingCompleto: false,
    documentosPendentes: ['rg', 'comp_residencia'],
    criadoEm: now,
    atualizadoEm: now
  })
  await ctx.db.patch(userId, { ofertanteProfileId: profileId })
}

const providers: AuthProviderConfig[] = [
  createPhoneProvider('phone_admin'),
  createPhoneProvider('phone_ofertante'),
  createPhoneProvider('phone_beneficiary')
]

if (ENABLE_TEST_PASSWORD_AUTH) {
  providers.push(
    Password({
      id: TEST_PASSWORD_BENEFICIARY_PROVIDER,
      profile(params) {
        const email = String(params.email ?? '').trim().toLowerCase()
        return { email }
      }
    }),
    Password({
      id: TEST_PASSWORD_OFERTANTE_PROVIDER,
      profile(params) {
        const email = String(params.email ?? '').trim().toLowerCase()
        return { email }
      }
    })
  )
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers,
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

      if (type === 'credentials') {
        const role = getTestRoleFromProviderId(provider.id)
        if (!role) {
          throw new Error(`Provider de credenciais não suportado: ${provider.id}`)
        }
        if (!ENABLE_TEST_PASSWORD_AUTH) {
          throw new Error('Login de teste com senha está desabilitado')
        }

        const email = String(profile.email ?? '').trim().toLowerCase()
        if (!email) {
          throw new Error('E-mail é obrigatório para login de teste')
        }

        const now = Date.now()
        const nomeBase =
          typeof profile.nome === 'string' && profile.nome.trim().length > 0
            ? profile.nome.trim()
            : `Teste ${role === 'beneficiary' ? 'Beneficiário' : 'Ofertante'}`
        const cpfBase =
          typeof profile.cpf === 'string' && profile.cpf.trim().length > 0
            ? profile.cpf.trim()
            : `test-${role}-${email}`

        if (existingUserId !== null) {
          await ctx.db.patch(existingUserId, {
            email,
            nome: nomeBase,
            searchName: normalizeName(nomeBase),
            role,
            isTestUser: true,
            atualizadoEm: now
          })
          return existingUserId
        }

        const userId = await ctx.db.insert('users', {
          role,
          cpf: cpfBase,
          nome: nomeBase,
          searchName: normalizeName(nomeBase),
          email,
          status: role === 'beneficiary' ? 'active' : 'onboarding',
          isTestUser: true,
          criadoEm: now,
          atualizadoEm: now
        })

        await createTestRoleProfile(ctx, userId, role, now)
        return userId
      }

      throw new Error(`Fluxo de auth não suportado: ${type}`)
    }
  }
})
