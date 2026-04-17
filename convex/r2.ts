import { R2 } from '@convex-dev/r2'
import { v } from 'convex/values'
import { components } from './_generated/api'
import { mutation, query } from './_generated/server'
import { verifyLogin } from './authz'

import type { DataModel } from './_generated/dataModel'

export const r2 = new R2(components.r2)

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx) => {
    const user = await verifyLogin(ctx)
    if (
      user?.role !== 'ofertante' &&
      user?.role !== 'construtor' &&
      user?.role !== 'admin'
    ) {
      throw new Error('Não autorizado')
    }
  },
  onUpload: async (ctx, _bucket, key) => {
    console.log(`[R2] File uploaded: ${key} to bucket: ${_bucket}`)
  }
})

export const syncToFiles = mutation({
  args: {
    r2Key: v.string(),
    name: v.string(),
    contentType: v.string(),
    size: v.number(),
    propertyId: v.optional(v.id('properties')),
    documentId: v.optional(v.id('documents'))
  },
  handler: async (ctx, args) => {
    const user = await verifyLogin(ctx)

    const url = await r2.getUrl(args.r2Key)

    const fileId = await ctx.db.insert('files', {
      r2Key: args.r2Key,
      name: args.name,
      type: args.contentType,
      size: args.size,
      url,
      userId: user._id,
      propertyId: args.propertyId,
      documentId: args.documentId
    })

    return fileId
  }
})

export const getFileUrlAndMetadata = query({
  args: { fileIds: v.array(v.id('files')) },
  handler: async (ctx, { fileIds }) => {
    const files = await Promise.all(fileIds.map((id) => ctx.db.get(id)))
    if (!files) {
      throw new Error('Arquivos não encontrados')
    }

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        if (!file) {
          throw new Error('Arquivo não encontrado')
        }
        return {
          ...file,
          url: await r2.getUrl(file.r2Key)
        }
      })
    )

    return filesWithUrls
  }
})

// Query to get file URLs by IDs (uses cached URL or generates new one)
export const getFileUrls = query({
  args: { fileIds: v.array(v.id('files')) },
  handler: async (ctx, { fileIds }) => {
    const files = await Promise.all(fileIds.map((id) => ctx.db.get(id)))

    const urls = await Promise.all(
      files
        .filter((f): f is NonNullable<typeof f> => f !== null)
        .map(async (file) => {
          // Use cached URL if available, otherwise generate one
          if (file.url) return file.url
          return await r2.getUrl(file.r2Key)
        })
    )

    return urls.filter((url): url is string => !!url)
  }
})

export const deleteFile = mutation({
  args: { fileId: v.id('files') },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId)
    if (!file) {
      throw new Error('Arquivo não encontrado')
    }
    const fileId = await r2.deleteObject(ctx, file.r2Key)
    await ctx.db.delete(args.fileId)
    return fileId
  }
})
