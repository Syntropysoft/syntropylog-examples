/**
 * Example 31: Testing Custom Serializers
 * 
 * This test file demonstrates how to use MockSerializerRegistry
 * for testing custom serializers with SyntropyLog.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockSerializerRegistry } from 'syntropylog/testing';
import { createMockLogger } from 'syntropylog/testing';

describe('SerializerService - Testing with MockSerializerRegistry', () => {
  let mockSerializer: MockSerializerRegistry;
  let mockLogger: any;

  beforeEach(() => {
    mockSerializer = new MockSerializerRegistry(vi.fn);
    mockLogger = createMockLogger();
  });

  describe('Basic Serialization', () => {
    it('should process metadata with custom serializer', async () => {
      // Arrange
      const customSerializer = (value: unknown) => `CUSTOM_${String(value)}`;
      mockSerializer.setSerializer('userId', customSerializer);

      const metadata = {
        userId: 123,
        name: 'John Doe',
        email: 'john@example.com'
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.userId).toBe('CUSTOM_123');
      expect(result.name).toBe('John Doe'); // Unchanged
      expect(result.email).toBe('john@example.com'); // Unchanged
    });

    it('should handle multiple serializers', async () => {
      // Arrange
      mockSerializer.setSerializer('userId', (value) => `USER_${value}`);
      mockSerializer.setSerializer('email', (value) => `EMAIL_${value}`);

      const metadata = {
        userId: 456,
        email: 'jane@example.com',
        name: 'Jane Doe'
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.userId).toBe('USER_456');
      expect(result.email).toBe('EMAIL_jane@example.com');
      expect(result.name).toBe('Jane Doe'); // Unchanged
    });

    it('should handle complex objects', async () => {
      // Arrange
      const userSerializer = (user: any) => {
        if (!user) return 'null';
        return `User(${user.id}, ${user.name})`;
      };
      mockSerializer.setSerializer('user', userSerializer);

      const metadata = {
        user: { id: 789, name: 'Bob Smith', email: 'bob@example.com' },
        timestamp: '2024-01-01T00:00:00Z'
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.user).toBe('User(789, Bob Smith)');
      expect(result.timestamp).toBe('2024-01-01T00:00:00Z'); // Unchanged
    });
  });

  describe('Error Handling', () => {
    it('should handle serializer errors gracefully', async () => {
      // Arrange
      const failingSerializer = (value: unknown) => {
        throw new Error('Serializer failed');
      };
      mockSerializer.setSerializer('userId', failingSerializer);

      const metadata = {
        userId: 789,
        name: 'Bob'
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.userId).toBe('[MOCK_SERIALIZER_ERROR: Failed to process key \'userId\']');
      expect(result.name).toBe('Bob'); // Unchanged
    });

    it('should simulate timeout errors', async () => {
      // Arrange
      mockSerializer.setTimeout(10); // 10ms timeout

      const metadata = { userId: 123 };

      // Act & Assert
      await expect(mockSerializer.process(metadata, mockLogger))
        .rejects.toThrow('Mock serializer timed out after 10ms.');
    });

    it('should handle null and undefined values', async () => {
      // Arrange
      const nullSerializer = (value: unknown) => {
        if (value === null) return 'NULL_VALUE';
        if (value === undefined) return 'UNDEFINED_VALUE';
        return String(value);
      };
      mockSerializer.setSerializer('nullableField', nullSerializer);
      mockSerializer.setSerializer('undefinedField', nullSerializer); // Configurar serializer para ambos campos

      const metadata = {
        nullableField: null,
        undefinedField: undefined,
        normalField: 'normal'
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.nullableField).toBe('NULL_VALUE');
      expect(result.undefinedField).toBe('UNDEFINED_VALUE');
      expect(result.normalField).toBe('normal'); // Unchanged
    });
  });

  describe('Spying and Verification', () => {
    it('should track process calls', async () => {
      // Arrange
      const metadata = { userId: 123 };

      // Act
      await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(mockSerializer.process).toHaveBeenCalledWith(metadata, mockLogger);
      expect(mockSerializer.process).toHaveBeenCalledTimes(1);
    });

    it('should track serializer configuration', () => {
      // Arrange
      const customSerializer = (value: unknown) => `CUSTOM_${value}`;

      // Act
      mockSerializer.setSerializer('userId', customSerializer);

      // Assert
      expect(mockSerializer.setSerializer).toHaveBeenCalledWith('userId', customSerializer);
    });

    it('should track error configuration', () => {
      // Arrange
      const error = new Error('Test error');

      // Act
      mockSerializer.setError('userId', error);

      // Assert
      expect(mockSerializer.setError).toHaveBeenCalledWith('userId', error);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to default behavior', async () => {
      // Arrange
      mockSerializer.setSerializer('userId', (value) => `CUSTOM_${value}`);
      const metadata = { userId: 123 };

      // Act
      mockSerializer.reset();
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.userId).toBe(123); // Back to original value
      expect(mockSerializer.reset).toHaveBeenCalled();
    });

    it('should reset after error configuration', async () => {
      // Arrange
      mockSerializer.setError('userId', new Error('Test error'));
      const metadata = { userId: 123 };

      // Act
      mockSerializer.reset();
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.userId).toBe(123); // Back to original value
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle user data serialization', async () => {
      // Arrange
      const userSerializer = (user: any) => {
        if (!user) return 'null';
        return `${user.name} (${user.id})`;
      };
      mockSerializer.setSerializer('user', userSerializer);

      const metadata = {
        user: { id: 123, name: 'John Doe', email: 'john@example.com' },
        action: 'login',
        timestamp: new Date().toISOString()
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.user).toBe('John Doe (123)');
      expect(result.action).toBe('login'); // Unchanged
      expect(result.timestamp).toBeDefined(); // Unchanged
    });

    it('should handle order data serialization', async () => {
      // Arrange
      const orderSerializer = (order: any) => {
        if (!order) return 'null';
        return `Order #${order.id} - $${order.total}`;
      };
      mockSerializer.setSerializer('order', orderSerializer);

      const metadata = {
        order: { id: 'ORD-456', total: 99.99, items: ['item1', 'item2'] },
        customerId: 789
      };

      // Act
      const result = await mockSerializer.process(metadata, mockLogger);

      // Assert
      expect(result.order).toBe('Order #ORD-456 - $99.99');
      expect(result.customerId).toBe(789); // Unchanged
    });
  });
});

/**
 * FOR NEXT AI/DEVELOPER
 * 
 * When testing custom serializers:
 * 
 * 1. **Use MockSerializerRegistry** instead of real SerializerRegistry
 * 2. **Configure serializers** with setSerializer() for specific test scenarios
 * 3. **Test error cases** with setError() and setTimeout()
 * 4. **Reset between tests** to ensure clean state
 * 5. **Spy on calls** to verify serializer usage
 * 6. **Test edge cases** like null, undefined, and complex objects
 * 7. **Verify unchanged fields** remain unmodified
 * 
 * Remember: The goal is to test serializer behavior without depending on external systems.
 */ 