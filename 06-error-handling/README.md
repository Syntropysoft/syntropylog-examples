<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 06: Error Handling 🛡️

> **Core Pattern** — Log errors with full context so you can trace exactly what went wrong and where.

## 🎯 What You'll Learn

- **Custom error types**: `ValidationError`, `DatabaseError`, `ExternalServiceError` — typed errors carry structured context
- **Error correlation**: every error log automatically includes the `correlationId` of the current operation
- **Context preservation**: errors logged mid-flow keep all the context set at the start
- **Graceful degradation**: when an external call fails, the app continues with a fallback instead of crashing

---

## 🏗️ The Problem This Solves

Without correlation, a production error log looks like this:

```
ERROR: Connection timeout
```

With SyntropyLog, the same error looks like this:

```json
{
  "level": "error",
  "message": "User registration failed",
  "correlationId": "a3f2-...",
  "operation": "user-registration",
  "userId": "new-user-123",
  "error": "Connection timeout",
  "errorType": "DatabaseError"
}
```

You know *who* was affected, *what* operation failed, and *which request* to trace — without changing a single line of business logic.

---

## 🔍 Four Patterns Demonstrated

### Pattern 1 — Simple error handling

Basic `try/catch` with structured error logging:

```typescript
try {
  await validateUser({ email: 'test@example.com' }); // name missing → throws
  logger.info('User validation successful');
} catch (error) {
  logger.error('User validation failed', {
    error: error instanceof Error ? error.message : String(error),
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
  });
}
```

---

### Pattern 2 — Context preservation on error

The `correlationId` set at the start of the operation is still present when the error is logged:

```typescript
await contextManager.run(async () => {
  contextManager.set('operation', 'user-registration');
  contextManager.set('userId', 'new-user-123');

  try {
    await validateUser({}); // fails: email and name missing
  } catch (error) {
    // correlationId is automatic — no need to pass it manually
    logger.error('User validation failed with context', {
      error: error instanceof Error ? error.message : String(error),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
    });
  }
});
```

---

### Pattern 3 — Error in a multi-step async flow

A registration flow with three sequential steps. If any step fails, the error log identifies exactly which step and preserves the full operation context:

```typescript
// Step 1: Validation
await validateUser(userData);

// Step 2: Database (may throw DatabaseError randomly)
await saveUserToDatabase(userData);

// Step 3: External service (may throw ExternalServiceError randomly)
await callExternalService(userData);
```

If `saveUserToDatabase` throws, the caught error carries `errorType: "DatabaseError"` and `operation: "user-registration"` — no manual wiring needed.

---

### Pattern 4 — Graceful degradation on HTTP failure

When an external HTTP call fails, the app returns cached data instead of propagating the error. The failure is logged with full context, but the operation completes:

```typescript
try {
  // Simulate HTTP call that may fail
  throw new Error('HTTP 500: External service unavailable');
} catch (error) {
  logger.error('HTTP request failed, using fallback', {
    error: error instanceof Error ? error.message : String(error),
    fallback: 'cached-data',
  });
  return { data: 'cached-data' }; // app continues
}
```

---

## 📊 Custom Error Types

The example defines three typed errors that carry structured fields:

```typescript
class ValidationError extends Error {
  constructor(message: string, public field: string) { ... }
}

class DatabaseError extends Error {
  constructor(message: string, public operation: string) { ... }
}

class ExternalServiceError extends Error {
  constructor(message: string, public service: string) { ... }
}
```

These let you log `errorType` and distinguish errors programmatically without parsing message strings.

---

## 🚀 How to Run

```bash
cd 06-error-handling
npm install
npm run dev
```

### Expected output

```
🎯 Example 06: Error Handling with Correlation

🔗 Correlation ID: <generated-uuid>
📊 Demonstrating error handling patterns:

🛡️ Pattern 1: Simple Error Handling
[INFO]  User validation successful
[ERROR] User validation failed { error: 'Name is required', errorType: 'ValidationError' }

🔍 Pattern 2: Error Handling with Context Preservation
[ERROR] User validation failed with context { error: 'Email is required', errorType: 'ValidationError', correlationId: '...' }

⚡ Pattern 3: Error Handling in Async Operations
[INFO]  Validating user data
[INFO]  User validation successful
[INFO]  Saving user to database
[INFO]  User saved to database        ← or →  [ERROR] User registration failed { errorType: 'DatabaseError' }
...

🌐 Pattern 4: HTTP Error Handling with Graceful Degradation
[ERROR] HTTP request failed, using fallback { fallback: 'cached-data' }
[INFO]  Operation completed with data { dataSource: 'cached-data' }

✅ Error handling demonstration completed!
```

> Patterns 3 and 4 include random failures — output varies per run.

---

## ⚙️ Configuration

```typescript
await syntropyLog.init({
  logger: {
    serviceName: 'error-handling-example',
    level: 'info',
    serializerTimeoutMs: 100,
    transports: [new ClassicConsoleTransport(), new ConsoleTransport()],
  },
  context: {
    correlationIdHeader: 'x-correlation-id-test-06',
  },
});
```

Two transports are active simultaneously — `ClassicConsoleTransport` (colored, single-line) and `ConsoleTransport` (plain JSON) — so you can see both formats side by side.

---

## 📚 Key Takeaways

- **Wrap operations in `contextManager.run()`** — every log inside it automatically carries the correlation ID.
- **Log `error.constructor.name`** as `errorType` — makes errors filterable in any log aggregator.
- **Graceful degradation is explicit** — catch, log, return fallback. The caller never knows it failed.
- **In production**, context is created automatically by HTTP middleware or message queue handlers. The patterns here are the same.

---

## 🔗 Related Examples

- [Example 00](../00-setup-initialization) — initialization and graceful shutdown
- [Example 02](../02-basic-context) — context propagation basics
- [Example 10](../10-basic-http-correlation) — HTTP correlation with Axios
