<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>
## 📖 Table of Contents

# Example 02: Basic Context and Correlation

Welcome to the next step in your SyntropyLog journey! This example demonstrates one of the most powerful features of the framework: **automatic context propagation** in a realistic e-commerce scenario.

## 🎯 The "Why"

In a modern application, a single request can trigger a chain of function calls across multiple services. To debug effectively, you need to be able to trace that entire chain. The old way was to manually pass a request ID or `correlationId` through every function. This is tedious, error-prone, and clutters your code.

SyntropyLog solves this by using Node.js's `AsyncLocalStorage`. You create a "context" for a specific operation (like an incoming HTTP request), and any logs made within that operation's lifecycle will automatically be tagged with the context's data, no matter how deep the function calls go.

**It's like putting a magical, invisible backpack on a request, and every function it visits can drop a note inside without having to explicitly pass the backpack around.**

## 🏪 E-commerce Scenario

This example simulates a realistic e-commerce application with three services:

1. **Order Service** - Processes customer orders
2. **Inventory Service** - Manages product stock and reservations
3. **Payment Service** - Handles payment processing

Each order gets its own correlation context, and all logs from all services automatically include the correlation ID, customer ID, and session ID.

## 🎯 Purpose

The goal of this example is to show how to:

1. Initialize `syntropyLog` with context configuration
2. Use `contextManager.run()` to create new asynchronous contexts
3. Set correlation IDs and additional context data
4. Observe how logs from different services all share the same context automatically
5. Handle multiple concurrent requests with separate contexts
6. Implement proper error handling and logging

## 🚀 How to Run

1. **Install Dependencies**:
   From the `02-basic-context` directory, run:
   ```bash
   npm install --no-workspaces
   ```
   
   > **⚠️ Important**: Use `--no-workspaces` flag to avoid npm workspace conflicts when installing dependencies in individual examples.

2. **Run the Example**:
   ```bash
   npm run dev
   ```

## 📊 Expected Output

Notice in the output how each order processing session has its own correlation ID, and all logs from different services (order-service, inventory-service, payment-service) automatically include the same correlation ID and customer context.

```
INFO (main): Starting e-commerce application...
INFO (main): Starting new order processing session {"correlationId":"550e8400-e29b-41d4-a716-446655440000","customerId":"CUST-001"}
INFO (order-service): Processing order... {"correlationId":"550e8400-e29b-41d4-a716-446655440000","orderId":"PROD-001","quantity":2,"customerId":"CUST-001"}
INFO (inventory-service): Checking inventory... {"correlationId":"550e8400-e29b-41d4-a716-446655440000","itemId":"PROD-001"}
INFO (inventory-service): Inventory check completed {"correlationId":"550e8400-e29b-41d4-a716-446655440000","itemId":"PROD-001","stock":45,"price":299}
INFO (inventory-service): Reserving stock... {"correlationId":"550e8400-e29b-41d4-a716-446655440000","itemId":"PROD-001","quantity":2}
INFO (inventory-service): Stock reserved successfully {"correlationId":"550e8400-e29b-41d4-a716-446655440000","itemId":"PROD-001","quantity":2}
INFO (order-service): Order processed successfully {"correlationId":"550e8400-e29b-41d4-a716-446655440000","orderId":"PROD-001","quantity":2,"totalPrice":598}
INFO (payment-service): Processing payment... {"correlationId":"550e8400-e29b-41d4-a716-446655440000","amount":598,"customerId":"CUST-001"}
INFO (payment-service): Payment processed successfully {"correlationId":"550e8400-e29b-41d4-a716-446655440000","amount":598,"customerId":"CUST-001"}
INFO (main): Order and payment completed successfully {"correlationId":"550e8400-e29b-41d4-a716-446655440000","orderId":"PROD-001","customerId":"CUST-001"}
```

## 🔍 Key Features Demonstrated

### 1. **Automatic Context Propagation**
- No need to manually pass correlation IDs between functions
- Context is automatically available in all nested function calls
- Each service can access the same context data

### 2. **Multiple Concurrent Requests**
- Each order gets its own unique correlation ID
- Contexts are isolated between different requests
- No cross-contamination of context data

### 3. **Rich Context Data**
- Correlation ID for request tracing
- Customer ID for user identification
- Session ID for session management
- Additional business data as needed

### 4. **Error Handling**
- Errors are logged with full context
- Failed operations are properly tracked
- Graceful degradation with proper logging

### 5. **Service Integration**
- Multiple services working together
- Shared context across service boundaries
- Consistent logging format across all services

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Order Service │    │ Inventory Service│    │ Payment Service │
│                 │    │                  │    │                 │
│ - Process Order │───▶│ - Check Stock    │    │ - Process Payment│
│ - Validate      │    │ - Reserve Stock  │    │ - Handle Errors │
│ - Handle Errors │    │ - Handle Errors  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Context       │
                    │                 │
                    │ - correlationId │
                    │ - customerId    │
                    │ - sessionId     │
                    └─────────────────┘
```

## 💡 Benefits

1. **Debugging Made Easy**: Trace any request through the entire system
2. **No Manual Propagation**: Context is automatically available everywhere
3. **Performance**: Minimal overhead, maximum visibility
4. **Scalability**: Works with any number of services and functions
5. **Consistency**: All logs follow the same format and include the same context

## 🔧 Configuration

The example uses the following configuration:

```typescript
await syntropyLog.init({
  logger: {
    level: 'info',
    serviceName: 'ecommerce-app',
    transports: [new ClassicConsoleTransport()],
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID'
  }
});
```

> **💡 Note**: This example uses `ClassicConsoleTransport` for familiar console output format, making it easier for developers coming from other logging frameworks.

## 🎯 Next Steps

After understanding this example, you can explore:

- **Example 03**: Data masking and sanitization
- **Example 04**: HTTP correlation with real web servers
- **Example 05**: Kafka correlation for event-driven architectures
- **Example 06**: Advanced context management patterns

## ⚠️ **IMPORTANT: Context Management in Examples**

### **🔍 Why Context is Manual in Examples**

In SyntropyLog, **context management is asynchronous** and uses Node.js `AsyncLocalStorage`. This means:

1. **Context is NOT global by default** - it only exists within `contextManager.run()` blocks
2. **Examples are quick demonstrations** - they don't have HTTP requests or message queues that automatically create context
3. **Manual context creation** - we must wrap our logging operations in `contextManager.run()` to get correlation IDs

### **🎯 The Solution: Global Context Wrapper**

```typescript
// ❌ WITHOUT context (no correlationId)
orderService.processOrder(order); // No correlationId

// ✅ WITH context (has correlationId)
await contextManager.run(async () => {
  orderService.processOrder(order); // Has correlationId automatically
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

*This example demonstrates how SyntropyLog makes distributed tracing and context management effortless, allowing you to focus on your business logic while maintaining full observability.* 