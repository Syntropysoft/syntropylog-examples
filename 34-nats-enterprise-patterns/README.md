# Example 34: NATS Enterprise Patterns 🚀🛩️

> **NATS JetStream, Clustering, and Enterprise-Grade Messaging** - Where high-performance messaging meets distributed systems at scale.

## 🎯 What You'll Learn

This example demonstrates **enterprise-level NATS patterns** that power the world's fastest messaging systems:

- **NATS JetStream** with persistent messaging and streaming
- **NATS Clustering** for high availability and scalability
- **NATS Supercluster** for global distribution
- **Stream Processing** with consumer groups
- **Message Replay** and historical data access
- **Load Balancing** and fault tolerance
- **Request-Reply** with correlation tracking

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Order Service │    │  Payment Service │    │ Inventory Service│
│   (NATS Client) │    │  (NATS Client)   │    │  (NATS Client)  │
│                 │    │                  │    │                 │
│ • Publishes     │    │ • Subscribes     │    │ • Request-Reply │
│   Orders        │    │   Payments       │    │   Stock Check   │
│ • JetStream     │    │ • Consumer Group │    │ • Load Balanced │
│   Persistence   │    │ • Message Replay │    │ • Fault Tolerant│
└─────────┬───────┘    └─────────┬────────┘    └─────────┬───────┘
          │                      │                       │
          ▼                      ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NATS Enterprise Cluster                      │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ NATS Server │ │ NATS Server │ │ NATS Server │ │ NATS Server │ │
│ │ (Node 1)    │ │ (Node 2)    │ │ (Node 3)    │ │ (Node 4)    │ │
│ │             │ │             │ │             │ │             │ │
│ │ • JetStream │ │ • JetStream │ │ • JetStream │ │ • JetStream │ │
│ │ • Clustering│ │ • Clustering│ │ • Clustering│ │ • Clustering│ │
│ │ • Persistence│ │ • Persistence│ │ • Persistence│ │ • Persistence│ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│ │ Stream      │ │ Consumer    │ │ Message     │ │ Load        │ │
│ │ (Orders)    │ │ Group       │ │ Replay      │ │ Balancer    │ │
│ │             │ │ (Payments)  │ │ (Historical)│ │ (Requests)  │ │
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Monitoring     │
                       │   & Analytics    │
                       │                  │
                       │ • Stream Metrics │
                       │ • Consumer Lag   │
                       │ • Cluster Health │
                       │ • Performance    │
                       └──────────────────┘
```

## 🧠 Brain-Melting NATS Patterns

### 1. **NATS JetStream with Persistence**
```typescript
// Persistent messaging with guaranteed delivery
const jetStream = await nc.jetstream();

// Create a stream for orders
await jetStream.addStream({
  name: 'ORDERS',
  subjects: ['orders.*'],
  retention: RetentionPolicy.Workqueue,
  storage: StorageType.File,
  maxMsgsPerSubject: 1000,
  maxAge: 24 * 60 * 60 * 1000000000, // 24 hours
  maxMsgSize: 1024 * 1024 // 1MB
});

// Publish with acknowledgment
const ack = await jetStream.publish('orders.new', {
  id: '12345',
  customerId: '999',
  amount: 150.00,
  correlationId: generateCorrelationId()
}, {
  msgID: 'order-12345',
  expectLastSequence: 0
});
```

### 2. **Consumer Groups with Load Balancing**
```typescript
// Consumer group for payment processing
const consumer = await jetStream.addConsumer('ORDERS', {
  durableName: 'payment-processor',
  deliverGroup: 'payment-group',
  deliverPolicy: DeliverPolicy.New,
  ackPolicy: AckPolicy.Explicit,
  maxDeliver: 3,
  filterSubject: 'orders.payment'
});

// Subscribe with load balancing
const subscription = await consumer.consume({
  callback: async (msg) => {
    const order = JSON.parse(msg.data.toString());
    logger.info({ orderId: order.id, correlationId: order.correlationId }, 'Processing payment');
    
    // Process payment logic here
    
    await msg.ack();
  },
  maxWaiting: 10,
  idleHeartbeat: 30000
});
```

### 3. **Request-Reply with Correlation**
```typescript
// Request-reply pattern with correlation tracking
const request = await nc.request('inventory.check', {
  productId: 'ABC123',
  quantity: 5,
  correlationId: generateCorrelationId()
}, {
  timeout: 5000,
  headers: {
    'X-Correlation-ID': correlationId
  }
});

const response = await request;
const stockInfo = JSON.parse(response.data.toString());
```

### 4. **Message Replay and Historical Data**
```typescript
// Replay messages from a specific sequence
const replayConsumer = await jetStream.addConsumer('ORDERS', {
  durableName: 'order-replay',
  deliverPolicy: DeliverPolicy.StartSequence,
  optStartSeq: 1000, // Start from sequence 1000
  ackPolicy: AckPolicy.None, // No acknowledgment needed for replay
  filterSubject: 'orders.*'
});

// Subscribe to replay
const replaySubscription = await replayConsumer.consume({
  callback: async (msg) => {
    const order = JSON.parse(msg.data.toString());
    logger.info({ 
      sequence: msg.seq, 
      timestamp: msg.timestamp,
      correlationId: order.correlationId 
    }, 'Replaying historical order');
  }
});
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- NATS knowledge (basic)

### 1. Start NATS Enterprise Cluster
```bash
docker-compose up -d
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the NATS Enterprise Example
```bash
npm run dev
```

## 🎭 Expected Output (Your Brain Will Melt)

```log
🚀 NATS ENTERPRISE PATTERNS ACTIVATED 🚀

[NATS Cluster] Starting 4-node cluster...
[JetStream] Initializing persistent storage...
[Streams] Creating ORDERS, PAYMENTS, INVENTORY streams...
[Consumer Groups] Setting up payment-processor group...

[Order Service] Publishing order with correlation...
[JetStream] Order persisted to ORDERS stream
[Acknowledgment] Message confirmed (sequence: 1)

[Payment Service] Consumer group processing...
[Load Balancing] Message distributed across 3 consumers
[Processing] Payment for order #12345
[Acknowledgment] Payment processed successfully

[Request-Reply] Inventory check request...
[Load Balancer] Request routed to available server
[Response] Stock available: 15 units
[Correlation] Request-Reply correlated successfully

[Message Replay] Replaying historical data...
[Replay] Processing 1000 historical messages
[Analytics] Historical order patterns analyzed

🚀 YOUR BRAIN HAS BEEN JETSTREAMED 🚀
```

## 🎯 Key Learning Points

### **Pattern 1: NATS JetStream**
- **Persistent Messaging**: Guaranteed message delivery
- **Stream Processing**: Real-time data pipelines
- **Consumer Groups**: Scalable message processing
- **Message Replay**: Historical data access

### **Pattern 2: NATS Clustering**
- **High Availability**: Automatic failover
- **Load Distribution**: Even message distribution
- **Fault Tolerance**: Automatic recovery
- **Scalability**: Horizontal scaling

### **Pattern 3: Request-Reply Pattern**
- **Synchronous Communication**: Immediate responses
- **Load Balancing**: Automatic request distribution
- **Correlation Tracking**: Request-response matching
- **Timeout Handling**: Graceful failure management

### **Pattern 4: Consumer Groups**
- **Load Balancing**: Even workload distribution
- **Fault Tolerance**: Automatic consumer failover
- **Scalability**: Add/remove consumers dynamically
- **Message Ordering**: Per-subject ordering guarantees

### **Pattern 5: Message Replay**
- **Historical Analysis**: Process past messages
- **Audit Trails**: Complete message history
- **Debugging**: Replay specific time periods
- **Data Recovery**: Restore from any point

## 🔧 Configuration

### NATS Enterprise Setup
```yaml
# docker-compose.yaml
services:
  nats-server-1:
    image: nats:2.9-alpine
    command: -js -cluster_name nats-cluster -cluster nats://nats-server-1:6222 -routes nats://nats-server-2:6222,nats://nats-server-3:6222,nats://nats-server-4:6222
    ports:
      - "4222:4222"
      - "8222:8222"

  nats-server-2:
    image: nats:2.9-alpine
    command: -js -cluster_name nats-cluster -cluster nats://nats-server-2:6222 -routes nats://nats-server-1:6222,nats://nats-server-3:6222,nats://nats-server-4:6222

  nats-server-3:
    image: nats:2.9-alpine
    command: -js -cluster_name nats-cluster -cluster nats://nats-server-3:6222 -routes nats://nats-server-1:6222,nats://nats-server-2:6222,nats://nats-server-4:6222

  nats-server-4:
    image: nats:2.9-alpine
    command: -js -cluster_name nats-cluster -cluster nats://nats-server-4:6222 -routes nats://nats-server-1:6222,nats://nats-server-2:6222,nats://nats-server-3:6222

  nats-ui:
    image: synadia/nats-account-server:latest
    ports:
      - "8080:8080"
    environment:
      - NATS_SERVER_URL=nats://nats-server-1:4222
```

### SyntropyLog Configuration
```typescript
const config = {
  brokers: {
    instances: [
      {
        instanceName: 'nats-enterprise',
        adapter: new NatsJetStreamAdapter({
          servers: [
            'nats://localhost:4222',
            'nats://localhost:4223',
            'nats://localhost:4224',
            'nats://localhost:4225'
          ],
          jetStream: {
            domain: 'enterprise',
            timeout: 5000
          },
          clustering: {
            clusterName: 'nats-cluster',
            loadBalancing: true
          }
        })
      }
    ]
  }
};
```

## 🧪 Testing the NATS Enterprise Setup

### Test 1: JetStream Publishing
```bash
# Publish to JetStream
nats pub orders.new '{"id": "12345", "amount": 150.00}' --server localhost:4222

# Check stream
nats stream list --server localhost:4222
```

### Test 2: Consumer Groups
```bash
# Subscribe with consumer group
nats sub orders.payment --queue payment-group --server localhost:4222

# Check consumer info
nats consumer info ORDERS payment-processor --server localhost:4222
```

### Test 3: Request-Reply
```bash
# Send request
nats req inventory.check '{"productId": "ABC123"}' --server localhost:4222

# Check cluster health
nats server report --server localhost:4222
```

## 🎨 Advanced Features

### **JetStream Capabilities**
- **Persistent Storage**: File-based message storage
- **Stream Processing**: Real-time data pipelines
- **Consumer Groups**: Scalable message processing
- **Message Replay**: Historical data access

### **Clustering Features**
- **High Availability**: Automatic failover
- **Load Distribution**: Even message distribution
- **Fault Tolerance**: Automatic recovery
- **Scalability**: Horizontal scaling

### **Enterprise Patterns**
- **Request-Reply**: Synchronous communication
- **Load Balancing**: Automatic request distribution
- **Correlation Tracking**: Request-response matching
- **Timeout Handling**: Graceful failure management

### **Monitoring & Analytics**
- **Stream Metrics**: Message throughput and lag
- **Consumer Health**: Consumer group status
- **Cluster Health**: Node status and connectivity
- **Performance**: Latency and throughput metrics

## 🚨 Warning

⚠️ **This example may cause:**
- Addiction to high-performance messaging ⚡
- Obsession with clustering and HA 🏗️
- Sudden urge to stream everything 📡
- Deep appreciation for NATS JetStream 🚀

## 🎯 Next Steps

After your brain recovers:
- Implement your own JetStream applications
- Add more complex consumer groups
- Explore different clustering topologies
- Build real-time monitoring dashboards

---

**Remember: In NATS, speed is the new normal!** 🛩️🚀🧠 