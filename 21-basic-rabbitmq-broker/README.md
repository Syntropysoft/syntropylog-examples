<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 21: Basic RabbitMQ Correlation 🐰

> **Simple and elegant RabbitMQ integration** - Producer/Consumer with correlation ID propagation

## 🎯 What You'll Learn

This example demonstrates **basic RabbitMQ integration** with SyntropyLog, showing how to:

- **Connect to RabbitMQ** using SyntropyLog's broker adapter
- **Publish messages** with automatic correlation ID propagation
- **Consume messages** with context preservation
- **Handle errors** gracefully
- **Monitor performance** with built-in instrumentation

## 🏗️ Simple Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Producer      │    │    RabbitMQ      │    │   Consumer      │
│                 │    │                  │    │                 │
│ • Creates       │───►│ • Message Queue  │───►│ • Processes     │
│   messages      │    │ • Correlation    │    │   messages      │
│ • Correlation   │    │   ID headers     │    │ • Same          │
│   ID context    │    │ • Persistence    │    │   correlation   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+

### 1. Start RabbitMQ
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Example
```bash
npm run dev
```

## 🎭 Expected Output

```log
--- Running Basic RabbitMQ Correlation Example ---
🚀 Initializing SyntropyLog...
✅ SyntropyLog initialized successfully!
🐰 Connecting to RabbitMQ...
✅ RabbitMQ connection established
📤 Publishing message with correlation ID...
✅ Message published successfully
📥 Consumer received message with same correlation ID
✅ Correlation ID preserved: abc-123-def-456
🐰 RabbitMQ example finished successfully!
```

## 🎯 Key Learning Points

### **Pattern 1: Basic Connection**
- Simple RabbitMQ connection setup
- Automatic health checks
- Graceful error handling

### **Pattern 2: Message Publishing**
- Publish messages with correlation IDs
- Automatic header injection
- Performance monitoring

### **Pattern 3: Message Consumption**
- Subscribe to queues
- Process messages with context
- Acknowledge messages properly

### **Pattern 4: Error Handling**
- Connection failures
- Message processing errors
- Graceful shutdown

## 🔧 Configuration

### RabbitMQ Setup
```yaml
# docker-compose.yaml
services:
  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"   # AMQP protocol
      - "15672:15672" # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
```

### SyntropyLog Configuration
```typescript
const config = {
  brokers: {
    instances: [
      {
        instanceName: 'rabbitmq-basic',
        adapter: new RabbitMQAdapter({
          url: 'amqp://admin:admin123@localhost:5672',
          queue: 'test-queue',
          exchange: 'test-exchange'
        })
      }
    ]
  }
};
```

## 🧪 Testing

### Test 1: Basic Message Flow
```bash
npm run dev
```

### Test 2: Check RabbitMQ Management UI
Open http://localhost:15672
- Username: admin
- Password: admin123

### Test 3: Monitor Logs
```bash
docker-compose logs -f rabbitmq
```

## 🎨 Features

### **Correlation ID Propagation**
- Automatic correlation ID injection
- Context preservation across services
- Traceable message flow

### **Performance Monitoring**
- Message publish/consume times
- Queue depth monitoring
- Error rate tracking

### **Graceful Shutdown**
- Proper connection cleanup
- Message acknowledgment
- Resource cleanup

## 🚨 Simple and Clean

This example focuses on:
- ✅ **Simplicity** - Easy to understand
- ✅ **Reliability** - Proper error handling
- ✅ **Observability** - Built-in monitoring
- ✅ **Maintainability** - Clean code structure

## 🎯 Next Steps

After mastering this example:
- Explore advanced RabbitMQ patterns
- Try different exchange types
- Implement message persistence
- Add more complex routing

---

**Simple, elegant, and powerful!** 🐰✨ 