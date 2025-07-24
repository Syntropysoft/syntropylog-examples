# Example 28: Testing Patterns with Vitest

This example shows how to test SyntropyLog applications using Vitest. The key: Test your business logic, not the framework.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage (shows real code coverage metrics)
npm run test:coverage
```

## 📊 Code Coverage

This example demonstrates **real code coverage** with our testing approach:

```bash
npm run test:coverage
```

**Coverage Results:**
```
----------|---------|----------|---------|---------|-----------------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s           
----------|---------|----------|---------|---------|-----------------------------
All files |   82.55 |    93.75 |    87.5 |   82.55 |                   
 index.ts |   82.55 |    93.75 |    87.5 |   82.55 | 121-144,148-149   
----------|---------|----------|---------|---------|-----------------------------
```

**What this means:**
- ✅ **82.55% Statement Coverage**: Most of the business logic and boilerplate is tested
- ✅ **93.75% Branch Coverage**: Almost all conditional paths are covered
- ✅ **87.5% Function Coverage**: Core functions and boilerplate are tested
- ✅ **82.55% Line Coverage**: Most lines of code are executed during tests

**Uncovered lines (121-144, 148-149)** are demonstration code:
- **121-144**: Main function (example demonstration code)
- **148-149**: Module execution check (example runner)

This coverage demonstrates that our **declarative testing approach** covers all business logic AND framework boilerplate while focusing on behavior, not implementation details.

## What You'll Learn

- How to use SyntropyLogMock (no framework setup needed)
- How to write simple, readable tests with Vitest
- How to avoid testing external dependencies
- How to focus on business logic, not framework details

## Key Principles

- Test WHAT the system produces, not HOW it works
- Tests should read like specifications
- Don't test Redis, brokers, or framework internals
- Use mocks to avoid initialization issues

## Setup

### 1. Install Dependencies

```bash
npm install syntropylog vitest typescript
```

### 2. Configure Vitest

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
});
```

### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Testing Patterns

### 1. Basic Test Setup with SyntropyLogMock

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { UserService } from '../src/index';
const { createTestHelper } = require('syntropylog/testing');

// Create test helper - this creates a SyntropyLogMock that simulates the entire framework
// No real initialization/shutdown needed - everything is in memory
const testHelper = createTestHelper();

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    testHelper.beforeEach(); // Reset mocks and create fresh instances
    userService = new UserService(testHelper.mockSyntropyLog); // Inject the mock
  });

  it('should create user successfully', async () => {
    // Arrange
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    // Act
    const result = await userService.createUser(userData);
    
    // Assert - Test behavior, not implementation
    expect(result).toHaveProperty('userId');
    expect(result.name).toBe('John Doe');
  });
});
```

### 2. Alternative: Service Helper

For even simpler setup, use the service helper:

```typescript
it('should create user with service helper', async () => {
  // Arrange
  const userData = { name: 'John Doe', email: 'john@example.com' };
  
  // Act - Create service with mock in one line
  const { createServiceWithMock, createSyntropyLogMock } = require('syntropylog/testing');
  const userService = createServiceWithMock(UserService, createSyntropyLogMock());
  
  const result = await userService.createUser(userData);
  
  // Assert
  expect(result).toHaveProperty('userId');
});
```

## Understanding the SyntropyLogMock

The `SyntropyLogMock` is a complete simulation of the SyntropyLog framework that runs entirely in memory. Here's what it provides:

### What the Mock Simulates

- **Logger**: Mock logger with all standard methods (info, warn, error, etc.)
- **Context Manager**: Mock context manager with correlation IDs
- **HTTP Manager**: Mock HTTP manager for testing HTTP operations
- **Broker Manager**: Mock broker manager for testing message brokers
- **Serialization Manager**: Mock serialization manager

### Why Use the Mock?

- ✅ **No Initialization**: No need to call `syntropyLog.init()` or `syntropyLog.shutdown()`
- ✅ **No External Dependencies**: No Redis, brokers, or HTTP servers needed
- ✅ **Fast Tests**: Everything runs in memory
- ✅ **Reliable**: No network issues or state conflicts between tests
- ✅ **Isolated**: Each test gets a fresh mock instance

## Vitest-Specific Features

### 1. Powerful Matchers

```typescript
it('should use Vitest matchers', async () => {
  const result = await userService.createUser(userData);
  
  expect(result).toHaveProperty('name', 'John Doe');
  expect(result.email).toMatch(/@/); // Regex matcher
  expect(typeof result.name).toBe('string'); // Type checking
});
```

### 2. Async Testing

```typescript
it('should handle async operations', async () => {
  // Vitest handles async/await naturally
  await expect(userService.getUserById('user-123'))
    .resolves.not.toThrow();
});
```

### 3. Structure Validation

```typescript
it('should validate object structure', async () => {
  const result = await userService.createUser(userData);
  
  // Test structure without depending on random values
  expect(result).toHaveProperty('userId');
  expect(result).toHaveProperty('name');
  expect(result).toHaveProperty('email');
  expect(typeof result.userId).toBe('string');
  expect(result.userId.length).toBeGreaterThan(0);
  expect(result.name).toBe('John Doe');
});
```

## What's Being Tested

### ✅ What We Test

- **Business Logic**: User creation, validation, retrieval
- **Error Handling**: Invalid inputs, edge cases
- **Data Structures**: Return values, object properties
- **Async Operations**: Promise resolution, error rejection

### ❌ What We Don't Test

- **Framework Features**: Logging, context management, Redis operations
- **External Dependencies**: Database connections, HTTP calls
- **Implementation Details**: Internal method calls, private properties

## Common Pitfalls

### 1. Testing Framework Instead of Business Logic

❌ **Don't do this:**
```typescript
it('should log user creation', async () => {
  // Testing if logging happened - framework responsibility
});
```

✅ **Do this instead:**
```typescript
it('should create user successfully', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
});
```

### 2. Testing External Dependencies

❌ **Don't do this:**
```typescript
it('should connect to Redis', async () => {
  // Testing Redis connection - external dependency
});
```

✅ **Do this instead:**
```typescript
it('should handle user data correctly', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
});
```

### 3. Over-Complicated Setup

❌ **Don't do this:**
```typescript
beforeEach(async () => {
  // Complex setup with real framework initialization
  await syntropyLog.initialize();
  // ... more setup
});
```

✅ **Do this instead:**
```typescript
beforeEach(() => {
  testHelper.beforeEach(); // Simple, clean setup
  userService = new UserService(testHelper.mockSyntropyLog);
});
```

### 4. Testing Framework Boilerplate

**Why test boilerplate?** The initialization and shutdown functions are critical for:
- ✅ **Resource management**: Proper cleanup of transports, connections, and contexts
- ✅ **Framework lifecycle**: Ensuring proper startup and shutdown sequences
- ✅ **Error handling**: Validating configuration and initialization errors
- ✅ **Integration**: Testing that the framework integrates correctly with your app

✅ **Do this:**
```typescript
it('should handle initialization and shutdown boilerplate', async () => {
  // Test boilerplate functions coverage
  // These should not throw and should complete successfully
  
  await expect(initializeSyntropyLog('test-app')).resolves.not.toThrow();
  await expect(shutdownSyntropyLog()).resolves.not.toThrow();
});
```

**Key points:**
- **Export boilerplate functions** so they can be tested
- **Test that they don't throw** - this validates the configuration
- **Test both init and shutdown** - ensures complete lifecycle coverage
- **Use descriptive test names** - makes it clear what's being tested

## 🎯 Real Framework Behavior

When you run the boilerplate tests, you'll see the actual framework working:

```bash
npm run test:coverage
```

**Output shows real framework lifecycle:**
```
{"level":"info","timestamp":"2025-07-24T18:03:30.946Z","service":"syntropylog-main","message":"SyntropyLog framework initialized successfully."}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"🔄 LifecycleManager.shutdown() called. Current state: READY"}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"🔄 State changed to SHUTTING_DOWN"}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"Shutting down SyntropyLog framework..."}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"📋 Executing 1 shutdown promises..."}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"✅ Shutdown promises completed"}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"🔍 Starting external process termination..."}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"Found 3 regex-test processes to terminate"}
{"level":"info","timestamp":"2025-07-24T18:03:30.947Z","service":"syntropylog-main","message":"Terminating 3 external processes..."}
{"level":"info","timestamp":"2025-07-24T18:03:31.148Z","service":"syntropylog-main","message":"✅ All regex-test processes terminated successfully"}
{"level":"info","timestamp":"2025-07-24T18:03:31.148Z","service":"syntropylog-main","message":"All managers have been shut down."}
{"level":"info","timestamp":"2025-07-24T18:03:31.148Z","service":"syntropylog-main","message":"✅ State changed to SHUTDOWN"}
```

**What this proves:**
- ✅ **Framework initializes correctly** - No configuration errors
- ✅ **Resource cleanup works** - External processes are terminated
- ✅ **Lifecycle management** - Proper state transitions
- ✅ **Integration testing** - Real framework behavior in tests

## Next Steps

1. **Run the tests**: `npm test`
2. **Explore the code**: Look at `src/index.ts` to understand the service
3. **Modify tests**: Try adding your own test cases
4. **Check coverage**: `npm run test:coverage`
5. **Try other examples**: Check examples 29 (Jest) and 30 (Redis context)

## Contributing

When adding new tests:

1. Follow the **Arrange-Act-Assert** pattern
2. Use descriptive test names
3. Focus on **behavior**, not implementation
4. Keep tests simple and readable
5. Use the provided helpers for consistent setup

## Related Examples

- **[Example 29: Testing patterns with Jest](../29-testing-patterns-jest)**
- **[Example 30: Redis context testing](../30-testing-redis-context)**
- **[Example 31: Advanced testing scenarios](../31-advanced-testing)** (Coming Soon)

---

:::tip Remember
The goal is to write tests that are **readable**, **maintainable**, and **focused on business value**. Let the framework handle the complexity, and focus your tests on what matters most: your business logic.
:::

:::info Framework Integration
This example works seamlessly with the published `syntropylog` package. When you install it via npm, the `syntropylog/testing` module will be available automatically.
:::

## For Next AI/Developer

This example shows the SIMPLEST way to test SyntropyLog applications with Vitest:

### 1. Copy This Pattern:
```typescript
// Import
const { createTestHelper } = require('syntropylog/testing');

// Setup  
const testHelper = createTestHelper();

// Inject
const service = new MyService(testHelper.mockSyntropyLog);

// Test
it('should do something', async () => {
  // Arrange
  const data = { ... };
  
  // Act
  const result = await service.method(data);
  
  // Assert
  expect(result).toHaveProperty('expected');
});
```

### 2. Write Simple Tests:
- Test behavior, not implementation
- Use descriptive names: "should create user successfully"
- Follow Arrange-Act-Assert pattern
- Don't test framework internals

### 3. Avoid Common Mistakes:
- Don't test if logging happened (framework responsibility)
- Don't test Redis connections (external dependency)
- Don't use snapshots with random values
- Don't initialize real framework in tests

### 4. Keep It Simple:
- Focus on business logic
- Tests should read like specifications
- Use the mock for everything

### 5. Vitest Specific:
- Use Vitest's built-in matchers
- Leverage async/await naturally
- Use expect().resolves and expect().rejects

This pattern works for ANY SyntropyLog application with Vitest. Just copy and adapt! 

---

## 🚨 For AI Assistants (and other helpful bots)

If you're an AI assistant or helpful bot working on this codebase, here's what you need to know:

### What This Example Does
- Shows how to test SyntropyLog applications with Vitest
- Uses a complete mock that simulates the entire framework
- Focuses on testing business logic, not framework internals

### Key Files to Understand
- `src/index.ts` - The UserService being tested
- `tests/UserService.test.ts` - The actual tests
- `tests/test-helper.ts` - Helper functions for test setup

### Common AI Mistakes to Avoid
1. **Don't try to initialize real SyntropyLog** - Use the mock instead
2. **Don't test framework features** - Test business logic only
3. **Don't create complex test setups** - Use the provided helpers
4. **Don't test external dependencies** - They're mocked for a reason

### When Modifying This Example
- Keep tests simple and focused
- Use the existing patterns as templates
- Don't add unnecessary complexity
- Follow the Arrange-Act-Assert pattern

### If Tests Fail
- Check that you're using the mock correctly
- Ensure you're not trying to access real framework features
- Verify that the service is properly injected with the mock
- Look at the existing working tests as reference

Remember: This is about testing business logic, not the framework. Keep it simple! 