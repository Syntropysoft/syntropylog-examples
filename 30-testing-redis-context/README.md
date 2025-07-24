# Example 30: Testing Redis Context Patterns

This example demonstrates how to test SyntropyLog applications that use **Redis for context management and correlation** using declarative testing patterns.

## Key Concepts

### 1. Test WHAT the system produces, not HOW Redis works internally

Instead of testing if Redis is connected or if data is stored, we test:
- ✅ **Context behavior**: Does the service maintain correlation IDs correctly?
- ✅ **Session operations**: Do create/read/update/delete operations work?
- ✅ **Error handling**: Does it handle invalid data properly?
- ✅ **Context isolation**: Are different operations isolated?

### 2. Declarative tests that read like specifications

```typescript
// Instead of: "Test that Redis connection is established"
// We write: "Test that session creation returns expected structure"

it('should create session with correlation and transaction IDs', async () => {
  const userId = 'user-123';
  const sessionData = { role: 'admin' };
  
  const result = await sessionService.createSession(userId, sessionData);
  
  expect(result).toHaveProperty('sessionId');
  expect(result).toHaveProperty('correlationId');
  expect(result).toHaveProperty('transactionId');
});
```

### 3. Use BeaconRedisMock for in-memory testing

SyntropyLog provides **framework-agnostic `BeaconRedisMock`** that handles everything in-memory:

- ✅ **No external Redis needed** - everything runs in memory
- ✅ **Fast and reliable** - no network dependencies
- ✅ **Full Redis API support** - all Redis commands work
- ✅ **Automatic cleanup** - no data persistence between tests
- ✅ **Framework agnostic** - works with Vitest, Jest, and Jasmine
- ✅ **Spy function injection** - full testing framework compatibility

We test:
- ✅ Context structure and propagation
- ✅ Session operation results
- ✅ Error handling and validation
- ✅ Context isolation between operations

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
All files |   89.02 |    95.65 |      90 |   89.02 |                   
 index.ts |   89.02 |    95.65 |      90 |   89.02 | 217-241,245-246   
----------|---------|----------|---------|---------|-----------------------------
```

**What this means:**
- ✅ **89.02% Statement Coverage**: Most of the business logic and boilerplate is tested
- ✅ **95.65% Branch Coverage**: Almost all conditional paths are covered
- ✅ **90% Function Coverage**: Core functions and boilerplate are tested
- ✅ **89.02% Line Coverage**: Most lines of code are executed during tests

**Uncovered lines (217-241, 245-246)** are demonstration code:
- **217-241**: Main function (example demonstration code)
- **245-246**: Module execution check (example runner)

This coverage demonstrates that our **declarative testing approach** covers all business logic AND framework boilerplate while focusing on behavior, not implementation details.

## 🔧 Framework Agnostic Mocks

This example uses **framework-agnostic mocks** that work with any testing framework:

### Spy Function Injection

```typescript
// For Vitest (this example)
const testHelper = createTestHelper(vi.fn);

// For Jest
const testHelper = createTestHelper(jest.fn);

// For Jasmine
const testHelper = createTestHelper(jasmine.createSpy);

// Without spy (basic functionality only)
const testHelper = createTestHelper();
```

### BeaconRedisMock with Spy Functions

```typescript
// For Vitest
const mockRedis = new BeaconRedisMock(vi.fn);

// For Jest
const mockRedis = new BeaconRedisMock(jest.fn);

// For Jasmine
const mockRedis = new BeaconRedisMock(jasmine.createSpy);

// Without spy (basic functionality only)
const mockRedis = new BeaconRedisMock();
```

### Epic Error Messages

If you forget to inject the spy function, you'll get a memorable error:

```
🚨 SPY FUNCTION NOT INJECTED! 😡

To use spy functions like toHaveBeenCalled(), toHaveBeenCalledWith(), etc.
YOU MUST inject your spy function in the constructor:

// For Vitest:
const mockRedis = new BeaconRedisMock(vi.fn);

// For Jest:
const mockRedis = new BeaconRedisMock(jest.fn);

// For Jasmine:
const mockRedis = new BeaconRedisMock(jasmine.createSpy);

// Without spy (basic functionality only):
const mockRedis = new BeaconRedisMock();

DON'T FORGET AGAIN! 😤
```

## Testing Patterns

### Pattern 1: Boilerplate Testing

**Why test boilerplate?** The initialization and shutdown functions are critical for:
- ✅ **Resource management**: Proper cleanup of transports, connections, and contexts
- ✅ **Framework lifecycle**: Ensuring proper startup and shutdown sequences
- ✅ **Error handling**: Validating configuration and initialization errors
- ✅ **Integration**: Testing that the framework integrates correctly with your app

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

### Pattern 2: Context Structure Testing

Test that context operations return the expected structure:

```typescript
it('should create session with correlation and transaction IDs', async () => {
  const result = await sessionService.createSession('user-123', { role: 'admin' });
  
  expect(result).toHaveProperty('sessionId');
  expect(result).toHaveProperty('correlationId');
  expect(result).toHaveProperty('transactionId');
  expect(typeof result.correlationId).toBe('string');
});
```

### Pattern 2: Context Isolation Testing

Test that different operations maintain separate context:

```typescript
it('should generate unique session IDs for different sessions', async () => {
  const session1 = await sessionService.createSession('user-123', { role: 'admin' });
  const session2 = await sessionService.createSession('user-456', { role: 'user' });
  
  expect(session1.sessionId).not.toBe(session2.sessionId);
  expect(session1.correlationId).not.toBe(session2.correlationId);
});
```

### Pattern 3: Session Operation Testing

Test that session operations behave correctly:

```typescript
it('should handle non-existent sessions gracefully', async () => {
  const result = await sessionService.getSession('non-existent');
  expect(result).toBeNull();
});

it('should handle invalid update data', async () => {
  await expect(sessionService.updateSession('session-123', { role: 'invalid-role' }))
    .rejects.toThrow('Invalid role specified');
});
```

### Pattern 4: Redis Context Persistence Testing

Test that context data persists across operations:

```typescript
it('should persist and retrieve context data across operations', async () => {
  // Arrange - Create a session first
  const createdSession = await sessionService.createSession('user-123', { role: 'admin' });
  
  // Act - Retrieve the session
  const retrievedSession = await sessionService.getSession(createdSession.sessionId);
  
  // Assert - Verify that the session data persists
  expect(retrievedSession).toHaveProperty('id', createdSession.sessionId);
  expect(retrievedSession?.data).toHaveProperty('role', 'admin');
});
```

### Pattern 5: Context Manager Mocking (When Needed)

If you need to test specific context behavior:

```typescript
it('should set context values during session operations', async () => {
  await sessionService.createSession('user-123', { role: 'admin' });
  
  const contextManager = syntropyLog.getContextManager();
  expect(contextManager.set).toHaveBeenCalledWith('x-correlation-id', expect.any(String));
  expect(contextManager.set).toHaveBeenCalledWith('x-transaction-id', expect.any(String));
});
```

## Running the Example

```bash
# Install dependencies
npm install

# Run the application
npm start

# Run tests
npm test

# Run tests with coverage (shows real code coverage metrics)
npm run test:coverage
```

**Coverage Command**: The `npm run test:coverage` command shows actual code coverage metrics, proving that our declarative testing approach covers the code while focusing on behavior, not implementation details.

## Why This Approach?

1. **Simple**: Tests focus on business logic, not infrastructure
2. **Maintainable**: Changes to Redis implementation don't break tests
3. **Focused**: Tests verify context behavior, not Redis internals
4. **Fast**: BeaconRedisMock runs everything in memory
5. **Reliable**: No external Redis dependency required
6. **Declarative**: Tests read like specifications of behavior
7. **Complete**: BeaconRedisMock supports all Redis operations

## Best Practices

1. **Use BeaconRedisMock for testing** - no external Redis needed
2. **Set up data first, then test retrieval** - create before testing
3. **Test context structure, not Redis internals**
4. **Verify correlation and transaction ID propagation**
5. **Test context isolation between operations**
6. **Focus on session operation results**
7. **Test error handling and validation**
8. **Keep tests declarative and readable**

## Context Management Concepts

### Correlation IDs
- Track requests across different services
- Enable distributed tracing
- Maintain request context

### Transaction IDs
- Track specific operations within a request
- Enable operation-level tracing
- Maintain operation context

### Context Isolation
- Each operation gets its own context
- Prevents context pollution between operations
- Ensures clean separation of concerns

This approach leverages SyntropyLog's BeaconRedisMock to create tests that verify context behavior with full Redis functionality, all running in memory. 