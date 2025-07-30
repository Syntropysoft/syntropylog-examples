// =================================================================
//  ProductServer.ts - Express HTTP Server
//  RESPONSIBILITY: Handle HTTP routes and Express server lifecycle
// =================================================================

import express, { Request, Response } from 'express';
import { ILogger, syntropyLog } from 'syntropylog';
import { ProductDataService, Product } from './ProductDataService';
import { syntropyContextMiddleware } from './contextMiddleware';

export class ProductServer {
  private readonly app: express.Application;
  private readonly logger: ILogger;
  private readonly dataService: ProductDataService;
  private server: any;

  constructor(dataService: ProductDataService, logger: ILogger) {
    this.app = express();
    this.dataService = dataService;
    this.logger = logger.child({ module: 'ProductServer' });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    
    // Use SyntropyLog context middleware
    this.app.use(syntropyContextMiddleware());
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Get product by ID
    this.app.get('/product/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const product = await this.dataService.getProduct(id);
        
        if (!product) {
          return res.status(404).json({ 
            error: 'Product not found',
            id 
          });
        }

        res.json(product);
      } catch (error) {
        this.logger.error('Error in GET /product/:id', { 
          error: error instanceof Error ? error.message : String(error),
          id: req.params.id
        });
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // Create product
    this.app.post('/product', async (req: Request, res: Response) => {
      try {
        const { name, price, description } = req.body;
        
        // Validate required fields
        if (!name || !price || !description) {
          return res.status(400).json({
            error: 'Missing required fields',
            required: ['name', 'price', 'description']
          });
        }

        const product = await this.dataService.createProduct({
          name,
          price: Number(price),
          description
        });

        res.status(201).json(product);
      } catch (error) {
        this.logger.error('Error in POST /product', { 
          error: error instanceof Error ? error.message : String(error),
          body: req.body
        });
        res.status(500).json({ 
          error: 'Internal server error' 
        });
      }
    });

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({ 
        error: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  start(port: number): void {
    this.server = this.app.listen(port, () => {
      this.logger.info('🚀 Product Server started', { port });
      console.log(`🏪 Product Service running on http://localhost:${port}`);
    });
  }

  stop(): void {
    if (this.server) {
      this.server.close(() => {
        this.logger.info('Product Server stopped');
      });
    }
  }
} 