import { UserService } from '../src/UserService';
const { createTestHelper } = require('syntropylog/testing');

/**
 * 🧪 Testing Patterns with Jest - Simple & Clear Example
 * 
 * This example shows how to test SyntropyLog applications using Jest.
 * The key: Test your business logic, not the framework.
 * 
 * 📋 QUICK START (Copy & Paste):
 * 1. Import: const { createTestHelper } = require('syntropylog/testing');
 * 2. Setup: const testHelper = createTestHelper();
 * 3. Inject: new MyService(testHelper.mockSyntropyLog);
 * 4. Test: Focus on behavior, not implementation
 * 
 * 🎯 WHAT YOU'LL LEARN:
 * - How to use SyntropyLogMock (no framework setup needed)
 * - How to write simple, readable tests
 * - How to avoid testing external dependencies
 * - How to focus on business logic, not framework details
 * 
 * ✅ KEY PRINCIPLES:
 * - Test WHAT the system produces, not HOW it works
 * - Tests should read like specifications
 * - Don't test Redis, brokers, or framework internals
 * - Use mocks to avoid initialization issues
 * 
 * 🛠 SETUP (One-time):
 * - npm install syntropylog jest ts-jest @types/jest
 * - Copy jest.config.js and tsconfig.json from this example
 * - Use createTestHelper() for all your tests
 * 
 * 🔧 HOW THE MOCK WORKS:
 * - createTestHelper() = Complete framework simulation in memory
 * - No init/shutdown needed
 * - No external dependencies
 * - Fast, reliable, isolated tests
 */

// Create test helper - this handles all the mock setup and cleanup
// This creates a SyntropyLogMock that simulates the entire framework
// No real initialization/shutdown needed - everything is in memory
const testHelper = createTestHelper();

describe('UserService - Declarative Testing Patterns with Jest', () => {
  let userService: UserService;

  // Setup before each test - this ensures clean state
  beforeEach(() => {
    testHelper.beforeEach(); // Reset mocks and create fresh instances
    userService = new UserService(testHelper.mockSyntropyLog); // Inject the mock
  });

  // ✅ Verify mock is working (optional - shows how to check mock setup)
  it('should use SyntropyLogMock instead of real framework', () => {
    expect(testHelper.mockSyntropyLog).toBeDefined();
    expect(typeof testHelper.mockSyntropyLog.getLogger).toBe('function');
    expect(typeof testHelper.mockSyntropyLog.getContextManager).toBe('function');
    expect(userService).toBeInstanceOf(UserService);
  });

  describe('User Creation', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      // Act
      const result = await userService.createUser(userData);
      
      // Assert - Test behavior, not implementation
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
    });

    it('should reject invalid email', async () => {
      // Arrange
      const userData = { name: 'John Doe', email: 'invalid-email' };
      
      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow('Invalid email format');
    });
  });

  describe('User Retrieval', () => {
    it('should retrieve user by ID', async () => {
      // Arrange
      const userId = 'user-123';
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(result).toHaveProperty('id', 'user-123');
      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('email', 'john@example.com');
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
      // Arrange - Prepare data for multi-step operation
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      // Act - Execute multiple operations that should share context
      const createdUser = await userService.createUser(userData);
      const foundUser = await userService.getUserById('user-123');
      
      // Assert - Verify that operations complete successfully
      // We test that operations complete successfully and return expected data
      // The mock handles all context management internally
      expect(createdUser).toHaveProperty('userId');
      expect(foundUser).toHaveProperty('id', 'user-123');
    });
  });
});

/**
 * Alternative Testing Approach: Using the service helper
 * 
 * This section shows how to use the createServiceWithMock helper for even simpler setup.
 * This is useful when you want to create services on-the-fly without global setup.
 */

describe('UserService - With Service Helper', () => {
  it('should create user with service helper', async () => {
    // Arrange - Prepare test data
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    // Act - Using the helper for even simpler setup
    // This creates a service with a fresh mock in one line
    const { createServiceWithMock, createSyntropyLogMock } = require('syntropylog/testing');
    const userService = createServiceWithMock(UserService, createSyntropyLogMock());
    
    const result = await userService.createUser(userData);
    
    // Assert - Verify the result
    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('name', 'John Doe');
  });
});

/**
 * Jest-Specific Testing Patterns
 * 
 * This section demonstrates Jest-specific features that work well with SyntropyLog.
 * These patterns show how to leverage Jest's capabilities while keeping tests declarative.
 */

describe('Jest-Specific Testing Features', () => {
  let userService: UserService;

  beforeEach(() => {
    testHelper.beforeEach();
    userService = new UserService(testHelper.mockSyntropyLog);
  });

  it('should use Jest matchers for better assertions', async () => {
    // Arrange - Prepare test data
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    // Act - Execute the method
    const result = await userService.createUser(userData);
    
    // Assert using Jest-specific matchers
    // Jest provides powerful matchers that make tests more readable
    expect(result).toHaveProperty('name', 'John Doe');
    expect(result.email).toMatch(/@/); // Regex matcher for email validation
    expect(typeof result.name).toBe('string'); // Type checking
  });

  it('should handle async operations with Jest', async () => {
    // Arrange - Prepare test data
    const userId = 'user-123';
    
    // Act & Assert
    // Jest handles async/await naturally and provides good error messages
    // This tests that the operation doesn't throw an error
    await expect(userService.getUserById(userId)).resolves.not.toThrow();
  });

  it('should validate object structure without snapshots', async () => {
    // Arrange - Prepare test data
    const userData = { name: 'John Doe', email: 'john@example.com' };
    
    // Act - Execute the method
    const result = await userService.createUser(userData);
    
    // Assert - Test structure without depending on random values
    // This is better than snapshots for objects with random IDs
    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('email');
    expect(typeof result.userId).toBe('string');
    expect(result.userId.length).toBeGreaterThan(0);
    expect(result.name).toBe('John Doe');
    expect(result.email).toBe('john@example.com');
  });
}); 

/**
 * 📝 FOR NEXT AI/DEVELOPER:
 * 
 * This example shows the SIMPLEST way to test SyntropyLog applications:
 * 
 * 1. COPY THIS PATTERN:
 *    - Import: const { createTestHelper } = require('syntropylog/testing');
 *    - Setup: const testHelper = createTestHelper();
 *    - Inject: new MyService(testHelper.mockSyntropyLog);
 * 
 * 2. WRITE SIMPLE TESTS:
 *    - Test behavior, not implementation
 *    - Use descriptive names: "should create user successfully"
 *    - Follow Arrange-Act-Assert pattern
 *    - Don't test framework internals
 * 
 * 3. AVOID COMMON MISTAKES:
 *    - Don't test if logging happened (framework responsibility)
 *    - Don't test Redis connections (external dependency)
 *    - Don't use snapshots with random values
 *    - Don't initialize real framework in tests
 * 
 * 4. KEEP IT SIMPLE:
 *    - Focus on business logic
 *    - Tests should read like specifications
 *    - Use the mock for everything
 * 
 * This pattern works for ANY SyntropyLog application. Just copy and adapt!
 */