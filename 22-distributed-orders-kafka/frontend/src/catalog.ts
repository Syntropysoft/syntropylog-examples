import type { Product } from './types';

// SKUs match the inventory service seed. SKU-WATCH is seeded at 0 → out of stock.
export const CATALOG: Product[] = [
  { sku: 'SKU-LAPTOP', name: 'Laptop Pro 16"', price: 1500, emoji: '💻' },
  { sku: 'SKU-PHONE', name: 'Phone X', price: 999, emoji: '📱' },
  { sku: 'SKU-HEADPHONES', name: 'Noise-Cancel Headphones', price: 199, emoji: '🎧' },
  { sku: 'SKU-WATCH', name: 'Smart Watch', price: 450, emoji: '⌚', note: 'out of stock (demo)' },
];
