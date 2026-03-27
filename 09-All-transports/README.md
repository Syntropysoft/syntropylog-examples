<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 09: All Transports 🌐

> **Transport Pool** — Configure multiple named transports and control which ones receive each log call using the fluent API: `override`, `add`, `remove`.

## 🎯 What You'll Learn

- **Transport pool**: Define multiple transports by name in `transportList`
- **Env routing**: Automatically activate different transport sets per environment
- **`override(...names)`**: Send the next log call *only* to these transports
- **`add(...names)`**: Send the next log call to the default set *plus* these
- **`remove(...names)`**: Send the next log call to the default set *minus* these

---

## 🏗️ The Setup

Four named transports are registered in `transportList`. In `development`, only `json` is active by default:

```typescript
await syntropyLog.init({
  logger: {
    serviceName: 'all-transports-example',
    transportList: {
      json:    new ConsoleTransport(),           // plain JSON
      classic: new ClassicConsoleTransport(),    // single-line, colored
      pretty:  new PrettyConsoleTransport(),     // multi-line, colored
      compact: new CompactConsoleTransport(),    // compact one-liner, colored
    },
    env: { development: ['json'] },
    envKey: 'NODE_ENV',
  },
});
```

---

## 🔍 Six Patterns Demonstrated

### 1. `override('json')` — only JSON transport

```typescript
log.override('json').info('Test message');
// → only ConsoleTransport receives this call, regardless of env default
```

### 2. `override('classic')` — only ClassicConsoleTransport

```typescript
log.override('classic').info('Test message');
// → colored single-line output only
```

### 3. `override('pretty')` — only PrettyConsoleTransport

```typescript
log.override('pretty').info('Test message', { userId: 'u-1', action: 'login' });
// → multi-line colored output only
```

### 4. `override('compact')` — only CompactConsoleTransport

```typescript
log.override('compact').warn('Test message');
// → compact one-liner output only
```

### 5. `add('classic', 'json')` — default + extra transports

```typescript
log.add('classic', 'json').info('This log goes to default + classic + json');
// → env default (json) + classic + json (no duplicates)
```

### 6. `remove('compact')` — default minus one transport

```typescript
log.remove('compact').info('This log goes to default without compact');
// → env default minus the compact transport
```

> `override`, `add`, and `remove` affect **only the next log call**. The following call goes back to the env default.

---

## 📊 Transport Formats Side by Side

The same `logger.info('Con metadata', { userId: 'u-1', action: 'login' })` call renders differently per transport:

| Transport | Output style |
|-----------|-------------|
| `ConsoleTransport` | `{"level":"info","message":"Con metadata","userId":"u-1","action":"login",...}` |
| `ClassicConsoleTransport` | `2025-01-01 12:00:00 INFO  [all-transports] Con metadata { userId: 'u-1', action: 'login' }` |
| `PrettyConsoleTransport` | Multi-line colored block with indented fields |
| `CompactConsoleTransport` | Single colored line, minimal whitespace |

---

## 🚀 How to Run

```bash
cd 09-all-transports
npm install
npm run dev
```

### Expected output

```
============================================================
  1. override("json")
============================================================
{"level":"info","message":"Mensaje de prueba info",...}
{"level":"warn","message":"Mensaje de prueba warn",...}
{"level":"info","message":"Con metadata","userId":"u-1","action":"login",...}

============================================================
  2. override("classic")
============================================================
2025-01-01 12:00:00 INFO  [all-transports] Mensaje de prueba info
2025-01-01 12:00:00 WARN  [all-transports] Mensaje de prueba warn
2025-01-01 12:00:00 INFO  [all-transports] Con metadata { userId: 'u-1', action: 'login' }

============================================================
  3. override("pretty")
============================================================
... (multi-line colored block)

============================================================
  4. override("compact")
============================================================
... (compact one-liners)

============================================================
  5. add("classic", "json") — próximo log = default + classic + json
============================================================
... (appears in both json and classic format)

============================================================
  6. remove("compact") — próximo log = default sin compact
============================================================
... (appears in default transports only, without compact)

============================================================
  All transports listo (override, add, remove)
============================================================
```

---

## 📚 Key Takeaways

- **`transportList` + `env`** is the recommended way to manage multiple transports — define once, activate by environment.
- **`override`** is useful for audit logs or critical alerts that must go to a specific destination regardless of the current env.
- **`add`** lets you temporarily include an extra destination (e.g. a debug transport) for a single call.
- **`remove`** lets you exclude a transport for a single call without creating a new logger instance.
- All three fluent methods reset automatically — the next call uses the env default again.

---

## 🔗 Related Examples

- [Example 04](../04-logging-levels-transports) — transport basics and log levels
- [Example 07](../07-logger-configuration) — pretty vs JSON output configuration
- [Example 12](../12-universal-adapter) — UniversalAdapter for custom backends
