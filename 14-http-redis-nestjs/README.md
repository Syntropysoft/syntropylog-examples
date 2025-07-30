# NestJS + SyntropyLog Example

Este ejemplo demuestra cómo integrar SyntropyLog con NestJS para logging estructurado, cache con Redis y propagación automática de correlation IDs.

## 🚀 Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar Redis
```bash
docker compose up -d redis
```

### 3. Ejecutar la aplicación
```bash
npm run start:dev
```

## 📋 Endpoints

- `GET /health` - Health check
- `GET /products/:id` - Obtener producto (con cache)
- `POST /products` - Crear producto

## 🔧 Configuración de SyntropyLog

La configuración está en `src/main.ts`:

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

Los correlation IDs se propagan automáticamente:

- **Automático**: Se genera si no se envía
- **Personalizado**: Enviar header `x-correlation-id`
- **Logs**: Aparecen en todos los logs del servicio
- **Respuestas**: Se devuelven en headers de respuesta

## 📝 Ejemplos de uso

### Obtener producto (correlation ID automático)
```bash
curl http://localhost:3000/products/123
```

### Obtener producto (correlation ID personalizado)
```bash
curl -H "x-correlation-id: mi-correlation-id" http://localhost:3000/products/123
```

### Crear producto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"title":"Nuevo Producto","price":999,"description":"Descripción"}'
```

## 🏗️ Estructura del proyecto

```
src/
├── main.ts                    # Configuración de SyntropyLog
├── app.module.ts             # Módulo principal
├── context.middleware.ts     # Middleware para correlation IDs
└── products/
    ├── products.controller.ts # Controlador REST
    ├── products.service.ts    # Lógica de negocio + Redis
    └── products.module.ts     # Módulo de productos
```

## ✨ Características

- ✅ **Logging estructurado** con correlation IDs
- ✅ **Cache con Redis** automático
- ✅ **Propagación de contexto** en requests HTTP
- ✅ **Headers de respuesta** con correlation IDs
- ✅ **Graceful shutdown** de SyntropyLog
