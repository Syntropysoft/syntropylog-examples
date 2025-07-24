/**
 * Example 32: Testing Transports Concepts
 * 
 * This test demonstrates the CONCEPTUAL understanding of transports:
 * - Transports are essentially SPIES that capture log entries
 * - How to test them with framework agnostic patterns
 * - How to combine all testing patterns together
 * - Boilerplate testing
 * - Declarative testing patterns
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createTestHelper } from 'syntropylog/testing';
import { NotificationService, initializeSyntropyLog, shutdownSyntropyLog } from '../src/index';

// Create test helper with spy injection for Vitest
const testHelper = createTestHelper(vi.fn);

describe('Transports Concepts - Understanding How Transports Work', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    testHelper.beforeEach();
    notificationService = new NotificationService(testHelper.mockSyntropyLog);
  });

  afterEach(() => {
    testHelper.afterEach();
  });

  describe('Concept 1: Transports Are Spies', () => {
    it('should demonstrate that transports capture log entries', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Test notification';
      const type = 'email' as const;

      // Act
      const result = await notificationService.sendNotification(userId, message, type);

      // Assert
      expect(result).toMatchObject({
        userId,
        message,
        type
      });
      expect(result.notificationId).toBeDefined();

      // The transport (spy) captured the log entries
      // We don't need to test the transport directly - it's a spy!
      // Just verify the service works correctly
      expect(result).toBeDefined();
    });

    it('should show that transports handle different log levels', async () => {
      // Arrange
      const userId = '';
      const message = '';
      const type = 'email' as const;

      // Act & Assert
      await expect(notificationService.sendNotification(userId, message, type))
        .rejects.toThrow('Invalid notification data');

      // The transport captured both info and error logs
      // We don't need to verify the transport - it's just a spy!
    });
  });

  describe('Concept 2: Framework Agnostic Testing', () => {
    it('should work with any spy function (Vitest example)', async () => {
      // This test uses vi.fn() injected via testHelper
      // Same test would work with jest.fn() or jasmine.createSpy()
      
      const result = await notificationService.getNotificationHistory('user-123');
      
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'notif-1',
        message: 'Welcome!',
        type: 'email'
      });
    });

    it('should demonstrate spy function injection pattern', () => {
      // The testHelper.createTestHelper(vi.fn) pattern
      // makes our tests framework agnostic
      
      expect(testHelper.mockSyntropyLog).toBeDefined();
      expect(typeof testHelper.mockSyntropyLog.getLogger).toBe('function');
      
      // Verify we can call the mock functions
      const logger = testHelper.mockSyntropyLog.getLogger();
      expect(logger).toBeDefined();
    });
  });

  describe('Concept 3: Declarative Testing Patterns', () => {
    it('should test business logic, not transport details', async () => {
      // Arrange
      const userId = 'user-123';
      const message = 'Hello world!';
      const type = 'sms' as const;

      // Act
      const result = await notificationService.sendNotification(userId, message, type);

      // Assert - Focus on business logic
      expect(result).toMatchObject({
        userId,
        message,
        type
      });
      expect(result.notificationId).toMatch(/^notif-\d+$/);

      // We DON'T test:
      // - How the transport works internally
      // - What format the logs are in
      // - Whether logs were actually written
    });

    it('should test error scenarios declaratively', async () => {
      // Arrange
      const invalidData = [
        { userId: '', message: 'test', type: 'email' as const },
        { userId: 'user-123', message: '', type: 'sms' as const },
        { userId: null as any, message: 'test', type: 'push' as const }
      ];

      // Act & Assert
      for (const data of invalidData) {
        await expect(notificationService.sendNotification(data.userId, data.message, data.type))
          .rejects.toThrow('Invalid notification data');
      }
    });
  });

  describe('Concept 4: Boilerplate Testing', () => {
    it('should handle initialization and shutdown boilerplate', async () => {
      // Test boilerplate functions coverage
      // These should not throw and should complete successfully
      
      await expect(initializeSyntropyLog('test-app')).resolves.not.toThrow();
      await expect(shutdownSyntropyLog()).resolves.not.toThrow();
    });
  });

  describe('Concept 5: Combining All Patterns', () => {
    it('should demonstrate complete testing workflow', async () => {
      // 1. Framework agnostic setup
      expect(testHelper.mockSyntropyLog).toBeDefined();

      // 2. Declarative business logic testing
      const result = await notificationService.sendNotification('user-123', 'test', 'email');
      expect(result).toHaveProperty('notificationId');

      // 3. Error scenario testing
      await expect(notificationService.sendNotification('', 'test', 'email'))
        .rejects.toThrow();

      // 4. Context management testing
      const history = await notificationService.getNotificationHistory('user-123');
      expect(history).toHaveLength(2);

      // 5. Edge case testing
      const emptyHistory = await notificationService.getNotificationHistory('new-user');
      expect(emptyHistory).toHaveLength(0);

      // The transport (spy) captured all these interactions
      // We don't need to test the transport - it's just a spy!
    });
  });
});

describe('Transports Concepts - Real Framework Behavior', () => {
  it('should show real framework logs during boilerplate testing', async () => {
    // This test shows the actual framework working
    // You'll see real logs in the output
    
    await expect(initializeSyntropyLog('real-framework-test')).resolves.not.toThrow();
    await expect(shutdownSyntropyLog()).resolves.not.toThrow();
  });
});

// FOR NEXT AI/DEVELOPER:
// This example demonstrates the KEY CONCEPT:
// 
// TRANSPORTS = SPIES
// 
// You don't need complex transport mocks because:
// 1. Transports are just functions that receive log entries
// 2. They can be easily spied with vi.fn(), jest.fn(), etc.
// 3. The SyntropyLogMock already handles transport mocking
// 4. Focus on testing business logic, not transport internals
//
// Key takeaways:
// - Use SyntropyLogMock for most testing
// - Inject spy functions for framework agnostic testing
// - Test business logic declaratively
// - Test boilerplate functions
// - Don't over-engineer transport testing 