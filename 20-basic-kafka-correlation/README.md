# Example 20: Basic Kafka Correlation

This example demonstrates how to use the **official Kafka Adapter** from `@syntropylog/adapters`. It showcases one of the core strengths of SyntropyLog: its decoupled, adapter-based architecture for message brokers.

By using the official `KafkaAdapter`, we can instrument any `kafkajs`-based communication, enabling automatic context propagation and centralized logging for distributed systems.

## Why This Pattern Matters

In distributed systems, tracking requests across multiple services is crucial for debugging and monitoring. Traditional approaches often require manual instrumentation of each message broker library, leading to:

- **Tight coupling** to specific broker implementations
- **Inconsistent logging** across different services
- **Manual correlation ID management** in every producer/consumer
- **Difficult testing** due to vendor lock-in

SyntropyLog's adapter pattern solves these problems by providing a unified interface that works with any message broker, while automatically handling context propagation and logging.

## Key Concepts

- **Official Adapter Pattern**: Instead of being tied to a specific broker library, you use the official adapter from `@syntropylog/adapters` that conforms to the `IBrokerAdapter` interface. This allows you to switch brokers without changing your application logic.
- **Context Propagation**: The `correlationId` is automatically added to message headers by the producer and extracted by the consumer, linking distributed operations across your entire system.
- **Singleton Client**: The Kafka client and adapter are instantiated once and shared across the application, which is a common best practice for resource management.

## Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Producer      │    │   SyntropyLog    │    │   Consumer      │
│                 │    │                  │    │                 │
│ 1. Create       │───▶│ 2. Add           │───▶│ 3. Extract      │
│    context      │    │    correlationId │    │    correlationId│
│                 │    │    to headers    │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   KafkaAdapter   │
                       │                  │
                       │ • Publishes      │
                       │ • Subscribes     │
                       │ • Handles        │
                       │   kafkajs API    │
                       └──────────────────┘
```

## Prerequisites

Before running this example, you must first build the main `syntropylog` library from the project's root directory:

```bash
# From the project root
npm run build
```

## Running the Example

1.  **Start Kafka with Docker Compose:**
    From the **example directory**, start Kafka and Zookeeper using the local `docker-compose.yaml` file.

    ```bash
    # From the example directory
    docker-compose up -d
    ```

    This will start:
    - **Zookeeper** (required for Kafka) on port 2181
    - **Kafka** broker on port 9092
    - **Kafka UI** (optional) on port 8080 for debugging

2.  **Install dependencies:**

   ```bash
   npm install
   ```

3.  **Run the example:**
    First, compile the TypeScript code. Then, run the start script.

   ```bash
   npm run build
   npm start
   ```

4.  **Stop Services:**
    When you're finished, you can stop all services from the **example directory**.

    ```bash
    # From the example directory
    docker-compose down
    ```

    **Optional**: You can also access the Kafka UI at http://localhost:8080 to monitor topics, messages, and consumer groups.

## Expected Output

You should see logs from both the producer and the consumer. You might see some initial connection errors from `kafkajs` while the Kafka cluster starts up, which is normal. The important part is that the `correlationId` is the same for both the producer and consumer logs, demonstrating automatic context propagation.

```log
--- Running Broker Instrumentation Example ---
2025-07-13 INFO  [broker-manager] :: Broker client instance "my-kafka-bus" created successfully via adapter.
2025-07-13 INFO  [syntropylog-main] :: SyntropyLog framework initialized successfully.
2025-07-13 INFO  [my-kafka-bus] :: Connecting to broker...
2025-07-13 INFO  [my-kafka-bus] :: Successfully connected to broker.
2025-07-13 INFO  [my-kafka-bus] [topic="syntropylog-test-topic"] :: Subscribing to topic...
2025-07-13 INFO  [my-kafka-bus] [topic="syntropylog-test-topic"] :: Successfully subscribed to topic.
2025-07-13 INFO  [producer] [X-Correlation-ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890"] :: Producer context created. Publishing message...
2025-07-13 INFO  [my-kafka-bus] [X-Correlation-ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" topic="syntropylog-test-topic"] :: Publishing message...
2025-07-13 INFO  [my-kafka-bus] [X-Correlation-ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" topic="syntropylog-test-topic"] :: Message published successfully.
2025-07-13 INFO  [my-kafka-bus] [X-Correlation-ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" topic="syntropylog-test-topic"] :: Received message.
2025-07-13 INFO  [consumer] [X-Correlation-ID="a1b2c3d4-e5f6-7890-abcd-ef1234567890" payload="Hello, distributed world!"] :: Message processed by consumer.

✅ Broker example finished.
```

## Key Benefits Demonstrated

1. **Automatic Correlation**: Notice how the same `correlationId` appears in both producer and consumer logs without any manual intervention.

2. **Clean Separation of Concerns**: The `KafkaAdapter` handles all Kafka-specific logic, while your application code remains broker-agnostic.

3. **Consistent Logging**: All logs follow the same format and include relevant context automatically.

4. **Easy Testing**: You can easily mock the `IBrokerAdapter` interface for unit tests without needing a real Kafka instance.

## Troubleshooting

### Common Issues

1. **Kafka Connection Errors**: If you see connection errors, wait a few seconds for Kafka to fully start up. The cluster needs time to initialize.

2. **Port Conflicts**: If ports 9092, 2181, or 8080 are already in use, stop the conflicting services or modify the ports in `docker-compose.yaml`.

3. **Topic Creation**: The example automatically creates the topic `syntropylog-test-topic`. If you see topic-related errors, check the Kafka UI at http://localhost:8080.

### Debugging with Kafka UI

The included Kafka UI provides a web interface to:
- Monitor topics and partitions
- View message contents
- Check consumer group status
- Debug connection issues

Access it at http://localhost:8080 after starting the services.

## Next Steps

- Try modifying the `KafkaAdapter` to add custom headers or implement retry logic
- Explore other broker adapters in the examples (RabbitMQ, NATS)
- Learn about advanced features like message serialization and data masking
