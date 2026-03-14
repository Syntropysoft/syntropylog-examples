<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 07: Logger Configuration 🎛️

> **Simple Concept** - Understanding how to change how your logs look in different environments.

## 🎯 What You'll Learn

This example demonstrates how to configure SyntropyLog's logger output:

- **Pretty logs**: Human-readable for development
- **JSON logs**: Structured for production
- **Multiple transports**: Same logs, different outputs
- **Automatic orchestration**: Transports work together seamlessly

## 🏗️ Simple Concept

```
┌─────────────────────────────────────────────────────────┐
│                Same Function, Multiple Outputs          │
│                                                         │
│ ┌─────────────────┐    ┌─────────────────┐             │
│ │   Pretty Logs   │    │   JSON Logs     │             │
│ │   (Development) │    │  (Production)   │             │
│ │                 │    │                 │             │
│ │ [INFO] User     │    │ {"level":"info" │             │
│ │     processed   │    │  "message":"..."│             │
│ │ [DEBUG] Details │    │  "timestamp":   │             │
│ │     user=123    │    │  "service":"..."│             │
│ └─────────────────┘    └─────────────────┘             │
│                                                         │
│ 🎯 Both outputs from the SAME log call!                │
└─────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Simple Configuration:**
- **Pretty logs**: Easy to read during development
- **JSON logs**: Structured for production tools
- **Multiple transports**: Same logs, multiple formats
- **Automatic orchestration**: No manual coordination needed

### **Real-World Usage:**
- **Development**: Pretty logs for debugging
- **Production**: JSON logs for log aggregation
- **File logging**: Write to files simultaneously
- **External systems**: Send to Kafka, Elasticsearch, etc.

## 🚀 Implementation Plan

### **Phase 1: Simple Function**
- [x] Create a function that does something
- [x] Log different levels (info, debug, error)
- [x] Show user data and operations

### **Phase 2: Multiple Transports**
- [x] PrettyConsoleTransport for development
- [x] ConsoleTransport for production
- [x] Both active simultaneously

### **Phase 3: Demonstration**
- [x] Show both outputs side by side
- [x] Explain automatic orchestration
- [x] Demonstrate real-world pattern

## 📊 Expected Outcomes

### **What You'll See:**
- ✅ **Same function** runs once
- ✅ **Pretty logs** for development
- ✅ **JSON logs** for production
- ✅ **Both outputs** from same log call

### **What You'll Learn:**
- ✅ **Multiple transports** work together automatically
- ✅ **Same logs** produce different formats
- ✅ **No manual coordination** needed
- ✅ **Real-world pattern** for production systems

## 🔧 Prerequisites

- Node.js 18+
- Understanding of examples 00-06 (basic concepts)
- Basic knowledge of development vs production

## 📝 Notes for Implementation

- **Keep it simple**: One function, multiple transports
- **Show orchestration**: Automatic coordination
- **Explain behavior**: Duplicate outputs are correct
- **Real-world focus**: Production-ready pattern

## ⚠️ **IMPORTANT: Context Management in Examples**

### **🔍 Why Context is Manual in Examples**

In SyntropyLog, **context management is asynchronous** and uses Node.js `AsyncLocalStorage`. This means:

1. **Context is NOT global by default** - it only exists within `contextManager.run()` blocks
2. **Examples are quick demonstrations** - they don't have HTTP requests or message queues that automatically create context
3. **Manual context creation** - we must wrap our logging operations in `contextManager.run()` to get correlation IDs

### **🎯 The Solution: Global Context Wrapper**

```typescript
// ❌ WITHOUT context (no correlationId)
logger.info('Configuration loaded'); // No correlationId

// ✅ WITH context (has correlationId)
await contextManager.run(async () => {
  logger.info('Configuration loaded'); // Has correlationId automatically
});
```

### **🔮 The Magic Middleware (2 Lines of Code)**

In production applications, you'll use this simple middleware:

```typescript
app.use(async (req, res, next) => {
  await contextManager.run(async () => {
    // 🎯 MAGIC: Just 2 lines!
    const correlationId = contextManager.getCorrelationId(); // Detects or generates
    contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId); // Sets in context
    
    next();
  });
});
```

**Why this is marvelous:**
- **Intelligent Detection**: `getCorrelationId()` uses existing ID or generates new one
- **Automatic Configuration**: `getCorrelationIdHeaderName()` reads your config
- **Automatic Propagation**: Once set, it propagates to all logs and operations

### **🚀 In Real Applications**

In production applications, context is automatically created by:
- **HTTP middleware** (Express, Fastify, etc.)
- **Message queue handlers** (Kafka, RabbitMQ, etc.)
- **Background job processors**
- **API gateways**

### **📚 Key Takeaway**

**For examples and quick tests**: Wrap all logging in `contextManager.run()`  
**For production apps**: Use SyntropyLog's HTTP/broker adapters for automatic context

## 🎯 Example Output

When you run this example, you'll see the SAME log call produce DIFFERENT outputs:

### **🌞 Pretty Logs (Development):**
```
12:04:23 [INFO] (user-processor-multi): Processing user data { userId: 123, userName: 'John Doe' }
```

### **🏭 JSON Logs (Production):**
```json
{"level":"info","timestamp":"2025-07-22T15:04:23.352Z","service":"user-processor-multi","message":"Processing user data { userId: 123, userName: 'John Doe' }"}
```

### **🎯 Key Insight:**
**Both outputs come from the SAME log call!** This demonstrates that:

- **Multiple transports** are orchestrated automatically
- **Same logs** can go to console, files, Kafka, Elasticsearch, etc.
- **No manual coordination** needed between transports
- **Real-world pattern** for production systems

**This behavior is correct and expected!** In production, you'd have:
- **Console transport** for debugging
- **File transport** for persistence
- **Kafka transport** for log aggregation
- **Elasticsearch transport** for search

All working together seamlessly from the same log calls.

---

**Status**: ✅ **Complete** - This example demonstrates how to configure SyntropyLog's logger with multiple transports that work together automatically. 