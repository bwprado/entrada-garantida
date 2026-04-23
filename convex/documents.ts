import { v } from 'convex/values'
import { Doc, Id } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'
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
  type PropertySaleDocumentTipo,
  propertySaleDocumentTipo
} from './propertySaleDocuments'
import { r2 } from './r2'

/** User-scoped ofertante checklist documents (no propertyId) */
const ofertanteChecklistTipo = v.union(
  v.literal('rg'),
  v.literal('comp_residencia'),
  v.literal('matricula'),
  v.literal('iptu')
)

type OfertanteChecklistTipo = 'rg' | 'comp_residencia' | 'matricula' | 'iptu'

async function assertDocumentAccess(
  ctx: QueryCtx | MutationCtx,
  actor: Doc<'users'>,
  doc: Doc<'documents'>
): Promise<void> {
  if (actor.role === 'admin' || doc.userId === actor._id) {
    return
  }

  if (doc.propertyId) {
    const property = await ctx.db.get(doc.propertyId)
    if (property) {
      ensurePropertyOwnerOrAdmin(actor, property)
      return
    }
  }

  throw new Error('Permissão negada')
}

// ============ QUERIES ============

export const getByUser = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    return await ctx.db
      .query('documents')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect()
  }
})

export const getByProperty = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    return await ctx.db
      .query('documents')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .collect()
  }
})

export const getByUserAndType = query({
  args: {
    userId: v.id('users'),
    tipo: v.union(
      v.literal('matricula'),
      v.literal('iptu'),
      v.literal('certidao_tributos'),
      v.literal('certidao_indisponibilidade'),
      v.literal('certidao_condominio'),
      v.literal('rg'),
      v.literal('comp_estado_civil'),
      v.literal('comp_residencia'),
      v.literal('habite_se'),
      v.literal('foto_imovel'),
      v.literal('plantas'),
      v.literal('outro')
    )
  },
  handler: async (ctx, args) => {
    await verifySelfOrAdmin(ctx, args.userId)
    return await ctx.db
      .query('documents')
      .withIndex('by_user_and_tipo', (q) =>
        q.eq('userId', args.userId).eq('tipo', args.tipo)
      )
      .first()
  }
})

export const getByPropertyAndType = query({
  args: {
    propertyId: v.id('properties'),
    tipo: v.union(
      v.literal('matricula'),
      v.literal('iptu'),
      v.literal('certidao_tributos'),
      v.literal('certidao_indisponibilidade'),
      v.literal('certidao_condominio'),
      v.literal('rg'),
      v.literal('comp_estado_civil'),
      v.literal('comp_residencia'),
      v.literal('habite_se'),
      v.literal('foto_imovel'),
      v.literal('plantas'),
      v.literal('outro')
    )
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    return await ctx.db
      .query('documents')
      .withIndex('by_property_and_tipo', (q) =>
        q.eq('propertyId', args.propertyId).eq('tipo', args.tipo)
      )
      .first()
  }
})

export const getPropertyDocuments = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    return await ctx.db
      .query('documents')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .collect()
  }
})

/** Property documents with linked file row (one round-trip for admin/owner review). */
export const getPropertyDocumentsWithFiles = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, { propertyId }) => {
    const property = await ctx.db.get(propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    const docs = await ctx.db
      .query('documents')
      .withIndex('by_property', (q) => q.eq('propertyId', propertyId))
      .collect()

    const out: Array<{
      document: (typeof docs)[0]
      file: Doc<'files'> | null
    }> = []
    for (const document of docs) {
      const file = await ctx.db
        .query('files')
        .withIndex('by_document', (q) => q.eq('documentId', document._id))
        .first()
      out.push({ document, file: file ?? null })
    }
    return out
  }
})

export const getPendingDocuments = query({
  args: {},
  handler: async (ctx) => {
    await verifyAdmin(ctx)
    return await ctx.db
      .query('documents')
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect()
  }
})

// Get signed URL for a document
export const getDocumentUrl = query({
  args: {
    documentId: v.id('documents'),
    expiresIn: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    const doc = await ctx.db.get(args.documentId)
    if (!doc) {
      throw new Error('Documento não encontrado')
    }
    await assertDocumentAccess(ctx, actor, doc)

    return await r2.getUrl(doc.r2Key, {
      expiresIn: args.expiresIn ?? 3600 // Default 1 hour
    })
  }
})

// Get signed URL by R2 key directly
export const getUrlByKey = query({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number())
  },
  handler: async (_ctx, args) => {
    await verifyAdmin(_ctx)
    return await r2.getUrl(args.key, {
      expiresIn: args.expiresIn ?? 3600
    })
  }
})

const OFERTANTE_TIPOS: OfertanteChecklistTipo[] = [
  'rg',
  'comp_residencia',
  'matricula',
  'iptu'
]

/** File IDs for user-level ofertante checklist documents (R2 uploader preview). */
export const getOfertanteDocumentFileIds = query({
  args: { userId: v.id('users') },
  handler: async (ctx, { userId }) => {
    await verifySelfOrAdmin(ctx, userId)

    const out: Record<OfertanteChecklistTipo, Id<'files'> | null> = {
      rg: null,
      comp_residencia: null,
      matricula: null,
      iptu: null
    }

    for (const tipo of OFERTANTE_TIPOS) {
      const rows = await ctx.db
        .query('documents')
        .withIndex('by_user_and_tipo', (q) =>
          q.eq('userId', userId).eq('tipo', tipo)
        )
        .collect()
      const doc = rows.find((d) => d.propertyId === undefined)
      if (!doc) continue

      const file = await ctx.db
        .query('files')
        .withIndex('by_document', (q) => q.eq('documentId', doc._id))
        .first()
      if (file) {
        out[tipo] = file._id
      }
    }

    return out
  }
})

/** File IDs for property-scoped sale checklist (R2 uploader preview). */
export const getPropertySaleDocumentFileIds = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, { propertyId }) => {
    const property = await ctx.db.get(propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    const out: Record<PropertySaleDocumentTipo, Id<'files'> | null> = {
      matricula: null,
      iptu: null,
      certidao_tributos: null,
      certidao_indisponibilidade: null,
      certidao_condominio: null
    }

    for (const tipo of PROPERTY_SALE_DOCUMENT_TIPOS) {
      const doc = await ctx.db
        .query('documents')
        .withIndex('by_property_and_tipo', (q) =>
          q.eq('propertyId', propertyId).eq('tipo', tipo)
        )
        .first()
      if (!doc) continue

      const file = await ctx.db
        .query('files')
        .withIndex('by_document', (q) => q.eq('documentId', doc._id))
        .first()
      if (file) {
        out[tipo] = file._id
      }
    }

    return out
  }
})

// ============ MUTATIONS ============

// Create document record after upload
// The actual upload is handled by the R2 component via useUploadFile hook
export const createDocumentRecord = mutation({
  args: {
    userId: v.id('users'),
    propertyId: v.optional(v.id('properties')),
    tipo: v.union(
      v.literal('matricula'),
      v.literal('iptu'),
      v.literal('certidao_tributos'),
      v.literal('certidao_indisponibilidade'),
      v.literal('certidao_condominio'),
      v.literal('rg'),
      v.literal('comp_estado_civil'),
      v.literal('comp_residencia'),
      v.literal('habite_se'),
      v.literal('foto_imovel'),
      v.literal('plantas'),
      v.literal('outro')
    ),
    r2Key: v.string(), // Key returned by R2 component
    nomeOriginal: v.string()
  },
  handler: async (ctx, args): Promise<Id<'documents'>> => {
    const actor = await verifySelfOrAdmin(ctx, args.userId)
    const now = Date.now()

    if (args.propertyId) {
      const property = await ctx.db.get(args.propertyId)
      if (!property) {
        throw new Error('Propriedade não encontrada')
      }
      if (actor.role !== 'admin') {
        ensurePropertyOwnerOrAdmin(actor, property)
      }
    }

    // Check if document of this type already exists for this user/property
    const existing = args.propertyId
      ? await ctx.db
          .query('documents')
          .withIndex('by_property_and_tipo', (q) =>
            q.eq('propertyId', args.propertyId).eq('tipo', args.tipo)
          )
          .first()
      : await ctx.db
          .query('documents')
          .withIndex('by_user_and_tipo', (q) =>
            q.eq('userId', args.userId).eq('tipo', args.tipo)
          )
          .first()

    if (existing) {
      // Update existing document with new file
      await ctx.db.patch(existing._id, {
        r2Key: args.r2Key,
        nomeOriginal: args.nomeOriginal,
        status: 'pending',
        notaRejeicao: undefined,
        atualizadoEm: now
      })
      return existing._id
    }

    // Create new document record
    return await ctx.db.insert('documents', {
      userId: args.userId,
      propertyId: args.propertyId,
      tipo: args.tipo,
      r2Key: args.r2Key,
      nomeOriginal: args.nomeOriginal,
      status: 'pending',
      criadoEm: now,
      atualizadoEm: now
    })
  }
})

/**
 * Finishes a user-scoped ofertante checklist upload: replaces linked files,
 * updates `documents`, inserts `files` row for previews, clears pending flag.
 */
export const completeOfertanteDocumentFromUpload = mutation({
  args: {
    tipo: ofertanteChecklistTipo,
    r2Key: v.string(),
    nomeOriginal: v.string(),
    contentType: v.string(),
    size: v.number()
  },
  handler: async (ctx, args) => {
    const user = await verifyLogin(ctx)
    if (user.role !== 'ofertante') {
      throw new Error('Apenas ofertantes podem enviar estes documentos')
    }

    const userId = user._id
    const now = Date.now()
    const rows = await ctx.db
      .query('documents')
      .withIndex('by_user_and_tipo', (q) =>
        q.eq('userId', userId).eq('tipo', args.tipo)
      )
      .collect()
    const existing = rows.find((d) => d.propertyId === undefined) ?? null

    const deletedR2Keys = new Set<string>()

    if (existing) {
      const oldFiles = await ctx.db
        .query('files')
        .withIndex('by_document', (q) => q.eq('documentId', existing._id))
        .collect()
      for (const f of oldFiles) {
        if (!deletedR2Keys.has(f.r2Key)) {
          await r2.deleteObject(ctx, f.r2Key)
          deletedR2Keys.add(f.r2Key)
        }
        await ctx.db.delete(f._id)
      }
      if (!deletedR2Keys.has(existing.r2Key)) {
        await r2.deleteObject(ctx, existing.r2Key)
        deletedR2Keys.add(existing.r2Key)
      }

      await ctx.db.patch(existing._id, {
        r2Key: args.r2Key,
        nomeOriginal: args.nomeOriginal,
        status: 'pending' as const,
        notaRejeicao: undefined,
        atualizadoEm: now
      })

      const url = await r2.getUrl(args.r2Key)
      await ctx.db.insert('files', {
        r2Key: args.r2Key,
        name: args.nomeOriginal,
        type: args.contentType,
        size: args.size,
        url,
        userId,
        documentId: existing._id
      })
    } else {
      const documentId = await ctx.db.insert('documents', {
        userId,
        tipo: args.tipo,
        r2Key: args.r2Key,
        nomeOriginal: args.nomeOriginal,
        status: 'pending',
        criadoEm: now,
        atualizadoEm: now
      })
      const url = await r2.getUrl(args.r2Key)
      await ctx.db.insert('files', {
        r2Key: args.r2Key,
        name: args.nomeOriginal,
        type: args.contentType,
        size: args.size,
        url,
        userId,
        documentId
      })
    }

    if (user.ofertanteProfileId) {
      const profile = await ctx.db.get(user.ofertanteProfileId)
      if (profile?.documentosPendentes?.length) {
        const next = profile.documentosPendentes.filter((k) => k !== args.tipo)
        if (next.length !== profile.documentosPendentes.length) {
          await ctx.db.patch(user.ofertanteProfileId, {
            documentosPendentes: next.length > 0 ? next : undefined,
            atualizadoEm: now
          })
        }
      }
    }

    return { success: true as const }
  }
})

export const deleteOfertanteDocumentByFileId = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const user = await verifyLogin(ctx)
    if (user.role !== 'ofertante') {
      throw new Error('Apenas ofertantes podem excluir estes documentos')
    }

    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error('Arquivo não encontrado')
    }
    if (file.userId !== user._id) {
      throw new Error('Permissão negada')
    }
    if (!file.documentId) {
      throw new Error('Arquivo não está vinculado a um documento')
    }

    const doc = await ctx.db.get(file.documentId)
    if (!doc) {
      await r2.deleteObject(ctx, file.r2Key)
      await ctx.db.delete(args.fileId)
      return { success: true as const }
    }
    if (doc.userId !== user._id) {
      throw new Error('Permissão negada')
    }
    if (doc.propertyId !== undefined) {
      throw new Error('Use outro fluxo para documentos vinculados a imóvel')
    }
    if (!OFERTANTE_TIPOS.includes(doc.tipo as OfertanteChecklistTipo)) {
      throw new Error('Tipo de documento inválido para exclusão')
    }

    await r2.deleteObject(ctx, doc.r2Key)
    await ctx.db.delete(args.fileId)
    await ctx.db.delete(doc._id)

    if (user.ofertanteProfileId) {
      const key = doc.tipo as OfertanteChecklistTipo
      const profile = await ctx.db.get(user.ofertanteProfileId)
      const list = profile?.documentosPendentes ?? []
      if (!list.includes(key)) {
        await ctx.db.patch(user.ofertanteProfileId, {
          documentosPendentes: [...list, key],
          atualizadoEm: Date.now()
        })
      }
    }

    return { success: true as const }
  }
})

/**
 * Finishes a property-scoped sale document upload: replaces linked files,
 * updates `documents`, inserts `files` row for previews.
 */
export const completePropertySaleDocumentFromUpload = mutation({
  args: {
    propertyId: v.id('properties'),
    tipo: propertySaleDocumentTipo,
    r2Key: v.string(),
    nomeOriginal: v.string(),
    contentType: v.string(),
    size: v.number()
  },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    if (
      actor.role !== 'ofertante' &&
      actor.role !== 'construtor' &&
      actor.role !== 'admin'
    ) {
      throw new Error('Não autorizado')
    }

    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    const ownerId = property.ofertanteId ?? property.construtorId
    if (!ownerId) {
      throw new Error('Propriedade sem ofertante ou construtor')
    }

    const now = Date.now()
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_property_and_tipo', (q) =>
        q.eq('propertyId', args.propertyId).eq('tipo', args.tipo)
      )
      .first()

    const deletedR2Keys = new Set<string>()

    if (existing) {
      const oldFiles = await ctx.db
        .query('files')
        .withIndex('by_document', (q) => q.eq('documentId', existing._id))
        .collect()
      for (const f of oldFiles) {
        if (!deletedR2Keys.has(f.r2Key)) {
          await r2.deleteObject(ctx, f.r2Key)
          deletedR2Keys.add(f.r2Key)
        }
        await ctx.db.delete(f._id)
      }
      if (!deletedR2Keys.has(existing.r2Key)) {
        await r2.deleteObject(ctx, existing.r2Key)
        deletedR2Keys.add(existing.r2Key)
      }

      await ctx.db.patch(existing._id, {
        r2Key: args.r2Key,
        nomeOriginal: args.nomeOriginal,
        status: 'pending' as const,
        notaRejeicao: undefined,
        atualizadoEm: now
      })

      const url = await r2.getUrl(args.r2Key)
      await ctx.db.insert('files', {
        r2Key: args.r2Key,
        name: args.nomeOriginal,
        type: args.contentType,
        size: args.size,
        url,
        userId: ownerId,
        documentId: existing._id
      })
    } else {
      const documentId = await ctx.db.insert('documents', {
        userId: ownerId,
        propertyId: args.propertyId,
        tipo: args.tipo,
        r2Key: args.r2Key,
        nomeOriginal: args.nomeOriginal,
        status: 'pending',
        criadoEm: now,
        atualizadoEm: now
      })
      const url = await r2.getUrl(args.r2Key)
      await ctx.db.insert('files', {
        r2Key: args.r2Key,
        name: args.nomeOriginal,
        type: args.contentType,
        size: args.size,
        url,
        userId: ownerId,
        documentId
      })
    }

    return { success: true as const }
  }
})

/**
 * After creating a property, links a `files` row (from syncToFiles after R2 upload)
 * to a new `documents` row for sale checklist. Used when the imóvel did not exist yet.
 */
export const attachPropertySaleDocumentFromUploadedFile = mutation({
  args: {
    propertyId: v.id('properties'),
    tipo: propertySaleDocumentTipo,
    fileId: v.id('files')
  },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    if (
      actor.role !== 'ofertante' &&
      actor.role !== 'construtor' &&
      actor.role !== 'admin'
    ) {
      throw new Error('Não autorizado')
    }

    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    const ownerId = property.ofertanteId ?? property.construtorId
    if (!ownerId) {
      throw new Error('Propriedade sem ofertante ou construtor')
    }

    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error('Arquivo não encontrado')
    }
    if (file.documentId !== undefined) {
      throw new Error('Arquivo já vinculado a um documento')
    }
    if (file.userId !== actor._id && actor.role !== 'admin') {
      throw new Error('Permissão negada')
    }

    const now = Date.now()
    const existing = await ctx.db
      .query('documents')
      .withIndex('by_property_and_tipo', (q) =>
        q.eq('propertyId', args.propertyId).eq('tipo', args.tipo)
      )
      .first()

    const deletedR2Keys = new Set<string>()

    if (existing) {
      const oldFiles = await ctx.db
        .query('files')
        .withIndex('by_document', (q) => q.eq('documentId', existing._id))
        .collect()
      for (const f of oldFiles) {
        if (!deletedR2Keys.has(f.r2Key)) {
          await r2.deleteObject(ctx, f.r2Key)
          deletedR2Keys.add(f.r2Key)
        }
        await ctx.db.delete(f._id)
      }
      if (!deletedR2Keys.has(existing.r2Key)) {
        await r2.deleteObject(ctx, existing.r2Key)
      }
      await ctx.db.delete(existing._id)
    }

    const documentId = await ctx.db.insert('documents', {
      userId: ownerId,
      propertyId: args.propertyId,
      tipo: args.tipo,
      r2Key: file.r2Key,
      nomeOriginal: file.name,
      status: 'pending',
      criadoEm: now,
      atualizadoEm: now
    })

    const url = await r2.getUrl(file.r2Key)
    await ctx.db.patch(args.fileId, {
      documentId,
      userId: ownerId,
      url
    })

    return { success: true as const, documentId }
  }
})

export const deletePropertySaleDocumentByFileId = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error('Arquivo não encontrado')
    }
    if (!file.documentId) {
      throw new Error('Arquivo não está vinculado a um documento')
    }

    const doc = await ctx.db.get(file.documentId)
    if (!doc) {
      await r2.deleteObject(ctx, file.r2Key)
      await ctx.db.delete(args.fileId)
      return { success: true as const }
    }

    await assertDocumentAccess(ctx, actor, doc)

    if (
      doc.propertyId === undefined ||
      !PROPERTY_SALE_DOCUMENT_TIPOS.includes(doc.tipo as PropertySaleDocumentTipo)
    ) {
      throw new Error('Use outro fluxo para este arquivo')
    }

    const property = await ctx.db.get(doc.propertyId)
    if (
      property &&
      property.checklistValidacao.documentos === 'approved' &&
      (property.status === 'draft' || property.status === 'pending')
    ) {
      await ctx.db.patch(doc.propertyId, {
        checklistValidacao: {
          ...property.checklistValidacao,
          documentos: 'pending'
        },
        atualizadoEm: Date.now()
      })
    }

    await r2.deleteObject(ctx, doc.r2Key)
    await ctx.db.delete(args.fileId)
    await ctx.db.delete(doc._id)

    return { success: true as const }
  }
})

export const validateDocument = mutation({
  args: {
    documentId: v.id('documents'),
    adminId: v.id('users')
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)

    const doc = await ctx.db.get(args.documentId)
    if (!doc) {
      throw new Error('Documento não encontrado')
    }

    await ctx.db.patch(args.documentId, {
      status: 'validated',
      notaRejeicao: undefined,
      atualizadoEm: Date.now()
    })

    // Update property checklist if all documents are validated
    if (doc.propertyId) {
      const allDocs = await ctx.db
        .query('documents')
        .withIndex('by_property', (q) => q.eq('propertyId', doc.propertyId))
        .collect()

      const requiredValidated = PROPERTY_SALE_DOCUMENT_TIPOS.every((t) =>
        allDocs.some((d) => d.tipo === t && d.status === 'validated')
      )

      if (requiredValidated) {
        const property = await ctx.db.get(doc.propertyId)
        if (property && property.checklistValidacao.documentos === 'pending') {
          await ctx.db.patch(doc.propertyId, {
            checklistValidacao: {
              ...property.checklistValidacao,
              documentos: 'approved'
            },
            atualizadoEm: Date.now()
          })
        }
      }
    }

    return { success: true }
  }
})

export const rejectDocument = mutation({
  args: {
    documentId: v.id('documents'),
    adminId: v.id('users'),
    motivo: v.string()
  },
  handler: async (ctx, args) => {
    await verifyAdmin(ctx)

    const doc = await ctx.db.get(args.documentId)
    if (!doc) {
      throw new Error('Documento não encontrado')
    }

    await ctx.db.patch(args.documentId, {
      status: 'rejected',
      notaRejeicao: args.motivo,
      atualizadoEm: Date.now()
    })

    // Mark property documents checklist as rejected
    if (doc.propertyId) {
      const property = await ctx.db.get(doc.propertyId)
      if (property && property.checklistValidacao.documentos === 'pending') {
        await ctx.db.patch(doc.propertyId, {
          checklistValidacao: {
            ...property.checklistValidacao,
            documentos: 'rejected'
          },
          atualizadoEm: Date.now()
        })
      }
    }

    return { success: true }
  }
})

export const deleteDocument = mutation({
  args: { documentId: v.id('documents') },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    const doc = await ctx.db.get(args.documentId)
    if (!doc) {
      throw new Error('Documento não encontrado')
    }
    await assertDocumentAccess(ctx, actor, doc)

    // Delete from R2
    await r2.deleteObject(ctx, doc.r2Key)

    // Delete from database
    await ctx.db.delete(args.documentId)

    return { success: true }
  }
})

export const getDocumentStats = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    await verifyPropertyOwnerOrAdmin(ctx, property)

    const docs = await ctx.db
      .query('documents')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .collect()

    const stats = {
      total: docs.length,
      validated: docs.filter((d) => d.status === 'validated').length,
      pending: docs.filter((d) => d.status === 'pending').length,
      rejected: docs.filter((d) => d.status === 'rejected').length,
      requiredMissing: PROPERTY_SALE_DOCUMENT_TIPOS.filter(
        (t) => !docs.some((d) => d.tipo === t)
      ),
      allRequiredValidated: PROPERTY_SALE_DOCUMENT_TIPOS.every((t) =>
        docs.some((d) => d.tipo === t && d.status === 'validated')
      )
    }

    return stats
  }
})

// ============ PROPERTY IMAGES ============

export const addPropertyImages = mutation({
  args: {
    propertyId: v.id('properties'),
    filesIds: v.array(v.id('files'))
  },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }
    ensurePropertyOwnerOrAdmin(actor, property)

    return await ctx.db.patch(args.propertyId, {
      filesIds: args.filesIds,
      atualizadoEm: Date.now()
    })
  }
})

export const getPropertyImages = query({
  args: { propertyId: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId)
    if (!property) {
      throw new Error('Propriedade não encontrada')
    }

    if (property.status !== 'validated') {
      await verifyPropertyOwnerOrAdmin(ctx, property)
    }

    const images = await ctx.db
      .query('files')
      .withIndex('by_property', (q) => q.eq('propertyId', args.propertyId))
      .order('asc')
      .collect()

    // Get signed URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await r2.getUrl(img.r2Key, { expiresIn: 3600 })
      }))
    )

    return imagesWithUrls
  }
})

export const deletePropertyImage = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const actor = await verifyLogin(ctx)
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error('Imagem não encontrada')
    }

    // Delete from R2
    await r2.deleteObject(ctx, file.r2Key)

    // Delete from database
    await ctx.db.delete(args.fileId)

    return { success: true }
  }
})

// export const reorderPropertyImages = mutation({
//   args: {
//     propertyId: v.id('properties'),
//     fileIds: v.array(v.id('files'))
//   },
//   handler: async (ctx, args) => {
//     const actor = await verifyLogin(ctx)
//     const property = await ctx.db.get(args.propertyId)
//     if (!property) {
//       throw new Error('Propriedade não encontrada')
//     }
//     ensurePropertyOwnerOrAdmin(actor, property)

//     for (let i = 0; i < args.fileIds.length; i++) {
//       const file = await ctx.db.get(args.fileIds[i])
//       if (file && file.propertyId === args.propertyId) {
//         await ctx.db.patch(args.fileIds[i], { ordem: i })
//       }
//     }
//   }
// })
