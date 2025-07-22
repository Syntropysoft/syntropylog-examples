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

# Example 03: TypeScript Context with Interfaces

This example demonstrates how to use SyntropyLog with TypeScript, leveraging static typing for context management and logging. It shows a complete application with proper initialization, context propagation, and graceful shutdown.

## 🎯 The "Why"

TypeScript provides several advantages when working with SyntropyLog:

- **Type-Safe Configuration**: Full autocomplete and error checking for configuration objects
- **Interface-Based Context**: Define clear contracts for your context data
- **Better Developer Experience**: IDE support for logger methods and context properties
- **Compile-Time Safety**: Catch errors before runtime

## 🏗️ Architecture

This example demonstrates:

1. **TypeScript Interfaces**: Define context structure with interfaces
2. **Context Propagation**: Automatic correlation across function calls
3. **Boilerplate Pattern**: Reusable initialization and shutdown functions
4. **ClassicConsoleTransport**: Familiar console output format
5. **Graceful Shutdown**: Proper lifecycle management

## 🎯 Purpose

The goal of this example is to show:

1. **TypeScript Integration**: How to use SyntropyLog with TypeScript
2. **Interface-Based Context**: Define and use typed context data
3. **Complete Boilerplate**: Initialization, context management, and shutdown
4. **Context Propagation**: Automatic correlation across services
5. **Error Handling**: Proper error logging with context

## 🚀 How to Run

1. **Install Dependencies**:
   From the `03-context-ts` directory, run:
    ```bash
   npm install --no-workspaces
    ```

   > **⚠️ Important**: Use `--no-workspaces` flag to avoid npm workspace conflicts when installing dependencies in individual examples.

2. **Run the Example**:
    ```bash
   npm run dev
   ```

3. **Test Graceful Shutdown**:
   Press `Ctrl+C` to test the graceful shutdown behavior.

## 📊 Expected Output

You should see output similar to this:

```
🚀 Initializing SyntropyLog...
{"level":"info","timestamp":"2025-07-19T15:30:45.123Z","service":"syntropylog-main","message":"SyntropyLog framework initialized successfully."}
✅ SyntropyLog initialized successfully!
{"level":"info","timestamp":"2025-07-19T15:30:45.124Z","service":"main","message":"Starting TypeScript context example..."}
{"level":"info","timestamp":"2025-07-19T15:30:45.125Z","service":"user-service","message":"Processing user request","correlationId":"550e8400-e29b-41d4-a716-446655440000","userId":"user-123","sessionId":"session-abc"}
{"level":"info","timestamp":"2025-07-19T15:30:45.126Z","service":"auth-service","message":"Validating user credentials","correlationId":"550e8400-e29b-41d4-a716-446655440000","userId":"user-123","sessionId":"session-abc"}
{"level":"info","timestamp":"2025-07-19T15:30:45.127Z","service":"auth-service","message":"User authenticated successfully","correlationId":"550e8400-e29b-41d4-a716-446655440000","userId":"user-123","sessionId":"session-abc"}
{"level":"info","timestamp":"2025-07-19T15:30:45.128Z","service":"user-service","message":"User request completed","correlationId":"550e8400-e29b-41d4-a716-446655440000","userId":"user-123","sessionId":"session-abc"}
✅ TypeScript context example completed!
🔄 Shutting down SyntropyLog gracefully...
{"level":"info","timestamp":"2025-07-19T15:30:45.129Z","service":"syntropylog-main","message":"🔄 LifecycleManager.shutdown() called. Current state: READY"}
{"level":"info","timestamp":"2025-07-19T15:30:45.130Z","service":"syntropylog-main","message":"🔄 State changed to SHUTTING_DOWN"}
{"level":"info","timestamp":"2025-07-19T15:30:45.131Z","service":"syntropylog-main","message":"Shutting down SyntropyLog framework..."}
{"level":"info","timestamp":"2025-07-19T15:30:45.132Z","service":"syntropylog-main","message":"📋 Executing 1 shutdown promises..."}
{"level":"info","timestamp":"2025-07-19T15:30:45.133Z","service":"syntropylog-main","message":"✅ Shutdown promises completed"}
{"level":"info","timestamp":"2025-07-19T15:30:45.134Z","service":"syntropylog-main","message":"🔍 Starting external process termination..."}
{"level":"info","timestamp":"2025-07-19T15:30:45.135Z","service":"syntropylog-main","message":"Found 3 regex-test processes to terminate"}
{"level":"info","timestamp":"2025-07-19T15:30:45.136Z","service":"syntropylog-main","message":"Terminating 3 external processes..."}
✅ SyntropyLog shutdown completed
{"level":"info","timestamp":"2025-07-19T15:30:45.200Z","service":"syntropylog-main","message":"✅ All regex-test processes terminated successfully"}
{"level":"info","timestamp":"2025-07-19T15:30:45.201Z","service":"syntropylog-main","message":"All managers have been shut down."}
{"level":"info","timestamp":"2025-07-19T15:30:45.202Z","service":"syntropylog-main","message":"✅ State changed to SHUTDOWN"}
```

## 🔍 Key Features Demonstrated

### 1. **TypeScript Interfaces**
```typescript
interface UserContext {
  correlationId: string;
  userId: string;
  sessionId: string;
}
```

### 2. **Context Propagation**
- Automatic correlation across all function calls
- Type-safe context access
- No manual context passing required

### 3. **Complete Boilerplate**
- Event-driven initialization
- Graceful shutdown with signal handlers
- Error handling throughout the lifecycle

### 4. **ClassicConsoleTransport**
- Familiar console output format
- Easy to read and parse
- Compatible with existing logging tools

### 5. **Service Integration**
- Multiple services working together
- Shared context across service boundaries
- Consistent logging format

## 🏗️ Code Structure

### Boilerplate Functions
- **`initializeSyntropyLog()`**: Standard initialization with event listeners
- **`gracefulShutdown()`**: Proper shutdown with signal handling
- **`main()`**: Application orchestration

### Example Logic
- **`UserContext`**: TypeScript interface for context data
- **`userService.processRequest()`**: Example service with context
- **`authService.validateUser()`**: Example service with context

### Configuration
```typescript
await syntropyLog.init({
  logger: {
    level: 'info',
    serviceName: 'typescript-context-example',
    transports: [new ClassicConsoleTransport()],
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID'
  }
});
```

## 💡 Benefits

1. **Type Safety**: Compile-time error checking
2. **Better IDE Support**: Autocomplete and IntelliSense
3. **Clear Contracts**: Interfaces define expected data structure
4. **Maintainability**: Easier to refactor and update
5. **Developer Experience**: Faster development with fewer runtime errors

## 🎯 Next Steps

After understanding TypeScript integration, explore:

- **Example 10**: HTTP correlation with real web servers
- **Example 11**: Custom adapters for specific clients
- **Example 13**: Framework agnosticism between adapters

## ⚠️ **IMPORTANT: Context Management in Examples**

### **🔍 Why Context is Manual in Examples**

In SyntropyLog, **context management is asynchronous** and uses Node.js `AsyncLocalStorage`. This means:

1. **Context is NOT global by default** - it only exists within `contextManager.run()` blocks
2. **Examples are quick demonstrations** - they don't have HTTP requests or message queues that automatically create context
3. **Manual context creation** - we must wrap our logging operations in `contextManager.run()` to get correlation IDs

### **🎯 The Solution: Global Context Wrapper**

```typescript
// ❌ WITHOUT context (no correlationId)
userService.processRequest(userId); // No correlationId

// ✅ WITH context (has correlationId)
await contextManager.run(async () => {
  userService.processRequest(userId); // Has correlationId automatically
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

*This example demonstrates how TypeScript enhances the SyntropyLog experience with type safety and better developer tooling.*
