# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## WhatsApp Bot Skeleton

Se incluye un esqueleto de bot en la carpeta `bot/` para responder FAQs y escalar a humano cuando sea necesario.

### Archivos principales

- `bot/server.mjs`: servidor HTTP con endpoints `/health` y `/webhook`.
- `bot/faq.mjs`: reglas simples de intencion por palabras clave.
- `bot/whatsapp-api.mjs`: envio de mensajes a WhatsApp Cloud API y hook de escalamiento.
- `bot/config.mjs`: lectura de variables de entorno.

### Variables de entorno

Configura estas variables en tu archivo `.env` (puedes partir de `.env.example`):

- `BOT_PORT`: puerto del bot (por defecto `3001`).
- `WHATSAPP_VERIFY_TOKEN`: token para verificar webhook en Meta.
- `WHATSAPP_PHONE_NUMBER_ID`: id del numero de WhatsApp Business.
- `WHATSAPP_ACCESS_TOKEN`: token de acceso de Meta.

Si `WHATSAPP_PHONE_NUMBER_ID` o `WHATSAPP_ACCESS_TOKEN` no estan definidos, el bot funciona en modo simulacion (dry-run) y solo imprime la respuesta en consola.

### Comandos

- `npm run bot:dev`: arranca el bot en modo watch.
- `npm run bot:start`: arranca el bot normal.

### Endpoints

- `GET /health`: estado del servicio.
- `GET /webhook`: validacion de webhook (Meta envia challenge).
- `POST /webhook`: recepcion de mensajes de WhatsApp.

### Flujo de respuesta

1. Llega un mensaje de texto por `POST /webhook`.
2. El bot extrae remitente y texto.
3. Evalua intencion con `faq.mjs`.
4. Si detecta palabras de escalamiento (ej. "humano", "asesor"), marca derivacion.
5. Responde por WhatsApp Cloud API.
6. Si hay derivacion, ejecuta `notifyEscalationLead` (placeholder para Slack, email o CRM).

### Prueba local rapida

Con el bot encendido, puedes probar el webhook con:

```bash
curl -X POST http://localhost:3001/webhook \
	-H "Content-Type: application/json" \
	-d '{
		"entry": [{
			"changes": [{
				"value": {
					"messages": [{
						"from": "573001112233",
						"type": "text",
						"text": { "body": "Quiero una demo" }
					}]
				}
			}]
		}]
	}'
```

Y para probar verificacion webhook:

```bash
curl "http://localhost:3001/webhook?hub.mode=subscribe&hub.verify_token=TU_TOKEN&hub.challenge=12345"
```
