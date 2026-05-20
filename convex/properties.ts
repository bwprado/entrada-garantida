import { R2 } from '@convex-dev/r2'
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { components } from './_generated/api'
import { Doc, Id } from './_generated/dataModel'
import {
  internalMutation,
  mutation,
  type MutationCtx,
  query
} from './_generated/server'
import {
  ensurePropertyOwnerOrAdmin,
  verifyAdmin,
  verifyLogin,
  verifyPropertyOwnerOrAdmin,
  verifySelfOrAdmin
} from './authz'
import { isSelectionActivePending } from './selectionHistory'
import { MAX_PROPERTY_PRICE } from './schema'

const r2 = new R2(components.r2)
const MIN_COMPARTIMENTOS = 1

function validateCompartimentos(n: number): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  if (!Number.isInteger(n) || n < MIN_COMPARTIMENTOS) {
    errors.push('Informe pelo menos 1 compartimento')
  }
  return { valid: errors.length === 0, errors }
}

function deriveCompartimentosFromRooms(input: {
  quartos?: number
  suites?: number
  banheiros?: number
  salasEstar?: number
  cozinhas?: number
  vagasGaragem?: number
  areasServico?: number
}): number {
  return (
    (input.quartos ?? 0) +
    (input.suites ?? 0) +
    (input.banheiros ?? 0) +
    (input.salasEstar ?? 0) +
    (input.cozinhas ?? 0) +
    (input.vagasGaragem ?? 0) +
    (input.areasServico ?? 0)
  )
}

// ============ QUERIES ============

export const getById = query({
  args: { id: v.id('properties') },
  handler: async (ctx, args): Promise<Doc<'properties'> | null> => {
    return await ctx.db.get(args.id)
  }
})

/** Public catalog + owner preview: validated for everyone; else only owner, construtor, or admin. */
export const getForPublicDetail = query({
  args: { id: v.id('properties') },
  handler: async (ctx, { id }): Promise<Doc<'properties'> | null> => {
    const p = await ctx.db.get(id)
    if (!p) return null
    if (p.status === 'validated') return p
    const userId = await getAuthUserId(ctx)
    if (!userId) return null
    const user = await ctx.db.get(userId)
    if (!user) return null
    if (user.role === 'admin') return p
    if (p.ofertanteId === user._id || p.construtorId === user._id) return p
    return null
  }
})

/** Load a single property for the logged-in ofertante/construtor (or admin) who owns it. */
export const getByIdForOwner = query({
  args: { id: v.id('properties') },
  handler: async (ctx, { id }): Promise<Doc<'properties'> | null> => {
    const user = await verifyLogin(ctx)
    const p = await ctx.db.get(id)
    if (!p) return null
    ensurePropertyOwnerOrAdmin(user, p)
    return p
  }
})

export const getByIds = query({
  args: { ids: v.array(v.id('properties')) },
  handler: async (ctx, args): Promise<Doc<'properties'>[]> => {
    const properties = await Promise.all(args.ids.map((id) => ctx.db.get(id)))
    return properties.filter((p): p is Doc<'properties'> => p !== null)
  }
})

export const getUserSelectedProperties = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary') {
      return []
    }

    const lines = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_beneficiario', (q) => q.eq('beneficiarioId', args.userId))
      .collect()
    const activeLine = lines.find((line) => isSelectionActivePending(line))
    if (!activeLine) return []
    const property = await ctx.db.get(activeLine.propertyId)
    return property ? [property] : []
  }
})

export const getUserPropertySelectionState = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    const user = await ctx.db.get(args.userId)
    if (!user || user.role !== 'beneficiary') {
      return { selectedProperty: null, selectionLocked: false }
    }

    const lines = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_beneficiario', (q) => q.eq('beneficiarioId', args.userId))
      .collect()
    const activeLine = lines.find((line) => isSelectionActivePending(line))
    const selectedProperty = activeLine
      ? await ctx.db.get(activeLine.propertyId)
      : null
    return {
      selectedProperty,
      selectionLocked: selectedProperty !== null
    }
  }
})

export const getValidated = query({
  args: {
    search: v.optional(v.string()),
    precoMin: v.optional(v.number()),
    precoMax: v.optional(v.number()),
    compartimentosMin: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query('properties')
      .withIndex('by_status', (q) => q.eq('status', 'validated'))

    let results = await q.collect()

    if (args.search) {
      const s = args.search.toLowerCase()
      results = results.filter(
        (p) =>
          p.titulo.toLowerCase().includes(s) ||
          p.endereco.toLowerCase().includes(s)
      )
    }
    if (args.precoMin !== undefined) {
      results = results.filter((p) => p.valorVenda >= args.precoMin!)
    }
    if (args.precoMax !== undefined) {
      results = results.filter((p) => p.valorVenda <= args.precoMax!)
    }
    if (args.compartimentosMin !== undefined) {
      results = results.filter(
        (p) => (p.compartimentos ?? 0) >= args.compartimentosMin!
      )
    }

    return await Promise.all(
      results.map(async (p) => {
        const firstId = p.filesIds?.[0]
        if (!firstId) {
          return { ...p, coverImageUrl: null as string | null }
        }
        const file = await ctx.db.get(firstId)
        if (!file) {
          return { ...p, coverImageUrl: null as string | null }
        }
        const coverImageUrl = await r2.getUrl(file.r2Key)
        return { ...p, coverImageUrl }
      })
    )
  }
})

export const getByOfertante = query({
  args: { ofertanteId: v.id('users') },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    if (actor.role !== 'admin' && actor._id !== args.ofertanteId) {
      throw new Error('Permissão negada')
    }
    return await ctx.db
      .query('properties')
      .withIndex('by_ofertante', (q) => q.eq('ofertanteId', args.ofertanteId))
      .collect()
  }
})

export const getByConstrutor = query({
  args: { construtorId: v.id('users') },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    if (actor.role !== 'admin' && actor._id !== args.construtorId) {
      throw new Error('Permissão negada')
    }
    return await ctx.db
      .query('properties')
      .withIndex('by_construtor', (q) =>
        q.eq('construtorId', args.construtorId)
      )
      .collect()
  }
})

export const getPendingValidation = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('properties')
      .withIndex('by_status', (q) => q.eq('status', 'pending'))
      .collect()
  }
})

const propertyStatusFilterArg = v.optional(
  v.union(
    v.literal('draft'),
    v.literal('pending'),
    v.literal('validated'),
    v.literal('paused'),
    v.literal('selected'),
    v.literal('rejected'),
    v.literal('sold')
  )
)

/** All imóveis for admin with owner context, optional status index filter + text search. */
export const getListForAdmin = query({
  args: {
    status: propertyStatusFilterArg,
    searchQuery: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    let list: Doc<'properties'>[]
    if (args.status) {
      list = await ctx.db
        .query('properties')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    } else {
      list = await ctx.db.query('properties').collect()
    }

    const q = args.searchQuery?.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.endereco.toLowerCase().includes(q) ||
          p.matricula.toLowerCase().includes(q) ||
          (p.inscricaoImobiliaria?.toLowerCase().includes(q) ?? false)
      )
    }

    list.sort((a, b) => b.atualizadoEm - a.atualizadoEm)

    const withOwner: Array<{
      property: Doc<'properties'>
      ofertante: {
        nome: string
        email: string | undefined
        _id: Id<'users'>
      } | null
      construtor: {
        nome: string
        email: string | undefined
        _id: Id<'users'>
      } | null
    }> = []

    for (const property of list) {
      let ofertante: {
        nome: string
        email: string | undefined
        _id: Id<'users'>
      } | null = null
      if (property.ofertanteId) {
        const u = await ctx.db.get(property.ofertanteId)
        if (u) {
          ofertante = { nome: u.nome, email: u.email, _id: u._id }
        }
      }
      let construtor: {
        nome: string
        email: string | undefined
        _id: Id<'users'>
      } | null = null
      if (property.construtorId) {
        const u = await ctx.db.get(property.construtorId)
        if (u) {
          construtor = { nome: u.nome, email: u.email, _id: u._id }
        }
      }
      withOwner.push({ property, ofertante, construtor })
    }

    return withOwner
  }
})

export const getForAdminReview = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, { propertyId }) => {
    await verifyAdmin(ctx)
    const property = await ctx.db.get(propertyId)
    if (!property) {
      return null
    }

    let ofertante: {
      nome: string
      email: string | undefined
      _id: Id<'users'>
    } | null = null
    if (property.ofertanteId) {
      const u = await ctx.db.get(property.ofertanteId)
      if (u) {
        ofertante = { nome: u.nome, email: u.email, _id: u._id }
      }
    }
    let construtor: {
      nome: string
      email: string | undefined
      _id: Id<'users'>
    } | null = null
    if (property.construtorId) {
      const u = await ctx.db.get(property.construtorId)
      if (u) {
        construtor = { nome: u.nome, email: u.email, _id: u._id }
      }
    }

    return { property, ofertante, construtor } as const
  }
})

export const getAllForAdmin = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('pending'),
        v.literal('validated'),
        v.literal('paused'),
        v.literal('selected'),
        v.literal('rejected'),
        v.literal('sold')
      )
    )
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    if (args.status) {
      return await ctx.db
        .query('properties')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .collect()
    }

    return await ctx.db.query('properties').collect()
  }
})

export const getSelectionsForProperty = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    const selectionRows = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .collect()
    const selections = selectionRows.filter((line) => isSelectionActivePending(line))

    const beneficiaryIds = selections.map((s) => s.beneficiarioId)
    const beneficiaries = await Promise.all(
      beneficiaryIds.map((id) => ctx.db.get(id))
    )

    return selections.map((s, i) => ({
      selection: s,
      beneficiary: beneficiaries[i]
    }))
  }
})

// ============ MUTATIONS ============

export const create = mutation({
  args: {
    ofertanteId: v.optional(v.id('users')),
    construtorId: v.optional(v.id('users')),
    titulo: v.string(),
    descricao: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco: v.string(),
    compartimentos: v.optional(v.number()),
    quartos: v.optional(v.number()),
    suites: v.optional(v.number()),
    banheiros: v.optional(v.number()),
    salasEstar: v.optional(v.number()),
    cozinhas: v.optional(v.number()),
    vagasGaragem: v.optional(v.number()),
    areasServico: v.optional(v.number()),
    ruaPavimentada: v.optional(v.boolean()),
    garagem: v.optional(v.boolean()),
    areaLavanderia: v.optional(v.boolean()),
    portaria24h: v.optional(v.boolean()),
    elevador: v.optional(v.boolean()),
    piscina: v.optional(v.boolean()),
    churrasqueira: v.optional(v.boolean()),
    academia: v.optional(v.boolean()),
    jardim: v.optional(v.boolean()),
    varanda: v.optional(v.boolean()),
    tamanho: v.number(),
    dataConstrucao: v.optional(v.number()),
    matricula: v.string(),
    inscricaoImobiliaria: v.optional(v.string()),
    valorVenda: v.number()
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean
    propertyId?: Id<'properties'>
    errors?: string[]
  }> => {
    const actor = await verifyLogin(ctx)
    const userId = actor._id
    if (
      actor.role !== 'ofertante' &&
      actor.role !== 'construtor' &&
      actor.role !== 'admin'
    ) {
      return { success: false, errors: ['Não autorizado'] }
    }
    if (args.ofertanteId !== undefined && args.ofertanteId !== userId) {
      return { success: false, errors: ['Não autorizado'] }
    }
    if (args.construtorId !== undefined && args.construtorId !== userId) {
      return { success: false, errors: ['Não autorizado'] }
    }

    if (args.valorVenda > MAX_PROPERTY_PRICE) {
      return {
        success: false,
        errors: [
          `Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString('pt-BR')}`
        ]
      }
    }

    const derivedCompartimentos = deriveCompartimentosFromRooms(args)
    const compartimentosToStore = args.compartimentos ?? derivedCompartimentos
    const comp = validateCompartimentos(compartimentosToStore)
    if (!comp.valid) {
      return { success: false, errors: comp.errors }
    }

    if (args.tamanho <= 0) {
      return { success: false, errors: ['Tamanho deve ser maior que zero'] }
    }

    if (!args.ofertanteId && !args.construtorId) {
      return {
        success: false,
        errors: ['Propriedade deve ter um ofertante ou construtor']
      }
    }

    const now = Date.now()
    const cepClean = args.cep?.replace(/\D/g, '') ?? ''
    const cepToStore = cepClean.length === 8 ? cepClean : undefined

    const propertyId = await ctx.db.insert('properties', {
      ofertanteId: args.ofertanteId,
      construtorId: args.construtorId,
      titulo: args.titulo,
      descricao: args.descricao,
      cep: cepToStore,
      endereco: args.endereco,
      compartimentos: compartimentosToStore,
      quartos: args.quartos ?? 0,
      suites: args.suites ?? 0,
      banheiros: args.banheiros ?? 0,
      salasEstar: args.salasEstar ?? 0,
      cozinhas: args.cozinhas ?? 0,
      vagasGaragem: args.vagasGaragem ?? 0,
      areasServico: args.areasServico ?? 0,
      ruaPavimentada: args.ruaPavimentada ?? false,
      garagem: args.garagem ?? false,
      areaLavanderia: args.areaLavanderia ?? false,
      portaria24h: args.portaria24h ?? false,
      elevador: args.elevador ?? false,
      piscina: args.piscina ?? false,
      churrasqueira: args.churrasqueira ?? false,
      academia: args.academia ?? false,
      jardim: args.jardim ?? false,
      varanda: args.varanda ?? false,
      tamanho: args.tamanho,
      dataConstrucao: args.dataConstrucao,
      matricula: args.matricula,
      inscricaoImobiliaria: args.inscricaoImobiliaria,
      valorVenda: args.valorVenda,
      status: 'draft',
      checklistValidacao: {
        dadosPessoais: 'pending',
        localizacao: 'pending',
        construcao: 'pending',
        cartorio: 'pending',
        preco: 'pending',
        documentos: 'pending'
      },
      criadoEm: now,
      atualizadoEm: now
    })

    return { success: true, propertyId }
  }
})

export const submitForValidation = mutation({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    if (property.status !== 'draft' && property.status !== 'rejected') {
      throw new Error(
        'Apenas propriedades em rascunho ou rejeitadas podem ser submetidas'
      )
    }

    if (property.valorVenda > MAX_PROPERTY_PRICE) {
      throw new Error(
        `Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString('pt-BR')}`
      )
    }

    const comp = validateCompartimentos(property.compartimentos ?? 0)
    if (!comp.valid) {
      throw new Error(comp.errors.join('; '))
    }

    const now = Date.now()
    const clearRejection =
      property.status === 'rejected'
        ? {
            motivoRejeicao: undefined,
            rejeitadoEm: undefined,
            rejeitadoPor: undefined
          }
        : {}

    await ctx.db.patch(args.propertyId, {
      status: 'pending',
      atualizadoEm: now,
      ...clearRejection
    })

    return { success: true }
  }
})

export const updateChecklistItem = mutation({
  args: {
    propertyId: v.id('properties'),
    item: v.union(
      v.literal('dadosPessoais'),
      v.literal('localizacao'),
      v.literal('construcao'),
      v.literal('cartorio'),
      v.literal('preco'),
      v.literal('documentos')
    ),
    status: v.union(
      v.literal('pending'),
      v.literal('approved'),
      v.literal('rejected')
    ),
    nota: v.optional(v.string()),
    adminId: v.id('users')
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)

    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }

    if (
      property.status !== 'pending' &&
      property.status !== 'validated' &&
      property.status !== 'paused'
    ) {
      throw new Error('Propriedade não está pendente de validação')
    }

    const checklist = { ...property.checklistValidacao }
    checklist[args.item] = args.status

    const notas = property.notasValidacao ? { ...property.notasValidacao } : {}
    if (args.nota) {
      notas[args.item] = args.nota
    }

    await ctx.db.patch(args.propertyId, {
      checklistValidacao: checklist,
      notasValidacao: notas,
      atualizadoEm: Date.now()
    })

    const allApproved = Object.values(checklist).every((s) => s === 'approved')

    if (allApproved && (property.status === 'pending' || property.status === 'paused')) {
      await ctx.db.patch(args.propertyId, {
        status: 'validated',
        validadoEm: Date.now(),
        validadoPor: args.adminId,
        motivoRejeicao: undefined,
        rejeitadoEm: undefined,
        rejeitadoPor: undefined
      })
    }

    return { success: true, allApproved }
  }
})

async function clearPropertyFromBeneficiaryWishlists(
  ctx: MutationCtx,
  propertyId: Id<'properties'>,
  now: number,
  reason: string
): Promise<void> {
  const trimmedReason = reason.trim()
  if (trimmedReason.length < 3) {
    throw new Error('Informe o motivo da rejeição (mín. 3 caracteres)')
  }

  const openSelections = await ctx.db
    .query('selectionsHistory')
    .withIndex('by_property', (q) => q.eq('propertyId', propertyId))
    .collect()
  for (const row of openSelections) {
    if (!isSelectionActivePending(row)) continue
    await ctx.db.patch(row._id, {
      removidoEm: now,
      outcome: 'rejected',
      rejectedReason: trimmedReason
    })
  }
}

export const pauseListing = mutation({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, { propertyId }) => {
    await verifyAdmin(ctx)
    const property = await ctx.db.get(propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    if (property.status !== 'validated') {
      throw new Error('Só é possível pausar anúncios validados')
    }
    const now = Date.now()
    await ctx.db.patch(propertyId, { status: 'paused', atualizadoEm: now })
    return { success: true as const }
  }
})

export const resumeListing = mutation({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, { propertyId }) => {
    await verifyAdmin(ctx)
    const property = await ctx.db.get(propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    if (property.status !== 'paused') {
      throw new Error('Este anúncio não está pausado')
    }
    const now = Date.now()
    await ctx.db.patch(propertyId, { status: 'validated', atualizadoEm: now })
    return { success: true as const }
  }
})

export const adminInvalidateListing = mutation({
  args: {
    propertyId: v.id('properties'),
    adminId: v.id('users'),
    motivo: v.string()
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)
    if (args.motivo.trim().length < 3) {
      throw new Error('Informe o motivo (mín. 3 caracteres)')
    }
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    const now = Date.now()
    const reason = args.motivo.trim()
    await clearPropertyFromBeneficiaryWishlists(
      ctx,
      args.propertyId,
      now,
      reason
    )
    await ctx.db.patch(args.propertyId, {
      status: 'rejected',
      motivoRejeicao: reason,
      rejeitadoEm: now,
      rejeitadoPor: args.adminId,
      atualizadoEm: now
    })
    return { success: true as const }
  }
})

export const reopenToPending = mutation({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, { propertyId }) => {
    await verifyAdmin(ctx)
    const property = await ctx.db.get(propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    if (
      property.status !== 'validated' &&
      property.status !== 'paused' &&
      property.status !== 'rejected'
    ) {
      throw new Error(
        'Só é possível reabrir anúncios validados, pausados ou rejeitados'
      )
    }
    const now = Date.now()
    const pendingChecklist = {
      dadosPessoais: 'pending' as const,
      localizacao: 'pending' as const,
      construcao: 'pending' as const,
      cartorio: 'pending' as const,
      preco: 'pending' as const,
      documentos: 'pending' as const
    }
    await ctx.db.patch(propertyId, {
      status: 'pending',
      checklistValidacao: pendingChecklist,
      notasValidacao: undefined,
      validadoEm: undefined,
      validadoPor: undefined,
      motivoRejeicao: undefined,
      rejeitadoEm: undefined,
      rejeitadoPor: undefined,
      atualizadoEm: now
    })
    return { success: true as const }
  }
})

export const approveAll = mutation({
  args: {
    propertyId: v.id('properties'),
    adminId: v.id('users')
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)

    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }

    const now = Date.now()
    const approvedChecklist = {
      dadosPessoais: 'approved' as const,
      localizacao: 'approved' as const,
      construcao: 'approved' as const,
      cartorio: 'approved' as const,
      preco: 'approved' as const,
      documentos: 'approved' as const
    }

    await ctx.db.patch(args.propertyId, {
      status: 'validated',
      checklistValidacao: approvedChecklist,
      validadoEm: now,
      validadoPor: args.adminId,
      atualizadoEm: now,
      motivoRejeicao: undefined,
      rejeitadoEm: undefined,
      rejeitadoPor: undefined
    })

    return { success: true }
  }
})

export const reject = mutation({
  args: {
    propertyId: v.id('properties'),
    adminId: v.id('users'),
    motivo: v.string()
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)

    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }

    const now = Date.now()

    await ctx.db.patch(args.propertyId, {
      status: 'rejected',
      motivoRejeicao: args.motivo,
      rejeitadoEm: now,
      rejeitadoPor: args.adminId,
      atualizadoEm: now
    })

    return { success: true }
  }
})

export const update = mutation({
  args: {
    propertyId: v.id('properties'),
    titulo: v.optional(v.string()),
    descricao: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),
    compartimentos: v.optional(v.number()),
    quartos: v.optional(v.number()),
    suites: v.optional(v.number()),
    banheiros: v.optional(v.number()),
    salasEstar: v.optional(v.number()),
    cozinhas: v.optional(v.number()),
    vagasGaragem: v.optional(v.number()),
    areasServico: v.optional(v.number()),
    ruaPavimentada: v.optional(v.boolean()),
    garagem: v.optional(v.boolean()),
    areaLavanderia: v.optional(v.boolean()),
    portaria24h: v.optional(v.boolean()),
    elevador: v.optional(v.boolean()),
    piscina: v.optional(v.boolean()),
    churrasqueira: v.optional(v.boolean()),
    academia: v.optional(v.boolean()),
    jardim: v.optional(v.boolean()),
    varanda: v.optional(v.boolean()),
    tamanho: v.optional(v.number()),
    dataConstrucao: v.optional(v.number()),
    matricula: v.optional(v.string()),
    inscricaoImobiliaria: v.optional(v.string()),
    valorVenda: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    if (property.status !== 'draft' && property.status !== 'rejected') {
      throw new Error(
        'Apenas propriedades em rascunho ou rejeitadas podem ser editadas'
      )
    }

    const updates: Partial<Doc<'properties'>> = {
      atualizadoEm: Date.now()
    }

    if (args.valorVenda !== undefined) {
      if (args.valorVenda > MAX_PROPERTY_PRICE) {
        throw new Error(
          `Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString('pt-BR')}`
        )
      }
      updates.valorVenda = args.valorVenda
    }

    if (args.titulo !== undefined) updates.titulo = args.titulo
    if (args.descricao !== undefined) updates.descricao = args.descricao
    if (args.cep !== undefined) {
      const clean = args.cep.replace(/\D/g, '')
      updates.cep = clean.length === 8 ? clean : undefined
    }
    if (args.endereco !== undefined) updates.endereco = args.endereco
    if (args.quartos !== undefined) updates.quartos = args.quartos
    if (args.suites !== undefined) updates.suites = args.suites
    if (args.banheiros !== undefined) updates.banheiros = args.banheiros
    if (args.salasEstar !== undefined) updates.salasEstar = args.salasEstar
    if (args.cozinhas !== undefined) updates.cozinhas = args.cozinhas
    if (args.vagasGaragem !== undefined) updates.vagasGaragem = args.vagasGaragem
    if (args.areasServico !== undefined) updates.areasServico = args.areasServico
    if (args.ruaPavimentada !== undefined)
      updates.ruaPavimentada = args.ruaPavimentada
    if (args.garagem !== undefined) updates.garagem = args.garagem
    if (args.areaLavanderia !== undefined)
      updates.areaLavanderia = args.areaLavanderia
    if (args.portaria24h !== undefined) updates.portaria24h = args.portaria24h
    if (args.elevador !== undefined) updates.elevador = args.elevador
    if (args.piscina !== undefined) updates.piscina = args.piscina
    if (args.churrasqueira !== undefined)
      updates.churrasqueira = args.churrasqueira
    if (args.academia !== undefined) updates.academia = args.academia
    if (args.jardim !== undefined) updates.jardim = args.jardim
    if (args.varanda !== undefined) updates.varanda = args.varanda
    if (args.tamanho !== undefined) updates.tamanho = args.tamanho
    if (args.dataConstrucao !== undefined)
      updates.dataConstrucao = args.dataConstrucao
    if (args.matricula !== undefined) updates.matricula = args.matricula
    if (args.inscricaoImobiliaria !== undefined)
      updates.inscricaoImobiliaria = args.inscricaoImobiliaria

    const finalComp =
      args.compartimentos ??
      deriveCompartimentosFromRooms({
        quartos: args.quartos ?? property.quartos,
        suites: args.suites ?? property.suites,
        banheiros: args.banheiros ?? property.banheiros,
        salasEstar: args.salasEstar ?? property.salasEstar,
        cozinhas: args.cozinhas ?? property.cozinhas,
        vagasGaragem: args.vagasGaragem ?? property.vagasGaragem,
        areasServico: args.areasServico ?? property.areasServico
      })
    const compCheck = validateCompartimentos(finalComp)
    if (!compCheck.valid) {
      throw new Error(compCheck.errors.join('; '))
    }
    updates.compartimentos = finalComp

    await ctx.db.patch(args.propertyId, updates)

    return { success: true }
  }
})

export const markAsSold = mutation({
  args: {
    propertyId: v.id('properties'),
    beneficiarioId: v.id('users'),
    adminId: v.id('users')
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)

    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }

    if (property.status !== 'selected') {
      throw new Error("Propriedade deve estar no status 'selected'")
    }

    const lines = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_beneficiario', (q) =>
        q.eq('beneficiarioId', args.beneficiarioId)
      )
      .collect()
    const activeLine = lines.find(
      (line) =>
        line.propertyId === args.propertyId && isSelectionActivePending(line)
    )
    if (!activeLine) {
      throw new Error('Linha de aquisição ativa não encontrada')
    }
    const now = Date.now()
    await ctx.db.patch(activeLine._id, {
      outcome: 'sold',
      removidoEm: now,
      rejectedReason: undefined
    })

    await ctx.db.patch(args.propertyId, {
      status: 'sold',
      atualizadoEm: now
    })

    return { success: true }
  }
})

export const softDelete = mutation({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    const user = await verifyPropertyOwnerOrAdmin(ctx, property)

    if (property.status === 'draft') {
      await ctx.db.delete(args.propertyId)
    } else {
      const now = Date.now()
      await ctx.db.patch(args.propertyId, {
        status: 'rejected',
        motivoRejeicao: 'Removido pelo usuário',
        rejeitadoEm: now,
        rejeitadoPor: user._id,
        atualizadoEm: now
      })
    }

    return { success: true }
  }
})

/** One-off: define explicit outcomes for pre-migration rows. */
export const backfillSelectionOutcomes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('selectionsHistory').collect()
    let updated = 0

    for (const row of rows) {
      if (row.removidoEm === undefined && row.outcome !== 'pending') {
        await ctx.db.patch(row._id, { outcome: 'pending' })
        updated += 1
        continue
      }

      if (row.removidoEm !== undefined && row.outcome === 'pending') {
        await ctx.db.patch(row._id, {
          outcome: 'withdrawn',
          rejectedReason: undefined
        })
        updated += 1
      }
    }

    return { scanned: rows.length, updated }
  }
})
