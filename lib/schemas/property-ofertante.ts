import { zid } from 'convex-helpers/server/zod3'
import { isValid } from 'date-fns'
import { z } from 'zod'

import { MAX_PROPERTY_PHOTOS, MAX_PROPERTY_PRICE } from '@/lib/property-limits'

const cepDigits = (s: string) => s.replace(/\D/g, '')

export const propertyOfertanteFormSchema = z.object({
  titulo: z.string().min(1, 'Informe o título'),
  descricao: z.string().optional(),
  cep: z
    .string()
    .default('')
    .refine(
      (v) => cepDigits(v).length === 0 || cepDigits(v).length === 8,
      'CEP deve ter 8 dígitos'
    ),
  endereco: z.string().min(1, 'Informe o endereço'),
  compartimentos: z.coerce
    .number()
    .int('Use um número inteiro')
    .min(1, 'Mínimo 1 compartimento'),
  tamanho: z.coerce.number().positive('Informe o tamanho em m²'),
  data_construcao: z
    .date({
      invalid_type_error: 'Informe a data da construção'
    })
    .refine((d) => isValid(d), { message: 'Data inválida' }),
  matricula: z.string().min(1, 'Informe a matrícula'),
  inscricao_imobiliaria: z.string().min(1, 'Informe a inscrição imobiliária'),
  valor_venda: z.coerce
    .number()
    .positive('Informe o valor de venda')
    .max(
      MAX_PROPERTY_PRICE,
      `Máximo R$ ${MAX_PROPERTY_PRICE.toLocaleString('pt-BR')}`
    ),
  filesIds: z
    .array(zid('files'))
    .min(1, 'Adicione pelo menos uma foto')
    .max(
      MAX_PROPERTY_PHOTOS,
      `No máximo ${MAX_PROPERTY_PHOTOS} fotos`
    )
})

export type PropertyOfertanteFormValues = z.infer<
  typeof propertyOfertanteFormSchema
>
