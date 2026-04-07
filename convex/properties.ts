import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { MAX_PROPERTY_PRICE } from "./schema";

const MIN_COMPARTIMENTOS = 1;

function validateCompartimentos(n: number): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!Number.isInteger(n) || n < MIN_COMPARTIMENTOS) {
    errors.push("Informe pelo menos 1 compartimento");
  }
  return { valid: errors.length === 0, errors };
}

// ============ QUERIES ============

export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args): Promise<Doc<"properties"> | null> => {
    return await ctx.db.get(args.id);
  },
});

export const getByIds = query({
  args: { ids: v.array(v.id("properties")) },
  handler: async (ctx, args): Promise<Doc<"properties">[]> => {
    const properties = await Promise.all(
      args.ids.map(id => ctx.db.get(id))
    );
    return properties.filter((p): p is Doc<"properties"> => p !== null);
  },
});

export const getValidated = query({
  args: {
    search: v.optional(v.string()),
    precoMin: v.optional(v.number()),
    precoMax: v.optional(v.number()),
    compartimentosMin: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const q = ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "validated"));

    let results = await q.collect();

    if (args.search) {
      const s = args.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.titulo.toLowerCase().includes(s) ||
          p.endereco.toLowerCase().includes(s)
      );
    }
    if (args.precoMin !== undefined) {
      results = results.filter((p) => p.valorVenda >= args.precoMin!);
    }
    if (args.precoMax !== undefined) {
      results = results.filter((p) => p.valorVenda <= args.precoMax!);
    }
    if (args.compartimentosMin !== undefined) {
      results = results.filter(
        (p) => p.compartimentos >= args.compartimentosMin!
      );
    }

    return results;
  },
});

export const getByOfertante = query({
  args: { ofertanteId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_ofertante", (q) => q.eq("ofertanteId", args.ofertanteId))
      .collect();
  },
});

export const getByConstrutor = query({
  args: { construtorId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_construtor", (q) => q.eq("construtorId", args.construtorId))
      .collect();
  },
});

export const getPendingValidation = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
  },
});

export const getAllForAdmin = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("pending"),
        v.literal("validated"),
        v.literal("selected"),
        v.literal("rejected"),
        v.literal("sold")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("properties")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }

    return await ctx.db.query("properties").collect();
  },
});

export const getSelectionsForProperty = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const selections = await ctx.db
      .query("selectionsHistory")
      .withIndex("by_property", (q) => q.eq("propertyId", args.propertyId))
      .filter((q) => q.eq(q.field("removidoEm"), undefined))
      .collect();

    const beneficiaryIds = selections.map((s) => s.beneficiarioId);
    const beneficiaries = await Promise.all(
      beneficiaryIds.map((id) => ctx.db.get(id))
    );

    return selections.map((s, i) => ({
      selection: s,
      beneficiary: beneficiaries[i],
    }));
  },
});

// ============ MUTATIONS ============

export const create = mutation({
  args: {
    ofertanteId: v.optional(v.id("users")),
    construtorId: v.optional(v.id("users")),
    titulo: v.string(),
    descricao: v.optional(v.string()),
    endereco: v.string(),
    compartimentos: v.number(),
    tamanho: v.number(),
    dataConstrucao: v.number(),
    matricula: v.string(),
    inscricaoImobiliaria: v.string(),
    valorVenda: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    propertyId?: Id<"properties">;
    errors?: string[];
  }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { success: false, errors: ["Não autorizado"] };
    }
    if (args.ofertanteId !== undefined && args.ofertanteId !== userId) {
      return { success: false, errors: ["Não autorizado"] };
    }
    if (args.construtorId !== undefined && args.construtorId !== userId) {
      return { success: false, errors: ["Não autorizado"] };
    }

    if (args.valorVenda > MAX_PROPERTY_PRICE) {
      return {
        success: false,
        errors: [
          `Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString("pt-BR")}`,
        ],
      };
    }

    const comp = validateCompartimentos(args.compartimentos);
    if (!comp.valid) {
      return { success: false, errors: comp.errors };
    }

    if (args.tamanho <= 0) {
      return { success: false, errors: ["Tamanho deve ser maior que zero"] };
    }

    if (!args.ofertanteId && !args.construtorId) {
      return {
        success: false,
        errors: ["Propriedade deve ter um ofertante ou construtor"],
      };
    }

    const now = Date.now();

    const propertyId = await ctx.db.insert("properties", {
      ofertanteId: args.ofertanteId,
      construtorId: args.construtorId,
      titulo: args.titulo,
      descricao: args.descricao,
      endereco: args.endereco,
      compartimentos: args.compartimentos,
      tamanho: args.tamanho,
      dataConstrucao: args.dataConstrucao,
      matricula: args.matricula,
      inscricaoImobiliaria: args.inscricaoImobiliaria,
      valorVenda: args.valorVenda,
      status: "draft",
      checklistValidacao: {
        dadosPessoais: "pending",
        localizacao: "pending",
        construcao: "pending",
        cartorio: "pending",
        preco: "pending",
        documentos: "pending",
      },
      criadoEm: now,
      atualizadoEm: now,
    });

    return { success: true, propertyId };
  },
});

export const submitForValidation = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    if (property.status !== "draft") {
      throw new Error("Apenas propriedades em rascunho podem ser submetidas");
    }

    if (property.valorVenda > MAX_PROPERTY_PRICE) {
      throw new Error(
        `Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString("pt-BR")}`
      );
    }

    const comp = validateCompartimentos(property.compartimentos);
    if (!comp.valid) {
      throw new Error(comp.errors.join("; "));
    }

    await ctx.db.patch(args.propertyId, {
      status: "pending",
      atualizadoEm: Date.now(),
    });

    return { success: true };
  },
});

export const updateChecklistItem = mutation({
  args: {
    propertyId: v.id("properties"),
    item: v.union(
      v.literal("dadosPessoais"),
      v.literal("localizacao"),
      v.literal("construcao"),
      v.literal("cartorio"),
      v.literal("preco"),
      v.literal("documentos")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    nota: v.optional(v.string()),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas administradores podem validar propriedades");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    if (property.status !== "pending" && property.status !== "validated") {
      throw new Error("Propriedade não está pendente de validação");
    }

    const checklist = { ...property.checklistValidacao };
    checklist[args.item] = args.status;

    const notas = property.notasValidacao ? { ...property.notasValidacao } : {};
    if (args.nota) {
      notas[args.item] = args.nota;
    }

    await ctx.db.patch(args.propertyId, {
      checklistValidacao: checklist,
      notasValidacao: notas,
      atualizadoEm: Date.now(),
    });

    const allApproved = Object.values(checklist).every((s) => s === "approved");

    if (allApproved && property.status === "pending") {
      await ctx.db.patch(args.propertyId, {
        status: "validated",
        validadoEm: Date.now(),
        validadoPor: args.adminId,
      });
    }

    return { success: true, allApproved };
  },
});

export const approveAll = mutation({
  args: {
    propertyId: v.id("properties"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas administradores podem validar propriedades");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    const now = Date.now();
    const approvedChecklist = {
      dadosPessoais: "approved" as const,
      localizacao: "approved" as const,
      construcao: "approved" as const,
      cartorio: "approved" as const,
      preco: "approved" as const,
      documentos: "approved" as const,
    };

    await ctx.db.patch(args.propertyId, {
      status: "validated",
      checklistValidacao: approvedChecklist,
      validadoEm: now,
      validadoPor: args.adminId,
      atualizadoEm: now,
    });

    return { success: true };
  },
});

export const reject = mutation({
  args: {
    propertyId: v.id("properties"),
    adminId: v.id("users"),
    motivo: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas administradores podem rejeitar propriedades");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    const now = Date.now();

    await ctx.db.patch(args.propertyId, {
      status: "rejected",
      notasValidacao: {
        ...property.notasValidacao,
        dadosPessoais: property.notasValidacao?.dadosPessoais ?? args.motivo,
      },
      atualizadoEm: now,
    });

    return { success: true };
  },
});

export const update = mutation({
  args: {
    propertyId: v.id("properties"),
    titulo: v.optional(v.string()),
    descricao: v.optional(v.string()),
    endereco: v.optional(v.string()),
    compartimentos: v.optional(v.number()),
    tamanho: v.optional(v.number()),
    dataConstrucao: v.optional(v.number()),
    matricula: v.optional(v.string()),
    inscricaoImobiliaria: v.optional(v.string()),
    valorVenda: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    if (property.status !== "draft") {
      throw new Error("Apenas propriedades em rascunho podem ser editadas");
    }

    const updates: Partial<Doc<"properties">> = {
      atualizadoEm: Date.now(),
    };

    if (args.valorVenda !== undefined) {
      if (args.valorVenda > MAX_PROPERTY_PRICE) {
        throw new Error(
          `Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString("pt-BR")}`
        );
      }
      updates.valorVenda = args.valorVenda;
    }

    if (args.titulo !== undefined) updates.titulo = args.titulo;
    if (args.descricao !== undefined) updates.descricao = args.descricao;
    if (args.endereco !== undefined) updates.endereco = args.endereco;
    if (args.tamanho !== undefined) updates.tamanho = args.tamanho;
    if (args.dataConstrucao !== undefined)
      updates.dataConstrucao = args.dataConstrucao;
    if (args.matricula !== undefined) updates.matricula = args.matricula;
    if (args.inscricaoImobiliaria !== undefined)
      updates.inscricaoImobiliaria = args.inscricaoImobiliaria;

    if (args.compartimentos !== undefined) {
      const comp = validateCompartimentos(args.compartimentos);
      if (!comp.valid) {
        throw new Error(comp.errors.join("; "));
      }
      updates.compartimentos = args.compartimentos;
    }

    const finalComp =
      args.compartimentos ?? property.compartimentos;
    const compCheck = validateCompartimentos(finalComp);
    if (!compCheck.valid) {
      throw new Error(compCheck.errors.join("; "));
    }

    await ctx.db.patch(args.propertyId, updates);

    return { success: true };
  },
});

export const markAsSold = mutation({
  args: {
    propertyId: v.id("properties"),
    beneficiarioId: v.id("users"),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db.get(args.adminId);
    if (!admin || admin.role !== "admin") {
      throw new Error("Apenas administradores podem marcar como vendido");
    }

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    if (property.status !== "selected") {
      throw new Error("Propriedade deve estar no status 'selected'");
    }

    await ctx.db.patch(args.propertyId, {
      status: "sold",
      atualizadoEm: Date.now(),
    });

    return { success: true };
  },
});

export const softDelete = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, args) => {
    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new Error("Propriedade não encontrada");
    }

    if (property.status === "draft") {
      await ctx.db.delete(args.propertyId);
    } else {
      await ctx.db.patch(args.propertyId, {
        status: "rejected",
        notasValidacao: {
          ...property.notasValidacao,
          dadosPessoais: "Removido pelo usuário",
        },
        atualizadoEm: Date.now(),
      });
    }

    return { success: true };
  },
});
