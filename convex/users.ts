import { getAuthUserId } from '@convex-dev/auth/server'
import {
  OrderedQuery,
  Query,
  QueryInitializer,
  paginationOptsValidator
} from 'convex/server'
import { ConvexError, v } from 'convex/values'
import { normalizePhone } from '../lib/normalize-phone'
import { DataModel, Doc, Id } from './_generated/dataModel'
import type { MutationCtx } from './_generated/server'
import { mutation, query } from './_generated/server'
import { verifyAdmin, verifyLogin, verifySelfOrAdmin } from './authz'
import { r2 } from './r2'
import {
  adminNivelAcessoEnum,
  deficienciaEnum,
  estadoCivilEnum,
  identidadeGeneroEnum,
  racaEnum,
  rendaFamiliarFaixaEnum,
  sexoEnum,
  tipoRendaEnum
} from './schema'

// Clean CPF (remove non-digits)
function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

// Validate CPF format (basic)
function isValidCPFLength(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  return cleaned.length === 11
}

/** Compare stored phone (any supported shape) with user input. */
function sameBrazilMobile(stored: string, input: string): boolean {
  const a = normalizePhone(stored)
  const b = normalizePhone(input)
  if (!a.isValid() || !b.isValid()) return false
  return a.digits() === b.digits()
}

/** Normalize name for search (lowercase, no accents, trimmed) */
export function normalizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/\s+/g, ' ') // Normalize whitespace
}

// ============ PROFILE QUERIES ============

/** Get current user with their profile data */
export const getCurrentUserWithProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await verifyLogin(ctx)

    if (user.role === 'beneficiary' && user.beneficiaryProfileId) {
      const profile = await ctx.db.get(user.beneficiaryProfileId)
      const properties = []

      if (
        profile &&
        profile.propriedadesInteresse &&
        profile.propriedadesInteresse.length > 0
      ) {
        for (const propertyId of profile.propriedadesInteresse ?? []) {
          const property = await ctx.db.get(propertyId)
          if (property) {
            properties.push(property)
          }
        }
      }
      return {
        user,
        profile: await ctx.db.get(user.beneficiaryProfileId),
        properties
      }
    }
    if (user.role === 'ofertante') {
      const profile = user.ofertanteProfileId
        ? await ctx.db.get(user.ofertanteProfileId)
        : null
      return { user, profile }
    }

    if (user.role === 'admin') {
      const profile = user.adminProfileId
        ? await ctx.db.get(user.adminProfileId)
        : null
      return { user, profile }
    }

    return null
  }
})

/** Get beneficiary profile by user ID */
export const getBeneficiaryProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary' || !user.beneficiaryProfileId) {
      return null
    }
    return await ctx.db.get(user.beneficiaryProfileId)
  }
})

/** Get ofertante profile by user ID */
export const getOfertanteProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'ofertante' || !user.ofertanteProfileId) {
      return null
    }
    return await ctx.db.get(user.ofertanteProfileId)
  }
})

/** Get admin profile by user ID */
export const getAdminProfile = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'admin' || !user.adminProfileId) {
      return null
    }
    return await ctx.db.get(user.adminProfileId)
  }
})

// ============ USER QUERIES ============

export const getByCPF = query({
  args: { cpf: v.string() },
  handler: async (ctx, args): Promise<Doc<'users'> | null> => {
    await verifyAdmin(ctx)
    const cleaned = cleanCPF(args.cpf)
    if (!isValidCPFLength(cleaned)) return null

    return await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
      .first()
  }
})

export const getById = query({
  args: { id: v.id('users') },
  handler: async (ctx, args): Promise<Doc<'users'> | null> => {
    await verifySelfOrAdmin(ctx, args.id)
    return await ctx.db.get(args.id)
  }
})

/** Admin-only: beneficiary or ofertante user row + role profile (single round-trip). */
export const getUserDetailForAdmin = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    const user = await ctx.db.get(args.userId)
    if (
      !user ||
      (user.role !== 'beneficiary' && user.role !== 'ofertante')
    ) {
      return null
    }
    if (user.role === 'beneficiary' && user.beneficiaryProfileId) {
      const profile = await ctx.db.get(user.beneficiaryProfileId)
      return { user, profile } as const
    }
    if (user.role === 'ofertante' && user.ofertanteProfileId) {
      const profile = await ctx.db.get(user.ofertanteProfileId)
      return { user, profile } as const
    }
    return { user, profile: null } as const
  }
})

export const getBeneficiaries = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('verified'),
        v.literal('active'),
        v.literal('rejected'),
        v.literal('suspended')
      )
    )
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    if (args.status) {
      return await ctx.db
        .query('users')
        .withIndex('by_role_and_status', (q) =>
          q.eq('role', 'beneficiary').eq('status', args.status!)
        )
        .collect()
    }

    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'beneficiary'))
      .collect()
  }
})

export const getBeneficiariesWithProfiles = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('verified'),
        v.literal('active'),
        v.literal('rejected'),
        v.literal('suspended')
      )
    )
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    let users
    if (args.status) {
      users = await ctx.db
        .query('users')
        .withIndex('by_role_and_status', (q) =>
          q.eq('role', 'beneficiary').eq('status', args.status!)
        )
        .collect()
    } else {
      users = await ctx.db
        .query('users')
        .withIndex('by_role', (q) => q.eq('role', 'beneficiary'))
        .collect()
    }

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null
        if (user.beneficiaryProfileId) {
          profile = await ctx.db.get(user.beneficiaryProfileId)
        }
        return { user, profile }
      })
    )

    return usersWithProfiles
  }
})

/** Get beneficiaries with pagination, search, and sorting */
export const getBeneficiariesPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
    searchQuery: v.optional(v.string()),
    sortDirection: v.optional(v.union(v.literal('asc'), v.literal('desc')))
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    const tableQuery: QueryInitializer<DataModel['users']> =
      ctx.db.query('users')

    let indexedQuery: Query<DataModel['users']> = tableQuery.withIndex(
      'by_role',
      (q) => q.eq('role', 'beneficiary')
    )

    let orderedQuery: OrderedQuery<DataModel['users']> = indexedQuery
    if (args.sortDirection) {
      orderedQuery = indexedQuery.order(args.sortDirection ?? 'asc')
    }

    const searchQuery = args.searchQuery?.trim()

    if (searchQuery && searchQuery.length > 0) {
      orderedQuery = tableQuery.withSearchIndex('search_name', (q) =>
        q
          .search('searchName', normalizeName(searchQuery))
          .eq('role', 'beneficiary')
      )
    }

    const results = await orderedQuery.paginate(args.paginationOpts)

    return results
  }
})

export const getBeneficiariesCount = query({
  args: {
    searchQuery: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    const searchQuery = args.searchQuery?.trim()
    const tableQuery: QueryInitializer<DataModel['users']> =
      ctx.db.query('users')
    let indexedQuery: Query<DataModel['users']> = tableQuery.withIndex(
      'by_role',
      (q) => q.eq('role', 'beneficiary')
    )
    let orderedQuery: OrderedQuery<DataModel['users']> = indexedQuery
    if (searchQuery && searchQuery.length > 0) {
      orderedQuery = tableQuery.withSearchIndex('search_name', (q) =>
        q
          .search('searchName', normalizeName(searchQuery))
          .eq('role', 'beneficiary')
      )
    }
    const results = await orderedQuery.collect()
    return results.length
  }
})

export const getBeneficiariesForRanking = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    const users = await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'beneficiary').eq('status', 'active')
      )
      .collect()

    const beneficiariesWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null
        if (user.beneficiaryProfileId) {
          profile = await ctx.db.get(user.beneficiaryProfileId)
        }
        return { user, profile }
      })
    )

    // Sort by ranking priority using profile data
    return beneficiariesWithProfiles.sort((a, b) => {
      const aProfile = a.profile
      const bProfile = b.profile

      // Primary: time in social rent (descending)
      const aMeses = aProfile?.mesesAluguelSocial ?? 0
      const bMeses = bProfile?.mesesAluguelSocial ?? 0
      if (aMeses !== bMeses) return bMeses - aMeses

      // Secondary: has elderly (true first)
      const aIdoso = aProfile?.possuiIdosoFamilia ?? false
      const bIdoso = bProfile?.possuiIdosoFamilia ?? false
      if (aIdoso !== bIdoso) return bIdoso ? 1 : -1

      // Tertiary: female head of household (true first)
      const aChefia = aProfile?.chefiaFeminina ?? false
      const bChefia = bProfile?.chefiaFeminina ?? false
      if (aChefia !== bChefia) return bChefia ? 1 : -1

      // Final tiebreaker: earlier creation date first
      return a.user.criadoEm - b.user.criadoEm
    })
  }
})

export const getAdmins = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'admin'))
      .collect()
  }
})

export const getOfertantes = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ofertante'))
      .collect()
  }
})

export const getOfertantesWithProfiles = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    const users = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ofertante'))
      .collect()

    return await Promise.all(
      users.map(async (user) => {
        let profile = null
        if (user.ofertanteProfileId) {
          profile = await ctx.db.get(user.ofertanteProfileId)
        }
        return { user, profile }
      })
    )
  }
})

export const getConstrutores = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'construtor'))
      .collect()
  }
})

/** Convex Auth: profile for the signed-in JWT (phone login). */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) return null
    return await ctx.db.get(userId)
  }
})

/** Ofertante login: whether this phone already has a user (skip register step). */
export const getLoginInfoByTelefone = query({
  args: { telefone: v.string() },
  handler: async (ctx, args) => {
    const n = normalizePhone(args.telefone)
    if (!n.isValid()) {
      return { ok: false, error: 'invalid' }
    }
    const e164 = n.save()
    const variants = Array.from(
      new Set([e164, e164.replace(/^\+/, ''), e164.replace(/^\+55/, '')])
    )
    for (const v of variants) {
      const user = await ctx.db
        .query('users')
        .withIndex('phone', (q) => q.eq('phone', v))
        .first()
      if (user) {
        return { ok: true, exists: true, role: user.role }
      }
    }
    return { ok: true, exists: false }
  }
})

// ============ PROFILE MUTATIONS ============

/** Update beneficiary profile */
export const updateBeneficiaryProfile = mutation({
  args: {
    userId: v.id('users'),
    // Address
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    empreendimento: v.optional(v.string()),
    // Contact
    email: v.optional(v.string()),
    telefoneFixo: v.optional(v.string()),
    dddTelefoneFixo: v.optional(v.string()),
    telefoneRecado: v.optional(v.string()),
    dddTelefoneRecado: v.optional(v.string()),
    falarCom: v.optional(v.string()),
    aceitaComunicacoes: v.optional(v.boolean()),
    // Personal (admin only)
    rg: v.optional(v.string()),
    nomeResponsavelFamiliar: v.optional(v.string()),
    nomeMae: v.optional(v.string()),
    nomePai: v.optional(v.string()),
    sexo: v.optional(sexoEnum),
    identidadeGenero: v.optional(identidadeGeneroEnum),
    raca: v.optional(racaEnum),
    deficiencias: v.optional(v.array(deficienciaEnum)),
    profissao: v.optional(v.string()),
    empregador: v.optional(v.string()),
    ramoAtividade: v.optional(v.string()),
    tipoRenda: v.optional(tipoRendaEnum),
    rendaFamiliarFaixa: v.optional(rendaFamiliarFaixaEnum),
    pessoasFamilia: v.optional(v.number()),
    mesesAluguelSocial: v.optional(v.number()),
    possuiIdosoFamilia: v.optional(v.boolean()),
    chefiaFeminina: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const actor = await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem atualizar este perfil')
    }

    if (!user.beneficiaryProfileId) {
      throw new Error('Perfil de beneficiário não encontrado')
    }

    const profile = await ctx.db.get(user.beneficiaryProfileId)
    if (!profile) {
      throw new Error('Perfil de beneficiário não encontrado')
    }

    const updates: Partial<Doc<'beneficiaryProfiles'>> = {
      atualizadoEm: Date.now()
    }

    // Address fields
    if (args.cep !== undefined) updates.cep = args.cep
    if (args.endereco !== undefined) updates.endereco = args.endereco
    if (args.numero !== undefined) updates.numero = args.numero
    if (args.complemento !== undefined) updates.complemento = args.complemento
    if (args.bairro !== undefined) updates.bairro = args.bairro
    if (args.cidade !== undefined) updates.cidade = args.cidade
    if (args.estado !== undefined) updates.estado = args.estado
    if (args.empreendimento !== undefined)
      updates.empreendimento = args.empreendimento

    // Contact fields
    if (args.telefoneFixo !== undefined)
      updates.telefoneFixo = args.telefoneFixo
    if (args.dddTelefoneFixo !== undefined)
      updates.dddTelefoneFixo = args.dddTelefoneFixo
    if (args.telefoneRecado !== undefined)
      updates.telefoneRecado = args.telefoneRecado
    if (args.dddTelefoneRecado !== undefined)
      updates.dddTelefoneRecado = args.dddTelefoneRecado
    if (args.falarCom !== undefined) updates.falarCom = args.falarCom
    if (args.aceitaComunicacoes !== undefined)
      updates.aceitaComunicacoes = args.aceitaComunicacoes

    // Personal fields: admin may edit any beneficiary; beneficiaries may edit their own
    const canEditPersonalFields =
      actor.role === 'admin' || actor._id === args.userId

    if (canEditPersonalFields) {
      if (args.rg !== undefined) updates.rg = args.rg
      if (args.nomeResponsavelFamiliar !== undefined)
        updates.nomeResponsavelFamiliar = args.nomeResponsavelFamiliar
      if (args.nomeMae !== undefined) updates.nomeMae = args.nomeMae
      if (args.nomePai !== undefined) updates.nomePai = args.nomePai
      if (args.sexo !== undefined) updates.sexo = args.sexo
      if (args.identidadeGenero !== undefined)
        updates.identidadeGenero = args.identidadeGenero
      if (args.raca !== undefined) updates.raca = args.raca
      if (args.deficiencias !== undefined)
        updates.deficiencias = args.deficiencias
      if (args.profissao !== undefined) updates.profissao = args.profissao
      if (args.empregador !== undefined) updates.empregador = args.empregador
      if (args.ramoAtividade !== undefined)
        updates.ramoAtividade = args.ramoAtividade
      if (args.tipoRenda !== undefined) updates.tipoRenda = args.tipoRenda
      if (args.rendaFamiliarFaixa !== undefined)
        updates.rendaFamiliarFaixa = args.rendaFamiliarFaixa
      if (args.pessoasFamilia !== undefined)
        updates.pessoasFamilia = args.pessoasFamilia
      if (args.mesesAluguelSocial !== undefined)
        updates.mesesAluguelSocial = args.mesesAluguelSocial
      if (args.possuiIdosoFamilia !== undefined)
        updates.possuiIdosoFamilia = args.possuiIdosoFamilia
      if (args.chefiaFeminina !== undefined)
        updates.chefiaFeminina = args.chefiaFeminina
    }

    // Update user email if provided
    if (args.email !== undefined) {
      await ctx.db.patch(args.userId, {
        email: args.email,
        atualizadoEm: Date.now()
      })
    }

    await ctx.db.patch(user.beneficiaryProfileId, updates)

    return { success: true }
  }
})

/** Update ofertante profile */
export const updateOfertanteProfile = mutation({
  args: {
    userId: v.id('users'),
    // Address
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    // Contact
    email: v.optional(v.string()),
    // Personal (admin only or during onboarding)
    rg: v.optional(v.string()),
    dataNascimento: v.optional(v.string()),
    estadoCivil: v.optional(estadoCivilEnum),
    profissao: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const actor = await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'ofertante') {
      throw new Error('Apenas ofertantes podem atualizar este perfil')
    }

    if (!user.ofertanteProfileId) {
      throw new Error('Perfil de ofertante não encontrado')
    }

    const profile = await ctx.db.get(user.ofertanteProfileId)
    if (!profile) {
      throw new Error('Perfil de ofertante não encontrado')
    }

    const isAdmin = actor.role === 'admin'

    const updates: Partial<Doc<'ofertanteProfiles'>> = {
      atualizadoEm: Date.now()
    }

    // Address fields
    if (args.cep !== undefined) updates.cep = args.cep
    if (args.endereco !== undefined) updates.endereco = args.endereco
    if (args.numero !== undefined) updates.numero = args.numero
    if (args.complemento !== undefined) updates.complemento = args.complemento
    if (args.bairro !== undefined) updates.bairro = args.bairro
    if (args.cidade !== undefined) updates.cidade = args.cidade
    if (args.estado !== undefined) updates.estado = args.estado

    // Personal fields
    if (args.rg !== undefined) updates.rg = args.rg
    if (args.dataNascimento !== undefined)
      updates.dataNascimento = args.dataNascimento
    if (args.estadoCivil !== undefined) updates.estadoCivil = args.estadoCivil
    if (args.profissao !== undefined) updates.profissao = args.profissao

    // Update user email if provided
    if (args.email !== undefined) {
      await ctx.db.patch(args.userId, {
        email: args.email,
        atualizadoEm: Date.now()
      })
    }

    await ctx.db.patch(user.ofertanteProfileId, updates)

    return { success: true }
  }
})

/** Update admin profile */
export const updateAdminProfile = mutation({
  args: {
    userId: v.id('users'),
    email: v.optional(v.string()),
    nivelAcesso: v.optional(adminNivelAcessoEnum),
    departamento: v.optional(v.string()),
    cargo: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'admin') {
      throw new Error('Apenas administradores podem atualizar este perfil')
    }

    // Update basic user info
    const userUpdates: Partial<Doc<'users'>> = {
      atualizadoEm: Date.now()
    }
    if (args.email !== undefined) userUpdates.email = args.email
    await ctx.db.patch(args.userId, userUpdates)

    // Update profile if it exists
    if (user.adminProfileId) {
      const profileUpdates: Partial<Doc<'adminProfiles'>> = {
        atualizadoEm: Date.now()
      }
      if (args.nivelAcesso !== undefined)
        profileUpdates.nivelAcesso = args.nivelAcesso
      if (args.departamento !== undefined)
        profileUpdates.departamento = args.departamento
      if (args.cargo !== undefined) profileUpdates.cargo = args.cargo
      await ctx.db.patch(user.adminProfileId, profileUpdates)
    }

    return { success: true }
  }
})

/** Update basic user info (common fields) */
export const updateUserBasicInfo = mutation({
  args: {
    userId: v.id('users'),
    nome: v.optional(v.string()),
    nomeSocial: v.optional(v.string()),
    email: v.optional(v.string()),
    telefone: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const actor = await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const updates: Partial<Doc<'users'>> = {
      atualizadoEm: Date.now()
    }

    const selfBeneficiary =
      user.role === 'beneficiary' && actor._id === args.userId

    // Nome e telefone vêm do cadastro/importação; beneficiário não altera pelo próprio perfil
    if (!selfBeneficiary) {
      if (args.nome !== undefined) updates.nome = args.nome
      if (args.telefone !== undefined) updates.phone = args.telefone
    }
    if (args.email !== undefined) updates.email = args.email

    await ctx.db.patch(args.userId, updates)

    return { success: true }
  }
})

// ============ AUTH & LEGACY MUTATIONS ============

/**
 * Validates CPF + phone against the beneficiário row before Convex Auth sends SMS.
 * Client must call this, then signIn("phone_beneficiary", { phone: phoneE164 }).
 */
export const assertBeneficiaryCpfTelefone = mutation({
  args: {
    cpf: v.string(),
    telefone: v.string()
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    telefoneMascarado?: string
    /** E.164 — use this exact value for signIn with phone_beneficiary */
    phoneE164?: string
    error?: string
  }> => {
    const cleanedCPF = cleanCPF(args.cpf)
    const n = normalizePhone(args.telefone)

    if (!isValidCPFLength(cleanedCPF)) {
      return { success: false, error: 'CPF deve ter 11 dígitos' }
    }

    if (!n.isValid()) {
      return { success: false, error: 'Telefone inválido' }
    }

    const user = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedCPF))
      .first()

    if (!user) {
      return {
        success: false,
        error: 'CPF não encontrado na lista de beneficiários pré-aprovados'
      }
    }

    if (user.role !== 'beneficiary') {
      return {
        success: false,
        error: 'Este CPF não está cadastrado como beneficiário'
      }
    }

    if (!user.phone || !sameBrazilMobile(user.phone, args.telefone)) {
      return {
        success: false,
        error:
          'O telefone informado não corresponde ao cadastrado. Entre em contato com a SECID para atualizar seus dados.'
      }
    }

    return {
      success: true,
      telefoneMascarado: n.display(),
      phoneE164: n.save()
    }
  }
})

export const acceptTerms = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error('Não autenticado')
    }
    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem aceitar termos')
    }

    if (user.termoAceitoEm) {
      throw new Error('Termos já aceitos anteriormente')
    }

    await ctx.db.patch(userId, {
      termoAceitoEm: Date.now(),
      status: 'active',
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const confirmData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error('Não autenticado')
    }
    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem validar dados')
    }

    await ctx.db.patch(userId, {
      dadosValidados: true,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const reportDataError = mutation({
  args: {
    mensagem: v.string()
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      throw new Error('Não autenticado')
    }
    const user = await ctx.db.get(userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Apenas beneficiários podem reportar erros')
    }

    await ctx.db.patch(userId, {
      dadosComErro: true,
      mensagemErroDados: args.mensagem,
      erroReportadoEm: Date.now(),
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const getBeneficiariesWithErrors = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'beneficiary').eq('status', 'active')
      )
      .filter((q) => q.eq(q.field('dadosComErro'), true))
      .collect()
  }
})

export const resolveDataError = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    await ctx.db.patch(args.userId, {
      dadosComErro: false,
      dadosValidados: true,
      mensagemErroDados: undefined,
      erroReportadoEm: undefined,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

export const selectProperty = mutation({
  args: {
    userId: v.id('users'),
    propertyId: v.id('properties')
  },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary') {
      throw new Error('Usuário inválido')
    }

    if (!user.termoAceitoEm) {
      throw new Error('Beneficiário precisa aceitar os termos primeiro')
    }

    if (!user.beneficiaryProfileId) {
      throw new Error('Perfil de beneficiário não encontrado')
    }

    const profile = await ctx.db.get(user.beneficiaryProfileId)
    if (!profile) {
      throw new Error('Perfil de beneficiário não encontrado')
    }

    const currentSelections = profile.propriedadesInteresse ?? []

    if (currentSelections.length >= 3) {
      throw new Error('Máximo de 3 propriedades pode ser selecionado')
    }

    if (currentSelections.includes(args.propertyId)) {
      throw new Error('Propriedade já selecionada')
    }

    // Verify property is validated
    const property = await ctx.db.get(args.propertyId)
    if (!property || property.status !== 'validated') {
      throw new Error('Propriedade não disponível para seleção')
    }

    const newSelections = [...currentSelections, args.propertyId]

    await ctx.db.patch(user.beneficiaryProfileId, {
      propriedadesInteresse: newSelections,
      atualizadoEm: Date.now()
    })

    await ctx.db.insert('selectionsHistory', {
      beneficiarioId: args.userId,
      propertyId: args.propertyId,
      ordemPreferencia: newSelections.length,
      selecionadoEm: Date.now()
    })

    return { success: true, selections: newSelections }
  }
})

export const removePropertySelection = mutation({
  args: {
    userId: v.id('users'),
    propertyId: v.id('properties')
  },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    if (user.role !== 'beneficiary') {
      throw new Error('Usuário inválido')
    }

    if (!user.beneficiaryProfileId) {
      throw new Error('Perfil de beneficiário não encontrado')
    }

    const profile = await ctx.db.get(user.beneficiaryProfileId)
    if (!profile) {
      throw new Error('Perfil de beneficiário não encontrado')
    }

    const currentSelections = profile.propriedadesInteresse ?? []
    const newSelections = currentSelections.filter(
      (id) => id !== args.propertyId
    )

    await ctx.db.patch(user.beneficiaryProfileId, {
      propriedadesInteresse: newSelections,
      atualizadoEm: Date.now()
    })

    const historyEntry = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_beneficiario', (q) => q.eq('beneficiarioId', args.userId))
      .filter(
        (q) =>
          q.eq(q.field('propertyId'), args.propertyId) &&
          q.eq(q.field('removidoEm'), undefined)
      )
      .first()

    if (historyEntry) {
      await ctx.db.patch(historyEntry._id, {
        removidoEm: Date.now()
      })
    }

    return { success: true }
  }
})

// Legacy updateProfile - kept for backwards compatibility
export const updateProfile = mutation({
  args: {
    userId: v.id('users'),
    email: v.optional(v.string()),
    telefone: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const updates: Partial<Doc<'users'>> = {
      atualizadoEm: Date.now()
    }

    if (args.email !== undefined) updates.email = args.email
    if (args.telefone !== undefined) updates.phone = args.telefone

    await ctx.db.patch(args.userId, updates)

    // Also update profile if it exists
    if (user.beneficiaryProfileId) {
      const profileUpdates: Partial<Doc<'beneficiaryProfiles'>> = {
        atualizadoEm: Date.now()
      }
      if (args.cep !== undefined) profileUpdates.cep = args.cep
      if (args.endereco !== undefined) profileUpdates.endereco = args.endereco
      if (args.numero !== undefined) profileUpdates.numero = args.numero
      if (args.complemento !== undefined)
        profileUpdates.complemento = args.complemento
      if (args.bairro !== undefined) profileUpdates.bairro = args.bairro
      if (args.cidade !== undefined) profileUpdates.cidade = args.cidade
      if (args.estado !== undefined) profileUpdates.estado = args.estado
      await ctx.db.patch(user.beneficiaryProfileId, profileUpdates)
    }

    if (user.ofertanteProfileId) {
      const profileUpdates: Partial<Doc<'ofertanteProfiles'>> = {
        atualizadoEm: Date.now()
      }
      if (args.cep !== undefined) profileUpdates.cep = args.cep
      if (args.endereco !== undefined) profileUpdates.endereco = args.endereco
      if (args.numero !== undefined) profileUpdates.numero = args.numero
      if (args.complemento !== undefined)
        profileUpdates.complemento = args.complemento
      if (args.bairro !== undefined) profileUpdates.bairro = args.bairro
      if (args.cidade !== undefined) profileUpdates.cidade = args.cidade
      if (args.estado !== undefined) profileUpdates.estado = args.estado
      await ctx.db.patch(user.ofertanteProfileId, profileUpdates)
    }

    return { success: true }
  }
})

// ============ ADMIN MUTATIONS ============

export const createAdmin = mutation({
  args: {
    cpf: v.string(),
    nome: v.string(),
    email: v.string(),
    telefone: v.string(),
    senha: v.string(),
    nivelAcesso: v.optional(adminNivelAcessoEnum),
    departamento: v.optional(v.string()),
    cargo: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    const cleaned = cleanCPF(args.cpf)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
      .first()

    if (existing) {
      throw new Error('CPF já cadastrado')
    }

    const now = Date.now()

    const userId = await ctx.db.insert('users', {
      role: 'admin',
      cpf: cleaned,
      nome: args.nome,
      email: args.email,
      phone: args.telefone,
      status: 'active',
      criadoEm: now,
      atualizadoEm: now
    })

    // Create admin profile
    await ctx.db.insert('adminProfiles', {
      userId,
      nivelAcesso: args.nivelAcesso ?? 'leitor',
      departamento: args.departamento,
      cargo: args.cargo,
      criadoEm: now,
      atualizadoEm: now
    })

    // Update user with profile reference
    await ctx.db.patch(userId, {
      adminProfileId: (await ctx.db
        .query('adminProfiles')
        .withIndex('by_user', (q) => q.eq('userId', userId))
        .first())!._id
    })

    return userId
  }
})

export const bulkUploadBeneficiaries = mutation({
  args: {
    adminId: v.id('users'),
    beneficiaries: v.array(
      v.object({
        cpf: v.string(),
        nome: v.string(),
        telefone: v.string(),
        email: v.optional(v.string()),
        // Profile fields
        rg: v.string(),
        nomeMae: v.optional(v.string()),
        nomePai: v.optional(v.string()),
        sexo: v.optional(v.string()),
        raca: v.optional(v.string()),
        deficiencias: v.optional(v.array(v.string())),
        profissao: v.string(),
        tipoRenda: v.optional(v.string()),
        rendaFamiliarFaixa: v.optional(v.string()),
        pessoasFamilia: v.optional(v.number()),
        mesesAluguelSocial: v.optional(v.number()),
        possuiIdosoFamilia: v.optional(v.boolean()),
        chefiaFeminina: v.optional(v.boolean()),
        // Address
        cep: v.optional(v.string()),
        endereco: v.optional(v.string()),
        numero: v.optional(v.string()),
        bairro: v.optional(v.string()),
        cidade: v.optional(v.string()),
        estado: v.optional(v.string()),
        importHasError: v.optional(v.boolean()),
        importErrorMessage: v.optional(v.string())
      })
    )
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    total: number
    sucessos: number
    importadosSemErro: number
    importadosComErro: number
    ignorados: number
    erros: Array<{ linha: number; erro: string }>
  }> => {
    await verifyAdmin(ctx)

    const erros: Array<{ linha: number; erro: string }> = []
    let importadosSemErro = 0
    let importadosComErro = 0
    let ignorados = 0
    const now = Date.now()
    const seenCpfsInBatch = new Set<string>()

    for (let i = 0; i < args.beneficiaries.length; i++) {
      const b = args.beneficiaries[i]
      const linha = i + 1

      try {
        const cleaned = cleanCPF(b.cpf)

        if (cleaned.length > 0) {
          if (seenCpfsInBatch.has(cleaned)) {
            erros.push({ linha, erro: 'CPF duplicado no arquivo' })
            ignorados++
            continue
          }
          seenCpfsInBatch.add(cleaned)

          const existing = await ctx.db
            .query('users')
            .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
            .first()

          if (existing) {
            erros.push({ linha, erro: 'CPF já cadastrado' })
            ignorados++
            continue
          }
        }

        const importErrors: string[] = []
        if (!isValidCPFLength(cleaned)) {
          importErrors.push('CPF inválido')
        }
        if (b.importHasError && b.importErrorMessage?.trim()) {
          importErrors.push(b.importErrorMessage.trim())
        }
        const hasImportError = importErrors.length > 0
        const safeNome = b.nome.trim() || `Beneficiário linha ${linha}`

        // Create user
        const userId = await ctx.db.insert('users', {
          role: 'beneficiary',
          cpf: cleaned,
          nome: safeNome,
          searchName: normalizeName(safeNome),
          phone: b.telefone,
          email: b.email,
          status: 'pending',
          dadosComErro: hasImportError,
          mensagemErroDados: hasImportError
            ? Array.from(new Set(importErrors)).join('; ')
            : undefined,
          erroReportadoEm: hasImportError ? now : undefined,
          criadoEm: now,
          atualizadoEm: now
        })

        // Create beneficiary profile
        const profileId = await ctx.db.insert('beneficiaryProfiles', {
          userId,
          rg: b.rg.trim() || 'Não informado',
          nomeMae: b.nomeMae,
          nomePai: b.nomePai,
          sexo: (b.sexo as any) ?? 'nao_informado',
          identidadeGenero: 'nao_informado',
          raca: (b.raca as any) ?? 'nao_informado',
          deficiencias: (b.deficiencias as any) ?? ['nao_possui'],
          profissao: b.profissao.trim() || 'Não informado',
          tipoRenda: (b.tipoRenda as any) ?? 'nao_informado',
          rendaFamiliarFaixa: (b.rendaFamiliarFaixa as any) ?? 'ate_2',
          pessoasFamilia: b.pessoasFamilia ?? 1,
          mesesAluguelSocial: b.mesesAluguelSocial ?? 0,
          possuiIdosoFamilia: b.possuiIdosoFamilia ?? false,
          chefiaFeminina: b.chefiaFeminina ?? false,
          // Address
          cep: b.cep ?? '',
          endereco: b.endereco ?? '',
          numero: b.numero ?? '',
          bairro: b.bairro ?? '',
          cidade: b.cidade ?? '',
          estado: b.estado ?? 'MA',
          complemento: '',
          // Contact defaults
          dddTelefoneFixo: '',
          telefoneFixo: '',
          dddTelefoneRecado: '',
          telefoneRecado: '',
          falarCom: '',
          aceitaComunicacoes: false,
          // Timestamps
          criadoEm: now,
          atualizadoEm: now,
          propriedadesInteresse: []
        })

        // Update user with profile reference
        await ctx.db.patch(userId, {
          beneficiaryProfileId: profileId
        })

        if (hasImportError) {
          importadosComErro++
        } else {
          importadosSemErro++
        }
      } catch (e) {
        erros.push({ linha, erro: String(e) })
        ignorados++
      }
    }

    return {
      success: true,
      total: args.beneficiaries.length,
      sucessos: importadosSemErro + importadosComErro,
      importadosSemErro,
      importadosComErro,
      ignorados,
      erros
    }
  }
})

export const updateUserStatus = mutation({
  args: {
    userId: v.id('users'),
    status: v.union(
      v.literal('pending'),
      v.literal('verified'),
      v.literal('active'),
      v.literal('rejected'),
      v.literal('suspended')
    )
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    await ctx.db.patch(args.userId, {
      status: args.status,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

// Register new ofertante
export const registerOfertante = mutation({
  args: {
    telefone: v.string(),
    nome: v.string()
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    userId?: Id<'users'>
    error?: string
  }> => {
    const n = normalizePhone(args.telefone)
    if (!n.isValid()) {
      return { success: false, error: 'Telefone inválido' }
    }
    const phoneE164 = n.save()

    const existingUser = await ctx.db
      .query('users')
      .withIndex('phone', (q) => q.eq('phone', phoneE164))
      .first()

    if (existingUser) {
      return { success: false, error: 'Este telefone já está cadastrado' }
    }

    const now = Date.now()

    const userId = await ctx.db.insert('users', {
      role: 'ofertante',
      cpf: '', // Will be filled during onboarding
      nome: args.nome,
      phone: phoneE164,
      status: 'onboarding',
      criadoEm: now,
      atualizadoEm: now
    })

    // Create empty ofertante profile
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

    // Update user with profile reference
    await ctx.db.patch(userId, {
      ofertanteProfileId: profileId
    })

    return { success: true, userId }
  }
})

// Complete ofertante onboarding
export const completeOfertanteOnboarding = mutation({
  args: {
    nome: v.optional(v.string()),
    cpf: v.string(),
    dataNascimento: v.string(),
    rg: v.optional(v.string()),
    profissao: v.optional(v.string()),
    estadoCivil: v.optional(estadoCivilEnum),
    cep: v.string(),
    endereco: v.string(),
    numero: v.string(),
    complemento: v.optional(v.string()),
    bairro: v.string(),
    cidade: v.string(),
    estado: v.string()
  },
  handler: async (ctx, args): Promise<{ success: boolean; error?: string }> => {
    const userId = await getAuthUserId(ctx)
    if (userId === null) {
      return { success: false, error: 'Não autenticado' }
    }
    const user = await ctx.db.get(userId)
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' }
    }

    if (user.role !== 'ofertante') {
      return {
        success: false,
        error: 'Apenas ofertantes podem completar onboarding'
      }
    }

    if (!user.ofertanteProfileId) {
      return { success: false, error: 'Perfil de ofertante não encontrado' }
    }

    // Validate CPF
    const cleanedCPF = cleanCPF(args.cpf)
    if (!isValidCPFLength(cleanedCPF)) {
      return { success: false, error: 'CPF inválido' }
    }

    // Check if CPF is already in use by another user
    const existingUserWithCPF = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedCPF))
      .first()

    if (existingUserWithCPF && existingUserWithCPF._id !== userId) {
      return { success: false, error: 'CPF já cadastrado por outro usuário' }
    }

    const rgTrim = args.rg?.trim()
    const profTrim = args.profissao?.trim()

    // Update user
    await ctx.db.patch(userId, {
      nome: args.nome || user.nome,
      cpf: cleanedCPF,
      status: 'active',
      atualizadoEm: Date.now()
    })

    // Update profile
    await ctx.db.patch(user.ofertanteProfileId, {
      rg: rgTrim ?? '',
      dataNascimento: args.dataNascimento,
      estadoCivil: args.estadoCivil ?? 'solteiro',
      profissao: profTrim ?? '',
      cep: args.cep,
      endereco: args.endereco,
      numero: args.numero,
      complemento: args.complemento,
      bairro: args.bairro,
      cidade: args.cidade,
      estado: args.estado,
      onboardingCompleto: true,
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

// Get ofertantes with pending onboarding
export const getOfertantesPendentes = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'ofertante').eq('status', 'onboarding')
      )
      .collect()
  }
})

// Create a single beneficiary (admin manual creation)
export const createBeneficiary = mutation({
  args: {
    nome: v.string(),
    cpf: v.string(),
    telefone: v.string(),
    email: v.optional(v.string()),
    rg: v.string(),
    sexo: sexoEnum,
    raca: v.optional(racaEnum),
    profissao: v.string(),
    tipoRenda: tipoRendaEnum,
    rendaFamiliarFaixa: rendaFamiliarFaixaEnum,
    pessoasFamilia: v.number(),
    cep: v.string(),
    endereco: v.string(),
    numero: v.string(),
    bairro: v.string(),
    cidade: v.string(),
    estado: v.string(),
    complemento: v.optional(v.string()),
    nomeMae: v.optional(v.string()),
    telefoneFixo: v.optional(v.string()),
    dddTelefoneFixo: v.optional(v.string())
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    userId?: Id<'users'>
    error?: string
  }> => {
    const currentUserId = await getAuthUserId(ctx)
    if (!currentUserId) {
      return { success: false, error: 'Não autenticado' }
    }

    const currentUser = await ctx.db.get(currentUserId)
    if (!currentUser || currentUser.role !== 'admin') {
      return {
        success: false,
        error: 'Apenas administradores podem criar usuários'
      }
    }

    const cleanedCPF = cleanCPF(args.cpf)
    const n = normalizePhone(args.telefone)

    // Validate CPF length
    if (!isValidCPFLength(cleanedCPF)) {
      return { success: false, error: 'CPF deve ter 11 dígitos' }
    }

    // Validate phone
    if (!n.isValid()) {
      return { success: false, error: 'Telefone inválido' }
    }

    // Check for existing CPF
    const existingCPF = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleanedCPF))
      .first()

    if (existingCPF) {
      return { success: false, error: 'CPF já cadastrado' }
    }

    const now = Date.now()
    const phoneE164 = n.save()

    // Create user
    const userId = await ctx.db.insert('users', {
      role: 'beneficiary',
      cpf: cleanedCPF,
      nome: args.nome,
      searchName: normalizeName(args.nome),
      phone: phoneE164,
      email: args.email,
      status: 'pending',
      criadoEm: now,
      atualizadoEm: now
    })

    // Create beneficiary profile
    const profileId = await ctx.db.insert('beneficiaryProfiles', {
      userId,
      rg: args.rg,
      nomeMae: args.nomeMae,
      nomePai: '',
      sexo: args.sexo,
      identidadeGenero: 'nao_informado',
      raca: args.raca ?? 'nao_informado',
      deficiencias: ['nao_possui'],
      profissao: args.profissao,
      tipoRenda: args.tipoRenda,
      rendaFamiliarFaixa: args.rendaFamiliarFaixa,
      pessoasFamilia: args.pessoasFamilia,
      mesesAluguelSocial: 0,
      possuiIdosoFamilia: false,
      chefiaFeminina: false,
      cep: args.cep,
      endereco: args.endereco,
      numero: args.numero,
      complemento: args.complemento ?? '',
      bairro: args.bairro,
      cidade: args.cidade,
      estado: args.estado,
      empreendimento: '',
      dddTelefoneFixo: args.dddTelefoneFixo ?? '',
      telefoneFixo: args.telefoneFixo ?? '',
      dddTelefoneRecado: '',
      telefoneRecado: '',
      falarCom: '',
      aceitaComunicacoes: false,
      criadoEm: now,
      atualizadoEm: now,
      propriedadesInteresse: []
    })

    // Update user with profile reference
    await ctx.db.patch(userId, {
      beneficiaryProfileId: profileId
    })

    return { success: true, userId }
  }
})

// Create ofertante with minimal fields (admin manual creation)
export const createOfertanteMinimal = mutation({
  args: {
    nome: v.string(),
    telefone: v.string()
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    userId?: Id<'users'>
    error?: string
  }> => {
    const currentUserId = await getAuthUserId(ctx)
    if (!currentUserId) {
      return { success: false, error: 'Não autenticado' }
    }

    const currentUser = await ctx.db.get(currentUserId)
    if (!currentUser || currentUser.role !== 'admin') {
      return {
        success: false,
        error: 'Apenas administradores podem criar usuários'
      }
    }

    const n = normalizePhone(args.telefone)
    if (!n.isValid()) {
      return { success: false, error: 'Telefone inválido' }
    }

    const phoneE164 = n.save()

    // Check for existing phone
    const existingUser = await ctx.db
      .query('users')
      .withIndex('phone', (q) => q.eq('phone', phoneE164))
      .first()

    if (existingUser) {
      return { success: false, error: 'Este telefone já está cadastrado' }
    }

    const now = Date.now()

    const userId = await ctx.db.insert('users', {
      role: 'ofertante',
      cpf: '',
      nome: args.nome,
      searchName: normalizeName(args.nome),
      phone: phoneE164,
      status: 'onboarding',
      criadoEm: now,
      atualizadoEm: now
    })

    // Create empty ofertante profile
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

    // Update user with profile reference
    await ctx.db.patch(userId, {
      ofertanteProfileId: profileId
    })

    return { success: true, userId }
  }
})

// ============ ADMIN DELETE USER ============

async function deleteAllRefreshTokensForSession(
  ctx: MutationCtx,
  sessionId: Id<'authSessions'>
) {
  const tokens = await ctx.db
    .query('authRefreshTokens')
    .withIndex('sessionId', (q) => q.eq('sessionId', sessionId))
    .collect()
  for (const t of tokens) {
    await ctx.db.delete(t._id)
  }
}

async function deleteAuthRecordsForUser(
  ctx: MutationCtx,
  userId: Id<'users'>,
  phone: string | undefined
) {
  const sessions = await ctx.db
    .query('authSessions')
    .withIndex('userId', (q) => q.eq('userId', userId))
    .collect()

  for (const session of sessions) {
    await deleteAllRefreshTokensForSession(ctx, session._id)
    const verifiers = await ctx.db
      .query('authVerifiers')
      .filter((q) => q.eq(q.field('sessionId'), session._id))
      .collect()
    for (const ver of verifiers) {
      await ctx.db.delete(ver._id)
    }
    await ctx.db.delete(session._id)
  }

  const accounts = await ctx.db
    .query('authAccounts')
    .filter((q) => q.eq(q.field('userId'), userId))
    .collect()

  for (const account of accounts) {
    const codes = await ctx.db
      .query('authVerificationCodes')
      .withIndex('accountId', (q) => q.eq('accountId', account._id))
      .collect()
    for (const c of codes) {
      await ctx.db.delete(c._id)
    }
    await ctx.db.delete(account._id)
  }

  if (phone) {
    const rate = await ctx.db
      .query('authRateLimits')
      .withIndex('identifier', (q) => q.eq('identifier', phone))
      .first()
    if (rate) {
      await ctx.db.delete(rate._id)
    }
  }
}

async function deleteUserDocuments(ctx: MutationCtx, userId: Id<'users'>) {
  const docs = await ctx.db
    .query('documents')
    .withIndex('by_user', (q) => q.eq('userId', userId))
    .collect()
  for (const doc of docs) {
    await r2.deleteObject(ctx, doc.r2Key)
    await ctx.db.delete(doc._id)
  }
}

export const adminDeleteBeneficiary = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const actor = await verifyAdmin(ctx)
    if (actor._id === args.userId) {
      throw new ConvexError('Não é possível excluir o próprio usuário')
    }
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary') {
      throw new ConvexError('Beneficiário não encontrado')
    }

    await deleteUserDocuments(ctx, args.userId)

    const selections = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_beneficiario', (q) => q.eq('beneficiarioId', args.userId))
      .collect()
    for (const s of selections) {
      await ctx.db.delete(s._id)
    }

    if (user.beneficiaryProfileId) {
      await ctx.db.delete(user.beneficiaryProfileId)
    }

    await deleteAuthRecordsForUser(ctx, args.userId, user.phone)

    await ctx.db.delete(args.userId)
  }
})

export const adminDeleteOfertante = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const actor = await verifyAdmin(ctx)
    if (actor._id === args.userId) {
      throw new ConvexError('Não é possível excluir o próprio usuário')
    }
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'ofertante') {
      throw new ConvexError('Ofertante não encontrado')
    }

    const owned = await ctx.db
      .query('properties')
      .withIndex('by_ofertante', (q) => q.eq('ofertanteId', args.userId))
      .first()
    if (owned !== null) {
      throw new ConvexError(
        'Não é possível excluir: existem imóveis cadastrados para este ofertante.'
      )
    }

    await deleteUserDocuments(ctx, args.userId)

    if (user.ofertanteProfileId) {
      await ctx.db.delete(user.ofertanteProfileId)
    }

    await deleteAuthRecordsForUser(ctx, args.userId, user.phone)

    await ctx.db.delete(args.userId)
  }
})
