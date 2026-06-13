> [🇬🇧 English](README.md) | 🇪🇸 Español

# Ejemplo 21: Middleware de correlación (Express / Fastify)

Propagación de correlation-id lista para usar en servidores HTTP. El middleware
resuelve un correlation-id entrante (multi-header → `traceparent` → genera uno),
abre un contexto de AsyncLocalStorage para todo el request — así **cada log dentro
del handler lleva el id automáticamente** — y lo devuelve en la respuesta.

## Qué muestra este ejemplo

1. Un request **sin** correlation-id → el server genera uno.
2. Un request **con** `x-correlation-id` → el server lo propaga de punta a punta.

Ambos se disparan desde el propio ejemplo con el `fetch` global, así que es
autocontenido — no hace falta curl.

## Ejecutar

```bash
npm install
npm run dev
```

## Express (este ejemplo)

```ts
import { correlationIdMiddleware } from 'syntropylog';

app.use(correlationIdMiddleware());          // montalo antes de tus rutas
app.get('/hello', (_req, res) => {
  log.info('handling /hello');               // el correlation-id se incluye solo
  res.json({ ok: true });
});
```

## Fastify (misma idea, otro hook)

```ts
import Fastify from 'fastify';
import { fastifyCorrelationHook } from 'syntropylog';

const app = Fastify();
app.addHook('onRequest', fastifyCorrelationHook());
app.get('/hello', async () => {
  log.info('handling /hello');
  return { ok: true };
});
```

## Opciones (ambos)

`correlationIdMiddleware(options)` / `fastifyCorrelationHook(options)` aceptan las
`CorrelationResolveOptions` compartidas (ej. `incomingHeaders`, `responseHeaders`,
`parseTraceparent`, `syntropyLog` para apuntar a una instancia que no sea el
singleton). Sin opciones usan el `context.correlationIdHeader` configurado y
defaults sensatos.
