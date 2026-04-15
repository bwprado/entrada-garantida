import { Migrations } from '@convex-dev/migrations'
import { components } from './_generated/api.js'
import { DataModel } from './_generated/dataModel.js'
import { normalizeName } from './users'

export const migrations = new Migrations<DataModel>(components.migrations)
export const run = migrations.runner()

export const backfillSearchName = migrations.define({
  table: 'users',

  migrateOne: async (ctx, user) => {
    if (user.searchName) return
    await ctx.db.patch(user._id, {
      searchName: normalizeName(user.nome)
    })
  }
})
