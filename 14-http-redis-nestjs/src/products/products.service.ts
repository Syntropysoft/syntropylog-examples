import { Injectable } from '@nestjs/common';
import { syntropyLog } from 'syntropylog';

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = syntropyLog.getLogger('ProductsService');

  async getProduct(id: number): Promise<Product | null> {
    const cacheKey = `product:${id}`;

    try {
      const redis = await syntropyLog.getRedis('product-cache');
      const cached = await redis.get(cacheKey);

      if (cached) {
        this.logger.info('Cache hit', { id, cacheKey });
        return JSON.parse(cached);
      }

      this.logger.info('Cache miss, creating product', { id, cacheKey });

      const product: Product = {
        id,
        title: `Product ${id}`,
        price: Math.floor(Math.random() * 1000) + 100,
        description: `This is product number ${id}`,
      };

      await redis.set(cacheKey, JSON.stringify(product), 30);

      this.logger.info('Product created and cached', {
        id,
        title: product.title,
      });

      return product;
    } catch (error) {
      this.logger.error('Error fetching product', {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async createProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const redis = await syntropyLog.getRedis('product-cache');
      const newId = Date.now();

      const product: Product = {
        id: newId,
        ...productData,
      };

      const cacheKey = `product:${newId}`;
      await redis.set(cacheKey, JSON.stringify(product), 30);

      this.logger.info('Product created', {
        id: product.id,
        title: product.title,
      });

      return product;
    } catch (error) {
      this.logger.error('Error creating product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
