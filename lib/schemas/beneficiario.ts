import { z } from "zod"
import { validaCPF } from "@/lib/validate-cpf"

// Basic helpers
const onlyDigits = (value: string) => value.replace(/\D/g, "")

export const sexoEnum = z.enum(["feminino", "masculino", "nao-informado"]) // "Sexo"
export const identidadeGeneroEnum = z.enum([
  "cisgenero",
  "transgenero",
  "nao-binario",
  "outro",
  "nao-informado"
])
export const racaEnum = z.enum([
  "branca",
  "preta",
  "parda",
  "amarela",
  "indigena",
  "nao-informado"
])
export const tipoRendaEnum = z.enum([
  "clt",
  "autonomo",
  "servidor-publico",
  "aposentado",
  "bpc",
  "outros"
])
export const rendaFamiliarFaixaEnum = z.enum([
  "ate-2",
  "2-4",
  "4-6",
  "6-8",
  "acima-8"
])

export const deficienciaEnum = z.enum([
  "nao_possui",
  "auditiva",
  "intelectual",
  "visual",
  "multipla",
  "psicossocial",
  "fisica"
])

export const beneficiarioSchema = z
  .object({
    // Dados pessoais
    nome: z
      .string({ required_error: "Nome é obrigatório" })
      .trim()
      .min(3, "Informe o nome completo"),
    cpf: z
      .string({ required_error: "CPF é obrigatório" })
      .min(1, "CPF é obrigatório")
      .transform(onlyDigits)
      .refine((v) => v.length === 11, "CPF deve ter 11 dígitos")
      .refine((v) => v.length === 11 && validaCPF(v), "CPF inválido"),
    rg: z
      .string({ required_error: "RG é obrigatório" })
      .trim()
      .min(3, "RG inválido"),
    senha: z
      .string({ required_error: "Senha é obrigatória" })
      .min(6, "Senha deve ter ao menos 6 caracteres"),
    nomeResponsavelFamiliar: z.string().trim().optional(),
    nomeSocial: z.string().trim().optional(),
    nomeMae: z.string().trim().optional(),
    nomePai: z.string().trim().optional(),
    sexo: sexoEnum.default("nao-informado"),
    identidadeGenero: identidadeGeneroEnum.default("nao-informado"),
    raca: racaEnum.default("nao-informado"),
    deficiencias: z
      .array(deficienciaEnum)
      .default(["nao_possui"]) // regra abaixo garante consistência
      .refine(
        (arr) =>
          (arr.length === 1 && arr[0] === "nao_possui") ||
          (arr.length >= 1 && !arr.includes("nao_possui")),
        {
          message:
            "Quando selecionar 'Não possui', não marque outros tipos de deficiência"
        }
      ),

    // Contato e dados profissionais
    profissao: z.string().trim().min(2, "Profissão é obrigatória"),
    empregador: z.string().trim().optional(),
    ramoAtividade: z.string().trim().optional(),
    tipoRenda: tipoRendaEnum.optional(),
    rendaFaixa: rendaFamiliarFaixaEnum,
    pessoasFamilia: z
      .number({ invalid_type_error: "Informe um número" })
      .int("Somente números inteiros")
      .min(1, "Mínimo 1 pessoa"),

    celular: z
      .string()
      .transform(onlyDigits)
      .refine(
        (v) => v.length === 11,
        "Celular deve ter 11 dígitos (DDD + número)"
      ),
    dddTelefoneFixo: z
      .string()
      .transform(onlyDigits)
      .refine((v) => v.length === 0 || v.length === 2, "DDD inválido")
      .optional(),
    telefoneFixo: z
      .string()
      .transform(onlyDigits)
      .refine(
        (v) => v.length === 0 || (v.length >= 8 && v.length <= 9),
        "Telefone inválido"
      )
      .optional(),
    dddTelefoneRecado: z
      .string()
      .transform(onlyDigits)
      .refine((v) => v.length === 0 || v.length === 2, "DDD inválido")
      .optional(),
    telefoneRecado: z
      .string()
      .transform(onlyDigits)
      .refine(
        (v) => v.length === 0 || (v.length >= 8 && v.length <= 9),
        "Telefone inválido"
      )
      .optional(),
    falarCom: z.string().trim().optional(),
    email: z.string().email("E-mail inválido"),
    aceitaComunicacoes: z.boolean().default(false),

    // Endereço
    cep: z
      .string({ required_error: "CEP é obrigatório" })
      .transform(onlyDigits)
      .refine((v) => v.length === 8, "CEP deve ter 8 dígitos"),
    endereco: z.string().trim().min(3, "Endereço é obrigatório"),
    numero: z.string().trim().min(1, "Número é obrigatório"),
    complemento: z.string().trim().optional(),
    bairro: z.string().trim().min(2, "Bairro é obrigatório"),
    cidade: z.string().trim().min(2, "Cidade é obrigatória"),
    estado: z.string().trim().length(2, "UF inválida").default("MA"),
    empreendimento: z.string().trim().optional()
  })
  .strict()

export type BeneficiarioFormData = z.infer<typeof beneficiarioSchema>
