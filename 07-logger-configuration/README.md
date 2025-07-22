<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 07: Logger Configuration 🎛️

> **Core Framework Feature** - Understanding how to configure SyntropyLog's logger with different levels, transports, and serializers.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's logger configuration:

- **Logger levels**: Configuring different log levels (fatal, error, warn, info, debug, trace)
- **Transports**: Console, JSON, and custom transports
- **Serializers**: Custom serializers for complex objects
- **Service configuration**: Setting up logger for different services

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Logger Configuration                         │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Log Levels  │ │ Transports  │ │ Serializers │ │ Service     │ │
│ │             │ │             │ │             │ │ Config      │ │
│ │             │ │             │ │             │ │             │ │
│ │ • fatal     │ │ • Console   │ │ • Custom    │ │ • Service   │ │
│ │ • error     │ │ • JSON      │ │   Objects   │ │   Name      │ │
│ │ • warn      │ │ • Pretty    │ │ • Complex   │ │ • Logger    │ │
│ │ • info      │ │ • Custom    │ │   Data      │ │   Name      │ │
│ │ • debug     │ │ • Multiple  │ │ • Timeout   │ │ • Timeout   │ │
│ │ • trace     │ │ • Conditional│ │ • Error     │ │ • Pretty    │ │
│ │ • silent    │ │ • Environment│ │   Handling  │ │   Print     │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Logger Levels:**
- **Level configuration**: Setting appropriate log levels
- **Level filtering**: Understanding which levels are logged
- **Environment-based levels**: Different levels for dev/prod
- **Level hierarchy**: Understanding level importance

### **Transports:**
- **Console transport**: Basic console output
- **JSON transport**: Structured logging for production
- **Pretty transport**: Human-readable for development
- **Custom transports**: Creating your own transport
- **Multiple transports**: Using different outputs simultaneously

### **Serializers:**
- **Custom serializers**: Serializing complex objects
- **Serializer timeout**: Preventing slow serializers
- **Error handling**: Handling serializer failures
- **Built-in serializers**: Using framework serializers

### **Service Configuration:**
- **Service name**: Identifying your service in logs
- **Logger name**: Custom logger instances
- **Timeout configuration**: Preventing blocking operations
- **Pretty print**: Development-friendly output

## 🚀 Implementation Plan

### **Phase 1: Basic Logger Configuration**
- [ ] Configure log levels
- [ ] Set up service name
- [ ] Basic console transport
- [ ] Environment-based configuration

### **Phase 2: Transport Configuration**
- [ ] Console transport (pretty vs JSON)
- [ ] Multiple transports
- [ ] Environment-based transport selection
- [ ] Custom transport example

### **Phase 3: Serializer Configuration**
- [ ] Custom object serializers
- [ ] Serializer timeout configuration
- [ ] Error handling in serializers
- [ ] Built-in serializer usage

### **Phase 4: Advanced Configuration**
- [ ] Multiple logger instances
- [ ] Conditional configuration
- [ ] Performance considerations
- [ ] Best practices

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Logger levels** configured correctly
- ✅ **Multiple transports** working together
- ✅ **Custom serializers** handling complex objects
- ✅ **Service configuration** properly set up

### **Learning Outcomes:**
- ✅ **How to configure logger** for different needs
- ✅ **Transport selection** strategies
- ✅ **Serializer patterns** for complex data
- ✅ **Service configuration** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of basic logging concepts
- Familiarity with examples 00-06 (basic setup through error handling)

## 📝 Notes for Implementation

- **Start simple**: Basic logger configuration first
- **Add complexity gradually**: One feature at a time
- **Focus on practical use**: Show real configuration scenarios
- **Document simple patterns**: Explain when to use what
- **Environment examples**: Show dev vs prod configurations

## ⚠️ **IMPORTANT: Context Management in Examples**

### **🔍 Why Context is Manual in Examples**

In SyntropyLog, **context management is asynchronous** and uses Node.js `AsyncLocalStorage`. This means:

1. **Context is NOT global by default** - it only exists within `contextManager.run()` blocks
2. **Examples are quick demonstrations** - they don't have HTTP requests or message queues that automatically create context
3. **Manual context creation** - we must wrap our logging operations in `contextManager.run()` to get correlation IDs

### **🎯 The Solution: Global Context Wrapper**

```typescript
// ❌ WITHOUT context (no correlationId)
logger.info('Logger configured'); // No correlationId

// ✅ WITH context (has correlationId)
await contextManager.run(async () => {
  logger.info('Logger configured'); // Has correlationId automatically
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

---

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's logger configuration with simple, practical examples. 