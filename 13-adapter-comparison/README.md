# Example 13: Adapter Comparison 🔄

## Purpose

This example demonstrates **SyntropyLog's adapter agnosticism** by comparing how the framework behaves identically with different HTTP client adapters.

## Key Learning Points

### 1. **Framework Agnosticism**
SyntropyLog doesn't care which HTTP client you use. The framework provides the same:
- **Context propagation** (correlation IDs)
- **Request/response logging**
- **Error handling**
- **Instrumentation**
- **Performance metrics**

### 2. **Official vs Custom Adapters**
- **`AxiosAdapter`** → Official adapter from `@syntropylog/adapters`
- **`CustomFetchAdapter`** → Custom adapter using native `fetch` API

### 3. **Polymorphic Behavior**
Both adapters implement the same interface (`IHttpClientAdapter`), so SyntropyLog treats them identically:

```typescript
// Both work the same way
const axiosClient = syntropyLog.getHttp('builtin-axios-client');
const fetchClient = syntropyLog.getHttp('custom-fetch-client');

// Same API, different underlying implementation
await axiosClient.request({ method: 'GET', url: '/api/modern' });
await fetchClient.request({ method: 'GET', url: '/api/native' });
```

## What This Example Shows

### **Flexibility**
You can use **any HTTP client** with SyntropyLog:
- ✅ Axios (official adapter)
- ✅ Fetch (custom adapter)
- ✅ Got, Request, etc. (custom adapters)

### **Consistency**
The framework provides **identical behavior** regardless of the adapter:
- Same correlation ID propagation
- Same logging format
- Same error handling
- Same performance metrics

### **Extensibility**
You can create custom adapters for **any HTTP client** by implementing the `IHttpClientAdapter` interface.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐
│   SyntropyLog   │    │   SyntropyLog    │
│   Framework     │    │   Framework      │
└─────────┬───────┘    └─────────┬────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌──────────────────┐
│  AxiosAdapter   │    │ CustomFetchAdapter│
│  (Official)     │    │  (Custom)        │
└─────────┬───────┘    └─────────┬────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌──────────────────┐
│     Axios       │    │      Fetch       │
│   (Library)     │    │   (Native API)   │
└─────────────────┘    └──────────────────┘
```

## Expected Output

```
🛠️ Custom adapter example initialized!
✅ Modern API call confirmed: Axios correlation ID received!
🌐 Native API call confirmed: Fetch correlation ID received!
✅ Axios response received!
🌐 Fetch response received!
🛠️ Both adapters tested successfully!
```

## Key Takeaways

1. **SyntropyLog is HTTP client agnostic** - it works with any HTTP client
2. **Official adapters** provide convenience for popular libraries
3. **Custom adapters** give you complete control and flexibility
4. **Same interface** = same behavior regardless of implementation
5. **Framework consistency** across different HTTP clients

## Next Steps

- Try creating your own custom adapter for other HTTP clients
- Explore the `IHttpClientAdapter` interface
- See how adapters work with other SyntropyLog features (Redis, brokers, etc.)

---

**This example proves that SyntropyLog's design is truly flexible and extensible!** 🚀 