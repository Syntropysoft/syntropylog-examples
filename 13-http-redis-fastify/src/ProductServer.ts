// =================================================================
//  ProductServer.ts - Fastify HTTP Server
//  RESPONSIBILITY: Handle HTTP routes and Fastify server lifecycle
// =================================================================

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ILogger, syntropyLog } from 'syntropylog';
import { ProductDataService, Product } from './ProductDataService';
import { v4 as uuidv4 } from 'uuid';

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
  }

  async init(): Promise<void> {
    await this.setupMiddleware();
    this.setupRoutes();
  }

  private async setupMiddleware(): Promise<void> {
    // Simple middleware to set context for each request
    this.app.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      const contextManager = syntropyLog.getContextManager();
      
      // Extract correlation ID from headers or generate one
      const correlationId = request.headers['x-correlation-id'] as string || `fastify-${uuidv4()}`;
      const transactionId = request.headers['x-transaction-id'] as string;
      
      // Set context directly
      contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
      contextManager.set(contextManager.getTransactionIdHeaderName(), transactionId);
      contextManager.set('requestId', request.id);
      contextManager.set('method', request.method);
      contextManager.set('url', request.url);
      contextManager.set('framework', 'fastify');
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
      return { status: 'OK', timestamp: new Date().toISOString() };
    });

    // Debug context endpoint
    this.app.get('/debug-context', async (request: FastifyRequest, reply: FastifyReply) => {
      const contextManager = syntropyLog.getContextManager();
      
      // Get SyntropyLog context
      const syntropyContext = {
        correlationId: contextManager.get(contextManager.getCorrelationIdHeaderName()),
        transactionId: contextManager.get(contextManager.getTransactionIdHeaderName()),
        requestId: contextManager.get('requestId'),
        method: contextManager.get('method'),
        url: contextManager.get('url'),
        framework: contextManager.get('framework'),
        allContext: contextManager.getAll()
      };
      
      // Get request headers
      const headers = {
        'x-correlation-id': request.headers['x-correlation-id'],
        'x-transaction-id': request.headers['x-transaction-id'],
        allHeaders: request.headers
      };
      
      return {
        timestamp: new Date().toISOString(),
        requestId: request.id,
        method: request.method,
        url: request.url,
        syntropyContext,
        headers,
        message: 'SyntropyLog context debug information'
      };
    });

    // Get product by ID
    this.app.get('/product/:id', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { id } = request.params as { id: string };
        const product = await this.dataService.getProduct(id);
        
        if (!product) {
          return reply.status(404).send({ 
            error: 'Product not found',
            id 
          });
        }

        return product;
      } catch (error) {
        this.logger.error('Error in GET /product/:id');
        return reply.status(500).send({ 
          error: 'Internal server error' 
        });
      }
    });

    // Create product
    this.app.post('/product', async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { name, price, description } = request.body as { name: string; price: number; description: string };
        
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
        this.logger.error('Error in POST /product');
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