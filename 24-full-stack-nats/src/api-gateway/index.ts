// =================================================================
//  API Gateway - Entry point for sales requests
//  RESPONSIBILITY: Handle HTTP requests and publish to NATS
// =================================================================

import express from 'express';
import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog } from './boilerplate.js';
import { BrokerMessage } from 'syntropylog';
import { v4 as uuidv4 } from 'uuid';

const PORT = parseInt(process.env.PORT || '3000');

async function main() {
  console.log('--- Running API Gateway Service ---');

  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();

    const broker = syntropyLog.getBroker('nats-broker');
    const logger = syntropyLog.getLogger('api-gateway');

    // Connect to NATS
    await broker.connect();
    logger.info('✅ Connected to NATS broker');

  const app = express();
    app.use(express.json());

  // Middleware to attach logger to request
  app.use((req, res, next) => {
    (req as any).logger = logger;
    next();
  });

  // Endpoint to create a new sale
  app.post('/sales', async (req: express.Request, res: express.Response) => {
    const saleData = req.body;
      const correlationId = uuidv4();

    const saleMessage: BrokerMessage = {
      payload: saleData,
        headers: { 'x-correlation-id': correlationId },
    };

    try {
        logger.info('Received new sale request', { 
          saleData, 
          correlationId 
        });
        
      await broker.publish('sales.new', saleMessage);
        logger.info('Sale event published to NATS', { 
          correlationId 
        });
        
        res.status(202).json({ 
          message: 'Sale processing started',
          correlationId 
        });
    } catch (error) {
      logger.error('Failed to publish sale event', {
        error: error instanceof Error ? error.message : String(error),
          correlationId
      });
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

    // Subscribe to dispatch ready events
    await broker.subscribe('dispatch.ready', async (message, controls) => {
      const correlationId = message.headers?.['x-correlation-id'];
      const correlationIdStr = typeof correlationId === 'string' ? correlationId : correlationId?.toString();
      
      if (correlationIdStr) {
        logger.info('Dispatch ready event received', { 
          correlationId: correlationIdStr,
          payload: message.payload.toString()
        });
      } else {
        logger.info('Dispatch ready event received (no correlation ID)', { 
          payload: message.payload.toString()
        });
      }
      
      await controls.ack();
    });

    logger.info('✅ Subscribed to dispatch.ready topic');

    app.listen(PORT, () => {
      logger.info(`API Gateway listening on port ${PORT}`);
      console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
  });

  } catch (error) {
    console.error('❌ API Gateway failed to start:', error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
