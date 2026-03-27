<p align="center">
  <img src="https://syntropysoft.com/syntropylog-logo.png" alt="SyntropyLog Logo" width="170"/>
</p>

<h1 align="center">SyntropyLog</h1>

<p align="center">
  <strong>The Observability Framework for High-Performance Teams.</strong>
  <br />
  Ship resilient, secure, and cost-effective Node.js applications with confidence.
</p>

# Example 15: Testing Custom Serializers

This example demonstrates how to test custom serializers using SyntropyLog's testing utilities.

## Key Concepts

- **Custom serializers**: Serialize non-JSON values (Date, Error, etc.) in your code before passing them to the logger
- **Testing serializers**: Test your serializer functions directly with unit tests
- **createMockLogger**: Use `syntropylog/testing` mock logger when testing code that logs
- **Init/shutdown**: Example uses `await syntropyLog.init()` and `await syntropyLog.shutdown()` (logger and context only)

## What You'll Learn

1. How to test custom serializer functions (user, order, date, error)
2. How to use `createMockLogger` from `syntropylog/testing` in tests
3. How to test serializer edge cases (null, undefined, errors)
4. How to test init/shutdown boilerplate

## Files

- `src/index.ts` - Main application with custom serializers and init/shutdown
- `src/serializers.ts` - Custom serializer functions (testable)
- `tests/serializer-service.test.ts` - Tests for serializers and mock logger usage
- `tests/example-coverage.test.ts` - Coverage tests for serializers and boilerplate

## Running the Example

```bash
# Install dependencies
npm install

# Run the application
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Coverage

This example achieves **100% coverage** on the core serializer logic (`serializers.ts`). The tests cover:

- **serializers.ts**: All serializer functions and edge cases
- **Init/shutdown**: Boilerplate with real `syntropyLog.init()` and `syntropyLog.shutdown()`

## Testing Patterns

### Testing your serializers directly

```typescript
import { userSerializer, orderSerializer, dateSerializer, errorSerializer } from '../src/serializers';

it('should serialize user data correctly', () => {
  const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
  expect(userSerializer(user)).toBe('User(123, John Doe)');
});

it('should handle null and undefined', () => {
  expect(userSerializer(null)).toBe('null');
  expect(userSerializer(undefined)).toBe('null');
});
```

### Using createMockLogger when testing code that logs

```typescript
import { createMockLogger } from 'syntropylog/testing';
import { userSerializer } from '../src/serializers';

const mockLogger = createMockLogger();
const serialized = userSerializer({ id: 1, name: 'Jane' });
mockLogger.info('User data', { user: serialized });
// Assert on serialized value or that no error was thrown
expect(serialized).toBe('User(1, Jane)');
```

### Testing init and shutdown

```typescript
import { initializeSyntropyLog, gracefulShutdown } from '../src/index';

it('should handle initialization and shutdown boilerplate', async () => {
  await expect(initializeSyntropyLog()).resolves.not.toThrow();
  await expect(gracefulShutdown()).resolves.not.toThrow();
});
```

## Key Takeaways

- **Serialize in code**: The logger only accepts `JsonValue`; serialize Date, Error, or custom objects in your code before logging
- **Test serializers as pure functions**: No framework needed for unit tests of serializer logic
- **createMockLogger**: Use when testing code that calls the logger with serialized data
- **Init uses await**: Use `await syntropyLog.init({ logger, context })` (no Redis, HTTP, or brokers in config)
