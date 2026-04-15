import { Migrations } from '@convex-dev/migrations'
import { components } from './_generated/api.js'
import { DataModel } from './_generated/dataModel.js'
import { normalizeName } from './users'
import { normalizePhone } from '../lib/normalize-phone'

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

export const backfillPhoneFromTelefone = migrations.define({
  table: 'users',

  migrateOne: async (ctx, user) => {
    if (user.phone) return

    const legacyTelefone = (user as unknown as { telefone?: string }).telefone
    if (!legacyTelefone) return

    const normalized = normalizePhone(legacyTelefone)

    await ctx.db.patch(user._id, {
      phone: normalized.isValid() ? normalized.save() : legacyTelefone
    })
  }
})
