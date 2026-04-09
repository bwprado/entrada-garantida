import {
  createShareImageResponse,
  ogImageAlt,
  ogImageSize,
} from '@/lib/og-share-image'

export const runtime = 'nodejs'
export const alt = ogImageAlt
export const size = ogImageSize
export const contentType = 'image/png'

export default async function TwitterImage() {
  return createShareImageResponse()
}
