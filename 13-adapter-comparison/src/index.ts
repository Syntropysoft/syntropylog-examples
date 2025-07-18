import { syntropyLog, CompactConsoleTransport } from 'syntropylog';
import { AxiosAdapter } from '@syntropylog/adapters';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';
import { CustomFetchAdapter } from './CustomFetchAdapter';
import { randomUUID } from 'crypto';
import nock from 'nock';
import axios from 'axios';

const MOCK_API_URL = 'https://api.example.com';

/**
 * Example 11: Custom Adapter Implementation 🛠️
 * 
 * This example demonstrates how to create and use custom adapters in SyntropyLog.
 * It shows both built-in adapters (AxiosAdapter) and custom adapters (CustomFetchAdapter).
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
    // 1. Initialize SyntropyLog with both built-in and custom adapters
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
            instanceName: 'builtin-axios-client',
            // Using the built-in AxiosAdapter
            adapter: new AxiosAdapter(axios),
          },
          {
            instanceName: 'custom-fetch-client',
            // Using our custom adapter for the native fetch API
            adapter: new CustomFetchAdapter(fetch),
          },
        ],
      },
    });

    const logger = syntropyLog.getLogger('main');
    logger.info('🛠️ Custom adapter example initialized!');

    // 2. Mock the external API endpoints with Nock
    nock(MOCK_API_URL)
      .get('/api/modern')
      .reply(200, function (uri, requestBody) {
        const correlationHeader = this.req.headers['x-correlation-id'];
        if (!correlationHeader) {
          throw new Error('X-Correlation-ID header was not received!');
        }
        logger.info('✅ Modern API call confirmed: Axios correlation ID received!', { 
          correlationId: correlationHeader,
          endpoint: '/api/modern',
          method: 'GET',
          adapter: 'AxiosAdapter'
        });
        return { 
          message: 'Modern API response',
          timestamp: new Date().toISOString(),
          status: 'success',
          adapter: 'built-in'
        };
      });

    nock(MOCK_API_URL)
      .get('/api/native')
      .reply(200, function (uri, requestBody) {
        const correlationHeader = this.req.headers['x-correlation-id'];
        if (!correlationHeader) {
          throw new Error('X-Correlation-ID header was not received!');
        }
        logger.info('🌐 Native API call confirmed: Fetch correlation ID received!', { 
          correlationId: correlationHeader,
          endpoint: '/api/native',
          method: 'GET',
          adapter: 'CustomFetchAdapter'
        });
        return { 
          message: 'Native API response',
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
      
      logger.info('🛠️ Context created. Testing both adapters...');

      // 4. Test the built-in AxiosAdapter
      logger.info('🚀 Testing built-in AxiosAdapter...');
      const axiosClient = syntropyLog.getHttp('builtin-axios-client');
      
      try {
        const axiosResponse = await axiosClient.request({
          method: 'GET',
          url: '/api/modern',
          headers: {
            'User-Agent': 'SyntropyLog-Axios-Client/1.0'
          },
        });
        
        logger.info('✅ Axios response received!', {
          message: axiosResponse.data.message,
          adapter: axiosResponse.data.adapter,
          status: axiosResponse.data.status
        });
        
      } catch (error) {
        logger.error('❌ Axios API call failed', { error });
      }

      // 5. Test the custom FetchAdapter
      logger.info('🌐 Testing custom FetchAdapter...');
      const fetchClient = syntropyLog.getHttp('custom-fetch-client');
      
      try {
        const fetchResponse = await fetchClient.request({
          method: 'GET',
          url: '/api/native',
          headers: {
            'User-Agent': 'SyntropyLog-Fetch-Client/1.0'
          },
        });
        
        logger.info('🌐 Fetch response received!', {
          message: fetchResponse.data.message,
          adapter: fetchResponse.data.adapter,
          status: fetchResponse.data.status
        });
        
      } catch (error) {
        logger.error('❌ Fetch API call failed', { error });
      }
      
      logger.info('🛠️ Both adapters tested successfully!');
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