// =================================================================
//  server.ts - Product Service with Redis Cache
//  RESPONSIBILITY: HTTP server with Redis caching
// =================================================================

import express from 'express';
import { syntropyLog } from 'syntropylog';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  stock: number;
  createdAt: string;
}

export class ProductService {
  private app: express.Application;
  private redis: any;
  private logger: any;

  constructor(redisInstance: any) {
    this.redis = redisInstance;
    this.logger = syntropyLog.getLogger('ProductService');

    this.app = express();
    this.app.use(express.json());

    this.setupRoutes();
  }

  private setupRoutes(): void {
    // GET /product/:id - Get product by ID with Redis cache
    this.app.get('/product/:id', async (req, res) => {
      const productId = req.params.id;
      const cacheKey = `product-${productId}`;

      this.logger.info('🔍 Looking for product', { productId, cacheKey });

      try {
        // Try to get from Redis cache first
        const cachedProduct = await this.redis.get(cacheKey);

        if (cachedProduct) {
          this.logger.info('✅ Product found in cache', { productId });
          const product = JSON.parse(cachedProduct);
          return res.json({
            success: true,
            source: 'cache',
            data: product,
          });
        }

        // If not in cache, simulate database lookup with 2 second timeout
        this.logger.info('⏳ Product not in cache, simulating DB lookup...', {
          productId,
        });

        const product = await this.simulateDatabaseLookup(productId);

        if (product) {
          // Store in cache for future requests
          await this.redis.set(cacheKey, JSON.stringify(product), 3600); // 1 hour TTL
          this.logger.info('💾 Product stored in cache', { productId });

          return res.json({
            success: true,
            source: 'database',
            data: product,
          });
        } else {
          return res.status(404).json({
            success: false,
            message: 'Product not found',
            productId,
          });
        }
      } catch (error: any) {
        this.logger.error('❌ Error getting product', {
          productId,
          error: error.message,
        });
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    });

    // POST /product/ - Create new product
    this.app.post('/product/', async (req, res) => {
      const productData = req.body;

      this.logger.info('📝 Creating new product', { productData });

      try {
        if (!productData.id) {
          return res.status(400).json({
            success: false,
            message: 'Product ID is required',
          });
        }

        const product: Product = {
          id: productData.id,
          name: productData.name || 'Unknown Product',
          price: productData.price || 0,
          description: productData.description || '',
          category: productData.category || 'General',
          stock: productData.stock || 0,
          createdAt: new Date().toISOString(),
        };

        const cacheKey = `product-${product.id}`;

        // Store in Redis cache
        await this.redis.set(cacheKey, JSON.stringify(product), 3600); // 1 hour TTL

        this.logger.info('✅ Product created and cached', {
          productId: product.id,
        });

        return res.status(201).json({
          success: true,
          message: 'Product created successfully',
          data: product,
        });
      } catch (error: any) {
        this.logger.error('❌ Error creating product', {
          error: error.message,
        });
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: error.message,
        });
      }
    });

    // GET /health - Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'Product Service is running',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private async simulateDatabaseLookup(
    productId: string
  ): Promise<Product | null> {
    // Simulate database lookup with 2 second delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate some products
        const mockProducts: Record<string, Product> = {
          '1': {
            id: '1',
            name: 'Laptop Gaming Pro',
            price: 1299.99,
            description: 'High-performance gaming laptop',
            category: 'Electronics',
            stock: 15,
            createdAt: new Date().toISOString(),
          },
          '2': {
            id: '2',
            name: 'Wireless Headphones',
            price: 199.99,
            description: 'Noise-cancelling wireless headphones',
            category: 'Audio',
            stock: 50,
            createdAt: new Date().toISOString(),
          },
          '3': {
            id: '3',
            name: 'Smartphone X',
            price: 899.99,
            description: 'Latest smartphone with advanced features',
            category: 'Mobile',
            stock: 25,
            createdAt: new Date().toISOString(),
          },
        };

        const product = mockProducts[productId] || null;
        resolve(product);
      }, 2000); // 2 second delay
    });
  }

  public start(port: number = 3000): void {
    this.app.listen(port, () => {
      this.logger.info('🚀 Product Service started', { port });
      console.log(`🏪 Product Service running on http://localhost:${port}`);
    });
  }
}
