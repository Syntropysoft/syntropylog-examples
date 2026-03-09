<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>
# SyntropyLog Examples

Welcome to the SyntropyLog examples. This collection demonstrates how to use the framework for observability in Node.js applications.

## 🎯 Philosophy

> **"Simplicity over Complexity"** - Configure once, use anywhere.

SyntropyLog unifies logging, HTTP clients, Redis, and message brokers in a single framework with automatic correlation.

## 📚 Learning Path

### **FUNDAMENTALS (00-09)** - Core Framework Features ✅ COMPLETE
- **00**: Basic setup ✅
- **01**: Hello world ✅
- **02**: Basic context ✅
- **03**: TypeScript ✅
- **04**: Logging levels and transports ✅
- **05**: Universal context patterns ✅
- **06**: Error handling ✅
- **07**: Logger configuration ✅
- **08**: Logging matrix ✅
- **09**: All transports ✅

### **INTEGRATION (10-13)** - HTTP & Redis with Different Frameworks 🚧
- **10**: HTTP correlation 🚧
- **11**: Custom adapter 🚧
- **12**: HTTP + Redis (Express) 🚧
- **13**: HTTP + Redis (Fastify) 🚧

### **ADVANCED FEATURES (14-19)** - Advanced Framework Features 🚧
- **14**: HTTP + Redis (NestJS) 🚧
- **15**: HTTP + Redis (Koa) 🚧
- **16**: HTTP + Redis (Hapi) 🚧
- **17**: Custom serializers 🚧
- **18**: Custom transports 🚧
- **19**: Doctor CLI 🚧

### **MESSAGING (20-24)** - Message Brokers & Correlation 🚧
- **20**: Basic Kafka 🚧
- **21**: Basic RabbitMQ 🚧
- **22**: Basic NATS 🚧
- **23**: Kafka full-stack 🚧
- **24**: NATS microservices (Full-stack distributed tracing) 🚧

### **ENTERPRISE (25-27)** - Production & Complete Applications 🚧
- **25**: Production configuration 🚧
- **26**: Advanced context 🚧
- **27**: Complete enterprise app 🚧

### **TESTING & BENCHMARKS (28-37)**
- **28**: Testing patterns (Vitest)
- **29**: Testing patterns (Jest)
- **30**: Testing Redis context
- **31**: Testing serializers
- **32**: Testing transports concepts
- **33**: Tree-shaking minimal
- **34**: Tree-shaking full
- **35**: Benchmark with SyntropyLog
- **36**: Benchmark without SyntropyLog
- **37**: Benchmark with Pino

## 🚀 Quick Start

### Instalación por ejemplo (cada uno su copia)
Cada carpeta de ejemplo es **independiente**: tiene su propio `package.json` y descarga su propia copia de `syntropylog` al hacer `npm install` dentro de esa carpeta. **No se usa la base** (raíz del repo) para las dependencias de los ejemplos; la raíz es solo para tooling del repo (y así no saturar la máquina con una instalación única de todo).

### Prerequisites
- Node.js 18+
- Docker (for examples with external services)

### Probar todos los ejemplos que corren en el script
```bash
# Usa la versión en versions.txt por defecto
./test-all-examples.sh

# Con versión concreta
./test-all-examples.sh 0.9.12

# A partir de un ejemplo (índice)
./test-all-examples.sh 0.9.12 5  # Empezar desde ejemplo 05
```
El script ejecuta **00-09** y **28-37**; omite **10-27** (dependen de API getHttp/getBroker/adapters ya no incluida en la librería).

### Individual Examples
Entra en la carpeta del ejemplo e instala ahí (cada una descarga su copia de la librería):

```bash
# Ejemplo 00: Setup e inicialización (el que figura en este README)
cd 00-setup-initialization
npm install
npm run dev
```

```bash
# Otro ejemplo mínimo
cd 01-hello-world
npm install
npm run dev
```

### With External Services
```bash
cd 12-http-redis-axios
docker-compose up -d redis
npm install
npm start
```

### Ejemplo 09: All transports (fuera de la lista)
El **09** es el ejemplo con todos los transportes de consola: pool de transportes (json, classic, pretty, compact, colorful), **override** por nombre para elegir salida, y operaciones **agregar / sacar / remover** transportes en tiempo de ejecución. Es el ejemplo de referencia con “todos los chiches” del logging.

### Transports y chalk
La librería **ya no requiere chalk**. `ClassicConsoleTransport` funciona igual con o sin chalk: si está disponible usa colores; si no, salida sin colores. Los ejemplos pueden usar `ClassicConsoleTransport` sin declarar chalk en dependencias.

## 🐳 Docker Services

Algunos ejemplos (10-27) requieren servicios externos si los ejecutas a mano. Hay `docker-compose` en las carpetas que los usan:

### Redis (ejemplos 12, 13)
```bash
cd 12-http-redis-axios   # o 13-http-redis-fastify
docker-compose up -d redis
npm install && npm start
```

### Message Brokers (20-24)
```bash
cd 23-kafka-full-stack   # o 20, 21, 22, 24
docker-compose up -d
npm install && npm run dev
```

## 📊 Current Status

### ✅ **Ejecutados por `test-all-examples.sh` (00-09, 28-37)**
El script de prueba ejecuta solo estos ejemplos (sin APIs de HTTP/brokers/adapters):
- **00-09**: Fundamentos (setup, context, transports, levels, error handling, etc.)
- **28-35**: Testing (Vitest, Jest, Redis, serializers, transports) y tree-shaking
- **36-37**: Benchmarks (sin SyntropyLog, con Pino)

### ⏭️ **Omitidos en el script (10-27)**
Los ejemplos **10-27** dependen de la API antigua (`getHttp`, `getBroker`, `@syntropylog/adapters`), que ya no está en la librería. El script los omite. Puedes ejecutarlos a mano si adaptas la integración (p. ej. [interceptores HTTP](docs/HTTP_CLIENT_INTEGRATION.md)).

### 🔧 **Versiones y mantenimiento**
- Versiones centralizadas en **`versions.txt`**. Para actualizar todos los `package.json`: `./update-all-dependencies.sh` (syntropylog, @syntropylog/types, redis; chalk ya no se gestiona en el script).
- Cada carpeta es independiente: `cd <ejemplo> && npm install && npm run dev`.

## 🎯 What You'll Learn

### **Core Concepts:**
- ✅ **Context propagation**: Automatic correlation across services
- ✅ **HTTP instrumentation**: Request/response logging; con Axios (y similares) se usan los **interceptores del cliente** (p. ej. `axios.interceptors.request`/`response`) y dentro se inyecta el logger y el contexto de correlación (ver [Integración HTTP](docs/HTTP_CLIENT_INTEGRATION.md))
- ✅ **Redis integration**: Command logging and caching
- ✅ **Message brokers**: Kafka, RabbitMQ, NATS correlation
- ✅ **UniversalAdapter**: un solo adapter; los transportes se configuran en `logger.transports` (consola, DB, HTTP, brokers, etc.) y se pueden sacar, agregar o reemplazar
- ✅ **Multiple instances**: Multiple Redis/broker instances

### **Real-World Patterns:**
- ✅ **Microservices**: End-to-end correlation
- ✅ **API Gateway**: Request tracing
- ✅ **Event-driven**: Message correlation
- ✅ **Caching**: Redis with observability
- ✅ **Error handling**: Graceful degradation

## 🔧 Framework Features

### **Setup e inicialización (ejemplo 00):**
```typescript
import { syntropyLog } from 'syntropylog';

// Escuchar eventos antes de init
syntropyLog.on('ready', () => console.log('✅ Listo'));
syntropyLog.on('error', (err) => console.error('❌', err));

syntropyLog.init({
  logger: {
    serviceName: 'my-app',
    level: 'info',
    serializerTimeoutMs: 100,
  },
});

const logger = syntropyLog.getLogger('main');
logger.info('Application startup complete', { version: '1.0.0' });

// Al cerrar la app
await syntropyLog.shutdown();
```

### **Uso básico:**
```typescript
const logger = syntropyLog.getLogger('main');
logger.info('User created', { userId: 123 });
```

### **Integración HTTP (Axios, etc.)**

Si usamos Axios, hay que crear los **interceptores de Axios** según la [documentación de Axios](https://axios-http.com/docs/interceptors) y **dentro** de esos interceptores inyectar nuestro logger y el contexto de correlación (headers). Así toda llamada que pase por esa instancia queda instrumentada. Detalle: [docs/HTTP_CLIENT_INTEGRATION.md](docs/HTTP_CLIENT_INTEGRATION.md).

### **Adapter y transportes**

En la librería hay **un solo adapter**: **UniversalAdapter**. Los transportes (consola, DB, HTTP, colas, etc.) se configuran en `logger.transports`; después se pueden sacar, agregar o reemplazar.

Ejemplo: consola + envío a DB (Prisma, Mongoose, pg, etc.) con UniversalAdapter. El ejemplo canónico está en el **README de la librería**:

```typescript
import { syntropyLog, UniversalAdapter, ClassicConsoleTransport } from 'syntropylog';
import { prisma } from './db';

const dbTransport = new UniversalAdapter({
  executor: async (logEntry) => {
    await prisma.systemLog.create({
      data: {
        level:         logEntry.level,
        message:       logEntry.message,
        service:       logEntry.serviceName,
        correlationId: logEntry.correlationId,
        payload:       logEntry.meta,
        timestamp:     new Date(logEntry.timestamp),
      },
    });
  },
});

await syntropyLog.init({
  logger: {
    serviceName: 'ecommerce-app',
    transports: [new ClassicConsoleTransport(), dbTransport],
  },
  // ...
});
```

Ver README de la librería y `docs/UNIVERSAL_ADAPTER_EXAMPLE.md`.

## 🔗 GraphQL Integration (Conceptual)

SyntropyLog integrates easily with GraphQL for automatic correlation:

### **Correlation ID Propagation:**
```typescript
// HTTP Headers (same as REST)
headers: {
  'X-Correlation-ID': correlationId,
  'Authorization': 'Bearer token'
}

// GraphQL Context
const context = {
  correlationId,
  syntropyLog: syntropyLogInstance,
  userId: req.user?.id
}
```

### **Resolver Integration:**
```typescript
const resolvers = {
  Query: {
    users: async (parent, args, context) => {
      // Usar tu cliente HTTP (Axios, fetch, etc.) con interceptores
      // que inyecten context.correlationId y el logger. Ver docs/HTTP_CLIENT_INTEGRATION.md
      const users = await myHttpClient.get('/api/users');
      return users.data;
    }
  }
}
```

### **Real-time Subscriptions:**
```typescript
// WebSocket correlation for subscriptions
const subscription = {
  userUpdated: {
    subscribe: (parent, args, context) => {
      // Correlation ID maintained in WebSocket
      return pubsub.asyncIterator(['USER_UPDATED']);
    }
  }
}
```

## 🚀 Versiones

Las versiones del framework y dependencias se definen en **`versions.txt`**. Para aplicar la misma versión a todos los ejemplos: **`./update-all-dependencies.sh`** (actualiza syntropylog, @syntropylog/types y redis en cada `package.json`). El ejemplo **00-setup-initialization** es la referencia de setup que se muestra en este README.

## 🤝 Contributing

We welcome contributions! Please:

1. **Test examples** with real services
2. **Add Docker Compose** for external dependencies
3. **Keep examples simple** and focused on SyntropyLog
4. **Document clearly** what each example demonstrates

## 📝 Testing Philosophy

We believe in **real integration over complex mocks**. Examples work with actual services to give you confidence for production use.

**What we test:**
- ✅ SyntropyLog integration patterns
- ✅ Real external service connections
- ✅ Complete working examples

**What we don't test:**
- ❌ External libraries (they have their own tests)
- ❌ Complex mocked scenarios

---

**Remember**: SyntropyLog is about **simplicity and productivity**. Configure once, use anywhere. 