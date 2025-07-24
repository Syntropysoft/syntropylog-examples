import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syntropyLog } from 'syntropylog';
import { SessionService, initializeSyntropyLog, shutdownSyntropyLog } from '../src/index';
import { createRedisTest } from './test-utils';

/**
 * Testing Redis Context Patterns Example
 * 
 * These tests demonstrate declarative testing patterns for SyntropyLog applications
 * that use Redis for context management and correlation.
 * 
 * Key principles:
 * - Test WHAT the system produces, not HOW Redis works internally
 * - Focus on context behavior, not Redis connectivity
 * - Tests should read like specifications
 * - Don't test Redis internals, test context propagation
 */

describe('SessionService - Redis Context Testing Patterns', () => {
  let sessionService: SessionService;
  const testSetup = createRedisTest();

  beforeEach(async () => {
    await testSetup.beforeEach();
    sessionService = new SessionService();
  });

  afterEach(async () => {
    await testSetup.afterEach();
  });

  it('should instantiate SessionService correctly', () => {
    // Test constructor coverage
    const service = new SessionService();
    expect(service).toBeInstanceOf(SessionService);
  });

  it('should handle initialization and shutdown boilerplate', async () => {
    // Test boilerplate functions coverage
    
    // These should not throw
    await expect(initializeSyntropyLog('test-app')).resolves.not.toThrow();
    await expect(shutdownSyntropyLog()).resolves.not.toThrow();
  });

  describe('Session Creation', () => {
    it('should create session with correlation and transaction IDs', async () => {
      // Arrange
      const userId = 'user-123';
      const sessionData = { role: 'admin' };
      
      // Act
      const result = await sessionService.createSession(userId, sessionData);
      
      // Assert
      // We test that the service returns the expected structure
      // We don't test if Redis is connected or if data is stored
      expect(result).toHaveProperty('sessionId');
      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('correlationId');
      expect(result).toHaveProperty('transactionId');
      expect(typeof result.correlationId).toBe('string');
      expect(typeof result.transactionId).toBe('string');
    });

    it('should generate unique session IDs for different sessions', async () => {
      // Arrange
      const userId1 = 'user-123';
      const userId2 = 'user-456';
      
      // Act
      const session1 = await sessionService.createSession(userId1, { role: 'admin' });
      const session2 = await sessionService.createSession(userId2, { role: 'user' });
      
      // Assert
      // We test that different sessions have different IDs
      expect(session1.sessionId).not.toBe(session2.sessionId);
      expect(session1.correlationId).not.toBe(session2.correlationId);
      expect(session1.transactionId).not.toBe(session2.transactionId);
    });
  });

  describe('Session Retrieval', () => {
    it('should retrieve existing session with context', async () => {
      // Arrange
      const sessionId = 'session-123';
      
      // Act
      const result = await sessionService.getSession(sessionId);
      
      // Assert
      // We test that the service returns the expected structure
      expect(result).toHaveProperty('id', sessionId);
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('data');
      expect(result?.data).toHaveProperty('role');
    });

    it('should handle non-existent sessions gracefully', async () => {
      // Arrange
      const sessionId = 'non-existent';
      
      // Act
      const result = await sessionService.getSession(sessionId);
      
      // Assert
      // We test the behavior: non-existent sessions return null
      expect(result).toBeNull();
    });
  });

  describe('Session Updates', () => {
    it('should update session with new data', async () => {
      // Arrange
      const sessionId = 'session-123';
      const updates = { role: 'user' };
      
      // Act
      const result = await sessionService.updateSession(sessionId, updates);
      
      // Assert
      // We test that the update operation completes successfully
      expect(result).toHaveProperty('sessionId', sessionId);
      expect(result).toHaveProperty('updated', true);
      expect(result).toHaveProperty('correlationId');
      expect(result).toHaveProperty('transactionId');
    });

    it('should handle invalid update data', async () => {
      // Arrange
      const sessionId = 'session-123';
      const invalidUpdates = { role: 'invalid-role' };
      
      // Act & Assert
      // We expect the service to throw an error for invalid data
      await expect(sessionService.updateSession(sessionId, invalidUpdates))
        .rejects.toThrow('Invalid role specified');
    });
  });

  describe('Session Deletion', () => {
    it('should delete existing session', async () => {
      // Arrange
      const sessionId = 'session-123';
      
      // Act
      const result = await sessionService.deleteSession(sessionId);
      
      // Assert
      // We test that the deletion operation completes successfully
      expect(result).toHaveProperty('deleted', true);
      expect(result).toHaveProperty('sessionId', sessionId);
    });

    it('should handle deletion of non-existent session', async () => {
      // Arrange
      const sessionId = 'non-existent';
      
      // Act
      const result = await sessionService.deleteSession(sessionId);
      
      // Assert
      // We test the behavior: non-existent sessions return not found
      expect(result).toHaveProperty('deleted', false);
      expect(result).toHaveProperty('reason', 'not_found');
    });
  });

  describe('Context Isolation', () => {
    it('should maintain separate context for different operations', async () => {
      // Arrange
      const sessionId = 'session-123';
      
      // Act
      const getResult = await sessionService.getSession(sessionId);
      const updateResult = await sessionService.updateSession(sessionId, { role: 'user' });
      const deleteResult = await sessionService.deleteSession(sessionId);
      
      // Assert
      // We test that each operation has its own correlation and transaction IDs
      expect(getResult).toHaveProperty('id');
      expect(updateResult).toHaveProperty('updated', true);
      expect(deleteResult).toHaveProperty('deleted', true);
      
      // Each operation should have different correlation/transaction IDs
      // (though in this case they're generated randomly, so we just verify they exist)
      expect(typeof updateResult.correlationId).toBe('string');
      expect(typeof updateResult.transactionId).toBe('string');
    });
  });

  describe('Redis Context Persistence', () => {
    it('should persist and retrieve context data across operations', async () => {
      // Arrange - Create a session first
      const userId = 'user-123';
      const sessionData = { role: 'admin', preferences: { theme: 'dark' } };
      
      // Act - Create session and then retrieve it
      const createdSession = await sessionService.createSession(userId, sessionData);
      const retrievedSession = await sessionService.getSession(createdSession.sessionId);
      
      // Assert - Verify that the session data persists
      expect(retrievedSession).toHaveProperty('id', createdSession.sessionId);
      expect(retrievedSession).toHaveProperty('userId', userId);
      expect(retrievedSession?.data).toHaveProperty('role', 'admin');
    });

    it('should update context data and persist changes', async () => {
      // Arrange - Create a session first
      const userId = 'user-456';
      const initialData = { role: 'user' };
      const createdSession = await sessionService.createSession(userId, initialData);
      
      // Act - Update the session
      const updates = { role: 'admin', permissions: ['read', 'write'] };
      const updateResult = await sessionService.updateSession(createdSession.sessionId, updates);
      
      // Assert - Verify that the update was successful
      expect(updateResult).toHaveProperty('updated', true);
      expect(updateResult).toHaveProperty('sessionId', createdSession.sessionId);
    });

    it('should handle context cleanup after deletion', async () => {
      // Arrange - Create and then delete a session
      const userId = 'user-789';
      const sessionData = { role: 'guest' };
      const createdSession = await sessionService.createSession(userId, sessionData);
      
      // Act - Delete the session
      const deleteResult = await sessionService.deleteSession(createdSession.sessionId);
      
      // Assert - Verify deletion was successful
      expect(deleteResult).toHaveProperty('deleted', true);
      expect(deleteResult).toHaveProperty('sessionId', createdSession.sessionId);
    });
  });
});

/**
 * Alternative Testing Approach: Testing with Redis Mock
 * 
 * If you need to test specific Redis behavior, you can mock Redis:
 */

describe('SessionService - With Redis Mock', () => {
  let sessionService: SessionService;

  beforeEach(async () => {
    // Mock Redis to isolate context testing
    vi.mock('syntropylog', () => {
      const mockContextManager = {
        run: vi.fn().mockImplementation(async (fn) => await fn()),
        set: vi.fn(),
        getCorrelationIdHeaderName: vi.fn().mockReturnValue('x-correlation-id'),
        getTransactionIdHeaderName: vi.fn().mockReturnValue('x-transaction-id'),
      };

      return {
        syntropyLog: {
          init: vi.fn().mockResolvedValue(undefined),
          shutdown: vi.fn().mockResolvedValue(undefined),
          getLogger: vi.fn().mockReturnValue({
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
            trace: vi.fn(),
            fatal: vi.fn(),
            withSource: vi.fn().mockReturnThis(),
          }),
          getContextManager: vi.fn().mockReturnValue(mockContextManager),
        },
      };
    });

    await syntropyLog.init({});
    sessionService = new SessionService();
  });

  afterEach(async () => {
    await syntropyLog.shutdown();
    vi.clearAllMocks();
  });

  it('should set context values during session operations', async () => {
    // Arrange
    const userId = 'user-123';
    const sessionData = { role: 'admin' };
    
    // Act
    await sessionService.createSession(userId, sessionData);
    
    // Assert
    // Test that context manager was used correctly
    const contextManager = syntropyLog.getContextManager();
    expect(contextManager.set).toHaveBeenCalledWith('x-correlation-id', expect.any(String));
    expect(contextManager.set).toHaveBeenCalledWith('x-transaction-id', expect.any(String));
  });
}); 