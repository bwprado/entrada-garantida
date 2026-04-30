import { v } from 'convex/values'
import { query, mutation } from './_generated/server'
import { MAX_PROPERTY_PRICE } from './schema'

// ============ PUBLIC QUERIES ============

export const getValidatedProperties = query({
  args: {
    precoMin: v.optional(v.number()),
    precoMax: v.optional(v.number()),
    compartimentosMin: v.optional(v.number()),
    search: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query('properties')
      .withIndex('by_status', (q) => q.eq('status', 'validated'))

    let results = await query.collect()

    if (args.search) {
      const searchLower = args.search.toLowerCase()
      results = results.filter(
        (p) =>
          p.titulo.toLowerCase().includes(searchLower) ||
          p.endereco.toLowerCase().includes(searchLower)
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

    return results.sort((a, b) => b.criadoEm - a.criadoEm)
  }
})

export const getPropertyById = query({
  args: { id: v.id('properties') },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id)
    if (!property) return null

    // Get images
    const images = await ctx.db
      .query('files')
      .withIndex('by_property', (q) => q.eq('propertyId', args.id))
      .collect()

    // Get documents status
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_property', (q) => q.eq('propertyId', args.id))
      .collect()

    return {
      ...property,
      images,
      documentCount: documents.length,
      documentsValidated: documents.filter((d) => d.status === 'validated')
        .length
    }
  }
})

// ============ CONFIG CONSTANTS ============

export const getConfig = query({
  args: {},
  handler: async () => {
    return {
      maxPropertyPrice: MAX_PROPERTY_PRICE,
      maxPropertySelections: 3,
      minComposition: {
        compartimentos: 1
      }
    }
  }
})

// ============ STATS ============

export const getPublicStats = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db
      .query('properties')
      .withIndex('by_status', (q) => q.eq('status', 'validated'))
      .collect()

    const beneficiaries = await ctx.db
      .query('users')
      .withIndex('by_role', (q) => q.eq('role', 'beneficiary'))
      .collect()

    return {
      propertiesAvailable: properties.length,
      beneficiariesRegistered: beneficiaries.filter(
        (b) => b.status === 'active'
      ).length,
      maxSubsidio: 20000,
      maxPropertyValue: MAX_PROPERTY_PRICE
    }
  }
})

// ============ HEALTH CHECK ============

export const healthCheck = query({
  args: {},
  handler: async () => {
    return { status: 'ok', timestamp: Date.now() }
  }
})
