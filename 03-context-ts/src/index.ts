import { syntropyLog, SyntropyLogConfig, ClassicConsoleTransport } from 'syntropylog';

/**
 * Example 03: TypeScript Context and Correlation
 * 
 * This example demonstrates TypeScript-specific context propagation
 * with proper typing and structured logging.
 * 
 * Key Concepts:
 * - TypeScript interfaces for context data
 * - Strongly typed context propagation
 * - Type-safe logging with interfaces
 * - Context inheritance in TypeScript
 */

// TypeScript interfaces for our context data
interface UserContext {
  userId: string;
  sessionId: string;
  correlationId: string;
  timestamp: string;
}

interface OrderData {
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

// Complete boilerplate for SyntropyLog initialization and shutdown
async function initializeSyntropyLog(): Promise<void> {
  console.log('🚀 Initializing SyntropyLog...');
  
  return new Promise<void>((resolve, reject) => {
    // Set up event listeners before initialization
    syntropyLog.on('ready', () => {
      console.log('✅ SyntropyLog initialized successfully!');
      resolve();
    });
    
    syntropyLog.on('error', (err) => {
      console.error('❌ SyntropyLog initialization failed:', err);
      reject(err);
    });

    // Initialize with configuration
    const config: SyntropyLogConfig = {
  logger: {
    level: 'info',
        serviceName: 'example-03-typescript',
        transports: [new ClassicConsoleTransport()],
    serializerTimeoutMs: 100,
  },
      context: {
        correlationIdHeader: 'X-Correlation-ID',
      },
    };

    syntropyLog.init(config);
  });
}

async function gracefulShutdown(): Promise<void> {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
}

// TypeScript function with typed context
function processOrder(orderData: OrderData, context: UserContext): void {
  const logger = syntropyLog.getLogger('order-service');
  
  logger.info('Processing order with TypeScript context', {
    orderId: orderData.orderId,
    userId: context.userId,
    correlationId: context.correlationId,
    sessionId: context.sessionId
  });
  
  // Simulate order processing
  const totalPrice = orderData.quantity * orderData.price;
  
  logger.info('Order processed successfully', {
    orderId: orderData.orderId,
    totalPrice,
    userId: context.userId,
    correlationId: context.correlationId
  });
}

// Another TypeScript function with context
function validateOrder(orderData: OrderData, context: UserContext): boolean {
  const logger = syntropyLog.getLogger('validation-service');
  
  logger.info('Validating order with TypeScript context', {
    orderId: orderData.orderId,
    userId: context.userId,
    correlationId: context.correlationId
  });
  
  // Simulate validation logic
  const isValid = orderData.quantity > 0 && orderData.price > 0;
  
  if (isValid) {
    logger.info('Order validation passed', {
      orderId: orderData.orderId,
      userId: context.userId,
      correlationId: context.correlationId
    });
  } else {
    logger.warn('Order validation failed', {
      orderId: orderData.orderId,
      userId: context.userId,
      correlationId: context.correlationId,
      reason: 'Invalid quantity or price'
    });
  }
  
  return isValid;
}

// Main function demonstrating TypeScript context propagation
async function main(): Promise<void> {
  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();
    
const logger = syntropyLog.getLogger('main');
    const contextManager = syntropyLog.getContextManager();
    
    logger.info('Starting TypeScript context propagation example...');
    
    // Sample order data with TypeScript typing
    const orders: OrderData[] = [
      { orderId: 'ORD-001', productId: 'PROD-001', quantity: 2, price: 25.50 },
      { orderId: 'ORD-002', productId: 'PROD-002', quantity: 1, price: 99.99 },
      { orderId: 'ORD-003', productId: 'PROD-003', quantity: 3, price: 15.75 }
    ];
    
    // Process each order with TypeScript context
    for (const order of orders) {
      const correlationId = `corr-${order.orderId}-${Date.now()}`;
      
      logger.info('Starting order processing session', {
        orderId: order.orderId,
        correlationId
      });

      // Create a new context for each order
      await contextManager.run(async () => {
        // Set correlation ID in context
        contextManager.set('X-Correlation-ID', correlationId);
        
        // Create typed context object
        const userContext: UserContext = {
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          sessionId: `session-${Date.now()}`,
          correlationId,
          timestamp: new Date().toISOString()
        };
        
        // Add context data
        contextManager.set('sessionId', userContext.sessionId);
        contextManager.set('timestamp', userContext.timestamp);
        
        // Process order with typed context - context is automatically propagated
        processOrder(order, userContext);
        
        // Validate order with typed context - context is automatically propagated
        const isValid = validateOrder(order, userContext);
        
        if (isValid) {
          logger.info('Order processing completed successfully', {
            orderId: order.orderId,
            userId: userContext.userId,
            correlationId: userContext.correlationId
          });
        } else {
          logger.warn('Order processing completed with warnings', {
            orderId: order.orderId,
            userId: userContext.userId,
            correlationId: userContext.correlationId
          });
        }
      });
      
      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    logger.info('All orders processed. TypeScript example completed.');
    
  } catch (error) {
    console.error('TypeScript example error:', error);
  } finally {
    // Always shutdown SyntropyLog
    await gracefulShutdown();
  }
}

// Handle process termination signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

// Run the TypeScript example
main().catch(console.error);
