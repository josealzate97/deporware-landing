import { config, hasWhatsAppCredentials } from "./config.mjs";

export async function sendWhatsAppTextMessage(to, body) {
  if (!hasWhatsAppCredentials()) {
    console.log("[BOT][DRY-RUN] Respuesta simulada", { to, body });
    return;
  }

  const url = `https://graph.facebook.com/v22.0/${config.phoneNumberId}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.accessToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Error enviando mensaje a WhatsApp: ${response.status} ${errorBody}`);
  }
}

export async function notifyEscalationLead({ from, messageText }) {
  // Punto de extension: aqui puedes crear ticket, enviar correo o notificar por Slack.
  console.log("[BOT][ESCALATION] Conversacion para humano", { from, messageText });
}
