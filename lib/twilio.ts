import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken 
  ? twilio(accountSid, authToken) 
  : null;

export async function sendSMS(
  to: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!client || !phoneNumber) {
    console.log("[DEV] SMS would be sent:", { to, message });
    return { success: true };
  }

  try {
    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: to.startsWith("+") ? to : `+55${to}`,
    });

    if (result.status === "failed" || result.status === "undelivered") {
      return { success: false, error: `SMS failed: ${result.errorMessage}` };
    }

    return { success: true };
  } catch (error) {
    console.error("Twilio error:", error);
    return { success: false, error: String(error) };
  }
}

export function formatOTPMessage(codigo: string): string {
  return `Aquisicao Assistida - Seu codigo de verificacao e: ${codigo}. Validade: 5 minutos. Nao compartilhe este codigo.`;
}
