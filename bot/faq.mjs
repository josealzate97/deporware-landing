const FAQ_RULES = [
  {
    intent: "precio",
    keywords: ["precio", "coste", "costo", "valor", "plan", "planes", "tarifa"],
    answer:
      "Manejamos planes segun tamano del club y necesidades. Si quieres, te conecto con un asesor para cotizar en detalle."
  },
  {
    intent: "demo",
    keywords: ["demo", "demostracion", "mostrar", "prueba", "agendar"],
    answer:
      "Podemos agendar una demo guiada. Comparteme tu nombre y el nombre del club para coordinar fecha y hora."
  },
  {
    intent: "funcionalidades",
    keywords: ["modulo", "modulos", "funciones", "funcionalidades", "que hace", "capacidad"],
    answer:
      "Deporware ayuda con gestion de deportistas, asistencia, reportes y operacion diaria del club en un solo sistema."
  },
  {
    intent: "soporte",
    keywords: ["soporte", "ayuda", "problema", "error", "falla", "no funciona"],
    answer:
      "Claro. Cuentame el problema y te ayudo. Si es urgente, tambien puedo derivarte con el equipo de soporte."
  }
];

const ESCALATION_KEYWORDS = [
  "asesor",
  "humano",
  "persona",
  "llamada",
  "urgente",
  "vendedor",
  "representante"
];

const DEFAULT_ANSWER =
  "Gracias por escribirnos. Puedo ayudarte con demo, precios, funcionalidades y soporte. Si prefieres, te paso con un asesor humano.";

function normalize(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function buildReplyForMessage(messageText) {
  const normalized = normalize(messageText ?? "");

  const shouldEscalate = ESCALATION_KEYWORDS.some((word) => normalized.includes(word));

  if (shouldEscalate) {
    return {
      intent: "escalamiento",
      shouldEscalate: true,
      answer:
        "Perfecto, te voy a derivar con una persona del equipo Deporware. En breve te escribimos por este mismo medio."
    };
  }

  const matchedRule = FAQ_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (!matchedRule) {
    return {
      intent: "default",
      shouldEscalate: false,
      answer: DEFAULT_ANSWER
    };
  }

  return {
    intent: matchedRule.intent,
    shouldEscalate: false,
    answer: matchedRule.answer
  };
}
