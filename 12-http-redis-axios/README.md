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

# Example 12: HTTP + Redis + Axios - Complete System Architecture

## 🎯 Overview

This example demonstrates a **production-ready system architecture** using SyntropyLog with Redis caching, HTTP clients, and Express server. It showcases how to build complex systems with minimal boilerplate while maintaining clean separation of concerns.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  ProductServer  │───▶│ ProductDataService│───▶│   Redis Cache   │
│   (Express)     │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  HTTP Client    │
                       │   (Axios)       │
                       └─────────────────┘
```

## 🚀 Key Features

### 1. 🗄️ Redis Management
- **Single instance pattern**: `syntropyLog.getRedis()` always returns the same configured instance
- **Automatic instrumentation**: Redis commands are automatically logged with performance metrics
- **Intelligent TTL**: 30-second cache to prevent "Christmas tree effect"
- **Fail-fast configuration**: Invalid Redis config stops the application immediately

### 2. 🌐 Generic HTTP Client
- **Any configured HTTP client**: Reuse existing HTTP clients from your configuration
- **Fluent ApiService**: Generic, stateless service for HTTP requests
- **Automatic correlation**: HTTP requests are automatically correlated with logs
- **Error handling**: Centralized error handling with proper logging

### 3. 🏗️ Clean Architecture
- **Separation of concerns**: Express server separated from data service
- **Dependency injection**: Services are injected, not tightly coupled
- **Single Responsibility**: Each class has one clear responsibility
- **Testable design**: Easy to unit test each component

### 4. ⚙️ Complete Configuration
- **TypeScript configuration**: Fully typed config using official framework types
- **Redis cluster support**: Configurable for single instance or cluster
- **HTTP adapters**: Configurable HTTP clients with custom adapters
- **Environment-based**: Different configs for different environments

### 5. 📊 Advanced Logging
- **Structured context**: All logs include relevant context (user ID, request ID, etc.)
- **Performance metrics**: Automatic timing for Redis and HTTP operations
- **Cache analytics**: Hit/miss ratios and performance insights
- **Error correlation**: Errors are correlated with the request that caused them

### 6. 🔄 Graceful Shutdown
- **Signal handling**: Proper handling of SIGTERM/SIGINT
- **Resource cleanup**: Redis connections and HTTP servers are properly closed
- **Timeout management**: Configurable shutdown timeouts
- **Health checks**: Built-in health check endpoint

### 7. 🛡️ Error Handling Patterns
- **Fail-fast principle**: Invalid configurations stop the application
- **Graceful degradation**: Cache misses don't break the system
- **Error boundaries**: Errors are caught and logged appropriately
- **Retry strategies**: Configurable retry logic for external services

### 8. 🧪 Testing Approach
- **Unit testing**: Each component can be tested in isolation
- **Integration testing**: Full system testing with Redis and HTTP
- **Mock strategies**: Redis and HTTP clients can be easily mocked
- **Performance testing**: Cache performance can be measured

## 📁 Project Structure

```
src/
├── config.ts              # TypeScript configuration with official types
├── index.ts               # Main application entry point
├── ProductServer.ts       # Express HTTP server (separation of concerns)
├── ProductDataService.ts  # Business logic with Redis caching
└── ApiService.ts          # Generic HTTP client service
```

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Redis

```bash
# Using Docker
docker run -d --name redis-cache -p 6379:6379 redis:7-alpine

# Or using the provided docker-compose
docker-compose up -d redis
```

### 3. Run the Example

```bash
npm start
```

## 🎮 Usage

### Health Check
```bash
curl http://localhost:3000/health
```

### Get Product (with caching)
```bash
curl http://localhost:3000/product/1
```

### Create Product
```bash
curl -X POST http://localhost:3000/product \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Mouse",
    "price": 89.99,
    "description": "High-precision gaming mouse"
  }'
```

## 📊 Cache Behavior

### First Request (Cache Miss)
```
GET /product/1
├── Redis GET product:1 → null (cache miss)
├── HTTP request to external API
├── Redis SET product:1 → data (TTL: 30s)
└── Response: 1000ms
```

### Subsequent Request (Cache Hit)
```
GET /product/1
├── Redis GET product:1 → data (cache hit)
└── Response: 1ms
```

## 🔧 Configuration

### Redis Configuration
```typescript
redis: {
  instances: {
    'product-cache': {
      host: 'localhost',
      port: 6379,
      db: 0,
      // Automatic instrumentation via BeaconRedis
    }
  },
  defaultInstance: 'product-cache'
}
```

### HTTP Client Configuration
```typescript
http: {
  clients: {
    'my-axios-client': {
      adapter: 'axios',
      baseURL: 'https://api.example.com',
      timeout: 5000,
      // Automatic correlation and logging
    }
  }
}
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Performance Tests
```bash
npm run test:performance
```

## 📈 Performance Insights

### Cache Performance
- **Hit Ratio**: Monitor cache effectiveness
- **Response Time**: Compare cached vs non-cached responses
- **Memory Usage**: Track Redis memory consumption
- **TTL Optimization**: Adjust TTL based on usage patterns

### HTTP Performance
- **Request Duration**: Monitor external API response times
- **Error Rates**: Track failed requests
- **Retry Success**: Monitor retry strategy effectiveness
- **Connection Pool**: Optimize connection management

## 🔍 Monitoring

### Log Examples

#### Cache Hit
```json
{
  "level": "info",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "main",
  "source": "redis",
  "module": "RedisManager",
  "message": "Redis command [GET] executed successfully.",
  "command": "GET",
  "instance": "product-cache",
  "durationMs": 1,
  "params": ["product:1"]
}
```

#### Cache Miss
```json
{
  "level": "info",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "main",
  "source": "redis",
  "module": "RedisManager",
  "message": "Redis command [GET] executed successfully.",
  "command": "GET",
  "instance": "product-cache",
  "durationMs": 5,
  "params": ["product:1"]
}
```

#### HTTP Request
```json
{
  "level": "info",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "main",
  "source": "http-manager",
  "module": "HttpManager",
  "message": "HTTP request completed successfully.",
  "method": "GET",
  "url": "https://api.example.com/products/1",
  "durationMs": 250,
  "statusCode": 200
}
```

## 🚀 Production Considerations

### 1. **Redis Production Setup**
- Use Redis Cluster for high availability
- Configure persistence (RDB/AOF)
- Set up monitoring and alerting
- Implement backup strategies

### 2. **HTTP Client Production Setup**
- Use connection pooling
- Implement circuit breakers
- Configure retry strategies
- Set up rate limiting

### 3. **Logging Production Setup**
- Configure log aggregation (ELK, Splunk, etc.)
- Set up log retention policies
- Implement log level management
- Configure alerting on errors

### 4. **Monitoring Production Setup**
- Set up metrics collection (Prometheus, etc.)
- Configure dashboards (Grafana, etc.)
- Implement health checks
- Set up alerting

## 🎯 Key Takeaways

### 1. **Framework Simplicity**
- SyntropyLog handles complex infrastructure automatically
- Focus on business logic, not boilerplate
- Consistent patterns across all components

### 2. **Performance Optimization**
- Redis caching provides significant performance improvements
- Automatic instrumentation helps identify bottlenecks
- Configurable TTL prevents cache thrashing

### 3. **Maintainability**
- Clean separation of concerns makes code easy to maintain
- Dependency injection enables easy testing
- Structured logging provides excellent debugging capabilities

### 4. **Scalability**
- Redis clustering supports horizontal scaling
- HTTP client pooling supports high concurrency
- Graceful shutdown ensures zero-downtime deployments

## 🔗 Related Examples

- **Example 10**: Basic HTTP correlation
- **Example 11**: Custom HTTP adapters
- **Example 13**: Advanced Redis patterns
- **Example 14**: Microservices communication

## 📚 Further Reading

- [SyntropyLog Documentation](../../../README.md)
- [Redis Best Practices](https://redis.io/topics/best-practices)
- [HTTP Client Patterns](https://developer.mozilla.org/en-US/docs/Web/HTTP)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practices-performance.html)

---

**This example demonstrates how to build production-ready systems with minimal complexity using SyntropyLog's powerful features. The combination of Redis caching, HTTP client management, and structured logging provides a solid foundation for any application.** 