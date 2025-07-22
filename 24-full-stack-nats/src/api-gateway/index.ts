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
      
      // Handle payload - could be Buffer or object
      let payload;
      logger.info('DEBUG: Processing payload', { 
        payloadType: typeof message.payload,
        isBuffer: Buffer.isBuffer(message.payload),
        hasType: message.payload && typeof message.payload === 'object' && 'type' in message.payload,
        hasData: message.payload && typeof message.payload === 'object' && 'data' in message.payload
      });
      
      if (Buffer.isBuffer(message.payload)) {
        const bufferString = message.payload.toString();
        logger.info('DEBUG: Buffer content', { 
          bufferString: bufferString.substring(0, 100) + '...',
          bufferLength: message.payload.length
        });
        
        // First parse: get the JSON from the buffer
        const parsedFromBuffer = JSON.parse(bufferString);
        
        // Second parse: if it's a Buffer object, extract the actual data
        if (parsedFromBuffer && typeof parsedFromBuffer === 'object' && parsedFromBuffer.type === 'Buffer' && Array.isArray(parsedFromBuffer.data)) {
          const actualBuffer = Buffer.from(parsedFromBuffer.data);
          payload = JSON.parse(actualBuffer.toString());
          logger.info('DEBUG: Double parsed Buffer payload (Buffer object)');
        } else {
          payload = parsedFromBuffer;
          logger.info('DEBUG: Single parsed Buffer payload (direct JSON)');
        }
      } else if (typeof message.payload === 'string') {
        payload = JSON.parse(message.payload);
        logger.info('DEBUG: Parsed string payload');
      } else if (message.payload && typeof message.payload === 'object' && 'type' in message.payload && 'data' in message.payload) {
        // Handle Buffer object representation
        const bufferObj = message.payload as any;
        if (bufferObj.type === 'Buffer' && Array.isArray(bufferObj.data)) {
          const buffer = Buffer.from(bufferObj.data);
          payload = JSON.parse(buffer.toString());
          logger.info('DEBUG: Parsed Buffer object payload');
        } else {
          payload = message.payload;
          logger.info('DEBUG: Using original payload (not Buffer object)');
        }
      } else {
        payload = message.payload;
        logger.info('DEBUG: Using original payload (fallback)');
      }
      
      if (correlationIdStr) {
        logger.info('DEBUG: Final payload to log', { 
          payloadType: typeof payload,
          payloadKeys: payload && typeof payload === 'object' ? Object.keys(payload) : 'not object'
        });
        logger.info('Dispatch ready event received', { 
          correlationId: correlationIdStr,
          payload: payload // This should now be the parsed JSON object
        });
      } else {
        logger.info('Dispatch ready event received (no correlation ID)', { 
          payload: payload // This should now be the parsed JSON object
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
