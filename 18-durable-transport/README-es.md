> [🇬🇧 English](README.md) | 🇪🇸 Español

# Ejemplo 18: DurableAdapterTransport (entrega garantizada)

`DurableAdapterTransport` convierte los logs marcados como auditoría en escrituras
con **entrega garantizada**. Envuelve cualquier `executor` (base de datos, colector
OTel, endpoint HTTP, broker) con:

- un **buffer en memoria** (acotado — `bufferSize`, default 1000 — para que no pueda
  tumbar un pod por OOM)
- **reintentos con backoff exponencial** (`maxRetries`, `initialBackoffMs`, `maxBackoffMs`)
- un **hook de dead-letter** (`onDrop`) para los entries que no se pueden entregar,
  con motivo `'buffer-full'` o `'retries-exhausted'`

Es **selectivo por default** (`durableOnlyForRetention: true`): solo los entries
marcados con metadata de retención (`withRetention(...)`) toman el camino durable.
Los `info` / `warn` comunes mantienen su semántica barata de fire-and-forget.

## Qué muestra este ejemplo

1. Un evento de auditoría cuyo sink falla dos veces y luego **se recupera** vía
   reintento — sin perder datos.
2. Un evento de auditoría cuyo sink queda caído, **agota los reintentos** y termina
   en la DLQ.

(Los logs `info`/`warn` comunes sin `withRetention(...)` saltean el camino durable
por completo — fire-and-forget, sin buffer ni reintentos.)

## Ejecutar

```bash
npm install
npm run dev
```

## Opciones clave

| Opción | Default | Para qué |
|--------|---------|----------|
| `executor` | — | la función que persiste cada entry; debe rechazar al fallar para disparar el reintento |
| `bufferSize` | `1000` | máximo de entries en buffer antes de aplicar `dropStrategy` |
| `maxRetries` | `5` | reintentos después del primer intento (así `4` = hasta 5 intentos totales) |
| `initialBackoffMs` / `maxBackoffMs` | `100` / `30000` | crecimiento del backoff y su tope |
| `dropStrategy` | `'oldest'` | qué descartar cuando el buffer está lleno (`'oldest'` / `'newest'` / `'reject'`) |
| `onDrop` | — | **debés manejarlo** — persistí los entries descartados en algún lado durable |
| `durableOnlyForRetention` | `true` | si es true, solo los entries con retención se hacen durables |
| `flushTimeoutMs` | `5000` | cuánto esperan `flush()` / `shutdown()` antes de mandar el resto a la DLQ |

> `flush()` y `shutdown()` drenan el buffer; lo que quede sin entregar después de
> `flushTimeoutMs` se manda a `onDrop` con motivo `'retries-exhausted'`.
