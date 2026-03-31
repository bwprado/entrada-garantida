import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { MAX_PROPERTY_PRICE } from "./schema";

// ============ PUBLIC QUERIES ============

export const getValidatedProperties = query({
  args: {
    cidade: v.optional(v.string()),
    bairro: v.optional(v.string()),
    tipoImovel: v.optional(v.union(
      v.literal("apartamento"),
      v.literal("casa"),
      v.literal("sobrado"),
      v.literal("terreno"),
      v.literal("outro")
    )),
    precoMin: v.optional(v.number()),
    precoMax: v.optional(v.number()),
    quartosMin: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "validated"));
    
    let results = await query.collect();
    
    // Apply filters
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      results = results.filter(p => 
        p.titulo.toLowerCase().includes(searchLower) ||
        p.bairro.toLowerCase().includes(searchLower) ||
        p.cidade.toLowerCase().includes(searchLower) ||
        p.endereco.toLowerCase().includes(searchLower)
      );
    }
    
    if (args.cidade) {
      results = results.filter(p => 
        p.cidade.toLowerCase().includes(args.cidade!.toLowerCase())
      );
    }
    
    if (args.bairro) {
      results = results.filter(p => 
        p.bairro.toLowerCase().includes(args.bairro!.toLowerCase())
      );
    }
    
    if (args.tipoImovel) {
      results = results.filter(p => p.tipoImovel === args.tipoImovel);
    }
    
    if (args.precoMin !== undefined) {
      results = results.filter(p => p.precoOfertado >= args.precoMin!);
    }
    
    if (args.precoMax !== undefined) {
      results = results.filter(p => p.precoOfertado <= args.precoMax!);
    }
    
    if (args.quartosMin !== undefined) {
      results = results.filter(p => p.quartos >= args.quartosMin!);
    }
    
    // Sort by creation date (newest first)
    return results.sort((a, b) => b.criadoEm - a.criadoEm);
  },
});

export const getPropertyById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.id);
    if (!property) return null;
    
    // Get images
    const images = await ctx.db
      .query("propertyImages")
      .withIndex("by_property", (q) => q.eq("propertyId", args.id))
      .order("asc")
      .collect();
    
    // Get documents status
    const documents = await ctx.db
      .query("documents")
      .withIndex("by_property", (q) => q.eq("propertyId", args.id))
      .collect();
    
    return {
      ...property,
      images,
      documentCount: documents.length,
      documentsValidated: documents.filter(d => d.status === "validated").length,
    };
  },
});

// ============ CONFIG CONSTANTS ============

export const getConfig = query({
  args: {},
  handler: async () => {
    return {
      maxPropertyPrice: MAX_PROPERTY_PRICE,
      maxPropertySelections: 3,
      minComposition: {
        salas: 1,
        quartos: 1,
        banheiros: 1,
        cozinha: true,
        areaServico: true,
      },
    };
  },
});

// ============ STATS ============

export const getPublicStats = query({
  args: {},
  handler: async (ctx) => {
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "validated"))
      .collect();
    
    const beneficiaries = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "beneficiary"))
      .collect();
    
    return {
      propertiesAvailable: properties.length,
      beneficiariesRegistered: beneficiaries.filter(b => b.status === "active").length,
      maxSubsidio: 20000,
      maxPropertyValue: MAX_PROPERTY_PRICE,
    };
  },
});

// ============ HEALTH CHECK ============

export const healthCheck = query({
  args: {},
  handler: async () => {
    return { status: "ok", timestamp: Date.now() };
  },
});
