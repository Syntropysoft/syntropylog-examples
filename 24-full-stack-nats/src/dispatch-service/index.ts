// =================================================================
//  Dispatch Service - Handle order dispatch
//  RESPONSIBILITY: Process dispatch requests and notify completion
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
  console.log('--- Running Dispatch Service ---');

  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();

    const broker = syntropyLog.getBroker('nats-broker');
    const logger = syntropyLog.getLogger('dispatch-service');

    // Connect to NATS
    await broker.connect();
    logger.info('✅ Connected to NATS broker');

    // Subscribe to processed sales
    await broker.subscribe('sales.processed', brokerContextMiddleware(async (message, controls) => {
      const saleData = JSON.parse(message.payload.toString());
      const contextManager = syntropyLog.getContextManager();
      const correlationId = contextManager.get(contextManager.getCorrelationIdHeaderName()) as string;

      try {
        logger.info('Processing dispatch for sale', { 
          saleId: saleData.saleId,
          correlationId
        });

        // Simulate dispatch processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const trackingNumber = `TRK-${Date.now()}`;
        
        logger.info('Dispatch prepared successfully', { 
          saleId: saleData.saleId,
          trackingNumber,
          correlationId
        });

        // Notify API Gateway that dispatch is ready
        const contextCorrelationId = contextManager.get(contextManager.getCorrelationIdHeaderName()) as string;

        await broker.publish('dispatch.ready', {
          payload: Buffer.from(JSON.stringify({
            saleId: saleData.saleId,
            trackingNumber,
            status: 'ready_for_pickup',
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            correlationId: contextCorrelationId // solo de control y no se propaga
          })),
          headers: {
            [contextManager.getCorrelationIdHeaderName()]: contextCorrelationId
          }
        });
        
        logger.info('Dispatch ready notification sent', { correlationId });

        await controls.ack();
      } catch (error) {
        logger.error('Failed to process dispatch', {
          error: error instanceof Error ? error.message : String(error),
          correlationId
        });
        await controls.nack();
      }
    }));

    logger.info('✅ Subscribed to sales.processed topic');
    console.log('📦 Dispatch Service running - waiting for sales...');

  } catch (error) {
    console.error('❌ Dispatch Service failed to start:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
