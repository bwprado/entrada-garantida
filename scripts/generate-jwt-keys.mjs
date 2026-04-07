/**
 * Generate JWT_PRIVATE_KEY + JWKS for @convex-dev/auth.
 * Run: node scripts/generate-jwt-keys.mjs
 * Then set both values on your Convex deployment (Dashboard → Settings → Environment Variables
 * or `npx convex env set`).
 *
 * @see https://labs.convex.dev/auth/setup/manual
 */
import { exportJWK, exportPKCS8, generateKeyPair } from 'jose'

const keys = await generateKeyPair('RS256', {
  extractable: true
})
const privateKey = await exportPKCS8(keys.privateKey)
const publicKey = await exportJWK(keys.publicKey)
const jwks = JSON.stringify({ keys: [{ use: 'sig', ...publicKey }] })

process.stdout.write(
  `JWT_PRIVATE_KEY="${privateKey.trimEnd().replace(/\n/g, ' ')}"`
)
process.stdout.write('\n')
process.stdout.write(`JWKS=${jwks}`)
process.stdout.write('\n')
