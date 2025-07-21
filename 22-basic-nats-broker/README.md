<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 22: Basic NATS Correlation 🚀

> **Simple and elegant NATS integration** - Publisher/Subscriber with correlation ID propagation

## 🎯 What You'll Learn

This example demonstrates **basic NATS integration** with SyntropyLog, showing how to:

- **Connect to NATS** using SyntropyLog's broker adapter
- **Publish messages** with automatic correlation ID propagation
- **Subscribe to topics** with context preservation
- **Handle errors** gracefully
- **Monitor performance** with built-in instrumentation

## 🏗️ Simple Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Publisher     │    │      NATS        │    │   Subscriber    │
│                 │    │                  │    │                 │
│ • Creates       │───►│ • Message Broker │───►│ • Processes     │
│   messages      │    │ • Correlation    │    │   messages      │
│ • Correlation   │    │   ID headers     │    │ • Same          │
│   ID context    │    │ • Pub/Sub        │    │   correlation   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+

### 1. Start NATS
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
--- Running Basic NATS Correlation Example ---
🚀 Initializing SyntropyLog...
✅ SyntropyLog initialized successfully!
🚀 Connecting to NATS...
✅ NATS connection established
📤 Publishing message with correlation ID...
✅ Message published successfully
📥 Subscriber received message with same correlation ID
✅ Correlation ID preserved: abc-123-def-456
🚀 NATS example finished successfully!
```

## 🎯 Key Learning Points

### **Pattern 1: Basic Connection**
- Simple NATS connection setup
- Automatic health checks
- Graceful error handling

### **Pattern 2: Message Publishing**
- Publish messages with correlation IDs
- Automatic header injection
- Performance monitoring

### **Pattern 3: Message Subscription**
- Subscribe to topics
- Process messages with context
- Handle message acknowledgments

### **Pattern 4: Error Handling**
- Connection failures
- Message processing errors
- Graceful shutdown

## 🔧 Configuration

### NATS Setup
```yaml
# docker-compose.yaml
services:
  nats-server:
    image: nats:2.9.25-alpine
    ports:
      - "4222:4222"   # NATS protocol
      - "8222:8222"   # HTTP monitor
```

## 📊 Key Features

- **Automatic Correlation**: Correlation IDs are automatically propagated
- **Structured Logging**: All operations are logged with context
- **Performance Monitoring**: Built-in timing and metrics
- **Error Handling**: Graceful error handling with proper logging
- **Type Safety**: Full TypeScript support with proper types

## 🎯 Next Steps

After mastering this basic example, explore:
- **Example 24**: Full-stack NATS microservices with distributed tracing
- **Example 20**: Kafka integration patterns
- **Example 21**: RabbitMQ integration patterns 