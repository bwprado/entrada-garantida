import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { r2 } from "./r2";

// ============ QUERIES ============

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getByProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const getByUserAndType = query({
  args: {
    userId: v.id("users"),
    tipo: v.union(
      v.literal("matricula"),
      v.literal("iptu"),
      v.literal("certidao_tributos"),
      v.literal("certidao_indisponibilidade"),
      v.literal("certidao_condominio"),
      v.literal("rg"),
      v.literal("comp_estado_civil"),
      v.literal("comp_residencia"),
      v.literal("habite_se"),
      v.literal("foto_imovel"),
      v.literal("plantas"),
      v.literal("outro")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_user_and_tipo", (q) => 
        q.eq("userId", args.userId).eq("tipo", args.tipo)
      )
      .first();
  },
});

export const getByPropertyAndType = query({
  args: {
    propertyId: v.id("properties"),
    tipo: v.union(
      v.literal("matricula"),
      v.literal("iptu"),
      v.literal("certidao_tributos"),
      v.literal("certidao_indisponibilidade"),
      v.literal("certidao_condominio"),
      v.literal("rg"),
      v.literal("comp_estado_civil"),
      v.literal("comp_residencia"),
      v.literal("habite_se"),
      v.literal("foto_imovel"),
      v.literal("plantas"),
      v.literal("outro")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_property_and_tipo", (q) => 
        q.eq("propertyId", args.propertyId).eq("tipo", args.tipo)
      )
      .first();
  },
});

export const getPropertyDocuments = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
  },
});

export const getPendingDocuments = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("documents")
      .filter(q => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

// Get signed URL for a document
export const getDocumentUrl = query({
  args: { 
    documentId: v.id("documents"),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Documento não encontrado");
    }
    
    return await r2.getUrl(doc.r2Key, { 
      expiresIn: args.expiresIn ?? 3600 // Default 1 hour 
    });
  },
});

// Get signed URL by R2 key directly
export const getUrlByKey = query({
  args: {
    key: v.string(),
    expiresIn: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await r2.getUrl(args.key, { 
      expiresIn: args.expiresIn ?? 3600 
    });
  },
});

// ============ MUTATIONS ============

// Create document record after upload
// The actual upload is handled by the R2 component via useUploadFile hook
export const createDocumentRecord = mutation({
  args: {
    userId: v.id("users"),
    propertyId: v.optional(v.id("properties")),
    tipo: v.union(
      v.literal("matricula"),
      v.literal("iptu"),
      v.literal("certidao_tributos"),
      v.literal("certidao_indisponibilidade"),
      v.literal("certidao_condominio"),
      v.literal("rg"),
      v.literal("comp_estado_civil"),
      v.literal("comp_residencia"),
      v.literal("habite_se"),
      v.literal("foto_imovel"),
      v.literal("plantas"),
      v.literal("outro")
    ),
    r2Key: v.string(), // Key returned by R2 component
    nomeOriginal: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"documents">> => {
    const now = Date.now();
    
    // Check if document of this type already exists for this user/property
    const existing = args.propertyId
      ? await ctx.db
          .query("documents")
          .withIndex("by_property_and_tipo", (q) => 
            q.eq("propertyId", args.propertyId).eq("tipo", args.tipo)
          )
          .first()
      : await ctx.db
          .query("documents")
          .withIndex("by_user_and_tipo", (q) => 
            q.eq("userId", args.userId).eq("tipo", args.tipo)
          )
          .first();
    
    if (existing) {
      // Update existing document with new file
      await ctx.db.patch(existing._id, {
        r2Key: args.r2Key,
        nomeOriginal: args.nomeOriginal,
        status: "pending",
        notaRejeicao: undefined,
        atualizadoEm: now,
      });
      return existing._id;
    }
    
    // Create new document record
    return await ctx.db.insert("documents", {
      userId: args.userId,
      propertyId: args.propertyId,
      tipo: args.tipo,
      r2Key: args.r2Key,
      nomeOriginal: args.nomeOriginal,
      status: "pending",
      criadoEm: now,
      atualizadoEm: now,
    });
  },
});

export const validateDocument = mutation({
  args: {
    documentId: v.id("documents"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas administradores podem validar documentos");
    }
    
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Documento não encontrado");
    }
    
    await ctx.db.patch(args.documentId, {
      status: "validated",
      notaRejeicao: undefined,
      atualizadoEm: Date.now(),
    });
    
    // Update property checklist if all documents are validated
    if (doc.propertyId) {
      const allDocs = await ctx.db
        .query("documents")
        .withIndex("by_property", (q) => q.eq("propertyId", doc.propertyId))
        .collect();
      
      const requiredTypes = ["matricula", "iptu", "certidao_tributos", "certidao_indisponibilidade", "certidao_condominio"];
      const requiredValidated = requiredTypes.every(t => 
        allDocs.some(d => d.tipo === t && d.status === "validated")
      );
      
      if (requiredValidated) {
        const property = await ctx.db.get(doc.propertyId);
        if (property && property.checklistValidacao.documentos === "pending") {
          await ctx.db.patch(doc.propertyId, {
            checklistValidacao: {
              ...property.checklistValidacao,
              documentos: "approved",
            },
            atualizadoEm: Date.now(),
          });
        }
      }
    }
    
    return { success: true };
  },
});

export const rejectDocument = mutation({
  args: {
    documentId: v.id("documents"),
    adminId: v.id("users"),
    motivo: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas administradores podem rejeitar documentos");
    }
    
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Documento não encontrado");
    }
    
    await ctx.db.patch(args.documentId, {
      status: "rejected",
      notaRejeicao: args.motivo,
      atualizadoEm: Date.now(),
    });
    
    // Mark property documents checklist as rejected
    if (doc.propertyId) {
      const property = await ctx.db.get(doc.propertyId);
      if (property && property.checklistValidacao.documentos === "pending") {
        await ctx.db.patch(doc.propertyId, {
          checklistValidacao: {
            ...property.checklistValidacao,
            documentos: "rejected",
          },
          atualizadoEm: Date.now(),
        });
      }
    }
    
    return { success: true };
  },
});

export const deleteDocument = mutation({
  args: { documentId: v.id("documents") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.documentId);
    if (!doc) {
      throw new Error("Documento não encontrado");
    }
    
    // Delete from R2
    await r2.deleteObject(ctx, doc.r2Key);
    
    // Delete from database
    await ctx.db.delete(args.documentId);
    
    return { success: true };
  },
});

export const getDocumentStats = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    
    const requiredTypes = [
      "matricula",
      "iptu", 
      "certidao_tributos",
      "certidao_indisponibilidade",
      "certidao_condominio",
    ];
    
    const stats = {
      total: docs.length,
      validated: docs.filter(d => d.status === "validated").length,
      pending: docs.filter(d => d.status === "pending").length,
      rejected: docs.filter(d => d.status === "rejected").length,
      requiredMissing: requiredTypes.filter(t => !docs.some(d => d.tipo === t)),
      allRequiredValidated: requiredTypes.every(t => 
        docs.some(d => d.tipo === t && d.status === "validated")
      ),
    };
    
    return stats;
  },
});

// ============ PROPERTY IMAGES ============

export const addPropertyImage = mutation({
  args: {
    propertyId: v.id("properties"),
    r2Key: v.string(),
    nomeOriginal: v.string(),
    ordem: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }
    
    const existingImages = await ctx.db
      .query("propertyImages")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .collect();
    
    const ordem = args.ordem ?? existingImages.length;
    
    return await ctx.db.insert("propertyImages", {
      propertyId: args.propertyId,
      r2Key: args.r2Key,
      ordem,
      nomeOriginal: args.nomeOriginal,
      criadoEm: Date.now(),
    });
  },
});

export const getPropertyImages = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const images = await ctx.db
      .query("propertyImages")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .order("asc")
      .collect();
    
    // Get signed URLs for each image
    const imagesWithUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await r2.getUrl(img.r2Key, { expiresIn: 3600 }),
      }))
    );
    
    return imagesWithUrls;
  },
});

export const deletePropertyImage = mutation({
  args: { imageId: v.id("propertyImages") },
  handler: async (ctx, args) => {
    const image = await ctx.db.get(args.imageId);
    if (!image) {
      throw new Error("Imagem não encontrada");
    }
    
    // Delete from R2
    await r2.deleteObject(ctx, image.r2Key);
    
    // Delete from database
    await ctx.db.delete(args.imageId);
    
    // Reorder remaining images
    const remaining = await ctx.db
      .query("propertyImages")
      .withIndex("by_property", (q) => q.eq("propertyId", image.propertyId))
      .order("asc")
      .collect();
    
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].ordem !== i) {
        await ctx.db.patch(remaining[i]._id, { ordem: i });
      }
    }
    
    return { success: true };
  },
});

export const reorderPropertyImages = mutation({
  args: {
    propertyId: v.id("properties"),
    imageIds: v.array(v.id("propertyImages")),
  },
  handler: async (ctx, args) => {
    for (let i = 0; i < args.imageIds.length; i++) {
      const image = await ctx.db.get(args.imageIds[i]);
      if (image && image.propertyId === args.propertyId) {
        await ctx.db.patch(args.imageIds[i], { ordem: i });
      }
    }
    
    return { success: true };
  },
});
