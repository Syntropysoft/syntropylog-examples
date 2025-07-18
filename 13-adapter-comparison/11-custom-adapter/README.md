# Example 11: Custom Adapter Implementation 🛠️

This example demonstrates how to create and use custom adapters in SyntropyLog, showcasing the framework's incredible flexibility and extensibility.

## The Power of Custom Adapters 🛠️

SyntropyLog's adapter system is designed to be **highly extensible**. While the framework provides built-in adapters for popular HTTP clients like Axios and Fetch, you can create custom adapters for ANY HTTP client, database, or external service.

**Key Benefits:**
- **Universal Compatibility**: Work with any HTTP client, no matter how old or new
- **Native API Support**: Integrate with built-in browser APIs like fetch
- **Custom Logic**: Add your own business logic, retry mechanisms, or transformations
- **Framework Agnostic**: Adapt to any external library or service
- **Zero Migration**: No need to change existing code

## Purpose

The goal of this example is to demonstrate:
1. How to create a custom adapter that implements the SyntropyLog interface
2. How to transform between generic and specific HTTP client formats
3. How to handle errors and responses in custom adapters
4. How SyntropyLog can work with ANY HTTP client through adapters
5. How to work with native browser APIs like fetch
6. The flexibility and extensibility of SyntropyLog's adapter system

## How to Run

1. **Install Dependencies**:
   From the `11-custom-adapter` directory, run:
   ```bash
   npm install --no-workspaces
   ```
   
   > **⚠️ Important**: Use `--no-workspaces` flag to avoid npm workspace conflicts when installing dependencies in individual examples.

2. **Run the Script**:
   ```bash
   npm run dev
   ```

## Expected Output

The log output shows both built-in and custom adapters working together:

```
🚀 Initializing SyntropyLog...
✅ SyntropyLog initialized successfully!
12:45:30 [INFO] (main): 🛠️ Custom adapter example initialized!
12:45:30 [INFO] (main): 🛠️ Context created. Testing both adapters...
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m
12:45:30 [INFO] (main): 🚀 Testing built-in AxiosAdapter...
12:45:30 [INFO] (syntropylog-main): Starting HTTP request
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m source=http-manager module=HttpManager method=GET url=/api/modern
12:45:30 [INFO] (main): ✅ Modern API call confirmed: Axios correlation ID received! { correlationId: 'd8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m', endpoint: '/api/modern', method: 'GET', adapter: 'AxiosAdapter' }
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m
12:45:30 [INFO] (main): ✅ Axios response received! { message: 'Modern API response', adapter: 'built-in', status: 'success' }
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m
12:45:30 [INFO] (main): 🌐 Testing custom FetchAdapter...
12:45:30 [INFO] (syntropylog-main): Starting HTTP request
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m source=http-manager module=HttpManager method=GET url=/api/native
12:45:30 [INFO] (main): 🌐 Native API call confirmed: Fetch correlation ID received! { correlationId: 'd8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m', endpoint: '/api/native', method: 'GET', adapter: 'CustomFetchAdapter' }
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m
12:45:30 [INFO] (main): 🌐 Fetch response received! { message: 'Native API response', adapter: 'custom', status: 'success' }
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m
12:45:30 [INFO] (main): 🛠️ Both adapters tested successfully!
  └─ correlationId=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m X-Correlation-ID=d8f7e2a1-b3c4-5d6e-7f8g-9h0i1j2k3l4m
🔄 Shutting down SyntropyLog gracefully...
✅ SyntropyLog shutdown completed
```

### Key Observations:
- **Both Adapters Work**: Built-in AxiosAdapter and custom FetchAdapter both function perfectly
- **Correlation ID Propagation**: `correlationId` appears in all logs from both adapters
- **Header Injection**: `X-Correlation-ID` is automatically added to HTTP headers by both adapters
- **Unified Interface**: Both adapters use the same `.request()` method interface
- **Native API Support**: The custom adapter works seamlessly with the native fetch API

## Code Structure

### Custom Adapter Implementation
- **`CustomFetchAdapter.ts`**: Complete implementation of a custom adapter for fetch
- **Interface Compliance**: Implements the SyntropyLog adapter interface
- **Error Handling**: Proper error transformation and handling
- **Response Transformation**: Converts between specific and generic formats
- **Native API Integration**: Works with the built-in fetch API

### Example Logic
- **Dual Adapter Setup**: Configuring both built-in and custom adapters
- **Context Management**: Creating correlation context for both adapters
- **Mock Testing**: Using Nock to test both adapters
- **Comparison**: Demonstrating that both adapters work identically

### Why This Structure?
- **Educational Value**: Shows how to create custom adapters
- **Real-world Scenario**: Demonstrates native API integration
- **Framework Flexibility**: Proves SyntropyLog works with any HTTP client
- **Best Practices**: Shows proper adapter implementation patterns

## Custom Adapter Implementation Guide

### 1. Interface Requirements

Your custom adapter must implement the SyntropyLog adapter interface:

```typescript
interface AdapterInterface {
  request<T>(request: AdapterHttpRequest): Promise<AdapterHttpResponse<T>>;
}
```

### 2. Key Implementation Points

**Request Transformation:**
```typescript
// Transform generic request to fetch-specific format
const fetchOptions: RequestInit = {
  method: request.method,
  headers: request.headers as Record<string, string>,
  body: request.body ? JSON.stringify(request.body) : undefined,
};
```

**Response Transformation:**
```typescript
// Transform fetch response to generic format
const genericResponse: AdapterHttpResponse<T> = {
  status: response.status,
  statusText: response.statusText,
  headers: Object.fromEntries(response.headers.entries()),
  data,
  config: {
    url: request.url,
    method: request.method,
    headers: request.headers,
  },
};
```

**Error Handling:**
```typescript
catch (error) {
  if (error instanceof TypeError) {
    throw new Error(`Network error: ${error.message}`);
  }
  throw new Error(`Fetch request failed: ${error.message}`);
}
```

### 3. Helper Methods (Optional)

You can add convenience methods for common HTTP operations:

```typescript
async get<T>(url: string, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
  return this.request<T>({ method: 'GET', url, headers });
}

async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
  return this.request<T>({ method: 'POST', url, body: data, headers });
}
```

## Best Practices

1. **Interface Compliance**: Always implement the required adapter interface
2. **Error Transformation**: Convert library-specific errors to standard errors
3. **Response Mapping**: Ensure all response fields are properly mapped
4. **Type Safety**: Use TypeScript generics for type-safe responses
5. **Documentation**: Document your custom adapter's behavior and limitations
6. **Testing**: Test your custom adapter thoroughly with mock servers

## Use Cases for Custom Adapters

- **Native APIs**: Support built-in browser APIs like fetch
- **Legacy Libraries**: Support deprecated HTTP clients
- **Specialized Clients**: Custom HTTP clients with specific features
- **Database Adapters**: Create adapters for database clients
- **External Services**: Adapt to third-party service SDKs
- **Proprietary APIs**: Custom APIs with non-standard interfaces

## Next Steps

After understanding custom adapters, proceed to:
- **Example 12**: Advanced HTTP Adapters (Got + Request)
- **Example 20**: Basic Kafka correlation
- **Example 21**: Advanced RabbitMQ broker
- **Example 30**: Data masking and security

## Fun Facts 🛠️

- SyntropyLog's adapter system is inspired by the Adapter design pattern
- Custom adapters can add business logic, retry mechanisms, or caching
- The framework treats built-in and custom adapters identically
- You can create adapters for any external library or service
- This example proves that SyntropyLog is truly framework-agnostic
- The fetch API is now available in Node.js 18+ and all modern browsers 