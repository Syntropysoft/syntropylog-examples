// =================================================================
//  ProductServer.ts - Fastify HTTP Server
//  RESPONSIBILITY: Handle HTTP routes and Fastify server lifecycle
// =================================================================

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ILogger } from 'syntropylog';
import { ProductDataService, Product } from './ProductDataService';

interface ProductRequest {
  Params: { id: string };
}

interface CreateProductRequest {
  Body: {
    name: string;
    price: number;
    description: string;
  };
}

export class ProductServer {
  private readonly app: FastifyInstance;
  private readonly logger: ILogger;
  private readonly dataService: ProductDataService;

  constructor(dataService: ProductDataService, logger: ILogger) {
    this.app = Fastify({
      logger: false // We use SyntropyLog instead
    });
    this.dataService = dataService;
    this.logger = logger.child({ module: 'ProductServer' });
    
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    // Add request logging middleware
    this.app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
      this.logger.info(`${request.method} ${request.url}`, {
        method: request.method,
        url: request.url,
        query: request.query,
        body: request.body,
      });
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: 'OK', timestamp: new Date().toISOString() };
    });

    // Get product by ID
    this.app.get<ProductRequest>('/product/:id', async (request: FastifyRequest<ProductRequest>, reply: FastifyReply) => {
      try {
        const { id } = request.params;
        const product = await this.dataService.getProduct(id);
        
        if (!product) {
          return reply.status(404).send({ 
            error: 'Product not found',
            id 
          });
        }

        return product;
      } catch (error) {
        this.logger.error('Error in GET /product/:id', { 
          error: error instanceof Error ? error.message : String(error),
          id: request.params.id
        });
        return reply.status(500).send({ 
          error: 'Internal server error' 
        });
      }
    });

    // Create product
    this.app.post<CreateProductRequest>('/product', async (request: FastifyRequest<CreateProductRequest>, reply: FastifyReply) => {
      try {
        const { name, price, description } = request.body;
        
        // Validate required fields
        if (!name || !price || !description) {
          return reply.status(400).send({
            error: 'Missing required fields',
            required: ['name', 'price', 'description']
          });
        }

        const product = await this.dataService.createProduct({
          name,
          price: Number(price),
          description
        });

        return reply.status(201).send(product);
      } catch (error) {
        this.logger.error('Error in POST /product', { 
          error: error instanceof Error ? error.message : String(error),
          body: request.body
        });
        return reply.status(500).send({ 
          error: 'Internal server error' 
        });
      }
    });

    // 404 handler
    this.app.setNotFoundHandler(async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(404).send({ 
        error: 'Route not found',
        path: request.url
      });
    });
  }

  async start(port: number): Promise<void> {
    try {
      await this.app.listen({ port, host: '127.0.0.1' });
      this.logger.info('🚀 Product Server started', { port });
      console.log(`🏪 Product Service running on http://localhost:${port}`);
    } catch (error) {
      this.logger.error('Failed to start server', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.app.close();
        this.logger.info('Product Server stopped');
    } catch (error) {
      this.logger.error('Error stopping server', { error });
    }
  }
} 