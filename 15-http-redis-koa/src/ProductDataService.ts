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
    
    // Try to get from cache first
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Simulate database delay
    await this.simulateDbDelay();
    
    // Create a mock product
    const product: Product = {
      id,
      name: 'Laptop Gaming',
      price: 1299.99,
      description: 'High-performance gaming laptop',
      createdAt: new Date()
    };
    
    // Cache the result
    await this.redis.set(cacheKey, JSON.stringify(product), 30);
    
    return product;
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

  private async simulateDbDelay(): Promise<void> {
    // Simulate database delay - 1 second for cache miss
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 