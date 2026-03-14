/**
 * Example 15: Testing Custom Serializers
 *
 * Tests the example's custom serializers and shows how to use
 * createMockLogger from syntropylog/testing when testing code that logs.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createMockLogger } from 'syntropylog/testing';
import {
  userSerializer,
  orderSerializer,
  dateSerializer,
  errorSerializer
} from '../src/serializers';

describe('SerializerService - Testing custom serializers', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    mockLogger = createMockLogger();
  });

  describe('Basic Serialization', () => {
    it('should process user metadata with custom serializer', () => {
      const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
      const result = userSerializer(user);
      expect(result).toBe('User(123, John Doe)');
    });

    it('should handle multiple serializers', () => {
      const user = { id: 456, name: 'Jane Doe', email: 'jane@example.com' };
      const order = { id: 'ORD-456', total: 99.99, items: ['item1', 'item2'] };
      expect(userSerializer(user)).toBe('User(456, Jane Doe)');
      expect(orderSerializer(order)).toBe('Order(ORD-456, $99.99)');
    });

    it('should handle complex objects', () => {
      const user = { id: 789, name: 'Bob Smith', email: 'bob@example.com' };
      const result = userSerializer(user);
      expect(result).toBe('User(789, Bob Smith)');
    });
  });

  describe('Error Handling', () => {
    it('should handle null and undefined values', () => {
      expect(userSerializer(null)).toBe('null');
      expect(userSerializer(undefined)).toBe('null');
      expect(orderSerializer(null)).toBe('null');
      expect(dateSerializer(null)).toBe('null');
    });

    it('should serialize error data correctly', () => {
      const error = new Error('Serializer failed');
      expect(errorSerializer(error)).toBe('Error: Serializer failed');
    });

    it('should handle non-error objects in errorSerializer', () => {
      expect(errorSerializer({ message: 'Not an error' })).toBe('[object Object]');
    });
  });

  describe('Logger integration', () => {
    it('should use mock logger when testing code that logs serialized data', () => {
      const user = { id: 123, name: 'John Doe' };
      const serialized = userSerializer(user);
      expect(() => mockLogger.info('User data', { user: serialized })).not.toThrow();
      expect(serialized).toBe('User(123, John Doe)');
    });

    it('should use mock logger with order serializer', () => {
      const order = { id: 'ORD-1', total: 42.5 };
      const serialized = orderSerializer(order);
      expect(() => mockLogger.info('Order', { order: serialized })).not.toThrow();
      expect(serialized).toBe('Order(ORD-1, $42.5)');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle user data serialization', () => {
      const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
      expect(userSerializer(user)).toBe('User(123, John Doe)');
    });

    it('should handle order data serialization', () => {
      const order = { id: 'ORD-456', total: 99.99, items: ['item1', 'item2'] };
      expect(orderSerializer(order)).toBe('Order(ORD-456, $99.99)');
    });

    it('should serialize date correctly', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      expect(dateSerializer(date)).toBe('2024-01-01T00:00:00.000Z');
    });
  });
});
