import { v } from "convex/values";
import { action } from "./_generated/server";

// Twilio configuration - these should be set in Convex environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

interface TwilioResponse {
  sid: string;
  status: string;
  error_code?: string;
  error_message?: string;
}

async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; sid?: string; error?: string }> {
  try {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.error("[Twilio] Missing credentials");
      return { success: false, error: "Twilio credentials not configured" };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const body = new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER,
      Body: message,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Twilio] API error:", errorData);
      return { 
        success: false, 
        error: errorData.message || `HTTP ${response.status}` 
      };
    }

    const data: TwilioResponse = await response.json();
    
    if (data.error_code) {
      return { success: false, error: data.error_message || `Error ${data.error_code}` };
    }

    return { success: true, sid: data.sid };
  } catch (error) {
    console.error("[Twilio] Error sending SMS:", error);
    return { success: false, error: String(error) };
  }
}

export const sendOTP = action({
  args: {
    telefone: v.string(),
    codigo: v.string(),
  },
  handler: async (ctx, args) => {
    const message = `Código de verificação Aquisição Assistida: ${args.codigo}. Válido por 5 minutos. Não compartilhe este código.`;
    
    const result = await sendSMS(args.telefone, message);
    
    if (!result.success) {
      // Log the error but don't fail the OTP request
      // The OTP is still created and can be shown in development mode
      console.error("[Twilio] Failed to send SMS:", result.error);
    }
    
    return result;
  },
});
