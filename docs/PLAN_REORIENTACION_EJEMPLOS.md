# Plan de reorientación — SyntropyLog Examples

**Estado actual:** Completado. Solo existen ejemplos 00–17; los opcionales (18–27) y los antiguos (28–37) fueron eliminados.

Este documento define cómo reorientar el proyecto de ejemplos: nuevo enfoque, numeración y títulos, y qué hacer con cada ejemplo. Todo el trabajo de reordenamiento y renombrado se planifica aquí; la implementación se hace en pasos posteriores.

---

## 1. Objetivo

- **Reorientar** el repo como “Ejemplos de SyntropyLog” alineados con la **API actual** de la librería (sin `getHttp`, `getBroker`, `@syntropylog/adapters` en el core).
- **Renumerar** todos los ejemplos con una lista coherente y títulos claros.
- **Mantener** lo que funciona (00-09, 28-37) y **reenfocar** lo que se puede (p. ej. HTTP con Axios vía interceptores).
- **Dejar documentado** qué es opcional, qué se depreca y qué queda como referencia de testing/benchmarks.

---

## 2. Principios

- Cada ejemplo debe poder **ejecutarse** con la versión de `syntropylog` indicada en `versions.txt`, sin APIs eliminadas.
- **Inicialización**: siempre patrón `ready` / `error` antes de `init()` y uso de `getLogger()` después de listo (alineado con el README de la librería).
- Los ejemplos son **didácticos**: un concepto por ejemplo, nombres de carpeta y títulos que se entiendan sin leer código.
- **HTTP**: si hay ejemplo de “correlación HTTP”, debe basarse en **interceptores del cliente** (Axios, fetch, etc.) e inyección de correlation ID / logger, no en `syntropyLog.init({ http: { ... } })`.
- **Brokers (Kafka, RabbitMQ, NATS)** y **“enterprise app”**: dependen de APIs que ya no están; se pueden dejar como **opcionales/avanzados** con nota “requiere adaptación” o excluirlos del índice principal hasta que exista una forma oficial de integrarlos.

---

## 3. Lista sugerida (nueva numeración y títulos)

Criterios de la tabla:

- **Nuevo #**: número definitivo tras reordenar.
- **Título nuevo**: nombre corto para README e índice.
- **Carpeta actual**: carpeta existente que se reutiliza (o “nuevo” si hay que crear).
- **Acción**: mantener | refocus | adaptar | opcional | deprecar.

| Nuevo # | Título nuevo | Carpeta actual | Acción | Notas |
|--------|--------------|----------------|--------|--------|
| **BLOQUE A — Fundamentos (setup, niveles, contexto, transportes)** |
| 01 | Setup e inicialización | 00-setup-initialization | mantener | Referencia de init con ready/error, getLogger, shutdown. |
| 02 | Hello world | 01-hello-world | mantener | Primer log mínimo. |
| 03 | Contexto básico | 02-basic-context | mantener | Contexto y campos por nivel. |
| 04 | TypeScript y tipado | 03-context-ts | mantener | Mismo con TS. |
| 05 | Niveles y transportes | 04-logging-levels-transports | mantener | Levels + transports. |
| 06 | Patrones de contexto | 05-universal-context-patterns | mantener | Patrones de contexto. |
| 07 | Manejo de errores | 06-error-handling | mantener | Error handling. |
| 08 | Configuración del logger | 07-logger-configuration | mantener | Config avanzada. |
| 09 | Logging matrix | 08-logging-matrix | mantener | Matrix por nivel. |
| 10 | Todos los transportes (pool, override, add/remove) | 09-all-transports | mantener | Pool, override, add, remove. |
| **BLOQUE B — Integración (HTTP, adapters)** |
| 11 | Correlación HTTP con Axios (interceptores) | 10-basic-http-correlation | refocus | Quitar `http: { instances, adapter }`. Usar interceptores Axios + inyección de correlation ID y logger. Documentar en el ejemplo. |
| 12 | Adapter custom / UniversalAdapter | 11-custom-adapter | adaptar | Si usa `@syntropylog/adapters`, reescribir a UniversalAdapter + AdapterTransport como en la librería. Si no, renombrar y ajustar título. |
| **BLOQUE C — Testing** |
| 13 | Testing con Vitest | 28-testing-patterns | mantener | Patrones de test con Vitest. |
| 14 | Testing con Jest | 29-testing-patterns-jest | mantener | Patrones con Jest. |
| 15 | Testing serializers | 31-testing-serializers | mantener | Tests de serialización. |
| 16 | Testing conceptos de transportes | 32-testing-transports-concepts | mantener | Conceptos de transportes en tests. |
| **BLOQUE D — Benchmark (uno solo)** |
| 17 | Benchmark (SyntropyLog / Pino / Winston) | *nuevo: 17-benchmark* | **unificar** | Usar **syntropyLog/benchmark**. Un único ejemplo que lo invoque o lo traiga aquí. Eliminar 35, 36, 37. *(Carpetas 33 y 34 tree-shaking borradas.)* Ver §7. |
| **BLOQUE E — Opcionales / avanzados (requieren adaptación o dependencias externas)** |
| — | Serializers custom | 17-custom-serializers | opcional | Quitar dependencia de @syntropylog/adapters; si no es posible, marcar “requiere adaptación” o mover a doc “avanzado”. |
| — | Transportes custom | 18-custom-transports | opcional | Idem. |
| — | Doctor CLI | 19-doctor-cli | opcional | Si usa APIs eliminadas, marcar opcional. |
| — | Kafka / RabbitMQ / NATS | 20–24 | opcional | Sin getBroker no hay integración oficial; dejar como referencia “conceptual” o con nota “adaptar a tu broker”. |
| — | Config producción / contexto avanzado / app enterprise | 25, 26, 27 | opcional | Revisar dependencias; si solo usan syntropylog + logger, se pueden reenfocar; si usan adapters/redis/brokers antiguos, opcional. |

**Nota sobre 12-http-redis-axios, 13–16:** En el repo actual no aparecen carpetas 12–16 en la lista de `package.json` encontrados; si existen en otro branch o se añaden después, se tratarían como “HTTP + Redis con Express/Fastify/…” y serían **refocus**: Redis y HTTP vía interceptores + sintaxis actual de la librería.

---

## 4. Títulos cortos para el README principal

Para el README de `syntropylog-examples` se puede usar esta lista como índice (después de renumerar carpetas):

- **01** — Setup e inicialización  
- **02** — Hello world  
- **03** — Contexto básico  
- **04** — TypeScript y tipado  
- **05** — Niveles y transportes  
- **06** — Patrones de contexto  
- **07** — Manejo de errores  
- **08** — Configuración del logger  
- **09** — Logging matrix  
- **10** — Todos los transportes (pool, override, add/remove)  
- **11** — Correlación HTTP con Axios (interceptores)  
- **12** — Adapter custom / UniversalAdapter  
- **13** — Testing con Vitest  
- **14** — Testing con Jest  
- **15** — Testing serializers  
- **16** — Testing conceptos de transportes  
- **17** — Benchmark (SyntropyLog vs Pino vs Winston; usa `syntropyLog/benchmark`)  

Opcionales (sin número en la secuencia principal, o sección aparte):

- Serializers custom (17-custom-serializers)  
- Transportes custom (18-custom-transports)  
- Doctor CLI (19-doctor-cli)  
- Kafka / RabbitMQ / NATS (20–24)  
- Producción / contexto avanzado / enterprise (25–27)  

---

## 5. Pasos de implementación sugeridos

1. **Consenso**  
   Revisar esta lista y decidir: qué entra en “principal” (01–17), qué queda como “opcional” y si se mantienen 17–27 como carpeta con nota o se mueven a `docs/` como referencia.

2. **Renombrar carpetas**  
   Renumerar según la tabla (00 → 01, …, 28 → 13, …, 32 → 16). Crear 17-benchmark (único benchmark; 33 y 34 tree-shaking ya no existen; 35–37 se eliminan o reemplazan por 17). Mantener nombres descriptivos (ej. `01-setup-initialization`, `11-http-correlation-axios`, `13-testing-vitest`).

3. **Actualizar scripts**  
   - `test-all-examples.sh`: lista de carpetas a ejecutar (01–17 sin los opcionales, o con flag para incluirlos).  
   - Quitar o ajustar `SKIP_EXAMPLES` según lo que pase a “opcional” o “refocus”.

4. **Refocus 11 (ex 10)**  
   - Eliminar `http: { instances, adapter }` de `init()`.  
   - Implementar interceptores Axios que inyecten `X-Correlation-ID` y logger.  
   - Documentar en el ejemplo y, si existe, en `docs/HTTP_CLIENT_INTEGRATION.md`.

5. **Adaptar 12 (ex 11)**  
   - Sustituir uso de `@syntropylog/adapters` por UniversalAdapter + AdapterTransport (como en README de la librería y ejemplos de migration/AppLoggerBridge).

6. **README principal**  
   - Reemplazar “Learning Path” y listas 00–37 por la nueva estructura (01–17 + opcionales).  
   - Títulos según la tabla de la sección 3.  
   - Aclarar que los opcionales pueden requerir adaptación o dependencias externas.

7. **Opcionales (17–27)**  
   - En cada carpeta opcional: README corto con “Este ejemplo requiere adaptación a la API actual” o “Dependencias: …”.  
   - En el README principal: una sola sección “Ejemplos opcionales o avanzados” con enlaces.

8. **Versiones y deps**  
   - Revisar que todos los ejemplos usen `versions.txt` / `update-all-dependencies.sh` y que no dependan de `@syntropylog/adapters` salvo los marcados como opcionales con nota.

---

## 6. Resumen

- **Lista principal:** 01–17 (fundamentos, integración HTTP/adapter, testing, **un solo benchmark**).  
- **Títulos:** los de la tabla en §3; en README usar la lista corta de §4.  
- **Acciones:** mantener (00–09, 28–29, 31–32), refocus (10 → 11 Axios), adaptar (11 → 12 UniversalAdapter), **unificar benchmark (35–37 → 17, usa syntropyLog/benchmark)**, opcional (17–27 y brokers). *(Carpetas 33 y 34 tree-shaking borradas.)*  
- **Orden de trabajo:** consenso → renombrar carpetas → scripts → refocus 11 → adaptar 12 → README → crear 17-benchmark → documentar opcionales.

---

## 7. Refresh ejemplo 17 — Benchmark (detalle)

*(Carpetas 33 y 34 tree-shaking fueron borradas por el usuario. El único ejemplo “post-16” es el benchmark, numerado 17.)*

### 7.1 Acción

| Nuevo # | Carpeta actual | Acción | Carpeta resultado |
|--------|----------------|--------|-------------------|
| **17** | *nuevo* | Un solo ejemplo de benchmark: traer / invocar **syntropyLog/benchmark** (mitata, SyntropyLog vs Pino vs Winston, throughput + memoria). Eliminar o no usar 35, 36, 37 como ejemplos separados. | `17-benchmark` |

### 7.2 Checklist ejemplo 17 (benchmark)

- [ ] Crear carpeta `17-benchmark`.
- [ ] Ejemplo debe invocar o documentar cómo ejecutar el benchmark de la librería (`syntropyLog/benchmark`: `pnpm run bench`, `pnpm run bench:memory`).
- [ ] README: "Example 17: Benchmark (SyntropyLog vs Pino vs Winston)"; explicar que el código vive en `syntropyLog/benchmark` y cómo ejecutarlo desde el monorepo (o traer script aquí).
- [ ] Decidir: ¿script en 17-benchmark que hace `cd ../../syntropyLog/benchmark && pnpm run bench` o copiar/adaptar el benchmark aquí para que sea autocontenido en ejemplos?

### 7.3 Eliminación de ejemplos antiguos de benchmark

- [ ] 35-benchmark-with-syntropy, 36-benchmark-without-syntropy, 37-benchmark-with-pino: eliminar carpetas o mover a `docs/` como referencia; el benchmark oficial queda en syntropyLog/benchmark y el ejemplo 17 lo usa o enlaza.

### 7.4 README principal y docs

- [ ] Índice 01–17 (sin 18–21). Enlace a `17-benchmark`.
- [ ] Si existe TESTING_OVERVIEW o docs que citen 33–37, actualizar (quitar 33–34; benchmark = 17).

### 7.5 Bloque E (opcionales)

Sin numeración 22+ por ahora. Mantener carpetas actuales (17-custom-serializers, 18-custom-transports, 19-doctor-cli, 20–24, 25–27) con README que indique “Opcional / requiere adaptación a la API actual”. En el README principal, una sola sección “Ejemplos opcionales o avanzados” con lista y enlaces. No renumerar estos en este refresh.

---

Si querés, el siguiente paso puede ser bajar esto a un checklist por carpeta (por ejemplo en `docs/CHECKLIST_REORDENAMIENTO.md`) o aplicar primero solo el renombrado y el README sin tocar aún el código de 10/11.
