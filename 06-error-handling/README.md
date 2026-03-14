<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 06: Error Handling 🛡️

> **Core Framework Feature** - Understanding how SyntropyLog handles errors gracefully and provides rich error context.

## 🎯 What You'll Learn

This example demonstrates SyntropyLog's error handling capabilities:

- **Error correlation**: How errors are automatically correlated
- **Error context**: Rich error information with correlation
- **Simple error handling**: Basic error handling patterns
- **Error logging**: How to log errors effectively

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Error Handling Strategy                      │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Error       │ │ Error       │ │ Graceful    │ │ Error       │ │
│ │ Propagation │ │ Context     │ │ Degradation │ │ Recovery    │ │
│ │             │ │             │ │             │ │             │ │
│ │ • HTTP      │ │ • Stack     │ │ • Fallbacks │ │ • Retry     │ │
│ │ • Redis     │ │ • Correlation│ │ • Defaults  │ │ • Circuit   │ │
│ │ • Brokers   │ │ • Metadata  │ │ • Logging   │ │ • Breaker   │ │
│ │ • Serializers│ │ • Timestamp │ │ • Monitoring│ │ • Timeout   │ │
│ │ • Transports│ │ • User      │ │ • Alerts    │ │ • Backoff   │ │
│ │ • Adapters  │ │ • System    │ │ • Metrics   │ │ • Health    │ │
│ │ • Framework │ │ • Business  │ │ • Status    │ │ • Checks    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Learning Objectives

### **Error Propagation:**
- **HTTP errors**: Network failures, timeouts, 4xx/5xx responses
- **Redis errors**: Connection failures, command errors, memory issues
- **Broker errors**: Connection failures, publish/subscribe errors
- **Framework errors**: Configuration errors, initialization failures

### **Error Context:**
- **Correlation ID**: Linking errors to specific requests
- **Stack traces**: Detailed error location information
- **Metadata**: User context, system state, business data
- **Timestamps**: When errors occurred and duration

### **Graceful Degradation:**
- **Fallback mechanisms**: Alternative paths when primary fails
- **Default values**: Safe defaults for failed operations
- **Partial functionality**: Continue with available features
- **User experience**: Maintain service despite errors

### **Simple Error Handling:**
- **Try-catch patterns**: Basic error handling
- **Error logging**: How to log errors with context
- **Error correlation**: How errors maintain correlation
- **Graceful handling**: Simple error recovery

## 🚀 Implementation Plan

### **Phase 1: Error Scenarios**
- [ ] HTTP client errors (timeout, 404, 500)
- [ ] Redis connection errors
- [ ] Message broker errors
- [ ] Framework initialization errors

### **Phase 2: Error Context**
- [ ] Rich error logging with correlation
- [ ] Error metadata collection
- [ ] Stack trace enhancement
- [ ] Error categorization

### **Phase 3: Graceful Degradation**
- [ ] Fallback mechanisms implementation
- [ ] Default value handling
- [ ] Partial functionality preservation
- [ ] User experience maintenance

### **Phase 4: Simple Error Patterns**
- [ ] Try-catch patterns
- [ ] Error logging with context
- [ ] Error correlation demonstration
- [ ] Simple error recovery

## 📊 Expected Outcomes

### **Technical Demonstrations:**
- ✅ **Error scenarios** handled gracefully
- ✅ **Rich error context** with correlation
- ✅ **Simple error handling** patterns
- ✅ **Error logging** strategies

### **Learning Outcomes:**
- ✅ **How to handle errors** in different scenarios
- ✅ **Error context importance** for debugging
- ✅ **Simple error handling** patterns
- ✅ **Error logging** best practices

## 🔧 Prerequisites

- Node.js 18+
- Understanding of error handling concepts
- Familiarity with examples 00-05 (basic setup, logging, configuration)

## 📝 Notes for Implementation

- **Start with simple errors**: Basic HTTP/Redis errors first
- **Add complexity gradually**: More sophisticated error scenarios
- **Include real-world examples**: Common error scenarios
- **Document simple patterns**: Best practices for error handling
- **Test error scenarios**: Ensure graceful handling

## ⚠️ **IMPORTANT: Context Management in Examples**

### **🔍 Why Context is Manual in Examples**

In SyntropyLog, **context management is asynchronous** and uses Node.js `AsyncLocalStorage`. This means:

1. **Context is NOT global by default** - it only exists within `contextManager.run()` blocks
2. **Examples are quick demonstrations** - they don't have HTTP requests or message queues that automatically create context
3. **Manual context creation** - we must wrap our logging operations in `contextManager.run()` to get correlation IDs

### **🎯 The Solution: Global Context Wrapper**

```typescript
// ❌ WITHOUT context (no correlationId)
logger.error('Database connection failed'); // No correlationId

// ✅ WITH context (has correlationId)
await contextManager.run(async () => {
  logger.error('Database connection failed'); // Has correlationId automatically
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

**Status**: 🆕 **In Development** - This example will demonstrate SyntropyLog's error handling capabilities with simple, practical error scenarios. 