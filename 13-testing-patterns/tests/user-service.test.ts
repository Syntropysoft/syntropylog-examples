/**
 * Example 28: Testing Patterns with Vitest
 * 
 * This test file demonstrates declarative testing patterns
 * using SyntropyLog's testing utilities with Vitest.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestHelper } from 'syntropylog/testing';
import { UserService, initializeSyntropyLog, shutdownSyntropyLog } from '../src/index';

// Create test helper with spy injection for Vitest
const testHelper = createTestHelper(vi.fn);

describe('UserService - Declarative Testing Patterns with Vitest', () => {
  let userService: UserService;

  beforeEach(() => {
    testHelper.beforeEach();
    userService = new UserService(testHelper.mockSyntropyLog);
  });

  afterEach(() => {
    testHelper.afterEach();
  });

  describe('User Creation', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Act
      const result = await userService.createUser(userData);

      // Assert
      expect(result).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com'
      });
      expect(result.userId).toBeDefined();
      expect(typeof result.userId).toBe('string');
    });

    it('should reject invalid email', async () => {
      // Arrange
      const userData = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      // Act & Assert
      await expect(userService.createUser(userData))
        .rejects.toThrow('Invalid email format');
    });
  });

  describe('User Retrieval', () => {
    it('should retrieve user by ID', async () => {
      // Arrange
      const userId = 'user-123';

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toMatchObject({
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should return null for non-existent user', async () => {
      // Arrange
      const userId = 'non-existent';

      // Act
      const result = await userService.getUserById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Context Management', () => {
    it('should maintain correlation context across operations', async () => {
      // Arrange
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      // Act
      const user = await userService.createUser(userData);
      const retrievedUser = await userService.getUserById(user.userId);

      // Assert
      expect(user).toBeDefined();
      expect(retrievedUser).toBeDefined();
      
      // Verify that context manager was used
      expect(testHelper.mockSyntropyLog.getContextManager).toHaveBeenCalled();
    });
  });
});

describe('UserService - With Service Helper', () => {
  beforeEach(() => {
    testHelper.beforeEach();
  });

  afterEach(() => {
    testHelper.afterEach();
  });

  it('should create user with service helper', async () => {
    // Arrange
    const userService = new UserService(testHelper.mockSyntropyLog);
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };

    // Act
    const result = await userService.createUser(userData);

    // Assert
    expect(result).toMatchObject(userData);
    expect(result.userId).toBeDefined();
  });
});

describe('Vitest-Specific Testing Features', () => {
  beforeEach(() => {
    testHelper.beforeEach();
  });

  afterEach(() => {
    testHelper.afterEach();
  });

  it('should use Vitest matchers for better assertions', async () => {
    // Arrange
    const userService = new UserService(testHelper.mockSyntropyLog);
    const userData = {
      name: 'Vitest User',
      email: 'vitest@example.com'
    };

    // Act
    const result = await userService.createUser(userData);

    // Assert using Vitest matchers
    expect(result).toEqual(
      expect.objectContaining({
        name: 'Vitest User',
        email: 'vitest@example.com',
        userId: expect.any(String)
      })
    );
  });

  it('should handle async operations with Vitest', async () => {
    // Arrange
    const userService = new UserService(testHelper.mockSyntropyLog);
    const userData = {
      name: 'Async User',
      email: 'async@example.com'
    };

    // Act & Assert
    await expect(userService.createUser(userData)).resolves.toBeDefined();
    await expect(userService.getUserById('user-123')).resolves.toBeDefined();
  });

  it('should validate object structure without snapshots', async () => {
    // Arrange
    const userService = new UserService(testHelper.mockSyntropyLog);
    const userData = {
      name: 'Structure User',
      email: 'structure@example.com'
    };

    // Act
    const result = await userService.createUser(userData);

    // Assert structure without snapshots
    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('email');
    expect(typeof result.userId).toBe('string');
    expect(typeof result.name).toBe('string');
    expect(typeof result.email).toBe('string');
  });
});

// Tests for coverage improvement
describe('Coverage Tests', () => {
  it('should test UserService constructor with default parameter', () => {
    // Test constructor with default syntropyLog instance
    const userService = new UserService();
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should test UserService constructor with custom instance', () => {
    // Test constructor with custom instance
    const mockInstance = { getLogger: vi.fn(), getContextManager: vi.fn() };
    const userService = new UserService(mockInstance);
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should test logger and context manager lazy initialization', async () => {
    // Test that logger and context manager are initialized lazily
    const mockInstance = {
      getLogger: vi.fn().mockReturnValue({ info: vi.fn(), warn: vi.fn() }),
      getContextManager: vi.fn().mockReturnValue({
        run: vi.fn().mockImplementation(async (fn) => await fn()),
        set: vi.fn(),
        getCorrelationIdHeaderName: vi.fn().mockReturnValue('x-correlation-id')
      })
    };
    
    const userService = new UserService(mockInstance);
    
    // Initially, logger and context manager should not be called
    expect(mockInstance.getLogger).not.toHaveBeenCalled();
    expect(mockInstance.getContextManager).not.toHaveBeenCalled();
    
    // After calling a method, they should be initialized
    await userService.createUser({ name: 'Test', email: 'test@example.com' });
    
    expect(mockInstance.getLogger).toHaveBeenCalled();
    expect(mockInstance.getContextManager).toHaveBeenCalled();
  });
});

// Boilerplate Testing
describe('Framework Boilerplate Testing', () => {
  it('should handle initialization and shutdown boilerplate', async () => {
    // Test boilerplate functions coverage
    // These should not throw and should complete successfully
    
    await expect(initializeSyntropyLog('test-app')).resolves.not.toThrow();
    await expect(shutdownSyntropyLog()).resolves.not.toThrow();
  });
}); 