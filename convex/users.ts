import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { normalizePhone } from '../lib/normalize-phone'
import { Doc, Id } from './_generated/dataModel'
import { internalMutation, mutation, query } from './_generated/server'
import { estadoCivilEnum } from './schema'

// Clean CPF (remove non-digits)
function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

// Validate CPF format (basic)
function isValidCPFLength(cpf: string): boolean {
  const cleaned = cleanCPF(cpf)
  return cleaned.length === 11
}

/** Compare stored telefone (any supported shape) with user input. */
function sameBrazilMobile(stored: string, input: string): boolean {
  const a = normalizePhone(stored)
  const b = normalizePhone(input)
  if (!a.isValid() || !b.isValid()) return false
  return a.digits() === b.digits()
}

// ============ QUERIES ============

export const getByCPF = query({
  args: { cpf: v.string() },
  handler: async (ctx, args): Promise<Doc<'users'> | null> => {
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
    return await ctx.db.get(args.id)
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

export const getBeneficiariesForRanking = query({
  args: {},
  handler: async (ctx) => {
    const beneficiaries = await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'beneficiary').eq('status', 'active')
      )
      .collect()

    // Sort by ranking priority:
    // 1. mesesAluguelSocial (higher = higher priority)
    // 2. possuiIdosoFamilia (true first)
    // 3. chefiaFeminina (true first)
    return beneficiaries.sort((a, b) => {
      // Primary: time in social rent (descending)
      const aMeses = a.mesesAluguelSocial ?? 0
      const bMeses = b.mesesAluguelSocial ?? 0
      if (aMeses !== bMeses) return bMeses - aMeses

      // Secondary: has elderly (true first)
      const aIdoso = a.possuiIdosoFamilia ?? false
      const bIdoso = b.possuiIdosoFamilia ?? false
      if (aIdoso !== bIdoso) return bIdoso ? 1 : -1

      // Tertiary: female head of household (true first)
      const aChefia = a.chefiaFeminina ?? false
      const bChefia = b.chefiaFeminina ?? false
      if (aChefia !== bChefia) return bChefia ? 1 : -1

      // Final tiebreaker: earlier creation date first
      return a.criadoEm - b.criadoEm
    })
  }
})

export const getAdmins = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'admin'))
      .collect()
  }
})

export const getOfertantes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'ofertante'))
      .collect()
  }
})

export const getConstrutores = query({
  args: {},
  handler: async (ctx) => {
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
        .withIndex('by_telefone', (q) => q.eq('telefone', v))
        .first()
      if (user) {
        return { ok: true, exists: true, role: user.role }
      }
    }
    return { ok: true, exists: false }
  }
})

// ============ MUTATIONS ============

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

    if (!sameBrazilMobile(user.telefone, args.telefone)) {
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
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary') {
      throw new Error('Usuário inválido')
    }

    if (!user.termoAceitoEm) {
      throw new Error('Beneficiário precisa aceitar os termos primeiro')
    }

    const currentSelections = user.propriedadesInteresse ?? []

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

    await ctx.db.patch(args.userId, {
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
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    const currentSelections = user.propriedadesInteresse ?? []
    const newSelections = currentSelections.filter(
      (id) => id !== args.propertyId
    )

    await ctx.db.patch(args.userId, {
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
    const user = await ctx.db.get(args.userId)
    if (!user) {
      throw new Error('Usuário não encontrado')
    }

    // Beneficiaries cannot modify nome or cpf
    // Admin can modify any field

    const updates: Partial<Doc<'users'>> = {
      atualizadoEm: Date.now()
    }

    if (args.email !== undefined) updates.email = args.email
    if (args.telefone !== undefined) updates.telefone = args.telefone
    if (args.cep !== undefined) updates.cep = args.cep
    if (args.endereco !== undefined) updates.endereco = args.endereco
    if (args.numero !== undefined) updates.numero = args.numero
    if (args.complemento !== undefined) updates.complemento = args.complemento
    if (args.bairro !== undefined) updates.bairro = args.bairro
    if (args.cidade !== undefined) updates.cidade = args.cidade
    if (args.estado !== undefined) updates.estado = args.estado

    await ctx.db.patch(args.userId, updates)

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
    senha: v.string()
  },
  handler: async (ctx, args) => {
    const cleaned = cleanCPF(args.cpf)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
      .first()

    if (existing) {
      throw new Error('CPF já cadastrado')
    }

    // TODO: Hash password properly
    const senhaHash = args.senha // Should be hashed

    const now = Date.now()

    return await ctx.db.insert('users', {
      role: 'admin',
      cpf: cleaned,
      nome: args.nome,
      email: args.email,
      telefone: args.telefone,
      senhaHash,
      status: 'active',
      criadoEm: now,
      atualizadoEm: now
    })
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
        mesesAluguelSocial: v.number(),
        possuiIdosoFamilia: v.boolean(),
        chefiaFeminina: v.boolean(),
        pessoasFamilia: v.optional(v.number()),
        sexo: v.optional(v.string()),
        raca: v.optional(v.string()),
        deficiencias: v.optional(v.array(v.string()))
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
    erros: Array<{ linha: number; erro: string }>
  }> => {
    // Verify admin
    const admin = await ctx.db.get(args.adminId)
    if (!admin || admin.role !== 'admin') {
      throw new Error('Apenas administradores podem fazer upload em massa')
    }

    const erros: Array<{ linha: number; erro: string }> = []
    let sucessos = 0
    const now = Date.now()

    for (let i = 0; i < args.beneficiaries.length; i++) {
      const b = args.beneficiaries[i]
      const linha = i + 1

      try {
        const cleaned = cleanCPF(b.cpf)

        if (!isValidCPFLength(cleaned)) {
          erros.push({ linha, erro: 'CPF inválido' })
          continue
        }

        const existing = await ctx.db
          .query('users')
          .withIndex('by_cpf', (q) => q.eq('cpf', cleaned))
          .first()

        if (existing) {
          erros.push({ linha, erro: 'CPF já cadastrado' })
          continue
        }

        await ctx.db.insert('users', {
          role: 'beneficiary',
          cpf: cleaned,
          nome: b.nome,
          telefone: b.telefone,
          mesesAluguelSocial: b.mesesAluguelSocial,
          possuiIdosoFamilia: b.possuiIdosoFamilia,
          chefiaFeminina: b.chefiaFeminina,
          pessoasFamilia: b.pessoasFamilia,
          sexo: b.sexo as any,
          raca: b.raca as any,
          deficiencias: b.deficiencias as any,
          status: 'pending',
          criadoEm: now,
          atualizadoEm: now
        })

        sucessos++
      } catch (e) {
        erros.push({ linha, erro: String(e) })
      }
    }

    return {
      success: true,
      total: args.beneficiaries.length,
      sucessos,
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
    const telefoneE164 = n.save()

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_telefone', (q) => q.eq('telefone', telefoneE164))
      .first()

    if (existingUser) {
      return { success: false, error: 'Este telefone já está cadastrado' }
    }

    const now = Date.now()

    const userId = await ctx.db.insert('users', {
      role: 'ofertante',
      cpf: '', // Will be filled during onboarding
      nome: args.nome,
      telefone: telefoneE164,
      status: 'onboarding',
      onboardingCompleto: false,
      documentosPendentes: ['rg', 'comp_residencia'],
      criadoEm: now,
      atualizadoEm: now
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

    await ctx.db.patch(userId, {
      nome: args.nome || user.nome,
      cpf: cleanedCPF,
      dataNascimento: args.dataNascimento,
      ...(rgTrim !== undefined && rgTrim !== '' ? { rg: rgTrim } : {}),
      ...(profTrim ? { profissao: profTrim } : {}),
      ...(args.estadoCivil !== undefined ? { estadoCivil: args.estadoCivil } : {}),
      cep: args.cep,
      endereco: args.endereco,
      numero: args.numero,
      complemento: args.complemento,
      bairro: args.bairro,
      cidade: args.cidade,
      estado: args.estado,
      onboardingCompleto: true,
      status: 'active',
      atualizadoEm: Date.now()
    })

    return { success: true }
  }
})

// Get ofertantes with pending onboarding
export const getOfertantesPendentes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('users')
      .withIndex('by_role_and_status', (q) =>
        q.eq('role', 'ofertante').eq('status', 'onboarding')
      )
      .collect()
  }
})
