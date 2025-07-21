<p align="center">
  <img src="https://raw.githubusercontent.com/Syntropysoft/syntropylog-examples-/main/assets/syntropyLog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 24: Full-Stack Correlation with NATS

This example demonstrates how `syntropylog` can be used in a realistic, distributed, full-stack environment to achieve end-to-end correlation across multiple microservices using NATS as the message broker.

## Architecture

The system consists of three microservices orchestrated with Docker Compose:

1. **API Gateway**: A Node.js service using Express. It's the public entry point that receives an HTTP POST request to create a sale. It publishes a `sales.new` event to NATS.
2. **Sales Service**: A Node.js service that subscribes to the `sales.new` topic, processes the sale, and then publishes a `sales.processed` event to NATS.
3. **Dispatch Service**: A Node.js service that subscribes to the `sales.processed` topic, processes the dispatch, and publishes a `dispatch.ready` event back to the API Gateway.

The key goal is to show how `syntropylog` automatically propagates a consistent `correlationId` from the initial HTTP request through all NATS messages, allowing for a unified trace of the entire transaction.

## Prerequisites

Before running the example, please ensure you have the following installed:
- Node.js (v18 or higher is recommended)
- Docker and Docker Compose

## How to Run

All services for this example are defined in the `docker-compose.yaml` file within this directory.

### Step 1: Start Infrastructure Services

First, start the required infrastructure services (NATS and Redis):

```bash
# Navigate to the example directory
cd examples/24-full-stack-nats

# Start infrastructure services only
docker compose up nats-server redis -d
```

Wait a few seconds for NATS and Redis to be ready.

### Step 2: Build and Start Application Services

Once the infrastructure is running, build and start the microservices:

```bash
# Build and start all services (infrastructure + applications)
docker compose up --build
```

This command will:
- Build the Docker images for the three microservices
- Start all services (NATS, Redis, API Gateway, Sales Service, Dispatch Service)
- Show logs from all containers in your terminal

### Alternative: Start Everything at Once

If you prefer to start everything together:

```bash
docker compose up --build
```

This will start infrastructure and applications in the correct order automatically.

## Testing the Flow

Once all services are running, you can trigger the end-to-end flow by sending a POST request to the API Gateway.

**Send the cURL request:**
```bash
curl -X POST http://localhost:3000/sales \
  -H "Content-Type: application/json" \
  -H "X-TRACE-ID: trace-abc-123" \
  -H "X-SESSION-ID: session-xyz-987" \
  -H "X-REQUEST-AGENT: curl-client/1.0" \
  -d '{
    "productId": "prod-123",
    "quantity": 2,
    "customer": {
      "id": "cust-abc",
      "name": "Gabriel Gomez"
    }
  }'
```

**Expected Response:**
```json
{
  "message": "Sale processing started",
  "correlationId": "98e1abbb-4b39-402f-91b0-f85a3f4c845f"
}
```

## Evidence of Success

You'll know everything is working correctly when you see the same `correlationId` in the logs from all three services. This demonstrates that the context was successfully propagated across all NATS topics.

**Real Log Flow Example:**

```log
# 1. API Gateway receives the request and creates a correlationId
api-gateway-1 | {"level":"info","timestamp":"2025-07-21T13:27:34.594Z","service":"api-gateway","message":"Received new sale request {\n  saleData: {\n    productId: 'prod-123',\n    quantity: 2,\n    customer: { id: 'cust-abc', name: 'Gabriel Gomez' }\n  },\n  correlationId: '98e1abbb-4b39-402f-91b0-f85a3f4c845f'\n}"}

# 2. Sales Service receives the message with the same correlationId
sales-service-1 | {"correlationId":"51c2e386-1aae-4022-a6fc-b257df2d496d","x-correlation-id":["98e1abbb-4b39-402f-91b0-f85a3f4c845f"],"level":"info","timestamp":"2025-07-21T13:27:34.602Z","service":"sales-service","message":"Processing new sale {\n  correlationId: '98e1abbb-4b39-402f-91b0-f85a3f4c845f',\n  saleData: {\n    productId: 'prod-123',\n    quantity: 2,\n    customer: { id: 'cust-abc', name: 'Gabriel Gomez' }\n  }\n}"}

# 3. Sales Service processes and publishes to dispatch
sales-service-1 | {"correlationId":"51c2e386-1aae-4022-a6fc-b257df2d496d","x-correlation-id":["98e1abbb-4b39-402f-91b0-f85a3f4c845f"],"level":"info","timestamp":"2025-07-21T13:27:35.608Z","service":"sales-service","message":"Sale processed successfully {\n  correlationId: '98e1abbb-4b39-402f-91b0-f85a3f4c845f',\n  saleId: 'SALE-1753104455608'\n}"}

# 4. Dispatch Service receives and processes the sale
dispatch-service-1 | {"correlationId":"0ed14317-c86b-4af2-aa4a-0d51792c5009","x-correlation-id":["98e1abbb-4b39-402f-91b0-f85a3f4c845f"],"level":"info","timestamp":"2025-07-21T13:27:35.612Z","service":"dispatch-service","message":"Processing dispatch for sale {\n  correlationId: '98e1abbb-4b39-402f-91b0-f85a3f4c845f',\n  saleId: undefined\n}"}

# 5. Dispatch Service completes and notifies API Gateway
dispatch-service-1 | {"correlationId":"0ed14317-c86b-4af2-aa4a-0d51792c5009","x-correlation-id":["98e1abbb-4b39-402f-91b0-f85a3f4c845f"],"level":"info","timestamp":"2025-07-21T13:27:37.116Z","service":"dispatch-service","message":"Dispatch prepared successfully {\n  correlationId: '98e1abbb-4b39-402f-91b0-f85a3f4c845f',\n  saleId: undefined,\n  trackingNumber: 'TRK-1753104457116'\n}"}

# 6. API Gateway receives the final notification
api-gateway-1 | {"correlationId":"e1f72ab3-9050-4b2b-bf7f-6affaec74936","x-correlation-id":["98e1abbb-4b39-402f-91b0-f85a3f4c845f"],"level":"info","timestamp":"2025-07-21T13:27:37.118Z","service":"api-gateway","message":"Dispatch ready event received {\n  correlationId: '98e1abbb-4b39-402f-91b0-f85a3f4c845f',\n  payload: '{\"trackingNumber\":\"TRK-1753104457116\",\"status\":\"ready_for_pickup\",...}'\n}"}
```

## Key Features Demonstrated

✅ **Automatic Correlation ID Propagation**: The same correlation ID flows through all services  
✅ **Distributed Tracing**: Complete visibility across microservices  
✅ **NATS Integration**: Seamless message broker integration with context preservation  
✅ **Structured Logging**: Rich, contextual logs with correlation information  
✅ **Docker Orchestration**: Complete containerized environment  
✅ **Real-time Processing**: Asynchronous message processing with proper acknowledgments  

## Architecture Details

- **Message Flow**: API Gateway → Sales Service → Dispatch Service → API Gateway
- **Topics**: `sales.new` → `sales.processed` → `dispatch.ready`
- **Infrastructure**: NATS (message broker) + Redis (framework state)
- **Observability**: SyntropyLog handles all correlation and logging automatically

## Status: ✅ WORKING

This example is fully functional and demonstrates real-world distributed tracing capabilities with SyntropyLog. 