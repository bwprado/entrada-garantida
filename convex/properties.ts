import { R2 } from '@convex-dev/r2'
import { getAuthUserId } from '@convex-dev/auth/server'
import { v } from 'convex/values'
import { components } from './_generated/api'
import { Doc, Id } from './_generated/dataModel'
import { mutation, query } from './_generated/server'
import {
  ensurePropertyOwnerOrAdmin,
  verifyAdmin,
  verifyLogin,
  verifyPropertyOwnerOrAdmin,
  verifySelfOrAdmin
} from './authz'
import {
  PROPERTY_SALE_DOCUMENT_TIPOS,
  missingSaleDocumentMessage
} from './propertySaleDocuments'
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
    if (!user) return []
    if (user.role !== 'beneficiary' || !user.beneficiaryProfileId) {
      return []
    }
    const profile = await ctx.db.get(user.beneficiaryProfileId)
    if (!profile) return []
    const properties = await Promise.all(
      profile.propriedadesInteresse?.map((id) => ctx.db.get(id)) || []
    )
    return properties.filter((p): p is Doc<'properties'> => p !== null)
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
        (p) => p.compartimentos >= args.compartimentosMin!
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
          p.inscricaoImobiliaria.toLowerCase().includes(q)
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

    const selections = await ctx.db
      .query('selectionsHistory')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .filter((q) => q.eq(q.field('removidoEm'), undefined))
      .collect()

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
    compartimentos: v.number(),
    tamanho: v.number(),
    dataConstrucao: v.number(),
    matricula: v.string(),
    inscricaoImobiliaria: v.string(),
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

    const comp = validateCompartimentos(args.compartimentos)
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
      compartimentos: args.compartimentos,
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

    const comp = validateCompartimentos(property.compartimentos)
    if (!comp.valid) {
      throw new Error(comp.errors.join('; '))
    }

    const propertyDocs = await ctx.db
      .query('documents')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .collect()
    const missing = PROPERTY_SALE_DOCUMENT_TIPOS.filter(
      (t) => !propertyDocs.some((d) => d.tipo === t)
    )
    if (missing.length > 0) {
      throw new Error(missingSaleDocumentMessage(missing))
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

    if (property.status !== 'pending' && property.status !== 'validated') {
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

    if (allApproved && property.status === 'pending') {
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
    if (args.tamanho !== undefined) updates.tamanho = args.tamanho
    if (args.dataConstrucao !== undefined)
      updates.dataConstrucao = args.dataConstrucao
    if (args.matricula !== undefined) updates.matricula = args.matricula
    if (args.inscricaoImobiliaria !== undefined)
      updates.inscricaoImobiliaria = args.inscricaoImobiliaria

    if (args.compartimentos !== undefined) {
      const comp = validateCompartimentos(args.compartimentos)
      if (!comp.valid) {
        throw new Error(comp.errors.join('; '))
      }
      updates.compartimentos = args.compartimentos
    }

    const finalComp = args.compartimentos ?? property.compartimentos
    const compCheck = validateCompartimentos(finalComp)
    if (!compCheck.valid) {
      throw new Error(compCheck.errors.join('; '))
    }

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

    await ctx.db.patch(args.propertyId, {
      status: 'sold',
      atualizadoEm: Date.now()
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
