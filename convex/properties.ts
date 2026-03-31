import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { MAX_PROPERTY_PRICE } from "./schema";

// Minimum property composition
const MIN_COMPOSITION = {
  salas: 1,
  quartos: 1,
  banheiros: 1,
  cozinha: true,
  areaServico: true,
};

// Validate property composition
function validateComposition(composition: {
  salas: number;
  quartos: number;
  banheiros: number;
  cozinha: boolean;
  areaServico: boolean;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (composition.salas < MIN_COMPOSITION.salas) {
    errors.push("Mínimo de 1 sala é obrigatório");
  }
  if (composition.quartos < MIN_COMPOSITION.quartos) {
    errors.push("Mínimo de 1 quarto é obrigatório");
  }
  if (composition.banheiros < MIN_COMPOSITION.banheiros) {
    errors.push("Mínimo de 1 banheiro é obrigatório");
  }
  if (!composition.cozinha) {
    errors.push("Cozinha é obrigatória");
  }
  if (!composition.areaServico) {
    errors.push("Área de serviço é obrigatória");
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
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "validated"));
    
    let results = await query.collect();
    
    // Apply filters
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
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("validated"),
      v.literal("selected"),
      v.literal("rejected"),
      v.literal("sold")
    )),
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
      .filter(q => q.eq(q.field("removidoEm"), undefined))
      .collect();
    
    const beneficiaryIds = selections.map(s => s.beneficiarioId);
    const beneficiaries = await Promise.all(
      beneficiaryIds.map(id => ctx.db.get(id))
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
    tipoImovel: v.union(
      v.literal("apartamento"),
      v.literal("casa"),
      v.literal("sobrado"),
      v.literal("terreno"),
      v.literal("outro")
    ),
    cep: v.string(),
    endereco: v.string(),
    numero: v.string(),
    complemento: v.optional(v.string()),
    bairro: v.string(),
    cidade: v.string(),
    estado: v.string(),
    precoOfertado: v.number(),
    areaUtil: v.number(),
    areaTotal: v.optional(v.number()),
    anoConstrucao: v.number(),
    quartos: v.number(),
    suites: v.optional(v.number()),
    salas: v.number(),
    banheiros: v.number(),
    cozinha: v.boolean(),
    areaServico: v.boolean(),
    varanda: v.optional(v.boolean()),
    vagasGaragem: v.optional(v.number()),
    possuiImpermeabilizacao: v.boolean(),
    matriculaCartorio: v.string(),
    habiteSe: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ success: boolean; propertyId?: Id<"properties">; errors?: string[] }> => {
    // Validate price ceiling
    if (args.precoOfertado > MAX_PROPERTY_PRICE) {
      return { 
        success: false, 
        errors: [`Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString("pt-BR")}`] 
      };
    }
    
    // Validate composition
    const compositionValidation = validateComposition({
      salas: args.salas,
      quartos: args.quartos,
      banheiros: args.banheiros,
      cozinha: args.cozinha,
      areaServico: args.areaServico,
    });
    
    if (!compositionValidation.valid) {
      return { success: false, errors: compositionValidation.errors };
    }
    
    // Validate ownership
    if (!args.ofertanteId && !args.construtorId) {
      return { success: false, errors: ["Propriedade deve ter um ofertante ou construtor"] };
    }
    
    const now = Date.now();
    
    const propertyId = await ctx.db.insert("properties", {
      ofertanteId: args.ofertanteId,
      construtorId: args.construtorId,
      titulo: args.titulo,
      descricao: args.descricao,
      tipoImovel: args.tipoImovel,
      cep: args.cep,
      endereco: args.endereco,
      numero: args.numero,
      complemento: args.complemento,
      bairro: args.bairro,
      cidade: args.cidade,
      estado: args.estado,
      precoOfertado: args.precoOfertado,
      areaUtil: args.areaUtil,
      areaTotal: args.areaTotal,
      anoConstrucao: args.anoConstrucao,
      quartos: args.quartos,
      suites: args.suites,
      salas: args.salas,
      banheiros: args.banheiros,
      cozinha: args.cozinha,
      areaServico: args.areaServico,
      varanda: args.varanda,
      vagasGaragem: args.vagasGaragem,
      possuiImpermeabilizacao: args.possuiImpermeabilizacao,
      matriculaCartorio: args.matriculaCartorio,
      habiteSe: args.habiteSe,
      status: "draft",
      checklistValidacao: {
        dadosPessoais: "pending",
        localizacao: "pending",
        construcao: "pending",
        impermeabilizacao: "pending",
        cartorio: "pending",
        habiteSe: "pending",
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
    
    // Re-validate price
    if (property.precoOfertado > MAX_PROPERTY_PRICE) {
      throw new Error(`Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString("pt-BR")}`);
    }
    
    // Re-validate composition
    const compositionValidation = validateComposition({
      salas: property.salas,
      quartos: property.quartos,
      banheiros: property.banheiros,
      cozinha: property.cozinha,
      areaServico: property.areaServico,
    });
    
    if (!compositionValidation.valid) {
      throw new Error(compositionValidation.errors.join("; "));
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
      v.literal("impermeabilizacao"),
      v.literal("cartorio"),
      v.literal("habiteSe"),
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
    // Verify admin
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
    
    // Check if all items are approved
    const allApproved = Object.values(checklist).every(s => s === "approved");
    
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
      impermeabilizacao: "approved" as const,
      cartorio: "approved" as const,
      habiteSe: "approved" as const,
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
    tipoImovel: v.optional(v.union(
      v.literal("apartamento"),
      v.literal("casa"),
      v.literal("sobrado"),
      v.literal("terreno"),
      v.literal("outro")
    )),
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),
    numero: v.optional(v.string()),
    complemento: v.optional(v.string()),
    bairro: v.optional(v.string()),
    cidade: v.optional(v.string()),
    estado: v.optional(v.string()),
    precoOfertado: v.optional(v.number()),
    areaUtil: v.optional(v.number()),
    areaTotal: v.optional(v.number()),
    anoConstrucao: v.optional(v.number()),
    quartos: v.optional(v.number()),
    suites: v.optional(v.number()),
    salas: v.optional(v.number()),
    banheiros: v.optional(v.number()),
    cozinha: v.optional(v.boolean()),
    areaServico: v.optional(v.boolean()),
    varanda: v.optional(v.boolean()),
    vagasGaragem: v.optional(v.number()),
    possuiImpermeabilizacao: v.optional(v.boolean()),
    matriculaCartorio: v.optional(v.string()),
    habiteSe: v.optional(v.string()),
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
    
    // Validate price if provided
    if (args.precoOfertado !== undefined) {
      if (args.precoOfertado > MAX_PROPERTY_PRICE) {
        throw new Error(`Preço deve ser no máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString("pt-BR")}`);
      }
      updates.precoOfertado = args.precoOfertado;
    }
    
    // Copy all optional fields
    if (args.titulo !== undefined) updates.titulo = args.titulo;
    if (args.descricao !== undefined) updates.descricao = args.descricao;
    if (args.tipoImovel !== undefined) updates.tipoImovel = args.tipoImovel;
    if (args.cep !== undefined) updates.cep = args.cep;
    if (args.endereco !== undefined) updates.endereco = args.endereco;
    if (args.numero !== undefined) updates.numero = args.numero;
    if (args.complemento !== undefined) updates.complemento = args.complemento;
    if (args.bairro !== undefined) updates.bairro = args.bairro;
    if (args.cidade !== undefined) updates.cidade = args.cidade;
    if (args.estado !== undefined) updates.estado = args.estado;
    if (args.areaUtil !== undefined) updates.areaUtil = args.areaUtil;
    if (args.areaTotal !== undefined) updates.areaTotal = args.areaTotal;
    if (args.anoConstrucao !== undefined) updates.anoConstrucao = args.anoConstrucao;
    if (args.quartos !== undefined) updates.quartos = args.quartos;
    if (args.suites !== undefined) updates.suites = args.suites;
    if (args.salas !== undefined) updates.salas = args.salas;
    if (args.banheiros !== undefined) updates.banheiros = args.banheiros;
    if (args.cozinha !== undefined) updates.cozinha = args.cozinha;
    if (args.areaServico !== undefined) updates.areaServico = args.areaServico;
    if (args.varanda !== undefined) updates.varanda = args.varanda;
    if (args.vagasGaragem !== undefined) updates.vagasGaragem = args.vagasGaragem;
    if (args.possuiImpermeabilizacao !== undefined) updates.possuiImpermeabilizacao = args.possuiImpermeabilizacao;
    if (args.matriculaCartorio !== undefined) updates.matriculaCartorio = args.matriculaCartorio;
    if (args.habiteSe !== undefined) updates.habiteSe = args.habiteSe;
    
    // Validate composition after updates
    const finalComposition = {
      salas: args.salas ?? property.salas,
      quartos: args.quartos ?? property.quartos,
      banheiros: args.banheiros ?? property.banheiros,
      cozinha: args.cozinha ?? property.cozinha,
      areaServico: args.areaServico ?? property.areaServico,
    };
    
    const compositionValidation = validateComposition(finalComposition);
    if (!compositionValidation.valid) {
      throw new Error(compositionValidation.errors.join("; "));
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
    
    // For draft properties, actually delete
    if (property.status === "draft") {
      await ctx.db.delete(args.propertyId);
    } else {
      // For others, just mark as rejected with note
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
