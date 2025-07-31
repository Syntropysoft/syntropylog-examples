// =================================================================
//  ProductServer.ts - Koa HTTP Server
//  RESPONSIBILITY: Handle HTTP routes and Koa server lifecycle
// =================================================================

import Koa from 'koa';
import Router from '@koa/router';
import bodyParser from 'koa-bodyparser';
import { ILogger } from 'syntropylog';
import { ProductDataService } from './ProductDataService';
import { contextMiddleware } from './contextMiddleware';

export class ProductServer {
  private readonly app: Koa;
  private readonly router: Router;
  private readonly logger: ILogger;
  private readonly dataService: ProductDataService;

  constructor(dataService: ProductDataService, logger: ILogger) {
    this.app = new Koa();
    this.router = new Router();
    this.dataService = dataService;
    this.logger = logger.child({ module: 'ProductServer' });
  }

  async init(): Promise<void> {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Use context middleware first
    this.app.use(contextMiddleware());
    
    // Use body parser for JSON requests
    this.app.use(bodyParser());
    
    // Use router
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }

  private setupRoutes(): void {
    // Health check
    this.router.get('/health', async (ctx) => {
      this.logger.info('Health check requested', {
        correlationId: ctx.state.correlationId,
        traceId: ctx.state.traceId
      });
      
      ctx.body = { 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        context: {
          correlationId: ctx.state.correlationId,
          traceId: ctx.state.traceId
        }
      };
    });

    // Get product by ID
    this.router.get('/product/:id', async (ctx) => {
      try {
        const { id } = ctx.params;
        
        this.logger.info('Product requested', {
          id,
          correlationId: ctx.state.correlationId,
          traceId: ctx.state.traceId
        });
        
        const product = await this.dataService.getProduct(id);
        
        if (!product) {
          ctx.status = 404;
          ctx.body = { 
            error: 'Product not found',
            id 
          };
          return;
        }

        ctx.body = product;
      } catch (error) {
        this.logger.error('Error in GET /product/:id', { 
          error: error instanceof Error ? error.message : String(error)
        });
        ctx.status = 500;
        ctx.body = { 
          error: 'Internal server error' 
        };
      }
    });

    // Create product
    this.router.post('/product', async (ctx) => {
      try {
        const { name, price, description } = ctx.request.body as { name: string; price: number; description: string };
        
        this.logger.info('Product creation requested', {
          name,
          price,
          correlationId: ctx.state.correlationId,
          traceId: ctx.state.traceId
        });
        
        // Validate required fields
        if (!name || !price || !description) {
          ctx.status = 400;
          ctx.body = {
            error: 'Missing required fields',
            required: ['name', 'price', 'description']
          };
          return;
        }

        const product = await this.dataService.createProduct({
          name,
          price: Number(price),
          description
        });

        ctx.status = 201;
        ctx.body = product;
      } catch (error) {
        this.logger.error('Error in POST /product', { 
          error: error instanceof Error ? error.message : String(error)
        });
        ctx.status = 500;
        ctx.body = { 
          error: 'Internal server error' 
        };
      }
    });

    // 404 handler
    this.router.all('(.*)', async (ctx) => {
      ctx.status = 404;
      ctx.body = { 
        error: 'Route not found',
        path: ctx.path
      };
    });
  }

  async start(port: number): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) => {
        this.app.listen(port, '127.0.0.1', () => {
          this.logger.info('🚀 Product Server started', { port });
          resolve();
        }).on('error', (error) => {
          reject(error);
        });
      });
    } catch (error) {
      this.logger.error('Failed to start server', {
        error: JSON.stringify(error),
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      // Koa doesn't have a built-in close method, so we just log
      this.logger.info('Product Server stopped');
    } catch (error) {
      this.logger.error('Error stopping server', { error: JSON.stringify(error) });
    }
  }
} 