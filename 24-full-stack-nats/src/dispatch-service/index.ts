// =================================================================
//  Dispatch Service - Handle order dispatch
//  RESPONSIBILITY: Process dispatch requests and notify completion
// =================================================================

import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog } from './boilerplate.js';
import { BrokerMessage } from 'syntropylog';

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
    await broker.subscribe('sales.processed', async (message, controls) => {
      const correlationId = message.headers?.['x-correlation-id'];
      const correlationIdStr = typeof correlationId === 'string' ? correlationId : correlationId?.toString();
      const saleData = JSON.parse(message.payload.toString());

      try {
        if (correlationIdStr) {
          logger.info('Processing dispatch for sale', { 
            correlationId: correlationIdStr,
            saleId: saleData.saleId 
          });
        } else {
          logger.info('Processing dispatch for sale (no correlation ID)', { 
            saleId: saleData.saleId 
          });
        }

        // Simulate dispatch processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const trackingNumber = `TRK-${Date.now()}`;
        
        if (correlationIdStr) {
          logger.info('Dispatch prepared successfully', { 
            correlationId: correlationIdStr,
            saleId: saleData.saleId,
            trackingNumber
          });
        } else {
          logger.info('Dispatch prepared successfully (no correlation ID)', { 
            saleId: saleData.saleId,
            trackingNumber
          });
        }

        // Notify API Gateway that dispatch is ready
        const readyMessage: BrokerMessage = {
          payload: Buffer.from(JSON.stringify({
            saleId: saleData.saleId,
            trackingNumber,
            status: 'ready_for_pickup',
            estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })),
          headers: correlationIdStr ? { 'x-correlation-id': correlationIdStr } : {},
        };

        await broker.publish('dispatch.ready', readyMessage);
        
        if (correlationIdStr) {
          logger.info('Dispatch ready notification sent', { 
            correlationId: correlationIdStr 
          });
        } else {
          logger.info('Dispatch ready notification sent (no correlation ID)');
        }

        await controls.ack();
      } catch (error) {
        if (correlationIdStr) {
          logger.error('Failed to process dispatch', {
            error: error instanceof Error ? error.message : String(error),
            correlationId: correlationIdStr
          });
        } else {
          logger.error('Failed to process dispatch (no correlation ID)', {
            error: error instanceof Error ? error.message : String(error)
          });
        }
        await controls.nack();
      }
    });

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
