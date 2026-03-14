/**
 * Example Coverage Test
 * 
 * This test covers the main functions in the example to improve coverage.
 * It's designed to be skipped in normal runs but can be enabled for coverage analysis.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { userSerializer, orderSerializer, dateSerializer, errorSerializer } from '../src/serializers';
import { initializeSyntropyLog, gracefulShutdown } from '../src/index';

describe('Example Coverage Tests', () => {
  beforeEach(() => {
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Custom Serializers', () => {
    it('should serialize user data correctly', () => {
      const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
      const result = userSerializer(user);
      expect(result).toBe('User(123, John Doe)');
    });

    it('should handle null user data', () => {
      const result = userSerializer(null);
      expect(result).toBe('null');
    });

    it('should handle user with missing fields', () => {
      const user = { email: 'john@example.com' };
      const result = userSerializer(user);
      expect(result).toBe('User(unknown, unnamed)');
    });

    it('should serialize order data correctly', () => {
      const order = { id: 'ORD-456', total: 99.99, items: ['item1', 'item2'] };
      const result = orderSerializer(order);
      expect(result).toBe('Order(ORD-456, $99.99)');
    });

    it('should handle null order data', () => {
      const result = orderSerializer(null);
      expect(result).toBe('null');
    });

    it('should handle order with missing fields', () => {
      const order = { items: ['item1'] };
      const result = orderSerializer(order);
      expect(result).toBe('Order(unknown, $0)');
    });

    it('should serialize date data correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = dateSerializer(date);
      expect(result).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should handle string date', () => {
      const date = '2024-01-01';
      const result = dateSerializer(date);
      expect(result).toBe('2024-01-01');
    });

    it('should handle null date', () => {
      const result = dateSerializer(null);
      expect(result).toBe('null');
    });

    it('should serialize error data correctly', () => {
      const error = new Error('Something went wrong');
      const result = errorSerializer(error);
      expect(result).toBe('Error: Something went wrong');
    });

    it('should handle non-error objects', () => {
      const obj = { message: 'Not an error' };
      const result = errorSerializer(obj);
      expect(result).toBe('[object Object]');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complex data with multiple serializers', () => {
      const user = { id: 123, name: 'John Doe' };
      const order = { id: 'ORD-456', total: 99.99 };
      const date = new Date('2024-01-01T00:00:00.000Z');
      const error = new Error('Test error');

      const userResult = userSerializer(user);
      const orderResult = orderSerializer(order);
      const dateResult = dateSerializer(date);
      const errorResult = errorSerializer(error);

      expect(userResult).toBe('User(123, John Doe)');
      expect(orderResult).toBe('Order(ORD-456, $99.99)');
      expect(dateResult).toBe('2024-01-01T00:00:00.000Z');
      expect(errorResult).toBe('Error: Test error');
    });

    it('should handle edge cases with all serializers', () => {
      // Test with undefined values
      expect(userSerializer(undefined)).toBe('null');
      expect(orderSerializer(undefined)).toBe('null');
      expect(dateSerializer(undefined)).toBe('null');

      // Test with empty objects
      expect(userSerializer({})).toBe('User(unknown, unnamed)');
      expect(orderSerializer({})).toBe('Order(unknown, $0)');

      // Test with non-date objects
      expect(dateSerializer({ notADate: true })).toBe('[object Object]');
    });
  });
});

// FOR NEXT AI/DEVELOPER:
// This test file is designed to improve coverage of the example code.
// The main functions in index.ts are not easily testable because they:
// 1. Initialize SyntropyLog (which requires real setup)
// 2. Handle process signals (which are hard to mock)
// 3. Use console.log/error (which we mock to avoid noise)
//
// To improve coverage further, you could:
// 1. Extract the main logic into separate functions
// 2. Create integration tests that actually initialize SyntropyLog
// 3. Mock the process signals for testing shutdown scenarios
//
// For now, this test covers the custom serializers which are the core
// functionality demonstrated in the example.

// Boilerplate Testing
describe('Framework Boilerplate Testing', () => {
  it('should handle initialization and shutdown boilerplate', async () => {
    // Test boilerplate functions coverage
    // These should not throw and should complete successfully
    
    await expect(initializeSyntropyLog()).resolves.not.toThrow();
    await expect(gracefulShutdown()).resolves.not.toThrow();
  });
}); 