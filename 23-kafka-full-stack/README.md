<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 23: Full-Stack Correlation with Kafka

This example demonstrates one of the most powerful features of `syntropylog`: **end-to-end context correlation** across different services communicating via a message broker (in this case, Kafka).

## Architecture

This example simulates a producer and a consumer running in the same process but architected as if they were separate microservices. The key is how `syntropylog` seamlessly propagates the `X-Correlation-ID` from the producer's context to the consumer's context through the message headers.

The project follows a clean, modular structure:

1. **`src/config.ts`**: Contains the SyntropyLog configuration using official framework types. Defines the Kafka adapter configuration and logging settings.

2. **`src/boilerplate.ts`**: Handles SyntropyLog initialization and graceful shutdown. Provides reusable lifecycle management functions.

3. **`src/index.ts`**: The main application entry point. It orchestrates the example:
   * Initializes SyntropyLog using the boilerplate
   * Connects to Kafka broker
   * Sets up a consumer that subscribes to the topic
   * Creates a producer context with correlation ID
   * Publishes a message and demonstrates correlation preservation

## Prerequisites

Before running this example, please ensure you have the following installed:
- Node.js (v18 or higher is recommended)
- Docker and Docker Compose

## How to Run

### Step 1: Start Kafka Infrastructure

First, start the required Kafka infrastructure:

```bash
# Navigate to the example directory
cd examples/23-kafka-full-stack

# Start Kafka and Zookeeper
docker compose up -d
```

Wait a few seconds for Kafka to be ready.

### Step 2: Run the Example

Once Kafka is running, install dependencies and run the example:

```bash
# Install dependencies
npm install

# Run the example
npm run dev
```

### Alternative: Start Everything at Once

If you prefer to start everything together:

```bash
docker compose up -d && npm install && npm run dev
```

## Expected Output

When you run the example, you will see a series of logs demonstrating the correlation flow. The most important thing to observe is that the `X-Correlation-ID` generated in the "producer" context is the same one that appears in the "consumer" logs, proving that the context was successfully propagated through Kafka.

```log
--- Running Kafka Full-Stack Correlation Example ---
🚀 Initializing SyntropyLog for Kafka Full-Stack Example...
✅ SyntropyLog initialized successfully for Kafka Full-Stack Example!
✅ Connected to Kafka broker
✅ Subscribed to topic: syntropylog-test-topic

{"correlationId":"33ee0f47-0de4-430c-af1c-a1352739a595","X-Correlation-ID":"a1c930a9-b0ac-4ef3-a979-ba245d99fcfd","level":"info","timestamp":"2025-07-21T13:51:31.027Z","service":"producer","message":"Producer context created. Publishing message..."}
✅ Message published with correlation ID: a1c930a9-b0ac-4ef3-a979-ba245d99fcfd

{"correlationId":"db364926-57b7-44e7-abd0-cf8c3ab79c13","X-Correlation-ID":{"0":51,"1":51,"2":101,"3":101,"4":48,"5":102,"6":52,"7":55,"8":45,"9":48,"10":100,"11":101,"12":52,"13":45,"14":52,"15":51,"16":48,"17":99,"18":45,"19":97,"20":102,"21":49,"22":99,"23":45,"24":97,"25":49,"26":51,"27":53,"28":50,"29":55,"30":51,"31":57,"32":97,"33":53,"34":57,"35":53},"level":"info","timestamp":"2025-07-21T13:51:31.056Z","service":"consumer","message":"Message processed by consumer.","payload":"Hello, distributed world!"}

🔄 Shutting down SyntropyLog gracefully...
✅ SyntropyLog shutdown completed
✅ Kafka Full-Stack example finished.
```

**Key Observations:**
- ✅ **Producer correlation ID**: `a1c930a9-b0ac-4ef3-a979-ba245d99fcfd`
- ✅ **Consumer correlation ID**: Same ID (shown as Buffer but represents the same value)
- ✅ **Message payload**: Successfully transmitted as "Hello, distributed world!"
- ✅ **Automatic correlation**: No manual header passing required
