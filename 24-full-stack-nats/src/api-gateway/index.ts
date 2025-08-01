// =================================================================
//  API Gateway - Entry point for sales requests
//  RESPONSIBILITY: Handle HTTP requests and publish to NATS
// =================================================================

import express from 'express';
import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog } from './boilerplate.js';

const PORT = parseInt(process.env.PORT || '3000');

// Middleware to handle SyntropyLog context for HTTP requests
function syntropyContextMiddleware() {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const contextManager = syntropyLog.getContextManager();

    // Create a new context for this request
    contextManager.run(async () => {
      // Extract correlation ID from headers or generate one
      const correlationId =
        (req.headers[contextManager.getCorrelationIdHeaderName()] as string) ||
        contextManager.getCorrelationId();

      // Set the correlation ID in the context
      contextManager.set(
        contextManager.getCorrelationIdHeaderName(),
        correlationId
      );

      res.setHeader(
        contextManager.getCorrelationIdHeaderName(),
        correlationId
      );

      // Continue with the request
      next();
    });
  };
}

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

    // Use SyntropyLog context middleware
    app.use(syntropyContextMiddleware());

    // Endpoint to create a new sale
    app.post('/sales', async (req: express.Request, res: express.Response) => {
      const saleData = req.body;
      const contextManager = syntropyLog.getContextManager();
      const correlationId = contextManager.get(
        contextManager.getCorrelationIdHeaderName()
      ) as string;

      try {
        logger.info('Received new sale request', { saleData, correlationId });

        await broker.publish('sales.new', { 
          payload: Buffer.from(JSON.stringify(saleData)),
          headers: {
            [contextManager.getCorrelationIdHeaderName()]: correlationId
          }
        });
        logger.info('Sale event published to NATS', { correlationId });

        res.status(202).json({
          message: 'Sale processing started',
          correlationId,
        });
      } catch (error) {
        logger.error('Failed to publish sale event', {
          error: error instanceof Error ? error.message : String(error),
          correlationId,
        });
        res.status(500).json({ message: 'Internal Server Error' });
      }
    });

    // Subscribe to dispatch ready events
    await broker.subscribe('dispatch.ready', brokerContextMiddleware(async (message, controls) => {
      let payload;

      if (Buffer.isBuffer(message.payload)) {
        payload = JSON.parse(message.payload.toString());
      } else if (typeof message.payload === 'string') {
        payload = JSON.parse(message.payload);
      } else {
        payload = message.payload;
      }

      logger.info('Dispatch ready event received', { payload });
      await controls.ack();
    }));

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
