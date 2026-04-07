import type { Id } from "@/convex/_generated/dataModel"

export async function uploadPropertyGallery(
  uploadFile: (
    file: File,
    options?: {
      onProgress?: (progress: { loaded: number; total: number }) => void
    }
  ) => Promise<string>,
  files: File[],
  addPropertyImage: (args: {
    propertyId: Id<"properties">
    r2Key: string
    nomeOriginal: string
    ordem?: number
  }) => Promise<unknown>,
  propertyId: Id<"properties">
) {
  for (let i = 0; i < files.length; i++) {
    const key = await uploadFile(files[i])
    await addPropertyImage({
      propertyId,
      r2Key: key,
      nomeOriginal: files[i].name,
      ordem: i
    })
  }
}
