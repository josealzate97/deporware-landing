import http from "node:http";
import { URL } from "node:url";

import { buildReplyForMessage } from "./faq.mjs";
import { config } from "./config.mjs";
import { notifyEscalationLead, sendWhatsAppTextMessage } from "./whatsapp-api.mjs";

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function getWebhookPayloadDetails(payload) {
  const value = payload?.entry?.[0]?.changes?.[0]?.value;
  const message = value?.messages?.[0];

  if (!message || message.type !== "text") {
    return null;
  }

  const from = message.from;
  const text = message.text?.body ?? "";

  if (!from || !text) {
    return null;
  }

  return { from, text };
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;

      if (data.length > 1_000_000) {
        reject(new Error("Payload demasiado grande"));
      }
    });

    req.on("end", () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("JSON invalido"));
      }
    });

    req.on("error", reject);
  });
}

async function handleWebhookVerification(req, res, parsedUrl) {
  const mode = parsedUrl.searchParams.get("hub.mode");
  const token = parsedUrl.searchParams.get("hub.verify_token");
  const challenge = parsedUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === config.verifyToken && challenge) {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(challenge);
    return;
  }

  sendJson(res, 403, { error: "No autorizado para verificar webhook" });
}

async function handleWebhookMessage(req, res) {
  try {
    const payload = await readRequestBody(req);
    const details = getWebhookPayloadDetails(payload);

    if (!details) {
      sendJson(res, 200, { ok: true, ignored: true });
      return;
    }

    const { from, text } = details;
    const reply = buildReplyForMessage(text);

    if (reply.shouldEscalate) {
      await notifyEscalationLead({ from, messageText: text });
    }

    await sendWhatsAppTextMessage(from, reply.answer);

    sendJson(res, 200, {
      ok: true,
      handled: true,
      intent: reply.intent,
      escalated: reply.shouldEscalate
    });
  } catch (error) {
    console.error("[BOT] Error procesando webhook", error);
    sendJson(res, 500, { error: "Error interno del bot" });
  }
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (req.method === "GET" && parsedUrl.pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "deporware-whatsapp-bot" });
    return;
  }

  if (parsedUrl.pathname !== "/webhook") {
    sendJson(res, 404, { error: "Ruta no encontrada" });
    return;
  }

  if (req.method === "GET") {
    await handleWebhookVerification(req, res, parsedUrl);
    return;
  }

  if (req.method === "POST") {
    await handleWebhookMessage(req, res);
    return;
  }

  sendJson(res, 405, { error: "Metodo no permitido" });
});

server.listen(config.port, () => {
  console.log(`[BOT] Escuchando en http://localhost:${config.port}`);
  if (!config.verifyToken) {
    console.warn("[BOT] WHATSAPP_VERIFY_TOKEN no configurado. La verificacion GET /webhook fallara.");
  }
});
