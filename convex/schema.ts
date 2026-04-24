import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

const { users: _, ...authTablesWithoutUsers } = authTables

// Price ceiling constant
export const MAX_PROPERTY_PRICE = 200000

/** Max listing images per property (keep in sync with lib/property-limits). */
export const MAX_PROPERTY_PHOTOS = 10

// User roles
export const userRoleEnum = v.union(
  v.literal('admin'),
  v.literal('beneficiary'),
  v.literal('ofertante'),
  v.literal('construtor')
)

// User status
export const userStatusEnum = v.union(
  v.literal('pending'),
  v.literal('verified'),
  v.literal('active'),
  v.literal('rejected'),
  v.literal('suspended'),
  v.literal('onboarding')
)

// Document types
export const documentTypeEnum = v.union(
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

// Document status
export const documentStatusEnum = v.union(
  v.literal('pending'),
  v.literal('validated'),
  v.literal('rejected')
)

// Property status
export const propertyStatusEnum = v.union(
  v.literal('draft'),
  v.literal('pending'),
  v.literal('validated'),
  v.literal('paused'),
  v.literal('selected'),
  v.literal('rejected'),
  v.literal('sold')
)

// Validation checklist item status
export const checklistItemStatusEnum = v.union(
  v.literal('pending'),
  v.literal('approved'),
  v.literal('rejected')
)

// Sex options
export const sexoEnum = v.union(
  v.literal('feminino'),
  v.literal('masculino'),
  v.literal('nao_informado')
)

// Race/color options
export const racaEnum = v.union(
  v.literal('branca'),
  v.literal('preta'),
  v.literal('parda'),
  v.literal('amarela'),
  v.literal('indigena'),
  v.literal('nao_informado')
)

// Disability types
export const deficienciaEnum = v.union(
  v.literal('nao_possui'),
  v.literal('auditiva'),
  v.literal('intelectual'),
  v.literal('visual'),
  v.literal('multipla'),
  v.literal('psicossocial'),
  v.literal('fisica')
)

// Income type
export const tipoRendaEnum = v.union(
  v.literal('clt'),
  v.literal('autonomo'),
  v.literal('servidor_publico'),
  v.literal('aposentado'),
  v.literal('bpc'),
  v.literal('outros'),
  v.literal('nao_informado')
)

// Income ranges
export const rendaFamiliarFaixaEnum = v.union(
  v.literal('ate_2'),
  v.literal('2_4'),
  v.literal('4_6'),
  v.literal('6_8'),
  v.literal('acima_8')
)

export const estadoCivilEnum = v.union(
  v.literal('solteiro'),
  v.literal('casado'),
  v.literal('divorciado'),
  v.literal('viuvo'),
  v.literal('uniao_estavel'),
  v.literal('separado')
)

// Admin access levels
export const adminNivelAcessoEnum = v.union(
  v.literal('super'),
  v.literal('moderador'),
  v.literal('leitor')
)

// Gender identity options
export const identidadeGeneroEnum = v.union(
  v.literal('cisgenero'),
  v.literal('transgenero'),
  v.literal('nao_binario'),
  v.literal('outro'),
  v.literal('nao_informado')
)

// Users table - lean table for auth + identification only
export const users = defineTable({
  // Convex Auth profile fields
  name: v.optional(v.string()),
  image: v.optional(v.string()),
  phone: v.optional(v.string()),
  phoneVerificationTime: v.optional(v.number()),

  role: userRoleEnum,
  cpf: v.string(),
  nome: v.string(),
  // Normalized name for search (lowercase, no accents, trimmed)
  searchName: v.optional(v.string()),
  email: v.optional(v.string()),

  // Status and timestamps
  status: userStatusEnum,
  criadoEm: v.number(),
  atualizadoEm: v.number(),

  // Term acceptance
  termoAceitoEm: v.optional(v.number()),

  // Data validation flags for SECID
  dadosValidados: v.optional(v.boolean()),
  dadosComErro: v.optional(v.boolean()),
  mensagemErroDados: v.optional(v.string()),
  erroReportadoEm: v.optional(v.number()),

  // Profile references (role-specific profile table IDs)
  beneficiaryProfileId: v.optional(v.id('beneficiaryProfiles')),
  ofertanteProfileId: v.optional(v.id('ofertanteProfiles')),
  adminProfileId: v.optional(v.id('adminProfiles'))
})
  .index('by_cpf', ['cpf'])
  .index('by_role', ['role'])
  .index('by_role_and_status', ['role', 'status'])
  .index('email', ['email'])
  .index('phone', ['phone'])
  .index('by_beneficiary_profile', ['beneficiaryProfileId'])
  .index('by_ofertante_profile', ['ofertanteProfileId'])
  .index('by_admin_profile', ['adminProfileId'])
  .index('by_searchName', ['searchName'])
  .searchIndex('search_name', {
    searchField: 'searchName',
    filterFields: ['role']
  })

// Beneficiary Profiles table - all beneficiary-specific data
export const beneficiaryProfiles = defineTable({
  userId: v.id('users'),

  // Personal details
  rg: v.string(),
  nomeResponsavelFamiliar: v.optional(v.string()),
  nomeMae: v.optional(v.string()),
  nomePai: v.optional(v.string()),
  sexo: sexoEnum,
  identidadeGenero: identidadeGeneroEnum,
  raca: racaEnum,
  deficiencias: v.array(deficienciaEnum),

  // Professional and income
  profissao: v.string(),
  empregador: v.optional(v.string()),
  ramoAtividade: v.optional(v.string()),
  tipoRenda: tipoRendaEnum,
  rendaFamiliarFaixa: rendaFamiliarFaixaEnum,

  // Family composition
  pessoasFamilia: v.number(),
  mesesAluguelSocial: v.optional(v.number()),
  possuiIdosoFamilia: v.boolean(),
  chefiaFeminina: v.boolean(),

  // Address
  cep: v.string(),
  endereco: v.string(),
  numero: v.string(),
  complemento: v.optional(v.string()),
  bairro: v.string(),
  cidade: v.string(),
  estado: v.string(),
  empreendimento: v.optional(v.string()),

  // Contact
  dddTelefoneFixo: v.optional(v.string()),
  telefoneFixo: v.optional(v.string()),
  dddTelefoneRecado: v.optional(v.string()),
  telefoneRecado: v.optional(v.string()),
  falarCom: v.optional(v.string()),
  aceitaComunicacoes: v.boolean(),

  // Property selections (max 3)
  propriedadesInteresse: v.optional(v.array(v.id('properties'))),

  // Timestamps
  criadoEm: v.number(),
  atualizadoEm: v.number()
}).index('by_user', ['userId'])

// Ofertante Profiles table - all ofertante-specific data
export const ofertanteProfiles = defineTable({
  userId: v.id('users'),

  // Personal details
  rg: v.string(),
  dataNascimento: v.string(),
  estadoCivil: estadoCivilEnum,

  // Professional
  profissao: v.string(),

  // Address
  cep: v.string(),
  endereco: v.string(),
  numero: v.string(),
  complemento: v.optional(v.string()),
  bairro: v.string(),
  cidade: v.string(),
  estado: v.string(),

  // Onboarding status
  onboardingCompleto: v.boolean(),
  documentosPendentes: v.optional(v.array(v.string())),

  // Timestamps
  criadoEm: v.number(),
  atualizadoEm: v.number()
}).index('by_user', ['userId'])

// Admin Profiles table - minimal admin-specific data
export const adminProfiles = defineTable({
  userId: v.id('users'),

  // Admin-specific
  nivelAcesso: adminNivelAcessoEnum,
  departamento: v.optional(v.string()),
  cargo: v.optional(v.string()),

  // Timestamps
  criadoEm: v.number(),
  atualizadoEm: v.number()
}).index('by_user', ['userId'])

// Properties table (simplified cadastro: endereço em linha única)
export const properties = defineTable({
  // Ownership
  ofertanteId: v.optional(v.id('users')),
  construtorId: v.optional(v.id('users')),

  titulo: v.string(),
  descricao: v.optional(v.string()),
  /** 8 digits, no mask */
  cep: v.optional(v.string()),
  endereco: v.string(),
  compartimentos: v.number(),
  tamanho: v.number(),
  /** Unix ms at UTC midnight for the chosen construction date */
  dataConstrucao: v.number(),
  matricula: v.string(),
  inscricaoImobiliaria: v.string(),
  valorVenda: v.number(),

  status: propertyStatusEnum,

  checklistValidacao: v.object({
    dadosPessoais: checklistItemStatusEnum,
    localizacao: checklistItemStatusEnum,
    construcao: checklistItemStatusEnum,
    cartorio: checklistItemStatusEnum,
    preco: checklistItemStatusEnum,
    documentos: checklistItemStatusEnum
  }),
  notasValidacao: v.optional(
    v.object({
      dadosPessoais: v.optional(v.string()),
      localizacao: v.optional(v.string()),
      construcao: v.optional(v.string()),
      cartorio: v.optional(v.string()),
      preco: v.optional(v.string()),
      documentos: v.optional(v.string())
    })
  ),
  filesIds: v.optional(v.array(v.id('files'))),
  criadoEm: v.number(),
  atualizadoEm: v.number(),
  validadoEm: v.optional(v.number()),
  validadoPor: v.optional(v.id('users')),
  /** When status is rejected: reason shown to the ofertante (and audit). */
  motivoRejeicao: v.optional(v.string()),
  rejeitadoEm: v.optional(v.number()),
  rejeitadoPor: v.optional(v.id('users'))
})
  .index('by_ofertante', ['ofertanteId'])
  .index('by_construtor', ['construtorId'])
  .index('by_status', ['status'])

// Documents table - tracks document metadata and validation status
// File storage is handled by @convex-dev/r2 component
export const documents = defineTable({
  userId: v.id('users'),
  propertyId: v.optional(v.id('properties')),
  tipo: documentTypeEnum,
  r2Key: v.string(), // Key returned by R2 component after upload
  nomeOriginal: v.string(), // Original filename for display
  status: documentStatusEnum,
  notaRejeicao: v.optional(v.string()),
  criadoEm: v.number(),
  atualizadoEm: v.number()
})
  .index('by_user', ['userId'])
  .index('by_property', ['propertyId'])
  .index('by_user_and_tipo', ['userId', 'tipo'])
  .index('by_property_and_tipo', ['propertyId', 'tipo'])

// Beneficiary selections history
export const selectionsHistory = defineTable({
  beneficiarioId: v.id('users'),
  propertyId: v.id('properties'),
  ordemPreferencia: v.number(),
  selecionadoEm: v.number(),
  removidoEm: v.optional(v.number())
})
  .index('by_beneficiario', ['beneficiarioId'])
  .index('by_property', ['propertyId'])

export const files = defineTable({
  r2Key: v.string(),
  name: v.string(),
  type: v.string(),
  size: v.number(),
  url: v.string(),
  userId: v.id('users'),
  propertyId: v.optional(v.id('properties')),
  documentId: v.optional(v.id('documents'))
})
  .index('by_r2_key', ['r2Key'])
  .index('by_property', ['propertyId'])
  .index('by_document', ['documentId'])

export default defineSchema({
  ...authTablesWithoutUsers,
  users,
  files,
  beneficiaryProfiles,
  ofertanteProfiles,
  adminProfiles,
  properties,
  documents,
  selectionsHistory
})
