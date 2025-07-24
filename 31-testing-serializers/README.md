# Example 31: Testing Custom Serializers

This example demonstrates how to test custom serializers using SyntropyLog's testing utilities.

## Key Concepts

- **MockSerializerRegistry**: Mock implementation for testing custom serializers
- **Serializer Configuration**: How to set up and test custom serializers
- **Error Handling**: Testing serializer failures and timeouts
- **Integration Testing**: Testing serializers with the full framework
- **Framework Agnostic**: Works with Vitest, Jest, and Jasmine

## What You'll Learn

1. How to use `MockSerializerRegistry` for testing
2. How to configure custom serializers for specific fields
3. How to test serializer error scenarios
4. How to verify serializer behavior in tests
5. How to inject spy functions for framework compatibility

## Files

- `src/index.ts` - Main application with custom serializers
- `tests/serializer-service.test.ts` - Tests using MockSerializerRegistry
- `tests/example-coverage.test.ts` - Coverage tests for the example

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

This example achieves **100% coverage** on the core serializer logic:

```
% Coverage report from v8
----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------|---------|----------|---------|---------|-------------------
All files       |   19.48 |    94.44 |      80 |   19.48 |                   
 index.ts       |       0 |        0 |       0 |       0 | 1-124             
 serializers.ts |     100 |      100 |     100 |     100 |                   
----------------|---------|----------|---------|---------|-------------------
```

**Key Coverage Metrics:**
- **serializers.ts**: 100% statements, 100% branches, 100% functions, 100% lines
- **Core serializer logic**: Fully tested with all edge cases
- **Error scenarios**: Complete coverage of failure modes
- **Integration tests**: Full framework integration verified
- **Framework agnostic mocks**: All mocks work with Vitest, Jest, and Jasmine

## Testing Patterns

### Framework Agnostic Setup
```typescript
import { MockSerializerRegistry } from 'syntropylog/testing';

// For Vitest
const mockSerializer = new MockSerializerRegistry(vi.fn);

// For Jest
const mockSerializer = new MockSerializerRegistry(jest.fn);

// For Jasmine
const mockSerializer = new MockSerializerRegistry(jasmine.createSpy);

// Without spy (basic functionality only)
const mockSerializer = new MockSerializerRegistry();
```

### Basic Serializer Testing
```typescript
import { MockSerializerRegistry } from 'syntropylog/testing';

const mockSerializer = new MockSerializerRegistry(vi.fn);
mockSerializer.setSerializer('userId', (value) => `USER_${value}`);

const result = await mockSerializer.process({ userId: 123 }, logger);
expect(result.userId).toBe('USER_123');
```

### Error Scenario Testing
```typescript
mockSerializer.setError('userId', new Error('Serializer failed'));
await expect(mockSerializer.process({ userId: 123 }, logger))
  .rejects.toThrow('Serializer failed');
```

### Timeout Testing
```typescript
mockSerializer.setTimeout(10);
await expect(mockSerializer.process({ userId: 123 }, logger))
  .rejects.toThrow('Mock serializer timed out after 10ms.');
```

### Spy Function Testing
```typescript
// With spy injection, you can use all spy methods
expect(mockSerializer.process).toHaveBeenCalled();
expect(mockSerializer.setSerializer).toHaveBeenCalledWith('userId', expect.any(Function));
expect(mockSerializer.process).toHaveBeenCalledTimes(1);
```

## Key Takeaways

- **MockSerializerRegistry** provides complete control over serializer behavior
- **Framework Agnostic** design works with Vitest, Jest, and Jasmine
- **Spy Injection** allows full spy functionality when needed
- **setSerializer()** allows configuring custom serialization logic
- **setError()** and **setTimeout()** enable testing error scenarios
- **reset()** method cleans up configuration between tests
- **Epic Error Messages** guide developers when spy functions aren't injected

## FOR NEXT AI/DEVELOPER

When working with custom serializers in tests:

1. **Inject spy function** in constructor for full spy capabilities:
   ```typescript
   const mockSerializer = new MockSerializerRegistry(vi.fn); // Vitest
   const mockSerializer = new MockSerializerRegistry(jest.fn); // Jest
   const mockSerializer = new MockSerializerRegistry(jasmine.createSpy); // Jasmine
   ```

2. **Use MockSerializerRegistry** instead of real SerializerRegistry
3. **Configure serializers** with setSerializer() for specific test scenarios
4. **Test error cases** with setError() and setTimeout()
5. **Reset between tests** to ensure clean state
6. **Spy on calls** to verify serializer usage with full spy methods
7. **Test integration** with full framework using SyntropyLogMock

## Epic Error Example

If you forget to inject the spy function, you'll get this memorable error:

```
🚨 SPY FUNCTION NOT INJECTED! 😡

To use spy functions like toHaveBeenCalled(), toHaveBeenCalledWith(), etc.
YOU MUST inject your spy function in the constructor:

// For Vitest:
const mockSerializer = new MockSerializerRegistry(vi.fn);

// For Jest:
const mockSerializer = new MockSerializerRegistry(jest.fn);

// For Jasmine:
const mockSerializer = new MockSerializerRegistry(jasmine.createSpy);

// Without spy (basic functionality only):
const mockSerializer = new MockSerializerRegistry();

DON'T FORGET AGAIN! 😤
```

**Important**: If you get the "SPY FUNCTION NOT INJECTED!" error, remember to pass your testing framework's spy function to the constructor!

Remember: The goal is to test serializer behavior without depending on external systems or complex setup, while maintaining framework compatibility. 