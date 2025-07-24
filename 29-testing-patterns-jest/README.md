# Example 29: Testing Patterns with Jest

This example demonstrates how to write **declarative, behavior-focused tests** for SyntropyLog applications using Jest. The key insight is to avoid testing the framework itself and instead focus on testing your business logic.

## 🎯 What You'll Learn

- How to use **framework-agnostic mocks** that work with Jest, Vitest, and Jasmine
- How to inject spy functions for full testing framework compatibility
- How to write tests that focus on **behavior**, not implementation
- How to use Jest-specific features with SyntropyLog
- How to avoid testing external dependencies (Redis, brokers, etc.)
- How to create maintainable and readable tests

## 🚀 Quick Start

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

This example demonstrates **perfect code coverage** with our testing approach:

```bash
npm run test:coverage
```

**Coverage Results:**
```
----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
----------------|---------|----------|---------|---------|-------------------
All files       |     100 |      100 |     100 |     100 |                   
 UserService.ts |     100 |      100 |     100 |     100 |                   
----------------|---------|----------|---------|---------|-------------------
```

**What this means:**
- ✅ **100% Statement Coverage**: Every line of business logic is tested
- ✅ **100% Branch Coverage**: Every conditional path is covered
- ✅ **100% Function Coverage**: Every function is tested
- ✅ **100% Line Coverage**: Every line of code is executed during tests

This **perfect coverage** demonstrates that our **agnostic testing approach** with framework-agnostic mocks achieves complete code coverage while focusing on behavior, not implementation details. The example shows how to extract business logic into separate modules for optimal testability.

## 📋 Prerequisites

- Node.js 18+ (using nvm: `source ~/.nvm/nvm.sh`)
- npm or yarn
- Basic knowledge of Jest and TypeScript

## 🔧 Framework Agnostic Mocks

This example uses **framework-agnostic mocks** that work with any testing framework:

### Spy Function Injection

```typescript
// For Jest (this example)
const testHelper = createTestHelper(jest.fn);

// For Vitest
const testHelper = createTestHelper(vi.fn);

// For Jasmine
const testHelper = createTestHelper(jasmine.createSpy);

// Without spy (basic functionality only)
const testHelper = createTestHelper();
```

### Epic Error Messages

If you forget to inject the spy function, you'll get a memorable error:

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

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install syntropylog jest ts-jest @types/jest typescript
```

### 2. Configure Jest

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!tests/**/*'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: [],
  moduleFileExtensions: ['ts', 'js', 'json']
};
```

### 3. Configure TypeScript

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
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
    "types": ["jest", "node"]
  },
  "include": ["src/**/*", "tests/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## 🎭 Agnostic Mocks

This example uses **agnostic mocks** from `syntropylog/testing` that work seamlessly with both Jest and Vitest:

- **No framework conflicts**: The mocks are designed to work with any testing framework
- **Consistent API**: Same mock interface regardless of your testing framework
- **Easy migration**: Switch between Jest and Vitest without changing your mocks

Available mocks:
- `MockBrokerAdapter` - For testing message brokers
- `MockHttpClient` - For testing HTTP clients  
- `MockSerializerRegistry` - For testing custom serializers
- `BeaconRedisMock` - For testing Redis operations

## 🧪 Testing Patterns

### 1. Basic Test Setup

```typescript
import { UserService } from '../src/UserService';
const { createTestHelper } = require('syntropylog/testing');

// Create test helper - handles all mock setup and cleanup
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
    
    // Assert
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

## 🎯 Key Principles

### 1. Test Behavior, Not Implementation

✅ **Good**: Test what the system produces
```typescript
it('should return user with correct data', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
  expect(result.name).toBe('John Doe');
});
```

❌ **Avoid**: Testing internal framework details
```typescript
// Don't test if logging happened - that's framework responsibility
it('should log user creation', async () => {
  // This tests the framework, not your business logic
});
```

### 2. Focus on Business Logic

✅ **Good**: Test business rules
```typescript
it('should reject invalid email', async () => {
  await expect(userService.createUser({ email: 'invalid' }))
    .rejects.toThrow('Invalid email format');
});
```

### 3. Use Descriptive Test Names

✅ **Good**: Tests read like specifications
```typescript
it('should handle non-existent user gracefully', async () => {
  const result = await userService.getUserById('non-existent');
  expect(result).toBeNull();
});
```

## 🛠 Jest-Specific Features

### 1. Powerful Matchers

```typescript
it('should use Jest matchers', async () => {
  const result = await userService.createUser(userData);
  
  expect(result).toHaveProperty('name', 'John Doe');
  expect(result.email).toMatch(/@/); // Regex matcher
  expect(typeof result.name).toBe('string'); // Type checking
});
```

### 2. Async Testing

```typescript
it('should handle async operations', async () => {
  // Jest handles async/await naturally
  await expect(userService.getUserById('user-123'))
    .resolves.not.toThrow();
});
```

### 3. Snapshots

```typescript
it('should match snapshot', async () => {
  const result = await userService.createUser(userData);
  expect(result).toMatchSnapshot();
});
```

## 🔍 What's Being Tested

### ✅ What We Test

- **Business Logic**: User creation, validation, retrieval
- **Error Handling**: Invalid inputs, edge cases
- **Data Structures**: Return values, object properties
- **Async Operations**: Promise resolution, error rejection

### ❌ What We Don't Test

- **Framework Features**: Logging, context management, Redis operations
- **External Dependencies**: Database connections, HTTP calls
- **Implementation Details**: Internal method calls, private properties

## 🚨 Common Pitfalls

### 1. Testing Framework Instead of Business Logic

```typescript
// ❌ Don't do this
it('should log user creation', async () => {
  // Testing if logging happened - framework responsibility
});

// ✅ Do this instead
it('should create user successfully', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
});
```

### 2. Testing External Dependencies

```typescript
// ❌ Don't do this
it('should connect to Redis', async () => {
  // Testing Redis connection - external dependency
});

// ✅ Do this instead
it('should handle user data correctly', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
});
```

### 3. Over-Complicated Setup

```typescript
// ❌ Don't do this
beforeEach(async () => {
  // Complex setup with real framework initialization
  await syntropyLog.initialize();
  // ... more setup
});

// ✅ Do this instead
beforeEach(() => {
  testHelper.beforeEach(); // Simple, clean setup
  userService = new UserService(testHelper.mockSyntropyLog);
});
```

## 📚 Next Steps

1. **Run the tests**: `npm test`
2. **Explore the code**: Look at `src/index.ts` to understand the service
3. **Modify tests**: Try adding your own test cases
4. **Check coverage**: `npm run test:coverage`
5. **Try other examples**: Check examples 28 (Vitest) and 30 (Redis context)

## 🤝 Contributing

When adding new tests:

1. Follow the **Arrange-Act-Assert** pattern
2. Use descriptive test names
3. Focus on **behavior**, not implementation
4. Keep tests simple and readable
5. Use the provided helpers for consistent setup

## 📖 Related Examples

- **Example 28**: Testing patterns with Vitest
- **Example 30**: Redis context testing
- **Example 31**: Advanced testing scenarios

---

**Remember**: The goal is to write tests that are **readable**, **maintainable**, and **focused on business value**. Let the framework handle the complexity, and focus your tests on what matters most: your business logic. 