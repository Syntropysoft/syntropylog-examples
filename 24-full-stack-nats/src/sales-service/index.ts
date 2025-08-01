// =================================================================
//  Sales Service - Process sales and notify dispatch
//  RESPONSIBILITY: Handle sales processing and publish to dispatch
// =================================================================

import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog } from './boilerplate.js';

// Middleware to handle SyntropyLog context for broker messages
function brokerContextMiddleware(messageHandler: (message: any, controls: any) => Promise<void>) {
  return async (message: any, controls: any) => {
    const contextManager = syntropyLog.getContextManager();
    
    // Extract correlation ID from message headers
    const correlationId = message.headers?.[contextManager.getCorrelationIdHeaderName()];
    
    // Create a new context for this message processing
    contextManager.run(async () => {
      // Set the correlation ID in the current context if available
      if (correlationId) {
        // Ensure correlationId is a string, not an array
        const correlationIdStr = Array.isArray(correlationId) ? correlationId[0] : correlationId;
        contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationIdStr);
      }
      
      // Process the message in the current context
      await messageHandler(message, controls);
    });
  };
}

async function main() {
  console.log('--- Running Sales Service ---');

  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();

    const broker = syntropyLog.getBroker('nats-broker');
    const logger = syntropyLog.getLogger('sales-service');

    // Connect to NATS
    await broker.connect();
    logger.info('✅ Connected to NATS broker');

    // Subscribe to new sales
    await broker.subscribe('sales.new', brokerContextMiddleware(async (message, controls) => {
      const saleData = JSON.parse(message.payload.toString());
      const contextManager = syntropyLog.getContextManager();
      const correlationId = contextManager.get(contextManager.getCorrelationIdHeaderName()) as string;
      try {
        logger.info('Processing new sale', { saleData, correlationId });

        // Simulate sales processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const saleId = `SALE-${Date.now()}`;
        
        logger.info('Sale processed successfully', { saleId, correlationId });

        await broker.publish('sales.processed', {
          payload: Buffer.from(
            JSON.stringify({
              saleId,
              customerId: saleData.customerId,
              items: saleData.items,
              total: saleData.total,
              correlationId: correlationId, // esto es solo de control y no se propaga
            })
          ),
          headers: {
            [contextManager.getCorrelationIdHeaderName()]: correlationId
          }
        });
        
        logger.info('Sale sent to dispatch service', { correlationId });

        await controls.ack();
      } catch (error) {
        logger.error('Failed to process sale', {
          error: error instanceof Error ? error.message : String(error),
          correlationId
        });
        await controls.nack();
      }
    }));

    logger.info('✅ Subscribed to sales.new topic');
    console.log('🛍️ Sales Service running - waiting for sales...');

  } catch (error) {
    console.error('❌ Sales Service failed to start:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
}); 