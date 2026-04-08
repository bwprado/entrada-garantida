import { z } from "zod"

import { parseDataNascimentoBrParaIso } from "@/lib/date-br"
import { validaCPF } from "@/lib/validate-cpf"

export const onlyDigits = (value: string) => value.replace(/\D/g, "")

export const estadoCivilOfertanteEnum = z.enum([
  "solteiro",
  "casado",
  "divorciado",
  "viuvo",
  "uniao_estavel",
  "separado"
])

export type EstadoCivilOfertante = z.infer<typeof estadoCivilOfertanteEnum>

export const estadoCivilLabels: Record<EstadoCivilOfertante, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  divorciado: "Divorciado(a)",
  viuvo: "Viúvo(a)",
  uniao_estavel: "União estável",
  separado: "Separado(a)"
}

// Base user schema (stored in users table)
export const ofertanteUserBaseSchema = z.object({
  nome: z
    .string({ required_error: "Nome é obrigatório" })
    .trim()
    .min(3, "Informe o nome completo"),
  telefone: z
    .string({ required_error: "Celular é obrigatório" })
    .refine(
      (v) => {
        const d = onlyDigits(v)
        return d.length >= 10 && d.length <= 11
      },
      { message: "Celular inválido" }
    ),
  cpf: z
    .string({ required_error: "CPF é obrigatório" })
    .refine((v) => onlyDigits(v).length === 11, "CPF deve ter 11 dígitos")
    .refine((v) => validaCPF(onlyDigits(v)), "CPF inválido")
})

export type OfertanteUserBaseFormValues = z.infer<typeof ofertanteUserBaseSchema>

// Profile schema (stored in ofertanteProfiles table)
export const ofertanteProfileSchema = z.object({
  rg: z
    .string({ required_error: "RG é obrigatório" })
    .trim()
    .min(3, "RG inválido"),
  dataNascimento: z
    .string({ required_error: "Data de nascimento é obrigatória" })
    .min(1, "Informe a data de nascimento")
    .refine(
      (v) => parseDataNascimentoBrParaIso(v) !== null,
      "Use uma data válida (DD-MM-AAAA)"
    ),
  profissao: z
    .string({ required_error: "Profissão é obrigatória" })
    .trim()
    .min(1, "Informe a profissão"),
  estadoCivil: estadoCivilOfertanteEnum
    .optional()
    .refine((v) => v !== undefined, { message: "Selecione o estado civil" }),
  cep: z
    .string({ required_error: "CEP é obrigatório" })
    .refine((v) => onlyDigits(v).length === 8, "CEP deve ter 8 dígitos"),
  endereco: z
    .string({ required_error: "Endereço é obrigatório" })
    .trim()
    .min(1, "Informe o logradouro"),
  numero: z
    .string({ required_error: "Número é obrigatório" })
    .trim()
    .min(1, "Informe o número"),
  complemento: z.string().optional(),
  bairro: z
    .string({ required_error: "Bairro é obrigatório" })
    .trim()
    .min(1, "Informe o bairro"),
  cidade: z
    .string({ required_error: "Cidade é obrigatória" })
    .trim()
    .min(1, "Informe a cidade"),
  estado: z
    .string({ required_error: "Estado é obrigatório" })
    .trim()
    .length(2, "Use a sigla da UF")
})

export type OfertanteProfileFormValues = z.infer<typeof ofertanteProfileSchema>

// Combined schema for form convenience
export const ofertanteCadastroSchema = ofertanteUserBaseSchema.merge(ofertanteProfileSchema)

export type OfertanteCadastroFormValues = z.infer<typeof ofertanteCadastroSchema>

/** Step 1 — nome + telefone (strings as typed; CPF transform runs on full schema submit only). */
export const ofertanteCadastroStep1Fields = [
  "nome",
  "telefone"
] as const satisfies readonly (keyof OfertanteCadastroFormValues)[]

/** Step 2 — dados pessoais + endereço */
export const ofertanteCadastroStep2Fields = [
  "cpf",
  "rg",
  "dataNascimento",
  "profissao",
  "estadoCivil",
  "cep",
  "endereco",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "estado"
] as const satisfies readonly (keyof OfertanteCadastroFormValues)[]

// Note: OTP is now handled by Convex Auth, not stored in profile
export const otpVerifySchema = z.object({
  otp: z
    .string()
    .length(6, "Digite os 6 dígitos do código")
    .regex(/^\d+$/, "Use apenas números")
})
