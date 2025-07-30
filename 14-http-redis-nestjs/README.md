# NestJS + SyntropyLog Example

This example demonstrates how to integrate SyntropyLog with NestJS for structured logging, Redis caching, and automatic correlation ID propagation.

## 🚀 Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start Redis
```bash
docker compose up -d redis
```

### 3. Run the application
```bash
npm run start:dev
```

## 📋 Endpoints

- `GET /health` - Health check
- `GET /products/:id` - Get product (with cache)
- `POST /products` - Create product

## 🔧 SyntropyLog Configuration

Configuration is in `src/main.ts`:

```typescript
await syntropyLog.init({
  logger: {
    serviceName: 'nestjs-example',
    level: 'info',
    serializerTimeoutMs: 1000,
  },
  context: {
    correlationIdHeader: 'x-correlation-id',
    transactionIdHeader: 'x-trace-id',
  },
  redis: {
    instances: [
      {
        mode: 'single',
        instanceName: 'product-cache',
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    ],
  },
});
```

## 🔗 Correlation IDs

Correlation IDs are automatically propagated:

- **Automatic**: Generated if not provided
- **Custom**: Send `x-correlation-id` header
- **Logs**: Appear in all service logs
- **Responses**: Returned in response headers

## 📝 Usage Examples

### Get product (automatic correlation ID)
```bash
curl http://localhost:3000/products/123
```

### Get product (custom correlation ID)
```bash
curl -H "x-correlation-id: my-correlation-id" http://localhost:3000/products/123
```

### Create product
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"title":"New Product","price":999,"description":"Description"}'
```

## 🏗️ Project Structure

```
src/
├── main.ts                    # SyntropyLog configuration
├── app.module.ts             # Main module
├── context.middleware.ts     # Correlation ID middleware
└── products/
    ├── products.controller.ts # REST controller
    ├── products.service.ts    # Business logic + Redis
    └── products.module.ts     # Products module
```

## ✨ Features

- ✅ **Structured logging** with correlation IDs
- ✅ **Redis cache** automatic
- ✅ **Context propagation** in HTTP requests
- ✅ **Response headers** with correlation IDs
- ✅ **Graceful shutdown** of SyntropyLog
