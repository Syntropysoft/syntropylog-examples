# Resumen de tests en syntropylog-examples

Resumen de los ejemplos de testing (Bloque C, 13–16): carpetas, archivos y qué cubre cada uno.

---

## Carpetas de ejemplos de test

| Carpeta | Runner | Archivos de test | Qué cubre |
|--------|--------|-------------------|-----------|
| **13-testing-patterns** | Vitest | `tests/user-service.test.ts`, `tests/test-utils.ts` | Patrones con Vitest: `createTestHelper(vi.fn)`, UserService con mock de SyntropyLog, init/shutdown boilerplate. |
| **14-testing-patterns-jest** | Jest | `tests/user-service.test.ts` | Mismo patrón con Jest: `createTestHelper()`, UserService, matchers de Jest. |
| **15-testing-serializers** | Vitest | `tests/serializer-service.test.ts`, `tests/example-coverage.test.ts` | createMockLogger, serializers custom; coverage de serializers e init/shutdown. |
| **16-testing-transports-concepts** | Vitest | `tests/transports-concepts.test.ts` | Conceptos: transports como “spies”, createTestHelper(vi.fn), NotificationService, boilerplate. |

---

## Configuración

| Carpeta | Config test |
|--------|-------------|
| 13-testing-patterns | `vitest.config.ts`, `vitest.config.simple.ts` — `tests/**/*.test.ts`, coverage v8 |
| 14-testing-patterns-jest | `jest.config.js` — preset ts-jest, `tests`, `**/*.test.ts` |
| 15-testing-serializers | vitest vía package.json — tests en `tests/` |
| 16-testing-transports-concepts | `vitest.config.ts` — node, coverage v8 |

---

## Contenido por ejemplo

### 13-testing-patterns (Vitest)

- **user-service.test.ts**: createTestHelper(vi.fn), UserService con mock, init/shutdown.
- **test-utils.ts**: Helpers para tests (initSyntropyForTesting, shutdownSyntropyForTesting, etc.).

### 14-testing-patterns-jest (Jest)

- **user-service.test.ts**: createTestHelper(), UserService con mock, matchers de Jest.
- Dependencia: `syntropylog/testing`.

### 15-testing-serializers

- **serializer-service.test.ts**: createMockLogger(), serializers custom, spying/verification.
- **example-coverage.test.ts**: Framework boilerplate (initializeSyntropyLog, gracefulShutdown), coverage de serializers.

### 16-testing-transports-concepts

- **transports-concepts.test.ts**: Transports as spies, createTestHelper(vi.fn), NotificationService, init/shutdown.

---

## Utilidades de `syntropylog/testing`

- **createTestHelper(fn?)** — Devuelve `{ beforeEach, afterEach, mockSyntropyLog }`.
- **createServiceWithMock(Service, mock)** — Instancia del servicio con mock.
- **createSyntropyLogMock()** — Mock del framework.
- **createMockLogger()** — Logger mock para tests con serializers.

---

## Cómo ejecutar los tests

```bash
cd 13-testing-patterns && npm test
cd 14-testing-patterns-jest && npm test
cd 15-testing-serializers && npm test
cd 16-testing-transports-concepts && npm test
```

Cada carpeta tiene su propio `package.json` con script `test` (vitest o jest).
