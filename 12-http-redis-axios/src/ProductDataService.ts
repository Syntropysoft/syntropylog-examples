// =================================================================
//  ProductDataService.ts - Data Layer for Products
//  RESPONSIBILITY: Handle product data operations and Redis caching
// =================================================================

import { ILogger } from 'syntropylog';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  createdAt: string;
}

export class ProductDataService {
  private readonly logger: ILogger;
  private readonly redis: any;
  private readonly cacheKey = 'product:';

  constructor(redis: any, logger: ILogger) {
    this.redis = redis;
    this.logger = logger.child({ module: 'ProductDataService' });
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      // Try to get from cache first
      const cached = await this.redis.get(this.cacheKey + id);
      
      if (cached) {
        this.logger.info('Product retrieved from cache', { id });
        return JSON.parse(cached);
      }

      // Simulate database lookup
      const product = await this.simulateDatabaseLookup(id);
      
      if (product) {
        // Cache for 30 seconds
        await this.redis.set(this.cacheKey + id, JSON.stringify(product), 30);
        this.logger.info('Product retrieved from database and cached', { id });
      } else {
        this.logger.warn('Product not found', { id });
      }

      return product;
    } catch (error) {
      this.logger.error('Error retrieving product', { 
        id, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const product: Product = {
        id: Date.now().toString(),
        ...data,
        createdAt: new Date().toISOString()
      };

      this.logger.info('Product created', { id: product.id, name: product.name });
      return product;
    } catch (error) {
      this.logger.error('Error creating product', { 
        data, 
        error: error instanceof Error ? error.message : String(error) 
      });
      throw error;
    }
  }

  private async simulateDatabaseLookup(id: string): Promise<Product | null> {
    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data
    const products: Record<string, Product> = {
      '1': {
        id: '1',
        name: 'Laptop Gaming',
        price: 1299.99,
        description: 'High-performance gaming laptop',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      '2': {
        id: '2',
        name: 'Smartphone Pro',
        price: 899.99,
        description: 'Latest smartphone with advanced features',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    };

    return products[id] || null;
  }
} 