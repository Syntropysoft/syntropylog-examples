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
- **09**: HTTP configuration ✅

### **INTEGRATION (10-13)** - HTTP & Redis with Different Frameworks ✅ COMPLETE
- **10**: HTTP correlation ✅
- **11**: Custom adapter ✅
- **12**: HTTP + Redis (Express) ✅
- **13**: HTTP + Redis (Fastify) ✅

### **ADVANCED FEATURES (14-19)** - Advanced Framework Features 🚧 IN DEVELOPMENT
- **14**: HTTP + Redis (NestJS) 🚧
- **15**: HTTP + Redis (Koa) 🚧
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
# Test all examples with default version (0.6.11)
./test-all-examples.sh

# Test with specific version
./test-all-examples.sh 0.6.11

# Test from specific example
./test-all-examples.sh 0.6.11 5  # Start from example 05
```

### Individual Examples
```bash
cd 01-hello-world
npm install
npm start
```

### With External Services
```bash
cd 12-http-redis-axios
docker-compose up -d redis
npm install
npm start
```

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

### ✅ **Complete & Tested (00-13, 20-24)**
- **00-09**: Core Framework Features ✅
- **10-13**: HTTP & Redis Integration ✅
- **20-24**: Message Brokers & Correlation ✅

### 🚧 **In Development**
- **14-19**: Advanced Framework Features
- **25-27**: Enterprise Patterns

> **🎯 BETA READY**: Examples 00-13 and 20-24 are **fully functional** and ready for production use. All examples include complete boilerplate, context propagation, structured logging, and automatic termination.

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

### **Unified Configuration:**
```typescript
syntropyLog.init({
  logger: { serviceName: 'my-app' },
  http: { instances: [{ instanceName: 'api', adapter: axiosAdapter }] },
  redis: { instances: [{ instanceName: 'cache', url: 'redis://localhost' }] },
  brokers: { instances: [{ instanceName: 'events', adapter: kafkaAdapter }] }
});
```

### **Simple Usage:**
```typescript
const logger = syntropyLog.getLogger();
const http = syntropyLog.getHttp('api');
const redis = syntropyLog.getRedis('cache');
const broker = syntropyLog.getBroker('events');

// All automatically correlated
logger.info('User created', { userId: 123 });
await http.get('/users/123');
await redis.set('user:123', userData);
await broker.publish('user.created', event);
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

## 🚀 Beta Version Notice

> **🎯 BETA VERSION**: This is a beta release (v0.6.11). 
> 
> - **Core features stable**: Logger, context, HTTP, Redis, brokers (tested & proven)
> - **Production ready**: 94.1% test coverage, comprehensive examples
> - **API stable**: Core functionality locked, backward compatible
> - **Ready for adoption**: Perfect for production applications

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