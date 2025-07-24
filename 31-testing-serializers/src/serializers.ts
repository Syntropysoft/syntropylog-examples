/**
 * Custom serializers for different data types
 * 
 * These serializers are extracted from index.ts to make them testable
 */

export const userSerializer = (user: any) => {
  if (!user) return 'null';
  return `User(${user.id || 'unknown'}, ${user.name || 'unnamed'})`;
};

export const orderSerializer = (order: any) => {
  if (!order) return 'null';
  return `Order(${order.id || 'unknown'}, $${order.total || 0})`;
};

export const dateSerializer = (date: any) => {
  if (!date) return 'null';
  if (date instanceof Date) {
    return date.toISOString();
  }
  return String(date);
};

export const errorSerializer = (err: any) => {
  if (err instanceof Error) {
    return `${err.name}: ${err.message}`;
  }
  return String(err);
}; 