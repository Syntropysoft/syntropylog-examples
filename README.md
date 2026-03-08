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

### **INTEGRATION (10-13)** - HTTP & Redis with Different Frameworks ✅ COMPLETE
- **10**: HTTP correlation ✅
- **11**: Custom adapter ✅
- **12**: HTTP + Redis (Express) ✅ (Reviewed & Fixed)
- **13**: HTTP + Redis (Fastify) ✅ (Reviewed & Fixed)

### **ADVANCED FEATURES (14-19)** - Advanced Framework Features 🚧 IN DEVELOPMENT
- **14**: HTTP + Redis (NestJS) ✅
- **15**: HTTP + Redis (Koa) ✅
- **16**: HTTP + Redis (Hapi) 🚧
- **17**: Custom serializers 🚧
- **18**: Custom transports 🚧
- **19**: Doctor CLI 🚧

### **MESSAGING (20-24)** - Message Brokers & Correlation ✅ COMPLETE
- **20**: Basic Kafka ✅
- **21**: Basic RabbitMQ ✅
- **22**: Basic NATS ✅
- **23**: Kafka full-stack ✅
- **24**: NATS microservices ✅ (Full-stack distributed tracing)

### **ENTERPRISE (25-27)** - Production & Complete Applications 🚧 IN DEVELOPMENT
- **25**: Production configuration 🚧
- **26**: Advanced context 🚧
- **27**: Complete enterprise app 🚧

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (for examples with external services)

### Test All Examples (Recommended)
```bash
# Usa la versión en versions.txt por defecto
./test-all-examples.sh

# Con versión concreta
./test-all-examples.sh 0.9.12

# A partir de un ejemplo
./test-all-examples.sh 0.9.12 5  # Empezar desde ejemplo 05
```

### Individual Examples
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

Some examples require external services. We provide Docker Compose files:

### Redis Examples (12, 13)
```bash
docker-compose up -d redis
```

### Message Brokers (20, 21, 22, 23, 24)
```bash
docker-compose up -d
```

## 📊 Current Status

### ✅ **Complete & Tested (00-15, 20-24)**
- **00-09**: Core Framework Features ✅
- **10-15**: HTTP & Redis Integration ✅
- **20-24**: Message Brokers & Correlation ✅

### 🚧 **In Development**
- **14-19**: Advanced Framework Features
- **25-27**: Enterprise Patterns

> **🎯 BETA READY**: Examples 00-15 and 20-24 are **fully functional** and ready for production use. All examples include complete boilerplate, context propagation, structured logging, and automatic termination.

### 🔧 **Recent Improvements & Fixes**
- **Example 12 (Express)**: Fixed async initialization pattern for better lifecycle management
- **Example 13 (Fastify)**: Resolved AsyncLocalStorage context propagation issue with proper `contextManager.run()` implementation
- **Example 14 (NestJS)**: Enhanced TypeScript configuration and added proper package-lock.json
- **Example 15 (Koa)**: Implemented context middleware with AsyncLocalStorage for proper context propagation throughout request lifecycle
- **All Examples**: Versiones gestionadas vía `versions.txt` y `./update-all-dependencies.sh`

## 🎯 What You'll Learn

### **Core Concepts:**
- ✅ **Context propagation**: Automatic correlation across services
- ✅ **HTTP instrumentation**: Request/response logging
- ✅ **Redis integration**: Command logging and caching
- ✅ **Message brokers**: Kafka, RabbitMQ, NATS correlation
- ✅ **Custom adapters**: Extend for any HTTP client
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
      // Correlation propagates automatically
      const users = await context.syntropyLog.http.get('/api/users');
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

## 🚀 Versión

> Las versiones del framework y dependencias se definen en **`versions.txt`**.  
> El ejemplo **00-setup-initialization** es la referencia de setup que se muestra en este README.

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