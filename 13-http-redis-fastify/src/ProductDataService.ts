// =================================================================
//  ProductDataService.ts - Data Layer for Products
//  RESPONSIBILITY: Handle product data operations and Redis caching
// =================================================================

import { ILogger, IBeaconRedis } from 'syntropylog';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: Date;
}

export class ProductDataService {
  private readonly logger: ILogger;
  private readonly redis: IBeaconRedis;
  private readonly cacheTTL = 30; // ✅ 30 seconds cache to avoid Christmas tree effect

  constructor(redis: IBeaconRedis, logger: ILogger) {
    this.redis = redis;
    this.logger = logger.child({ module: 'ProductDataService' });
  }

  async getProduct(id: string): Promise<Product | null> {
    const cacheKey = `product:${id}`;
    
    try {
      // Try to get from cache first
      const cached = await this.redis.get(cacheKey);
      console.log('cache!!', cached);
      if (cached) {
        this.logger.debug('Product found in cache', { id });
        return JSON.parse(cached);
      }

      // Cache miss - simulate DB delay
      this.logger.debug('Cache miss, fetching from DB', { id });
      await this.simulateDbDelay();
      
      // Simulate DB query
      const product = await this.getProductFromDb(id);
      if (!product) {
        this.logger.debug('Product not found in DB', { id });
        return null;
      }

      // Cache the result
      await this.redis.set(cacheKey, JSON.stringify(product), this.cacheTTL);
      this.logger.debug('Product cached', { id, ttl: this.cacheTTL });
      
      return product;
    } catch (error) {
      this.logger.error('Error getting product', { id, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const product: Product = {
        ...productData,
        id: this.generateId(),
        createdAt: new Date()
      };

      // Simulate DB save
      await this.simulateDbDelay();
      
      // Cache the new product
      const cacheKey = `product:${product.id}`;
      await this.redis.set(cacheKey, JSON.stringify(product), this.cacheTTL);
      
      this.logger.info('Product created', { id: product.id, name: product.name });
      return product;
    } catch (error) {
      this.logger.error('Error creating product', { error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private async getProductFromDb(id: string): Promise<Product | null> {
    // Simulate DB query - in real app this would be a database call
    const mockProducts: Record<string, Product> = {
      '1': {
        id: '1',
        name: 'Laptop Gaming',
        price: 1299.99,
        description: 'High-performance gaming laptop',
        createdAt: new Date('2024-01-01')
      },
      '2': {
        id: '2',
        name: 'Wireless Mouse',
        price: 49.99,
        description: 'Ergonomic wireless mouse',
        createdAt: new Date('2024-01-02')
      }
    };

    return mockProducts[id] || null;
  }

  private async simulateDbDelay(): Promise<void> {
    // Simulate database delay - 1 second for cache miss
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 