# Example 21: Advanced RabbitMQ with Enterprise Patterns 🧠💥

> **Enterprise Patterns that will melt your brain** - Dead Letter Exchanges, Saga Pattern, Event Sourcing, CQRS, Circuit Breakers, and more!

## 🎯 What You'll Learn

This example demonstrates **enterprise-level RabbitMQ patterns** that will challenge everything you thought you knew about distributed systems:

- **Dead Letter Exchanges** with exponential backoff retry
- **Priority Queues** with circuit breaker patterns
- **Delayed Messages** with saga pattern orchestration
- **Fanout Exchanges** with event sourcing
- **Message Persistence** with outbox pattern
- **Consumer Acknowledgments** with CQRS
- **Queue Mirroring** for high availability

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Order Service │    │  Payment Service │    │ Inventory Service│
│                 │    │                  │    │                 │
│ • Creates Order │    │ • Processes Payment│   │ • Reserves Stock│
│ • Saga Orchestrator│  │ • Dead Letter Q  │   │ • Event Sourcing│
│ • Priority Queue│    │ • Circuit Breaker│   │ • CQRS Pattern  │
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RabbitMQ Enterprise Cluster                  │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Dead Letter │ │ Priority Q  │ │ Delayed Q   │ │ Fanout Ex   │ │
│ │ Exchange    │ │ (VIP Orders)│ │ (Scheduled) │ │ (Events)    │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Circuit     │ │ Event Store │ │ Outbox      │ │ Saga        │ │
│ │ Breaker     │ │ (CQRS)      │ │ Pattern     │ │ Coordinator │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🧠 Brain-Melting Patterns

### 1. **Dead Letter Exchange with Exponential Backoff**
```typescript
// When a message fails, it goes to DLX with increasing delays
const deadLetterConfig = {
  exchange: 'order.dlx',
  routingKey: 'order.failed',
  retryDelays: [1000, 2000, 4000, 8000, 16000], // Exponential backoff
  maxRetries: 5
};
```

### 2. **Priority Queues with Circuit Breaker**
```typescript
// VIP orders get priority, but circuit breaker prevents cascade failures
const priorityQueue = {
  name: 'orders.priority',
  maxPriority: 10,
  circuitBreaker: {
    failureThreshold: 5,
    recoveryTimeout: 30000,
    fallback: 'orders.standard'
  }
};
```

### 3. **Delayed Messages with Saga Pattern**
```typescript
// Order saga with automatic rollback on failures
const orderSaga = {
  steps: [
    { action: 'reserveInventory', compensation: 'releaseInventory' },
    { action: 'processPayment', compensation: 'refundPayment' },
    { action: 'confirmOrder', compensation: 'cancelOrder' }
  ],
  timeout: 30000
};
```

### 4. **Event Sourcing with CQRS**
```typescript
// Every state change is an event, queries are separate from commands
const eventStore = {
  events: ['OrderCreated', 'PaymentProcessed', 'InventoryReserved'],
  projections: ['OrderSummary', 'CustomerHistory', 'InventoryStatus']
};
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- A brain ready to be melted 🧠

### 1. Start RabbitMQ Cluster
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Brain Melter
```bash
npm run dev
```

## 🎭 Expected Output (Your Brain Will Melt)

```log
🧠 BRAIN MELTING PATTERNS ACTIVATED 🧠

[Order Service] Creating VIP order with priority 10...
[Priority Queue] VIP order queued with circuit breaker protection
[Circuit Breaker] State: CLOSED, Failures: 0/5

[Payment Service] Processing payment with saga orchestration...
[Saga Pattern] Step 1: reserveInventory → SUCCESS
[Saga Pattern] Step 2: processPayment → SUCCESS  
[Saga Pattern] Step 3: confirmOrder → SUCCESS
[Saga Pattern] ✅ Order saga completed successfully

[Event Store] Recording events for CQRS...
[Event Sourcing] OrderCreated → PaymentProcessed → InventoryReserved
[CQRS] Projection updated: OrderSummary, CustomerHistory

[Dead Letter Exchange] Monitoring failed messages...
[Exponential Backoff] Retry 1: 1000ms, Retry 2: 2000ms

[Fanout Exchange] Broadcasting events to all subscribers...
[Event Sourcing] 3 subscribers received OrderConfirmed event

🧠 YOUR BRAIN HAS BEEN SUCCESSFULLY MELTED 🧠
```

## 🎯 Key Learning Points

### **Pattern 1: Dead Letter Exchange**
- Messages that fail processing go to a special exchange
- Exponential backoff retry mechanism
- Final fallback to human intervention

### **Pattern 2: Priority Queues**
- VIP customers get priority processing
- Circuit breaker prevents cascade failures
- Graceful degradation to standard queues

### **Pattern 3: Saga Pattern**
- Distributed transactions with automatic rollback
- Compensation actions for failure recovery
- Eventual consistency guarantees

### **Pattern 4: Event Sourcing**
- Every state change is an immutable event
- Complete audit trail of all operations
- Time-travel debugging capabilities

### **Pattern 5: CQRS (Command Query Responsibility Segregation)**
- Separate models for reads and writes
- Optimized read projections
- Scalable query performance

## 🔧 Configuration

### RabbitMQ Enterprise Setup
```yaml
# docker-compose.yaml
services:
  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
```

### SyntropyLog Configuration
```typescript
const config = {
  brokers: {
    instances: [
      {
        instanceName: 'rabbitmq-enterprise',
        adapter: new RabbitMQEnterpriseAdapter({
          url: 'amqp://admin:admin123@localhost:5672',
          deadLetterExchange: 'dlx.orders',
          priorityQueues: true,
          delayedMessages: true,
          circuitBreaker: true
        })
      }
    ]
  }
};
```

## 🧪 Testing the Brain Melter

### Test 1: VIP Order with Priority
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "X-Customer-Type: VIP" \
  -d '{"productId": "premium-123", "quantity": 1}'
```

### Test 2: Saga with Rollback
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId": "out-of-stock", "quantity": 1}'
```

### Test 3: Event Sourcing Query
```bash
curl http://localhost:3000/orders/history/customer-123
```

## 🎨 Advanced Features

### **Circuit Breaker States**
- **CLOSED**: Normal operation
- **OPEN**: Failing, reject requests
- **HALF_OPEN**: Testing recovery

### **Saga Compensation**
- Automatic rollback on failures
- Compensation actions for each step
- Eventual consistency guarantees

### **Event Store Queries**
- Time-range queries
- Aggregate projections
- Real-time event streaming

## 🚨 Warning

⚠️ **This example contains patterns that may cause:**
- Brain melting 🧠
- Existential questions about distributed systems 🤔
- Sudden urge to refactor all your code 🔄
- Deep appreciation for enterprise patterns 🏢

## 🎯 Next Steps

After your brain recovers:
- Implement your own saga patterns
- Add more complex event sourcing
- Explore CQRS with different databases
- Build circuit breakers for your services

---

**Remember: Without leaving your comfort zone, there's no possibility of evolution!** 🚀🧠💥 