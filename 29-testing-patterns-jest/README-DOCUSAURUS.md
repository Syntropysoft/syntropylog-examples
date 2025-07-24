---
id: testing-patterns-jest
title: Testing Patterns with Jest
sidebar_label: Jest Testing Patterns
description: Learn how to write declarative, behavior-focused tests for SyntropyLog applications using Jest
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

This example demonstrates how to write **declarative, behavior-focused tests** for SyntropyLog applications using Jest. The key insight is to avoid testing the framework itself and instead focus on testing your business logic.

## 🎯 What You'll Learn

- How to use `SyntropyLogMock` to avoid framework initialization issues
- How to write tests that focus on **behavior**, not implementation
- How to use Jest-specific features with SyntropyLog
- How to avoid testing external dependencies (Redis, brokers, etc.)
- How to create maintainable and readable tests

## 🚀 Quick Start

<Tabs>
<TabItem value="install" label="Install Dependencies" default>

```bash
npm install
```

</TabItem>
<TabItem value="test" label="Run Tests">

```bash
npm test
```

</TabItem>
<TabItem value="watch" label="Watch Mode">

```bash
npm run test:watch
```

</TabItem>
<TabItem value="coverage" label="Coverage">

```bash
npm run test:coverage
```

</TabItem>
</Tabs>

## 📋 Prerequisites

- Node.js 18+ (using nvm: `source ~/.nvm/nvm.sh`)
- npm or yarn
- Basic knowledge of Jest and TypeScript

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

## 🧪 Testing Patterns

### 1. Basic Test Setup

```typescript
import { UserService } from '../src/index';
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

<Tabs>
<TabItem value="good" label="✅ Good" default>

Test what the system produces

```typescript
it('should return user with correct data', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
  expect(result.name).toBe('John Doe');
});
```

</TabItem>
<TabItem value="bad" label="❌ Avoid">

Testing internal framework details

```typescript
// Don't test if logging happened - that's framework responsibility
it('should log user creation', async () => {
  // This tests the framework, not your business logic
});
```

</TabItem>
</Tabs>

### 2. Focus on Business Logic

```typescript
it('should reject invalid email', async () => {
  await expect(userService.createUser({ email: 'invalid' }))
    .rejects.toThrow('Invalid email format');
});
```

### 3. Use Descriptive Test Names

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

<Tabs>
<TabItem value="test" label="✅ What We Test" default>

- **Business Logic**: User creation, validation, retrieval
- **Error Handling**: Invalid inputs, edge cases
- **Data Structures**: Return values, object properties
- **Async Operations**: Promise resolution, error rejection

</TabItem>
<TabItem value="dont" label="❌ What We Don't Test">

- **Framework Features**: Logging, context management, Redis operations
- **External Dependencies**: Database connections, HTTP calls
- **Implementation Details**: Internal method calls, private properties

</TabItem>
</Tabs>

## 🚨 Common Pitfalls

### 1. Testing Framework Instead of Business Logic

<Tabs>
<TabItem value="bad" label="❌ Don't do this" default>

```typescript
it('should log user creation', async () => {
  // Testing if logging happened - framework responsibility
});
```

</TabItem>
<TabItem value="good" label="✅ Do this instead">

```typescript
it('should create user successfully', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
});
```

</TabItem>
</Tabs>

### 2. Testing External Dependencies

<Tabs>
<TabItem value="bad" label="❌ Don't do this" default>

```typescript
it('should connect to Redis', async () => {
  // Testing Redis connection - external dependency
});
```

</TabItem>
<TabItem value="good" label="✅ Do this instead">

```typescript
it('should handle user data correctly', async () => {
  const result = await userService.createUser(userData);
  expect(result).toHaveProperty('userId');
});
```

</TabItem>
</Tabs>

### 3. Over-Complicated Setup

<Tabs>
<TabItem value="bad" label="❌ Don't do this" default>

```typescript
beforeEach(async () => {
  // Complex setup with real framework initialization
  await syntropyLog.initialize();
  // ... more setup
});
```

</TabItem>
<TabItem value="good" label="✅ Do this instead">

```typescript
beforeEach(() => {
  testHelper.beforeEach(); // Simple, clean setup
  userService = new UserService(testHelper.mockSyntropyLog);
});
```

</TabItem>
</Tabs>

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

- **[Example 28: Testing patterns with Vitest](./28-testing-patterns-vitest)**
- **[Example 30: Redis context testing](./30-redis-context-testing)**
- **[Example 31: Advanced testing scenarios](./31-advanced-testing)**

---

:::tip Remember
The goal is to write tests that are **readable**, **maintainable**, and **focused on business value**. Let the framework handle the complexity, and focus your tests on what matters most: your business logic.
:::

:::info Framework Integration
This example works seamlessly with the published `syntropylog` package. When you install it via npm, the `syntropylog/testing` module will be available automatically.
::: 