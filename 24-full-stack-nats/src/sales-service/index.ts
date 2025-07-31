// =================================================================
//  Sales Service - Process sales and notify dispatch
//  RESPONSIBILITY: Handle sales processing and publish to dispatch
// =================================================================

import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog } from './boilerplate.js';
import { BrokerMessage } from 'syntropylog';

async function main() {
  console.log('--- Running Sales Service ---');

  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();

    const broker = syntropyLog.getBroker('nats-broker');
    const logger = syntropyLog.getLogger('sales-service');
    const context = syntropyLog.getContextManager();

    // Connect to NATS
    await broker.connect();
    logger.info('✅ Connected to NATS broker');

    // Subscribe to new sales
    await broker.subscribe('sales.new', async (message, controls) => {
      const correlationId = message.headers?.[context.getCorrelationIdHeaderName()];
      const correlationIdStr = typeof correlationId === 'string' ? correlationId : correlationId?.toString();
      const saleData = JSON.parse(message.payload.toString());

      try {
        if (correlationIdStr) {
          logger.info('Processing new sale', { 
            correlationId: correlationIdStr,
            saleData 
          });
        } else {
          logger.info('Processing new sale (no correlation ID)', { 
            saleData 
          });
        }

        // Simulate sales processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const saleId = `SALE-${Date.now()}`;
        
        if (correlationIdStr) {
          logger.info('Sale processed successfully', { 
            correlationId: correlationIdStr,
            saleId 
          });
        } else {
          logger.info('Sale processed successfully (no correlation ID)', { 
            saleId 
          });
        }

        // Publish to dispatch service
        const dispatchMessage: BrokerMessage = {
          payload: Buffer.from(JSON.stringify({
            saleId,
            customerId: saleData.customerId,
            items: saleData.items,
            total: saleData.total
          })),
          headers: correlationIdStr ? { 'x-correlation-id': correlationIdStr } : {},
        };

        await broker.publish('sales.processed', dispatchMessage);
        
        if (correlationIdStr) {
          logger.info('Sale sent to dispatch service', { 
            correlationId: correlationIdStr 
          });
        } else {
          logger.info('Sale sent to dispatch service (no correlation ID)');
        }

        await controls.ack();
      } catch (error) {
        if (correlationIdStr) {
          logger.error('Failed to process sale', {
            error: error instanceof Error ? error.message : String(error),
            correlationId: correlationIdStr
          });
        } else {
          logger.error('Failed to process sale (no correlation ID)', {
            error: error instanceof Error ? error.message : String(error)
          });
        }
        await controls.nack();
      }
    });

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