import { R2 } from "@convex-dev/r2";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";

export const r2 = new R2(components.r2);

export const { generateUploadUrl, syncMetadata } = r2.clientApi<DataModel>({
  checkUpload: async (ctx, bucket) => {
    // TODO: Add auth check when auth is ready
    // const user = await getUserFromAuth(ctx);
    // if (!user) throw new Error("Unauthorized");
  },
  onUpload: async (ctx, bucket, key) => {
    // Post-upload hook - can be used for logging or notifications
    console.log(`[R2] File uploaded: ${key} to bucket: ${bucket}`);
  },
});
