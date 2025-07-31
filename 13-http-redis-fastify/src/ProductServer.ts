// =================================================================
//  ProductServer.ts - Fastify HTTP Server
//  RESPONSIBILITY: Handle HTTP routes and Fastify server lifecycle
// =================================================================

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ILogger, syntropyLog } from 'syntropylog';
import { ProductDataService } from './ProductDataService';

// Extend FastifyRequest to include SyntropyLog context
declare module 'fastify' {
  interface FastifyRequest {
    syntropyContext?: {
      correlationId?: string;
      traceId?: string;
    };
  }
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
    
    // Decorate request with SyntropyLog context
    this.app.decorateRequest('syntropyContext', undefined);
  }

  async init(): Promise<void> {
    await this.setupMiddleware();
    this.setupRoutes();
  }

  private async setupMiddleware(): Promise<void> {
    this.app.addHook('onRequest', (request, reply, done) => {
      const contextManager = syntropyLog.getContextManager();
      
      contextManager.run(async () => {
        const correlationId = request.headers[contextManager.getCorrelationIdHeaderName()] as string || contextManager.getCorrelationId();
        const transactionId = request.headers[contextManager.getTransactionIdHeaderName()] as string;
        
        contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
        contextManager.set(contextManager.getTransactionIdHeaderName(), transactionId);
        
        request.syntropyContext = {
          correlationId,
          traceId: transactionId,
        };
        
        done();
      });
    });
  }

  private setupRoutes(): void {

    // Health check
    this.app.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
      return { 
        status: 'OK', 
        timestamp: new Date().toISOString()
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
        this.logger.error('Error in GET /product/:id', { 
          error: error instanceof Error ? error.message : String(error)
        });
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
        this.logger.error('Error in POST /product', { 
          error: error instanceof Error ? error.message : String(error)
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
    } catch (error) {
      this.logger.error('Failed to start server', {
        error: JSON.stringify(error),
      });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await this.app.close();
        this.logger.info('Product Server stopped');
    } catch (error) {
      this.logger.error('Error stopping server', { error: JSON.stringify(error) });
    }
  }
} 