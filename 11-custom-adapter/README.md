# Example 11: Custom HTTP Adapter

## 🎯 What You'll Learn

This example demonstrates how to create a **custom HTTP adapter** for SyntropyLog. You'll learn:

- **Conceptually**: What adapters are and why they matter
- **Practically**: How to implement your own HTTP client adapter
- **Integration**: How to use your custom adapter with SyntropyLog

## 🧠 Conceptual Understanding

### What is an Adapter?

An **adapter** is a design pattern that allows incompatible interfaces to work together. In SyntropyLog's context:

- **Problem**: Different HTTP libraries have different APIs (fetch, axios, got, etc.)
- **Solution**: Adapters provide a unified interface that SyntropyLog can work with
- **Benefit**: You can use ANY HTTP library while SyntropyLog handles logging, context propagation, and instrumentation

### Why Custom Adapters?

1. **Framework Agnostic**: SyntropyLog doesn't force you to use specific HTTP libraries
2. **Flexibility**: Use the HTTP client that fits your project's needs
3. **Extensibility**: Add custom behavior, retry logic, caching, etc.
4. **Testing**: Easier to mock and test with custom adapters

### The Adapter Contract

Every HTTP adapter must implement the `IHttpClientAdapter` interface:

```typescript
interface IHttpClientAdapter {
  request(options: HttpRequestOptions): Promise<HttpResponse>;
}
```

This simple contract ensures that SyntropyLog can work with any HTTP library.

## 🛠️ Practical Implementation

### Step 1: Understand the Interface

First, let's look at what we need to implement:

```typescript
interface HttpRequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
}
```

### Step 2: Create Your Custom Adapter

Here's how to create a custom adapter using the native `fetch` API:

```typescript
import { IHttpClientAdapter, HttpRequestOptions, HttpResponse } from 'syntropylog';

export class CustomFetchAdapter implements IHttpClientAdapter {
  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    const { method, url, headers = {}, body, timeout = 5000 } = options;
    
    // Create fetch options
    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(timeout),
    };
    
    // Add body if present
    if (body) {
      fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }
    
    try {
      // Make the request
      const response = await fetch(url, fetchOptions);
      
      // Parse response data
      const data = await response.json();
      
      // Convert to SyntropyLog format
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
      };
    } catch (error) {
      // Handle errors consistently
      throw new Error(`Network error: ${error.message}`);
    }
  }
}
```

### Step 3: Register Your Adapter

Tell SyntropyLog to use your custom adapter:

```typescript
import { syntropyLog } from 'syntropylog';
import { CustomFetchAdapter } from './CustomFetchAdapter';

const config = {
  http: {
    instances: [
      {
        instanceName: 'custom-fetch-client',
        adapter: new CustomFetchAdapter(),
      },
    ],
  },
};

await syntropyLog.init(config);
```

### Step 4: Use Your Adapter

Now you can use your custom adapter through SyntropyLog:

```typescript
const httpClient = syntropyLog.getHttp('custom-fetch-client');

const response = await httpClient.request({
  method: 'GET',
  url: 'https://api.example.com/data',
  headers: { 'Authorization': 'Bearer token' },
});
```

## 🔍 Deep Dive: Our CustomFetchAdapter

Let's examine the actual implementation in this example:

### Key Features

1. **Error Handling**: Consistent error format for debugging
2. **Timeout Support**: Uses AbortSignal for request timeouts
3. **Body Processing**: Handles both string and JSON bodies
4. **Header Conversion**: Converts fetch headers to standard format

### Implementation Details

```typescript
// URL validation
if (!url || typeof url !== 'string') {
  throw new Error('Network error: Invalid URL provided');
}

// Timeout handling
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), timeout);

// Response processing
const response = await fetch(url, {
  ...fetchOptions,
  signal: controller.signal,
});

clearTimeout(timeoutId);
```

## 🧪 Testing Your Adapter

### Manual Testing

Run this example to see your adapter in action:

```bash
npm run dev
```

You'll see:
- ✅ Adapter registration
- ✅ Context propagation (correlation IDs)
- ✅ Request logging
- ✅ Error handling
- ✅ Clean shutdown

### Expected Output

```
🚀 Initializing SyntropyLog...
✅ SyntropyLog initialized successfully!
🛠️ Custom adapter example initialized!
🛠️ Context created. Testing custom adapter...
🌐 Testing custom FetchAdapter...
❌ Custom adapter API call failed: Network error: Failed to parse URL from /api/data
🛠️ Custom adapter tested successfully!
```

**Note**: The "error" is expected because we're using a relative URL without a real server.

## 🎨 Advanced Customization

### Adding Custom Behavior

You can extend your adapter with custom features:

```typescript
export class AdvancedFetchAdapter implements IHttpClientAdapter {
  private retryCount = 3;
  private retryDelay = 1000;
  
  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await this.makeRequest(options);
      } catch (error) {
        if (attempt === this.retryCount) throw error;
        await this.delay(this.retryDelay * attempt);
      }
    }
  }
  
  private async makeRequest(options: HttpRequestOptions): Promise<HttpResponse> {
    // Your fetch implementation here
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Adding Middleware

```typescript
export class MiddlewareFetchAdapter implements IHttpClientAdapter {
  private middleware: Array<(options: HttpRequestOptions) => HttpRequestOptions> = [];
  
  use(middleware: (options: HttpRequestOptions) => HttpRequestOptions) {
    this.middleware.push(middleware);
  }
  
  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    // Apply middleware
    let processedOptions = options;
    for (const mw of this.middleware) {
      processedOptions = mw(processedOptions);
    }
    
    // Make request
    return this.makeRequest(processedOptions);
  }
}
```

## 🔗 Integration with Other Libraries

### Axios Adapter Example

```typescript
import axios, { AxiosResponse } from 'axios';

export class AxiosAdapter implements IHttpClientAdapter {
  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    const response: AxiosResponse = await axios({
      method: options.method,
      url: options.url,
      headers: options.headers,
      data: options.body,
      timeout: options.timeout,
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    };
  }
}
```

### Got Adapter Example

```typescript
import got from 'got';

export class GotAdapter implements IHttpClientAdapter {
  async request(options: HttpRequestOptions): Promise<HttpResponse> {
    const response = await got(options.url, {
      method: options.method,
      headers: options.headers,
      body: options.body,
      timeout: { request: options.timeout },
    });
    
    return {
      status: response.statusCode,
      statusText: response.statusMessage,
      headers: response.headers,
      data: response.body,
    };
  }
}
```

## 🎯 Best Practices

### 1. Error Handling
- Always provide meaningful error messages
- Include original error details when possible
- Use consistent error formats

### 2. Performance
- Implement proper timeout handling
- Consider connection pooling for high-traffic scenarios
- Add request/response logging for debugging

### 3. Testing
- Test with various HTTP methods
- Test error scenarios (network failures, timeouts)
- Test with different content types
- Mock external dependencies

### 4. Documentation
- Document any custom behavior
- Provide usage examples
- Explain configuration options

## 🚀 Next Steps

1. **Try Different HTTP Libraries**: Implement adapters for axios, got, or superagent
2. **Add Advanced Features**: Implement retry logic, circuit breakers, or caching
3. **Create Reusable Adapters**: Package your adapters for reuse across projects
4. **Explore Other Adapter Types**: Look into broker adapters (Redis, RabbitMQ) or serializer adapters

## 📚 Related Examples

- **Example 10**: Basic HTTP correlation (uses official adapters)
- **Example 13**: Adapter comparison (official vs custom adapters)

## 🤝 Contributing

Found a bug or have an improvement? Feel free to contribute! Check out our [Contributing Guide](../../../CONTRIBUTING.md) for details.

---

**Remember**: The power of adapters is that they make SyntropyLog truly framework-agnostic. You can use any HTTP library you want while still getting all the benefits of structured logging, context propagation, and instrumentation! 