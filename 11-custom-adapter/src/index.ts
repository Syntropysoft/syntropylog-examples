import { syntropyLog, CompactConsoleTransport } from 'syntropylog';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';
import { CustomFetchAdapter } from './CustomFetchAdapter';
import { randomUUID } from 'crypto';
import nock from 'nock';

const MOCK_API_URL = 'https://api.example.com';

/**
 * Example 11: Custom Adapter Implementation 🛠️
 * 
 * This example demonstrates how to create and use custom adapters in SyntropyLog.
 * It shows how to implement a custom adapter for the native fetch API.
 * 
 * Key Learning Points:
 * 1. How to create a custom adapter that implements the SyntropyLog interface
 * 2. How to transform between generic and specific HTTP client formats
 * 3. How to handle errors and responses in custom adapters
 * 4. How SyntropyLog can work with ANY HTTP client through adapters
 * 5. How to work with native browser APIs like fetch
 * 6. The flexibility and extensibility of SyntropyLog's adapter system
 */

async function main() {
  try {
    // 1. Initialize SyntropyLog with custom adapter
    await initializeSyntropyLog({
      logger: {
        serviceName: 'custom-adapter-example',
        level: 'info',
        transports: [new CompactConsoleTransport()],
        serializerTimeoutMs: 100,
      },
      context: {
        correlationIdHeader: 'X-Correlation-ID',
      },
      http: {
        instances: [
          {
            instanceName: 'custom-fetch-client',
            // Using our custom adapter for the native fetch API
            adapter: new CustomFetchAdapter(),
          },
        ],
      },
    });

    const logger = syntropyLog.getLogger('main');
    logger.info('🛠️ Custom adapter example initialized!');

    // 2. Mock the external API endpoint with Nock
    nock(MOCK_API_URL)
      .get('/api/data')
      .reply(200, function (uri, requestBody) {
        const correlationHeader = this.req.headers['x-correlation-id'];
        if (!correlationHeader) {
          throw new Error('X-Correlation-ID header was not received!');
        }
        logger.info('🌐 API call confirmed: Custom adapter correlation ID received!', { 
          correlationId: correlationHeader,
          endpoint: '/api/data',
          method: 'GET',
          adapter: 'CustomFetchAdapter'
        });
        return { 
          message: 'Custom adapter response',
          timestamp: new Date().toISOString(),
          status: 'success',
          adapter: 'custom'
        };
      });

    // 3. Create a context for the operation
    const contextManager = syntropyLog.getContextManager();
    await contextManager.run(async () => {
      const correlationId = randomUUID();
      contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
      
      logger.info('🛠️ Context created. Testing custom adapter...');

      // 4. Test the custom FetchAdapter
      logger.info('🌐 Testing custom FetchAdapter...');
      const fetchClient = syntropyLog.getHttp('custom-fetch-client');
      
      try {
        const fetchResponse = await fetchClient.request<{ message: string, adapter: string, status: string }>({
          method: 'GET',
          url: `${MOCK_API_URL}/api/data`,
          headers: {
            'User-Agent': 'SyntropyLog-Custom-Client/1.0'
          },
        });
        
        logger.info('🌐 Custom adapter response received!', {
          message: fetchResponse.data.message,
          adapter: fetchResponse.data.adapter,
          status: fetchResponse.data.status
        });
        
      } catch (error) {
        logger.error(`❌ Custom adapter API call failed  ${JSON.stringify( error)}`);
      }
      
      logger.info('🛠️ Custom adapter tested successfully!');
    });
    
    // 6. Graceful shutdown
    await gracefulShutdown();
    
  } catch (error) {
    console.error('❌ Error in Custom Adapter example:', error);
    process.exit(1);
  }
}

// Run the example
main(); 