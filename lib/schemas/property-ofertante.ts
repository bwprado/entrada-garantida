import { zid } from 'convex-helpers/server/zod3'
import { isValid, subYears } from 'date-fns'
import { z } from 'zod'

import {
  AMENITY_DEFAULTS,
  MAX_PROPERTY_PHOTOS,
  MAX_PROPERTY_PRICE,
  ROOM_COUNT_LIMITS,
  ROOM_DEFAULTS,
  type AmenityType,
  type RoomType
} from '@/lib/property-limits'
import { parseBrlCurrency } from '../masks'

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
  quartos: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.quartos.min)
    .max(ROOM_COUNT_LIMITS.quartos.max)
    .default(0),
  suites: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.suites.min)
    .max(ROOM_COUNT_LIMITS.suites.max)
    .default(0),
  banheiros: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.banheiros.min)
    .max(ROOM_COUNT_LIMITS.banheiros.max)
    .default(0),
  salasEstar: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.salasEstar.min)
    .max(ROOM_COUNT_LIMITS.salasEstar.max)
    .default(0),
  cozinhas: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.cozinhas.min)
    .max(ROOM_COUNT_LIMITS.cozinhas.max)
    .default(0),
  vagasGaragem: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.vagasGaragem.min)
    .max(ROOM_COUNT_LIMITS.vagasGaragem.max)
    .default(0),
  areasServico: z.coerce
    .number()
    .int()
    .min(ROOM_COUNT_LIMITS.areasServico.min)
    .max(ROOM_COUNT_LIMITS.areasServico.max)
    .default(0),
  ruaPavimentada: z.boolean().default(false),
  garagem: z.boolean().default(false),
  areaLavanderia: z.boolean().default(false),
  portaria24h: z.boolean().default(false),
  elevador: z.boolean().default(false),
  piscina: z.boolean().default(false),
  churrasqueira: z.boolean().default(false),
  academia: z.boolean().default(false),
  jardim: z.boolean().default(false),
  varanda: z.boolean().default(false),
  tamanho: z.coerce.number().positive('Informe o tamanho em m²'),
  data_construcao: z
    .date({
      invalid_type_error: 'Informe a data da construção'
    })
    .optional()
    .refine((d) => {
      if (!d) return true
      const now = new Date()
      const boundary = subYears(now, 20)
      return d <= now && d >= boundary
    }, 'Data deve ser entre 20 anos atrás e hoje'),
  matricula: z.string().min(1, 'Informe a matrícula'),
  inscricao_imobiliaria: z.string().optional(),
  valor_venda: z.string().refine((v) => {
    const n = parseBrlCurrency(v)
    return n !== undefined && n > 0 && n <= MAX_PROPERTY_PRICE
  }, 'Informe um valor válido'),
  filesIds: z
    .array(zid('files'))
    .min(1, 'Adicione pelo menos uma foto')
    .max(MAX_PROPERTY_PHOTOS, `No máximo ${MAX_PROPERTY_PHOTOS} fotos`)
})

export type PropertyOfertanteFormValues = z.infer<
  typeof propertyOfertanteFormSchema
>

export const ROOM_FIELD_NAMES = Object.keys(ROOM_COUNT_LIMITS) as RoomType[]

export const AMENITY_FIELD_NAMES = Object.keys(
  AMENITY_DEFAULTS
) as AmenityType[]

export const ALL_ROOM_AND_AMENITY_FIELDS = [
  ...ROOM_FIELD_NAMES,
  ...AMENITY_FIELD_NAMES
] as const
