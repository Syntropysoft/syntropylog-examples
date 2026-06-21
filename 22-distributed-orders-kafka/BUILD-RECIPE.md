# Build Recipe — Example 22: Distributed Orders (one correlation-id, end to end)

> Authoritative, resumable plan. If context is lost, re-read this file and continue
> from the first unchecked step. Every non-obvious SyntropyLog API fact is captured
> in §3 so we never have to re-research the library.

## 0. Goal & the "wow"

A single order placed in the browser threads **ONE correlation-id** through **5 services**
across **3 web frameworks** + **HTTP** + **Kafka** + **Redis**, and you watch the trace
light up **live** in a dashboard on the same page. The punchline: *no Datadog, no APM —
just SyntropyLog declaring observability once.* The jaw-drop is seeing the same id survive
a hop **through a message broker**, with PII (card, CVV, email) masked automatically.

## 1. Architecture & data flow

```
Browser (React storefront + live dashboard, one page)
  │  POST /api/orders   (frontend generates x-correlation-id = trc_web_*)
  ▼
Gateway · Express  :3000   correlationIdMiddleware + WS hub + logbus→WS bridge
  │  fetch(ORDERS_URL, headers: getPropagationHeaders('http'))   → x-correlation-id
  ▼
Orders · NestJS    :3001   SyntropyLogModule + @InjectLogger; save order→Redis;
  │  publish order.created  headers: getPropagationHeaders('kafka') → correlationId
  ▼ Kafka topic: order.created
  ├─► Payments · Fastify  :3002   consume; mask card PII; publish payment.processed
  └─► Inventory · Express :3003   consume; reserve stock in Redis; publish stock.reserved
            │
            ▼ Kafka topics: payment.processed, stock.reserved
        Notifications · worker     consume both; "send email"; mark order confirmed

Log bus: every service has an AdapterTransport → Redis pub/sub channel `syntropy:logbus`.
Gateway subscribes and streams each (already-masked) entry over WebSocket to the dashboard,
grouped by correlationId → live distributed trace.
```

Ports: gateway 3000 (HTTP+WS), orders 3001, payments 3002, inventory 3003. Infra: Kafka
localhost:9092, Redis localhost:6379, Kafka-UI localhost:8080.

## 2. Tech & runtime decisions

- **Monorepo**: npm workspaces. `packages/shared` (the heart) + `services/*` + `frontend`.
- **Language**: TypeScript, **CommonJS**, `tsc` builds. Decorators on (for NestJS).
- **Run model**: infra in Docker (`docker compose up -d`); the 5 services + Vite run on the
  **host** via one `npm run dev` (concurrently) so logs stream live in one terminal.
- **Per-service dev runner**: `tsx watch` for gateway/payments/inventory/notifications;
  **`ts-node-dev --transpile-only`** for orders (NestJS needs emitDecoratorMetadata — esbuild/tsx
  would strip it and break DI).
- **shared** is consumed as its **compiled** `dist/index.js` (predev builds it; `dev:shared`
  runs `tsc --watch`). Services `wait-on packages/shared/dist/index.js` before starting.
- **Broker**: Kafka KRaft single node (apache/kafka:3.8.0), dual listener (localhost:9092 for
  host services, kafka:19092 for the in-network Kafka-UI). Client lib: **kafkajs**.
- **Redis**: ioredis. Holds order state, stock, and the logbus pub/sub channel.
- **Frontend**: React + Vite (its own ESM `type:module`; talks to gateway over HTTP/WS only,
  so no ESM/CJS coupling with shared — it redeclares the tiny WS message type).

## 3. SyntropyLog API facts that matter (v1.2.0) — DO NOT re-research

- Source of truth: library at `C:\source\libs\syntropylog` (its README is comprehensive).
- `await syntropyLog.init({ logger, masking, loggingMatrix, retentionPolicies, context, onLogFailure })`.
  `getLogger(name)`, `getContextManager()`, `shutdown()`.
- **Logging is metadata-FIRST**: `log.info({ orderId, email }, 'msg')`. Masking is by field
  **name**, not message text — never put PII in the message string.
- Transports (named imports from `syntropylog`): `ClassicConsoleTransport` (colored host console),
  `AdapterTransport` + `UniversalAdapter` (logbus → Redis), `ConsoleTransport`, `DurableAdapterTransport`.
  `AdapterTransport` passes the masked `LogEntry` (`{ level, message, timestamp, service, correlationId, ...meta }`,
  all spread at top level) to `adapter.log(entry)`. No formatter needed.
- Masking: `getDefaultMaskingRules({maskChar})`, `MaskingStrategy` (`.PASSWORD`→`[REDACTED]`, `.TOKEN`, `.CUSTOM`),
  `maskEnum`. Defaults already mask `cardNumber`/`email`. We add a custom rule for `cvv`.
- Middleware: `correlationIdMiddleware()` (Express), `fastifyCorrelationHook()` (Fastify).
  Reads incoming `x-trace-id / x-correlation-id / x-request-id / request-id` → W3C `traceparent`
  → generates `trc_*`; echoes `X-Trace-Id / X-Correlation-ID / X-Request-ID` on the response;
  holds the ALS scope until `res.finish`.
- Inbound/outbound translation:
  `context.inbound/outbound = { source/target: { conceptualField: 'wire-name' } }`.
  `cm.getPropagationHeaders('kafka')` → `{ wireName: value }` for fields present in context.
  `extractInboundContext(headers, source, CONTEXT_CONFIG)` — **3 args**, pure, lowercases the
  wire name for lookup, does **not** auto-generate. (We pass our own exported `CONTEXT_CONFIG`,
  because `syntropyLog.config` is not a reliably-typed public getter.)
- **★ The coherence trick**: set `context.correlationIdHeader: 'correlationId'`. Then the built-in
  middleware stores the id under context key `'correlationId'` — exactly the conceptual field that
  `getPropagationHeaders()` reads (`store.data.get(field)`). Result: SAME id in logs AND on the wire
  over HTTP (`x-correlation-id`) AND Kafka (`correlationId`). On Kafka **consume**, lowercase the
  message-header keys before `extractInboundContext` (it lowercases wire names).
- NestJS (`syntropylog/nestjs`): `SyntropyLogModule.forRoot()`, `@InjectLogger()` (binds
  `source=ClassName`), `SyntropyNestLoggerService` (pass to `NestFactory.create(App,{logger})`).
  Peer deps: `@nestjs/common`, `@nestjs/core`, `reflect-metadata`, `rxjs`. **init() before create.**

## 4. File manifest (status)

Legend: [x] written · [ ] todo

Root / infra
- [x] package.json (workspaces, dev orchestration)
- [x] tsconfig.base.json
- [x] docker-compose.yaml (kafka KRaft + redis + kafka-ui)
- [x] .gitignore, .env.example

packages/shared/
- [x] package.json, tsconfig.json
- [x] src/constants.ts (FIELD/SOURCE/TARGET, topics, groups, redis keys, svc names)
- [x] src/env.ts, src/types.ts (Order + events), src/masking.ts
- [x] src/syntropy.ts (bootstrap + exported CONTEXT_CONFIG, logbus AdapterTransport)
- [x] src/redis.ts, src/kafka.ts (producer/consumer + correlation propagation), src/logbus.ts
- [x] src/index.ts (barrel)

services/* (all [x], all verified running)
- [x] gateway/src/index.ts
- [x] orders/src/{main,app.module,orders.controller,orders.service,kafka.provider,syntropy-nest-logger.service}.ts
       (echeq pattern — local logger, NO syntropylog/nestjs)
- [x] payments/src/index.ts
- [x] inventory/src/index.ts
- [x] notifications/src/index.ts

frontend/
- [x] package.json
- [ ] vite.config.ts, tsconfig.json, tsconfig.node.json, index.html
- [ ] src/main.tsx, src/App.tsx, src/api.ts, src/ws.ts, src/types.ts
- [ ] src/components/Storefront.tsx, TraceDashboard.tsx, ServiceMap.tsx, LogStream.tsx
- [ ] src/styles.css

Docs
- [ ] README.md (architecture, run steps, what to look for)

## 5. Build steps (ordered, with verification gates)

1. [x] Scaffold root + infra + all package.json/tsconfig.  ← DONE
2. [x] Write packages/shared sources.  ← DONE
3. [x] `npm install` at example root (374 pkgs; syntropylog installed, JS fallback fine).  ← DONE
4. [x] `npm run build:shared` → **0 type errors**. Validated API usage.  ← DONE
5. [x] Write services/orders (NestJS) → typechecks clean.  ← DONE
6. [ ] Write services/gateway (Express + WS + logbus bridge). Gate: typechecks.
7. [ ] Write services/payments, inventory, notifications. Gate: each typechecks.
8. [x] Frontend built (`vite build` → 37 modules, dist OK).  ← DONE
9. [x] `docker compose up -d` → kafka healthy, redis PONG; topics pre-created via ensureTopics().  ← DONE
10. [x] VERIFIED end-to-end: order ORD-369144db / corr trc_web_demoB threaded gateway→orders→payments+
        inventory→notifications (11 entries, 5 services); card=`**** **** **** 1234`, cvv=`[REDACTED]`,
        email=`a***********@example.com`; WS delivered all 11 entries to a dashboard client.  ← DONE
11. [x] README written. Edge paths (decline >$5000, out-of-stock SKU-WATCH) also verified.  ← DONE

**STATUS: COMPLETE & VERIFIED.** All 7 build steps done; happy path + both failure paths exercised
end-to-end with one correlation-id, PII masked, live WS feed confirmed.

## 6. Commands

```bash
cd 22-distributed-orders-kafka
docker compose up -d            # kafka + redis + kafka-ui
npm install
npm run dev                     # builds shared, then runs 5 services + vite (concurrently)
# place an order:
curl -X POST http://localhost:3000/api/orders -H 'content-type: application/json' \
  -H 'x-correlation-id: trc_web_demo1' -d @sample-order.json
# open the dashboard: http://localhost:5173   (Kafka UI: http://localhost:8080)
```

## 7. Gotchas & resolutions

- **Kafka consume header casing**: kafkajs returns header keys as-sent + Buffer values →
  `normalizeHeaders()` lowercases keys + stringifies before `extractInboundContext`. (done in shared/kafka.ts)
- **NestJS DI under a fast runner**: use `ts-node-dev --transpile-only`, NOT tsx (esbuild drops
  `emitDecoratorMetadata`). tsconfig has `experimentalDecorators` + `emitDecoratorMetadata`.
- **shared resolution in dev**: services import the compiled `dist`, not TS source; predev/`dev:shared`
  keep it built; `wait-on` guards the race.
- **Kafka not ready at boot**: kafkajs retry config (12 retries) + topics auto-create enabled in compose.
- **logbus must never crash a service**: executor publish is fire-and-forget with `.catch(()=>{})`.
- **syntropyLog is a singleton per process**: fine — each service is its own process.
- **`syntropylog/nestjs` subpath needs `moduleResolution: node16`** (classic `node` ignores the
  exports map). Base tsconfig uses `module: node16` + `moduleResolution: node16` (still emits CJS for
  non-`type:module` packages). Runtime resolution (node/tsx/ts-node) reads exports natively — fine.
- **★ NestJS — do NOT use `syntropylog/nestjs`**: that subpath bundles its OWN SyntropyLog singleton,
  separate from the main `syntropylog` one we init. `SyntropyLogModule.forRoot()` / `SyntropyNestLoggerService()`
  no-arg then use an UNINITIALIZED instance → runtime `Logger Factory not available`; passing the main
  singleton needs an `as never` cast (duplicate bundled types). Instead follow the echeq production pattern
  (`C:\source\echeq\echep-urgente\echeq-sandbox-nestjs`): a LOCAL `SyntropyNestLoggerService implements
  LoggerService` wrapping the main singleton (`syntropyLog.getLogger('nest')`), `NestFactory.create(App,
  { bufferLogs: true, logger: new SyntropyNestLoggerService() })`, and log in services via
  `syntropyLog.getLogger(name).withSource('ClassName')` — no module, no `@InjectLogger`. (Tell Gabriel: the
  `syntropylog/nestjs` subpath is effectively broken for consumers due to the dual singleton.)
- **★ Masking**: `masking: { enableDefaultRules: true, rules: [customRules] }`. Do NOT set
  `enableDefaultRules: false` + spread `getDefaultMaskingRules()` into `rules` — the defaults lose the internal
  `_isDefaultRule` fast-path and route through an async regex worker that fails to mask in time (PII leaks).
  Defaults cover email/cardNumber/ssn/phone/password/token; we add a custom `cvv` rule.
- **Logger metadata must be JsonValue**: interface-typed objects (Customer, PaymentInfo) aren't assignable
  to `Record<string, JsonValue>` (no index signature). Log a fresh object literal of primitive fields, e.g.
  `log.info({ email: customer.email, ... }, 'msg')` — not `log.info({ customer }, 'msg')`.
- **★ Node 20 required** (not the fnm default v25). `.node-version`/`.nvmrc` = 20.20.0, `engines.node: 20.x`.
  Run node/npm via PowerShell (the Bash tool's shell has no working node due to fnm hook errors).
```
