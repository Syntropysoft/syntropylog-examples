# Example 10: Basic HTTP Correlation

## 🎯 What You'll Learn

This example demonstrates **automatic HTTP correlation** - a critical feature for microservices and distributed systems. You'll learn:

- **Context Propagation**: How correlation IDs automatically flow across service boundaries
- **HTTP Instrumentation**: How SyntropyLog automatically injects headers and logs requests
- **Zero-Config Correlation**: How to get fully correlated logs with no manual effort

## 🧠 Conceptual Understanding

### What is HTTP Correlation?

In distributed systems, when `Service-A` calls `Service-B`, you need to link logs from both services to the same original request. This is done using a **correlation ID**.

**Without correlation:**
```
Service-A: "User login request received"
Service-B: "Processing user data"  // ← Which user? Which request?
```

**With correlation:**
```
Service-A: "User login request received" [correlationId: abc-123]
Service-B: "Processing user data" [correlationId: abc-123]  // ← Same request!
```

### How SyntropyLog Automates This

When you use an instrumented HTTP client, SyntropyLog automatically:

1. **Grabs** the current `correlationId` from the active context
2. **Injects** it into HTTP headers (e.g., `X-Correlation-ID: <value>`)
3. **Logs** both request and response with HTTP metadata
4. **Propagates** the correlation ID to the receiving service

**Result**: Fully correlated, detailed logs across service boundaries with zero manual effort.

## 🛠️ Practical Implementation

### Step 1: Configure HTTP Client

Set up an instrumented HTTP client with the built-in Axios adapter:

```typescript
import { syntropyLog } from 'syntropylog';

const config = {
  http: {
    instances: [
      {
        instanceName: 'api-client',
        adapter: 'axios', // Built-in Axios adapter
      },
    ],
  },
};

await syntropyLog.init(config);
```

### Step 2: Create Context

Create a correlation context for your operation:

```typescript
const contextManager = syntropyLog.getContextManager();
await contextManager.run(async () => {
  const correlationId = randomUUID();
  contextManager.set('X-Correlation-ID', correlationId);
  
  // All operations in this context will use this correlation ID
});
```

### Step 3: Make HTTP Calls

Use the instrumented client - correlation happens automatically:

```typescript
const httpClient = syntropyLog.getHttp('api-client');

const response = await httpClient.request({
  method: 'GET',
  url: 'https://api.example.com/users/1',
  headers: { 'Authorization': 'Bearer token' },
});
```

## 🔍 Deep Dive: Our Example

### Mock Server Setup

We use Nock to simulate an external API that validates correlation:

```typescript
nock('https://api.example.com')
  .get('/users/1')
  .reply(200, function (uri, requestBody) {
    const correlationHeader = this.req.headers['x-correlation-id'];
    if (!correlationHeader) {
      throw new Error('X-Correlation-ID header was not received!');
    }
    return { 
      message: 'User data retrieved',
      correlationId: correlationHeader 
    };
  });
```

### Key Features Demonstrated

1. **Automatic Header Injection**: `X-Correlation-ID` is added automatically
2. **Context Propagation**: Correlation ID flows through all operations
3. **Request Logging**: Full HTTP request/response logging
4. **Performance Tracking**: Request duration and metadata
5. **Error Handling**: Proper error propagation with context

## 🧪 Testing the Example

### Manual Testing

Run this example to see correlation in action:

```bash
npm run dev
```

### Expected Output

```
🚀 Initializing SyntropyLog...
✅ SyntropyLog initialized successfully!
12:38:35 [INFO] (main): Initialized.
12:38:35 [INFO] (main): Context created. Making HTTP call...
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10
12:38:35 [INFO] (syntropylog-main): Starting HTTP request
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10 source=http-manager module=HttpManager method=GET url=/users/1
12:38:35 [INFO] (main): Nock mock confirmed: Correlation ID received!
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10
12:38:35 [INFO] (syntropylog-main): HTTP response received
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10 source=http-manager module=HttpManager statusCode=200 url=/users/1 method=GET durationMs=9
12:38:35 [INFO] (main): Request finished.
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10
🔄 Shutting down SyntropyLog gracefully...
✅ SyntropyLog shutdown completed
```

### Key Observations

- **✅ Correlation ID Propagation**: Same `correlationId` appears in all logs
- **✅ Header Injection**: `X-Correlation-ID` automatically added to HTTP headers
- **✅ Performance Tracking**: Request completed in 9ms
- **✅ Mock Confirmation**: Nock server confirms correlation header received
- **✅ Context Flow**: Correlation ID flows through entire request lifecycle

## 🎨 Advanced Usage

### Custom Header Names

You can customize the correlation header name:

```typescript
const config = {
  context: {
    correlationIdHeader: 'X-Request-ID', // Custom header name
  },
  // ... rest of config
};
```

### Multiple HTTP Clients

Configure multiple instrumented clients:

```typescript
const config = {
  http: {
    instances: [
      {
        instanceName: 'user-api',
        adapter: 'axios',
      },
      {
        instanceName: 'payment-api',
        adapter: 'axios',
      },
    ],
  },
};
```

### Nested Contexts

Correlation IDs flow through nested contexts:

```typescript
await contextManager.run(async () => {
  // Outer context
  contextManager.set('X-Correlation-ID', 'outer-123');
  
  await contextManager.run(async () => {
    // Inner context inherits outer correlation ID
    const httpClient = syntropyLog.getHttp('api-client');
    await httpClient.request({ /* ... */ });
  });
});
```

## 🎯 Best Practices

### 1. Context Management
- Always use `contextManager.run()` for operations that need correlation
- Set correlation IDs early in the request lifecycle
- Use meaningful correlation ID formats (UUIDs recommended)

### 2. HTTP Configuration
- Use descriptive instance names for different APIs
- Configure appropriate timeouts for your use case
- Consider retry logic for external API calls

### 3. Logging
- Let SyntropyLog handle HTTP request/response logging
- Add business-specific logs within the correlation context
- Use structured logging for better observability

### 4. Testing
- Use Nock or similar tools to mock external APIs
- Validate that correlation headers are received
- Test error scenarios with correlation intact

## 🚀 Next Steps

1. **Try Custom Adapters**: See Example 11 for custom HTTP client adapters
2. **Explore Broker Correlation**: See Examples 20+ for message queue correlation
3. **Add Data Masking**: See Examples 30+ for sensitive data handling
4. **Implement Retry Logic**: Add resilience to your HTTP clients

## 📚 Related Examples

- **Example 11**: Custom HTTP adapters (extend beyond built-in adapters)
- **Example 13**: Adapter comparison (official vs custom adapters)
- **Example 20**: Basic Kafka correlation (message queue correlation)

## 🤝 Contributing

Found a bug or have an improvement? Feel free to contribute! Check out our [Contributing Guide](../../../CONTRIBUTING.md) for details.

---

**Remember**: HTTP correlation is the foundation of distributed tracing. With SyntropyLog, you get this critical feature automatically, making your microservices observable from day one!
