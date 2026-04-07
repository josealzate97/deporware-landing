export const config = {
  port: Number(process.env.BOT_PORT ?? 3001),
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? ""
};

export function hasWhatsAppCredentials() {
  return Boolean(config.phoneNumberId && config.accessToken);
}
