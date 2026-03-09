# TODO – Ejemplos SyntropyLog (seguir mañana)

Estado al cierre: qué falta, qué agregar, qué cambiar. Quizá haya que **rearmar toda la lista** (README + test script + agrupación).

---

## Estado actual

### Lo que corre (test-all-examples.sh)
- **00** – 08: se ejecutan (setup, hello-world, context, context-ts, levels/transports, universal-context, error-handling, logger-config, logging-matrix).
- **09**: se ejecuta (antes en SKIP; ahora es All-transports y está fuera de SKIP).

### Lo que se salta (SKIP_EXAMPLES)
API HTTP/brokers/adapters ya no existe en la librería (`getHttp`, `getBroker`, `@syntropylog/adapters`), por eso se omiten:
- **10** basic-http-correlation  
- **11** custom-adapter  
- **12** http-redis-axios  
- **13** http-redis-fastify  
- **14** http-redis-nestjs  
- **15** http-redis-koa  
- **16** http-redis-hapi  
- **17** custom-serializers  
- **18** custom-transports  
- **19** doctor-cli  
- **20** basic-kafka-correlation  
- **21** basic-rabbitmq-broker  
- **22** basic-nats-broker  
- **23** kafka-full-stack  
- **24** full-stack-nats  
- **25** production-configuration  
- **26** advanced-context  
- **27** complete-enterprise-app  

### Después del 27 (28–37)
- **28** testing-patterns, **29** testing-patterns-jest, **30** testing-redis-context, **31** testing-serializers, **32** testing-transports-concepts  
- **33** tree-shaking-minimal, **34** tree-shaking-full  
- **35** benchmark-with-syntropy, **36** benchmark-without-syntropy, **37** benchmark-with-pino  

No están en SKIP_EXAMPLES; si el script los incluye al listar carpetas numeradas, se intentan ejecutar. Revisar si deben estar en skip o en la lista “activos”.

---

## Pendientes por ejemplo / tema

### 09 – All-transports
- [ ] **Nombre de carpeta vs package**: carpeta es `09-All-transports`, `package.json` puede seguir diciendo `09-http-configuration`; unificar (p. ej. nombre en package: `09-all-transports`).
- [ ] **README del repo**: ya dice “09: All transports” y hay sección “Ejemplo 09: All transports (fuera de la lista)”. Ver si mover 09 dentro de la lista oficial o dejar como “destacado fuera”.
- [ ] Borrar o archivar `09-http-configuration/AllTransportsExample.ts` si ya no se usa (el código vivo está en `09-All-transports/src/index.ts`).

### 00 – 08
- [ ] **00**: sin cambios (sin colores; referencia de setup).
- [ ] **01**: ya tiene 2 transportes (Classic + Console). OK.
- [ ] **02 – 08**: ya tienen 2 transportes (Classic o Pretty + Console). OK.
- [ ] Revisar que en todos: chalk no requerido (doc en README + docs/LIBRARY-CLASSIC-CONSOLE-TRANSPORT.md).

### 10 – 27 (hoy en SKIP)
- [ ] **Decidir estrategia**:
  - **A)** Dejarlos en skip indefinidamente (README decir “archived / requieren API antigua”).
  - **B)** Reescribir los que se pueda sin getHttp/getBroker/adapters (solo logging + context, sin HTTP/brokers).
  - **C)** Mover a una rama o carpeta `archive/` y rearmar numeración solo con ejemplos que corran.
- [ ] Si se rearma lista: definir nuevos números y actualizar README + test-all-examples.sh (y SKIP si aplica).

### 28 – 37 (testing, tree-shaking, benchmark)
- [ ] Listar en README de forma clara (Testing, Tree-shaking, Benchmark).
- [ ] Decidir si entran en `test-all-examples.sh` o en otro script (p. ej. “solo 00–09” o “00–09 + 28–37”).
- [ ] Revisar que no dependan de getHttp/getBroker/adapters; si dependen, añadir a SKIP o adaptar.

### Nuevos ejemplos: UniversalAdapter + AdapterTransport
- [ ] **UniversalAdapter**: para llevar logs (o datos) **a donde se nos antoje** — cualquier destino (HTTP, broker, DB, S3, etc.) vía un único contrato/executor. Ejemplo(s) genérico(s) mostrando cómo configurarlo y enviar “a cualquier lado”.
  - Referencia de código: `docs/UNIVERSAL_ADAPTER_EXAMPLE.md` (ejemplo Prisma/DB; mismo patrón para axios, brokers).
- [ ] **AdapterTransport**: ejemplo(s) mostrando cómo usarlo como transport en el logger.
- [ ] **Casos de uso concretos** (usando UniversalAdapter/AdapterTransport):
  - **Axios / HTTP**: enviar a un API (reemplazo conceptual de los viejos 10, 11, 12).
  - **Brokers**: Kafka, RabbitMQ, NATS (reemplazo conceptual de 20–24).
  - Opcional: otros destinos (archivo, cola, etc.) para mostrar que “cualquier lado” es literal.
- [ ] Decidir numeración y sección en README (“UniversalAdapter: cualquier destino” + ejemplos axios/brokers).
- [ ] Documentar en README que UniversalAdapter = un solo adapter para cualquier backend; axios y brokers son ejemplos de destino.

---

## Comportamiento librería (syntropylog)

- [ ] **Logs después de shutdown**: Tras llamar a `syntropyLog.shutdown()`, el ejemplo imprime "completed" y los timers, pero el framework sigue emitiendo mensajes (LifecycleManager, "Shutdown promises completed", "State changed to SHUTDOWN", etc.). Opciones: (a) que `shutdown()` solo resuelva cuando todos los logs del propio shutdown estén escritos, o (b) no loguear esos pasos en consola durante shutdown, para que no queden mensajes "después de cerrar". Revisar en la librería.

## Tareas generales

- [ ] **Revisar README** (learning path, listado 00–37, estado ✅/🚧/archived).
- [ ] **Revisar test-all-examples.sh**: qué carpetas considera “ejemplo” (¿solo 00–27 o 00–37?), orden, mensajes de skip.
- [ ] **versions.txt / update-all-dependencies.sh**: que 09-All-transports (y el resto) reciban la versión correcta de syntropylog.
- [ ] **Lista única de referencia**: crear una tabla o sección “Ejemplos por número” con: número, nombre carpeta, nombre corto, ¿corre? (sí/skip), notas (ej. “All transports”, “archived – HTTP API”).

---

## Resumen rápido para mañana

1. Unificar **09**: nombre package/carpeta y README.  
2. Decidir qué hacer con **10–27** (archivar, reescribir o renumerar).  
3. Incluir **28–37** en README y en la lógica del script de test.  
4. **Nuevos ejemplos**: UniversalAdapter (llevar a **cualquier** destino) + AdapterTransport; ejemplos concretos con axios y brokers.  
5. Opcional: **rearmar toda la lista** (solo ejemplos que corren en “Fundamentals”, el resto en “Advanced / Archive / Testing / Benchmark”) y actualizar README + test-all-examples.sh en consecuencia.
