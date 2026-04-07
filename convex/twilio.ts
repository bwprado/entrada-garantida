import { Twilio } from '@convex-dev/twilio'
import { v } from 'convex/values'
import { components } from './_generated/api'
import { internalAction } from './_generated/server'

let twilioClient: Twilio<{ defaultFrom: string }> | null | undefined

/** Lazy init so missing env in dev does not fail module load (Twilio ctor throws). */
export function getTwilioClient(): Twilio<{ defaultFrom: string }> | null {
  if (twilioClient !== undefined) return twilioClient
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) {
    twilioClient = null
    return null
  }
  twilioClient = new Twilio(components.twilio, { defaultFrom: from })
  return twilioClient
}

/** Used by Convex Auth `sendVerificationRequest` (see convex/auth.ts). */
export const sendVerificationSms = internalAction({
  args: {
    to: v.string(),
    body: v.string()
  },
  handler: async (ctx, args) => {
    const client = getTwilioClient()
    if (!client) {
      console.warn('[DEV] Phone OTP (sem Twilio):', args.to, args.body)
      return
    }
    await client.sendMessage(ctx, { to: args.to, body: args.body })
  }
})
