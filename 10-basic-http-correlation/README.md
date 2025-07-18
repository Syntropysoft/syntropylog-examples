# Example 10: Basic HTTP Correlation

This example showcases a critical feature for microservices and distributed systems: **automatic context propagation over HTTP**.

## The "Why"

When `Service-A` calls `Service-B`, how do you link the logs from both services to the same original request? You need to propagate a `correlation-id`. SyntropyLog automates this entirely.

When you use an instrumented HTTP client, SyntropyLog automatically:
1.  Grabs the current `correlationId` from the active context.
2.  Injects it into the HTTP headers of the outgoing request (e.g., `X-Correlation-ID: <value>`).
3.  Logs both the request and the response, enriching the logs with HTTP metadata (`method`, `url`, `status_code`, etc.).

This means you get fully correlated, detailed logs across service boundaries with zero manual effort.

## Code Structure

### Boilerplate (Reusable)
This example uses a reusable boilerplate for initialization and shutdown:
- **`boilerplate.ts`**: Contains `initializeSyntropyLog()` and `gracefulShutdown()` functions
- **Based on Example 00**: Uses the same initialization pattern as the setup example

### Example Logic
- **HTTP Client Configuration**: Setting up the Axios adapter
- **Context Management**: Creating correlation context
- **Mock Server**: Using Nock to simulate external API
- **Request Execution**: Making instrumented HTTP calls

### Why This Structure?
- **Separation of concerns**: Boilerplate vs HTTP-specific logic
- **Reusability**: Boilerplate can be copied to other examples
- **Consistency**: Same initialization pattern across all examples

## Purpose

The goal of this example is to demonstrate:
1.  How to configure an instrumented HTTP client using the built-in `axios` adapter.
2.  How to make an HTTP call using the instrumented client.
3.  How `nock` can be used to simulate a server that asserts the `correlationId` was received.

## How to Run

1.  **Install Dependencies**:
    From the `10-basic-http-correlation` directory, run:
    ```bash
    npm install --no-workspaces
    ```
    
    > **⚠️ Important**: Use `--no-workspaces` flag to avoid npm workspace conflicts when installing dependencies in individual examples.

2.  **Run the Script**:
    ```bash
    npm run dev
    ```

## Expected Output

The log output shows the full lifecycle of the HTTP request with automatic correlation. The most important line is from our `nock` server, confirming it received the correlation header. You can see the `correlationId` automatically included in the context of every log.

```
🚀 Initializing SyntropyLog...
✅ SyntropyLog initialized successfully!
12:38:35 [INFO] (main): Initialized.
12:38:35 [INFO] (main): Context created. Making HTTP call...
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10
12:38:35 [INFO] (syntropylog-main): Starting HTTP request
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10 source=http-manager module=HttpManager method=GET url=/users/1
12:38:35 [INFO] (main): Nock mock confirmed: Correlation ID received! { correlationId: '2669c5dc-a12e-43b1-94f2-65c7369fd946' }
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10
12:38:35 [INFO] (syntropylog-main): HTTP response received
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10 source=http-manager module=HttpManager statusCode=undefined url=/users/1 method=GET durationMs=9
12:38:35 [INFO] (main): Request finished.
  └─ correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946 X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10
🔄 Shutting down SyntropyLog gracefully...
✅ SyntropyLog shutdown completed
```

### Key Observations:
- **Correlation ID Propagation**: `correlationId=2669c5dc-a12e-43b1-94f2-65c7369fd946` appears in all logs
- **Header Injection**: `X-Correlation-ID=1f909011-9c2f-4198-8c7c-319ee4ba2a10` is automatically added to HTTP headers
- **Performance**: Request completed in just 9ms
- **Mock Confirmation**: Nock server confirms the correlation header was received
