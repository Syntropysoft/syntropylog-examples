<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 15: HTTP + Redis with Koa 🌊

> **Context Middleware** - Koa HTTP server with Redis caching and context propagation middleware.

## 🎯 What You'll Learn

This example demonstrates Koa integration with SyntropyLog context middleware:

- **Koa server setup**: Basic Koa application with router
- **Context middleware**: Correlation ID and trace ID propagation using AsyncLocalStorage
- **HTTP endpoints**: Product API with GET and POST routes
- **Redis caching**: Caching with context propagation
- **Error handling**: Standard error handling patterns
- **Context logging**: Request context in all operations

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Koa           │    │  ProductData     │    │     Redis       │
│   Server        │◄──►│  Service         │◄──►│     Cache       │
│                 │    │                  │    │                 │
│ • HTTP Routes   │    │ • Business Logic │    │ • Product Cache │
│ • Request/Resp  │    │ • Cache Logic    │    │ • TTL: 30s      │
│ • Validation    │    │ • DB Simulation  │    │ • Auto Cleanup  │
│ • Context MW    │    │ • Context Aware  │    │ • Context Logs  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

**Context Flow**: Request → Context Middleware → AsyncLocalStorage → Redis Operations → Logs

## 🎯 Learning Objectives

### **Basic Koa Setup:**
- **Koa application**: Basic Koa server with router
- **Middleware setup**: Body parser and router middleware
- **Route handling**: HTTP endpoints for products
- **Error handling**: Standard error responses

### **Redis Integration:**
- **Context-aware caching**: Product caching with correlation IDs
- **Cache operations**: GET and SET operations with context
- **TTL management**: 30-second cache expiration
- **Error handling**: Redis error handling with context

### **SyntropyLog Integration:**
- **Logger setup**: Context-aware logging
- **Redis client**: SyntropyLog Redis client with context
- **Error logging**: Standard error logging with context
- **Context middleware**: Correlation ID and trace ID propagation using AsyncLocalStorage

## 🚀 Implementation Plan

### **Phase 1: Basic Skeleton ✅ COMPLETE**
- [x] Koa application setup
- [x] SyntropyLog configuration
- [x] Basic routes and handlers
- [x] Logger integration

### **Phase 2: Context Integration ✅ COMPLETE**
- [x] Context middleware implementation
- [x] Correlation ID propagation using AsyncLocalStorage
- [x] Request context injection
- [x] Context-aware logging
- [x] Redis operations with context

### **Phase 3: Advanced Features ✅ COMPLETE**
- [x] Custom middleware
- [x] Performance optimization
- [x] Health checks
- [x] Metrics collection

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Koa application** with SyntropyLog integration
- ✅ **HTTP correlation** across Koa middleware using AsyncLocalStorage
- ✅ **Redis caching** with performance monitoring and context
- ✅ **Context integration** with SyntropyLog throughout the request lifecycle

### **Learning Outcomes:**
- ✅ **How to integrate SyntropyLog** with Koa
- ✅ **HTTP correlation** in Koa applications using AsyncLocalStorage
- ✅ **Redis caching** strategies with monitoring and context
- ✅ **Koa best practices** with observability

## 🔧 Prerequisites

- Node.js 18+
- Understanding of Koa framework
- Familiarity with examples 10-13 (HTTP + Redis basics)

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Redis:**
   ```bash
   docker-compose up -d
   ```

3. **Run the example:**
   ```bash
   npm run dev
   ```

4. **Test with context:**
   ```bash
   # Test with correlation ID
   curl -H "x-correlation-id: test-123" http://localhost:3000/product/12345
   
   # Test without correlation ID (auto-generated)
   curl http://localhost:3000/product/12345
   ```

## 🔍 Context Middleware Implementation

The context middleware uses AsyncLocalStorage to ensure context persistence throughout the request lifecycle:

```typescript
export function contextMiddleware() {
  return async (ctx: Context, next: Next) => {
    ctx.state.correlationId = ctx.headers['x-correlation-id'] || generateCorrelationId();
    ctx.state.traceId = ctx.headers['x-trace-id'] || generateTraceId();

    const contextManager = syntropyLog.getContextManager();
    await contextManager.run(async () => {
      contextManager.set(contextManager.getCorrelationIdHeaderName(), ctx.state.correlationId);
      contextManager.set(contextManager.getTransactionIdHeaderName(), ctx.state.traceId);
      await next();
    });
  };
}
```

**Key Points:**
- Uses `contextManager.run()` to wrap the entire request lifecycle
- Ensures AsyncLocalStorage context persists through Redis operations
- Automatically generates correlation IDs if not provided
- Propagates context to all SyntropyLog operations

## 📊 Example Logs

With context propagation working correctly, you'll see correlation IDs in all logs:

```
2025-07-31 11:07:46 INFO  [main] [x-correlation-id="d1a110b8-4e72-4c2b-b862-8953af9fec6a" x-trace-id="example-123" module="ProductServer" message="Product requested"]
2025-07-31 11:07:46 INFO  [syntropylog-main] [x-correlation-id="d1a110b8-4e72-4c2b-b862-8953af9fec6a" x-trace-id="example-123" source="redis" module="RedisManager" command="GET" message="Redis command [GET] executed successfully."]
```

## 📝 Notes for Implementation

- **AsyncLocalStorage is key**: Context must be wrapped in `contextManager.run()`
- **Middleware order matters**: Context middleware should be early in the chain
- **State persistence**: Context persists through the entire request lifecycle
- **Redis integration**: All Redis operations automatically include context
- **Error handling**: Context is maintained even during errors

---

**Status**: ✅ **Complete & Tested** - This example demonstrates SyntropyLog integration with Koa for building lightweight observable HTTP APIs with Redis caching and proper context propagation using AsyncLocalStorage. 