# Example 16: Testing Transports Concepts

This example demonstrates the **CONCEPTUAL understanding** of transports in SyntropyLog and how to test them effectively. The key insight: **Transports are essentially SPIES**.

## 🎯 Key Concept: Transports = Spies

**Transports are just functions that receive log entries.** They don't need complex mocks because:

1. **They're already spies** - They capture log entries for you
2. **SyntropyLogMock handles them** - No need for separate transport mocks
3. **Focus on business logic** - Don't test transport internals
4. **Use existing spy functions** - `vi.fn()`, `jest.fn()`, `jasmine.createSpy()`

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 Code Coverage

This example demonstrates **comprehensive coverage** combining all patterns:

```bash
npm run test:coverage
```

**Coverage Results:**
```
----------|---------|----------|---------|---------|-----------------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s           
----------|---------|----------|---------|---------|-----------------------------
All files |   85.71 |    92.85 |   85.71 |   85.71 |                   
 index.ts |   85.71 |    92.85 |   85.71 |   85.71 | 121-144,148-149   
----------|---------|----------|---------|---------|-----------------------------
```

**What this means:**
- ✅ **85.71% Statement Coverage**: Business logic and boilerplate tested
- ✅ **92.85% Branch Coverage**: Almost all conditional paths covered
- ✅ **85.71% Function Coverage**: Core functions and boilerplate tested
- ✅ **85.71% Line Coverage**: Most lines executed during tests

**Uncovered lines (121-144, 148-149)** are demonstration code:
- **121-144**: Main function (example demonstration code)
- **148-149**: Module execution check (example runner)

## 🧠 Conceptual Understanding

### Concept 1: Transports Are Spies

```typescript
// ❌ DON'T create complex transport mocks
const mockTransport = {
  log: vi.fn(),
  format: vi.fn(),
  write: vi.fn()
};

// ✅ DO use SyntropyLogMock - it handles transports for you
const testHelper = createTestHelper(vi.fn);
const service = new NotificationService(testHelper.mockSyntropyLog);
```

### Concept 2: Framework Agnostic Testing

```typescript
// Works with any spy function
const testHelper = createTestHelper(vi.fn);     // Vitest
const testHelper = createTestHelper(jest.fn);   // Jest
const testHelper = createTestHelper(jasmine.createSpy); // Jasmine
```

### Concept 3: Declarative Testing

```typescript
// ✅ Test business logic
it('should send notification successfully', async () => {
  const result = await service.sendNotification('user-123', 'Hello', 'email');
  expect(result).toMatchObject({
    userId: 'user-123',
    message: 'Hello',
    type: 'email'
  });
});

// ❌ DON'T test transport internals
it('should log to transport', async () => {
  // Don't test how transports work internally
});
```

### Concept 4: Boilerplate Testing

```typescript
it('should handle initialization and shutdown boilerplate', async () => {
  await expect(initializeSyntropyLog('test-app')).resolves.not.toThrow();
  await expect(shutdownSyntropyLog()).resolves.not.toThrow();
});
```

## 🎯 What You'll Learn

- **Transports are spies** - No need for complex mocks
- **Framework agnostic testing** - Works with any test runner
- **Declarative testing patterns** - Focus on behavior, not implementation
- **Boilerplate testing** - Test initialization and shutdown
- **Combining all patterns** - Complete testing workflow

## 🔧 Testing Patterns

### Pattern 1: Transport Concepts

**Why transports don't need complex mocks:**
- ✅ **They're already spies** - Capture log entries automatically
- ✅ **SyntropyLogMock handles them** - No separate setup needed
- ✅ **Focus on business logic** - Don't test transport internals
- ✅ **Use existing spy functions** - `vi.fn()`, `jest.fn()`, etc.

```typescript
it('should demonstrate that transports capture log entries', async () => {
  const result = await service.sendNotification('user-123', 'test', 'email');
  
  // The transport (spy) captured the log entries
  // We don't need to test the transport directly - it's a spy!
  expect(testHelper.mockSyntropyLog.getLogger).toHaveBeenCalled();
});
```

### Pattern 2: Framework Agnostic Setup

```typescript
// Create test helper with spy injection
const testHelper = createTestHelper(vi.fn);

beforeEach(() => {
  testHelper.beforeEach();
  service = new NotificationService(testHelper.mockSyntropyLog);
});
```

### Pattern 3: Declarative Business Logic Testing

```typescript
it('should test business logic, not transport details', async () => {
  const result = await service.sendNotification('user-123', 'Hello', 'sms');
  
  // Assert - Focus on business logic
  expect(result).toMatchObject({
    userId: 'user-123',
    message: 'Hello',
    type: 'sms'
  });
  
  // We DON'T test:
  // - How the transport works internally
  // - What format the logs are in
  // - Whether logs were actually written
});
```

### Pattern 4: Error Scenario Testing

```typescript
it('should test error scenarios declaratively', async () => {
  const invalidData = [
    { userId: '', message: 'test', type: 'email' as const },
    { userId: 'user-123', message: '', type: 'sms' as const }
  ];

  for (const data of invalidData) {
    await expect(service.sendNotification(data.userId, data.message, data.type))
      .rejects.toThrow('Invalid notification data');
  }
});
```

### Pattern 5: Complete Workflow Testing

```typescript
it('should demonstrate complete testing workflow', async () => {
  // 1. Framework agnostic setup
  expect(testHelper.mockSyntropyLog).toBeDefined();

  // 2. Declarative business logic testing
  const result = await service.sendNotification('user-123', 'test', 'email');
  expect(result).toHaveProperty('notificationId');

  // 3. Error scenario testing
  await expect(service.sendNotification('', 'test', 'email'))
    .rejects.toThrow();

  // 4. Context management testing
  const history = await service.getNotificationHistory('user-123');
  expect(history).toHaveLength(2);

  // 5. Edge case testing
  const emptyHistory = await service.getNotificationHistory('new-user');
  expect(emptyHistory).toHaveLength(0);

  // The transport (spy) captured all these interactions
  // We don't need to test the transport - it's just a spy!
});
```

## 🎯 Real Framework Behavior

When you run the boilerplate tests, you'll see the actual framework working:

```bash
npm run test:coverage
```

**Output shows real framework lifecycle:** init and shutdown logs (e.g. "SyntropyLog framework initialized successfully", "LifecycleManager.shutdown() called", "State changed to SHUTDOWN").

## 🚫 What NOT to Do

### 1. Don't Create Complex Transport Mocks

❌ **Don't do this:**
```typescript
const mockTransport = {
  log: vi.fn(),
  format: vi.fn(),
  write: vi.fn(),
  flush: vi.fn()
};
```

✅ **Do this instead:**
```typescript
const testHelper = createTestHelper(vi.fn);
// SyntropyLogMock handles transports for you
```

### 2. Don't Test Transport Internals

❌ **Don't do this:**
```typescript
it('should log to transport', async () => {
  // Testing transport internals - framework responsibility
});
```

✅ **Do this instead:**
```typescript
it('should send notification successfully', async () => {
  const result = await service.sendNotification('user-123', 'Hello', 'email');
  expect(result).toHaveProperty('notificationId');
});
```

### 3. Don't Over-Engineer Transport Testing

❌ **Don't do this:**
```typescript
// Complex transport setup
const transport = new MockTransport();
transport.setup();
transport.expectLog();
```

✅ **Do this instead:**
```typescript
// Simple spy injection
const testHelper = createTestHelper(vi.fn);
// Focus on business logic testing
```

## 🎯 Key Takeaways

1. **Transports = Spies** - They capture log entries automatically
2. **Use SyntropyLogMock** - It handles transport mocking for you
3. **Inject spy functions** - For framework agnostic testing
4. **Test business logic** - Not transport internals
5. **Test boilerplate** - Initialization and shutdown functions
6. **Keep it simple** - Don't over-engineer transport testing

## Next Steps

- **Example 13**: Testing patterns with Vitest
- **Example 14**: Testing patterns with Jest
- **Example 15**: Custom serializers testing

This example combines all patterns into a comprehensive understanding of how to test SyntropyLog applications effectively. 