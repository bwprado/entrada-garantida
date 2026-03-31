import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Price ceiling constant
export const MAX_PROPERTY_PRICE = 200000;

// User roles
export const userRoleEnum = v.union(
  v.literal("admin"),
  v.literal("beneficiary"),
  v.literal("ofertante"),
  v.literal("construtor")
);

// User status
export const userStatusEnum = v.union(
  v.literal("pending"),
  v.literal("verified"),
  v.literal("active"),
  v.literal("rejected"),
  v.literal("suspended")
);

// Document types
export const documentTypeEnum = v.union(
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
);

// Document status
export const documentStatusEnum = v.union(
  v.literal("pending"),
  v.literal("validated"),
  v.literal("rejected")
);

// Property status
export const propertyStatusEnum = v.union(
  v.literal("draft"),
  v.literal("pending"),
  v.literal("validated"),
  v.literal("selected"),
  v.literal("rejected"),
  v.literal("sold")
);

// Validation checklist item status
export const checklistItemStatusEnum = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected")
);

// Sex options
export const sexoEnum = v.union(
  v.literal("feminino"),
  v.literal("masculino"),
  v.literal("nao_informado")
);

// Race/color options
export const racaEnum = v.union(
  v.literal("branca"),
  v.literal("preta"),
  v.literal("parda"),
  v.literal("amarela"),
  v.literal("indigena"),
  v.literal("nao_informado")
);

// Disability types
export const deficienciaEnum = v.union(
  v.literal("nao_possui"),
  v.literal("auditiva"),
  v.literal("intelectual"),
  v.literal("visual"),
  v.literal("multipla"),
  v.literal("psicossocial"),
  v.literal("fisica")
);

// Income type
export const tipoRendaEnum = v.union(
  v.literal("clt"),
  v.literal("autonomo"),
  v.literal("servidor_publico"),
  v.literal("aposentado"),
  v.literal("bpc"),
  v.literal("outros"),
  v.literal("nao_informado")
);

// Income ranges
export const rendaFamiliarFaixaEnum = v.union(
  v.literal("ate_2"),
  v.literal("2_4"),
  v.literal("4_6"),
  v.literal("6_8"),
  v.literal("acima_8")
);

// Property type
export const tipoImovelEnum = v.union(
  v.literal("apartamento"),
  v.literal("casa"),
  v.literal("sobrado"),
  v.literal("terreno"),
  v.literal("outro")
);

// Users table
export const users = defineTable({
  role: userRoleEnum,
  cpf: v.string(),
  nome: v.string(),
  nomeSocial: v.optional(v.string()),
  telefone: v.string(),
  email: v.optional(v.string()),
  senhaHash: v.optional(v.string()),
  
  // Beneficiary-specific fields
  mesesAluguelSocial: v.optional(v.number()),
  possuiIdosoFamilia: v.optional(v.boolean()),
  chefiaFeminina: v.optional(v.boolean()),
  pessoasFamilia: v.optional(v.number()),
  sexo: v.optional(sexoEnum),
  raca: v.optional(racaEnum),
  deficiencias: v.optional(v.array(deficienciaEnum)),
  tipoRenda: v.optional(tipoRendaEnum),
  rendaFamiliarFaixa: v.optional(rendaFamiliarFaixaEnum),
  profissao: v.optional(v.string()),
  
  // Address
  cep: v.optional(v.string()),
  endereco: v.optional(v.string()),
  numero: v.optional(v.string()),
  complemento: v.optional(v.string()),
  bairro: v.optional(v.string()),
  cidade: v.optional(v.string()),
  estado: v.optional(v.string()),
  
  // Term acceptance
  termoAceitoEm: v.optional(v.number()),
  
  // Property selections (max 3)
  propriedadesInteresse: v.optional(v.array(v.id("properties"))),
  
  // Status and timestamps
  status: userStatusEnum,
  otpCodigo: v.optional(v.string()),
  otpExpiraEm: v.optional(v.number()),
  criadoEm: v.number(),
  atualizadoEm: v.number(),

  // Data validation flags for SECID
  dadosValidados: v.optional(v.boolean()),
  dadosComErro: v.optional(v.boolean()),
  mensagemErroDados: v.optional(v.string()),
  erroReportadoEm: v.optional(v.number()),
})
  .index("by_cpf", ["cpf"])
  .index("by_role", ["role"])
  .index("by_role_and_status", ["role", "status"]);

// OTP tokens for authentication
export const otpTokens = defineTable({
  cpf: v.string(),
  codigo: v.string(),
  telefone: v.string(),
  expiraEm: v.number(),
  usado: v.boolean(),
  criadoEm: v.number(),
})
  .index("by_cpf", ["cpf"])
  .index("by_codigo", ["codigo"]);

// Properties table
export const properties = defineTable({
  // Ownership
  ofertanteId: v.optional(v.id("users")),
  construtorId: v.optional(v.id("users")),
  
  // Basic info
  titulo: v.string(),
  descricao: v.optional(v.string()),
  tipoImovel: tipoImovelEnum,
  
  // Location
  cep: v.string(),
  endereco: v.string(),
  numero: v.string(),
  complemento: v.optional(v.string()),
  bairro: v.string(),
  cidade: v.string(),
  estado: v.string(),
  
  // Price and details
  precoOfertado: v.number(),
  areaUtil: v.number(),
  areaTotal: v.optional(v.number()),
  anoConstrucao: v.number(),
  
  // Composition (minimum: sala, 1 quarto, banheiro, cozinha, area_servico)
  quartos: v.number(),
  suites: v.optional(v.number()),
  salas: v.number(),
  banheiros: v.number(),
  cozinha: v.boolean(),
  areaServico: v.boolean(),
  varanda: v.optional(v.boolean()),
  vagasGaragem: v.optional(v.number()),
  
  // Technical details
  possuiImpermeabilizacao: v.boolean(),
  
  // Registry info
  matriculaCartorio: v.string(),
  habiteSe: v.optional(v.string()),
  
  // Status
  status: propertyStatusEnum,
  
  // Validation checklist
  checklistValidacao: v.object({
    dadosPessoais: checklistItemStatusEnum,
    localizacao: checklistItemStatusEnum,
    construcao: checklistItemStatusEnum,
    impermeabilizacao: checklistItemStatusEnum,
    cartorio: checklistItemStatusEnum,
    habiteSe: checklistItemStatusEnum,
    preco: checklistItemStatusEnum,
    documentos: checklistItemStatusEnum,
  }),
  notasValidacao: v.optional(v.object({
    dadosPessoais: v.optional(v.string()),
    localizacao: v.optional(v.string()),
    construcao: v.optional(v.string()),
    impermeabilizacao: v.optional(v.string()),
    cartorio: v.optional(v.string()),
    habiteSe: v.optional(v.string()),
    preco: v.optional(v.string()),
    documentos: v.optional(v.string()),
  })),
  
  // Timestamps
  criadoEm: v.number(),
  atualizadoEm: v.number(),
  validadoEm: v.optional(v.number()),
  validadoPor: v.optional(v.id("users")),
})
  .index("by_ofertante", ["ofertanteId"])
  .index("by_construtor", ["construtorId"])
  .index("by_status", ["status"])
  .index("by_status_and_cidade", ["status", "cidade"]);

// Documents table - tracks document metadata and validation status
// File storage is handled by @convex-dev/r2 component
export const documents = defineTable({
  userId: v.id("users"),
  propertyId: v.optional(v.id("properties")),
  tipo: documentTypeEnum,
  r2Key: v.string(), // Key returned by R2 component after upload
  nomeOriginal: v.string(), // Original filename for display
  status: documentStatusEnum,
  notaRejeicao: v.optional(v.string()),
  criadoEm: v.number(),
  atualizadoEm: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_property", ["propertyId"])
  .index("by_user_and_tipo", ["userId", "tipo"])
  .index("by_property_and_tipo", ["propertyId", "tipo"]);

// Property images - thumbnails/gallery images
export const propertyImages = defineTable({
  propertyId: v.id("properties"),
  r2Key: v.string(), // Key returned by R2 component
  ordem: v.number(), // Display order
  nomeOriginal: v.string(),
  criadoEm: v.number(),
})
  .index("by_property", ["propertyId"]);

// Admin sessions
export const adminSessions = defineTable({
  userId: v.id("users"),
  token: v.string(),
  expiraEm: v.number(),
  criadoEm: v.number(),
})
  .index("by_token", ["token"])
  .index("by_user", ["userId"]);

// Bulk upload logs
export const bulkUploadLogs = defineTable({
  adminId: v.id("users"),
  tipo: v.union(v.literal("beneficiarios"), v.literal("propriedades")),
  totalLinhas: v.number(),
  sucessos: v.number(),
  erros: v.number(),
  detalhesErros: v.optional(v.array(v.object({
    linha: v.number(),
    erro: v.string(),
  }))),
  criadoEm: v.number(),
})
  .index("by_admin", ["adminId"]);

// Beneficiary selections history
export const selectionsHistory = defineTable({
  beneficiarioId: v.id("users"),
  propertyId: v.id("properties"),
  ordemPreferencia: v.number(),
  selecionadoEm: v.number(),
  removidoEm: v.optional(v.number()),
})
  .index("by_beneficiario", ["beneficiarioId"])
  .index("by_property", ["propertyId"]);

export default defineSchema({
  users,
  otpTokens,
  properties,
  documents,
  propertyImages,
  adminSessions,
  bulkUploadLogs,
  selectionsHistory,
});
