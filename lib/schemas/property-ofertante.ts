import { zid } from 'convex-helpers/server/zod3'
import { isValid } from 'date-fns'
import { z } from 'zod'

import { MAX_PROPERTY_PRICE } from '@/lib/property-limits'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const MAX_PHOTOS = 5
const ALLOWED_IMAGE = new Set(['image/png', 'image/jpeg', 'image/gif'])

export const propertyOfertanteFormSchema = z.object({
  titulo: z.string().min(1, 'Informe o título'),
  descricao: z.string().optional(),
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
  fotos: z
    .array(z.instanceof(File))
    .min(1, 'Adicione pelo menos uma foto')
    .max(MAX_PHOTOS, `No máximo ${MAX_PHOTOS} fotos`)
    .superRefine((files, ctx) => {
      for (const f of files) {
        if (!ALLOWED_IMAGE.has(f.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Use apenas PNG, JPEG ou GIF'
          })
          return
        }
        if (f.size > MAX_PHOTO_BYTES) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Cada arquivo deve ter no máximo 5 MB'
          })
          return
        }
      }
    }),
  filesIds: z.array(zid('files')).optional()
})

export type PropertyOfertanteFormValues = z.infer<
  typeof propertyOfertanteFormSchema
>
