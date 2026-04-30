/** Mirror of convex/schema MAX_PROPERTY_PRICE for client-side zod validation. */
export const MAX_PROPERTY_PRICE = 200_000

/** Max listing photos per property — mirror convex/schema MAX_PROPERTY_PHOTOS. */
export const MAX_PROPERTY_PHOTOS = 10

export const ROOM_COUNT_LIMITS = {
  quartos: { min: 0, max: 10, label: 'Quartos' },
  suites: { min: 0, max: 10, label: 'Suítes' },
  banheiros: { min: 0, max: 5, label: 'Banheiros' },
  salasEstar: { min: 0, max: 10, label: 'Salas de estar' },
  cozinhas: { min: 0, max: 5, label: 'Cozinhas' },
  vagasGaragem: { min: 0, max: 5, label: 'Vagas de garagem' },
  areasServico: { min: 0, max: 5, label: 'Áreas de serviço' }
} as const

export type RoomType = keyof typeof ROOM_COUNT_LIMITS

export const AMENITY_CONFIG = {
  ruaPavimentada: { label: 'Rua pavimentada' },
  garagem: { label: 'Garagem' },
  areaLavanderia: { label: 'Área de lavanderia' },
  portaria24h: { label: 'Portaria 24h' },
  elevador: { label: 'Elevador' },
  piscina: { label: 'Piscina' },
  churrasqueira: { label: 'Churrasqueira' },
  academia: { label: 'Academia' },
  jardim: { label: 'Jardim / Quintal' },
  varanda: { label: 'Varanda' }
} as const

export type AmenityType = keyof typeof AMENITY_CONFIG

export const ROOM_DEFAULTS: Record<RoomType, number> = {
  quartos: 0,
  suites: 0,
  banheiros: 0,
  salasEstar: 0,
  cozinhas: 0,
  vagasGaragem: 0,
  areasServico: 0
}

export const AMENITY_DEFAULTS: Record<AmenityType, boolean> = {
  ruaPavimentada: false,
  garagem: false,
  areaLavanderia: false,
  portaria24h: false,
  elevador: false,
  piscina: false,
  churrasqueira: false,
  academia: false,
  jardim: false,
  varanda: false
}