<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog Examples</h1>

<p align="center">
  <strong>Learn the framework through focused, runnable examples.</strong>
  <br />
  Setup, context, transports, HTTP correlation, testing, and benchmarks.
</p>

---

## Philosophy

> **"Simplicity over Complexity"** — Configure once, use anywhere.

SyntropyLog provides structured logging with context propagation, masking, and pluggable transports. These examples use the **current API**: initialization with `syntropyLog.init({ logger, context })`, no `getHttp`/`getBroker` in core. HTTP integration is done via **client interceptors** (e.g. Axios); persistence and brokers use **UniversalAdapter** and your own transports.

---

## Main examples (01–17)

Each example lives in its own folder. Run it with `npm install` and `npm run dev` (or the script shown in the example’s README).

| # | Folder | Description |
|---|--------|-------------|
| **A — Fundamentals** |
| 01 | `00-setup-initialization` | Setup and initialization (ready/error, getLogger, shutdown) |
| 02 | `01-hello-world` | Minimal first log |
| 03 | `02-basic-context` | Basic context and fields per level |
| 04 | `03-context-ts` | Same with TypeScript |
| 05 | `04-logging-levels-transports` | Logging levels and transports |
| 06 | `05-universal-context-patterns` | Context patterns |
| 07 | `06-error-handling` | Error handling |
| 08 | `07-logger-configuration` | Logger configuration |
| 09 | `08-logging-matrix` | Logging matrix by level |
| 10 | `09-All-transports` | All transports (pool, override, add/remove) |
| **B — Integration** |
| 11 | `10-basic-http-correlation`, `11-axios-interceptors` | HTTP correlation with Axios (interceptors) |
| 12 | `12-UniversalAdapter` | Custom adapter / UniversalAdapter |
| **C — Testing** |
| 13 | `13-testing-patterns` | Testing with Vitest |
| 14 | `14-testing-patterns-jest` | Testing with Jest |
| 15 | `15-testing-serializers` | Testing serializers |
| 16 | `16-testing-transports-concepts` | Testing transport concepts |
| **D — Benchmark** |
| 17 | `17-benchmark` | Benchmark: SyntropyLog vs Pino vs Winston (self-contained) |

*Learning path 01–17; folder names 00–17.*

---

## Quick start

### Per-example setup

Each example is **independent**: it has its own `package.json` and installs its own copy of `syntropylog` when you run `npm install` in that folder. The repo root is for tooling only.

### Prerequisites

- Node.js 18+

### Run a single example

```bash
# Example 01: Setup and initialization
cd 00-setup-initialization
npm install
npm run dev
```

```bash
# Example 17: Benchmark (SyntropyLog vs Pino vs Winston)
cd 17-benchmark
npm install
npm run bench
```

### Run all main examples (script)

```bash
# Default: uses version from versions.txt
./test-all-examples.sh

# With a specific syntropylog version
./test-all-examples.sh 0.9.12

# Start from a given example index
./test-all-examples.sh 0.9.12 5
```

The script runs all examples (00–17).

---

## Core usage (reference)

### Initialization (example 00)

```typescript
import { syntropyLog } from 'syntropylog';

syntropyLog.on('ready', () => console.log('Ready'));
syntropyLog.on('error', (err) => console.error(err));

await syntropyLog.init({
  logger: {
    serviceName: 'my-app',
    level: 'info',
    transports: [/* ConsoleTransport, etc. */],
  },
});

const logger = syntropyLog.getLogger('main');
logger.info('Application started', { version: '1.0.0' });

await syntropyLog.shutdown();
```

### HTTP integration (Axios)

Use **Axios interceptors** to inject correlation ID and logger on each request/response. See `11-axios-interceptors` and [docs/HTTP_CLIENT_INTEGRATION.md](docs/HTTP_CLIENT_INTEGRATION.md).

### UniversalAdapter and transports

The library exposes a **UniversalAdapter** and configurable transports (console, DB, HTTP, etc.) in `logger.transports`. See the library README and `12-UniversalAdapter`.

---

## Transports and chalk

The library **does not require chalk**. `ClassicConsoleTransport` works with or without chalk (colors if available, plain output otherwise). Examples can use it without adding chalk as a dependency.

---

## Versions and maintenance

- **versions.txt** — Defines syntropylog (and related) versions for the repo.
- **./update-all-dependencies.sh** — Updates those dependencies across all example `package.json` files.

---

## Contributing

1. **Test examples** with the intended Node and syntropylog version.
2. **Keep examples focused** on one concept each.
3. **Document** what each example demonstrates in its README.

---

**Remember:** SyntropyLog is about **simplicity and productivity**. Configure once, use anywhere.
