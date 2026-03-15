/**
 * Example 10: Basic HTTP correlation with SyntropyLog
 *
 * Uses the current API: init({ logger, context }) only. No getHttp.
 * Correlation ID is propagated via an Axios request interceptor that injects
 * the header from syntropyLog.getContextManager().
 */
import { syntropyLog, CompactConsoleTransport } from 'syntropylog';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';
import nock from 'nock';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const MOCK_API_URL = 'https://api.example.com';

/**
 * Creates an Axios instance that injects the current context's correlation ID
 * into every request (X-Correlation-ID or whatever is configured in context.correlationIdHeader).
 */
function createAxiosWithCorrelation(
  contextManager: { getCorrelationId(): string; getCorrelationIdHeaderName(): string },
  baseURL: string
): AxiosInstance {
  const client = axios.create({ baseURL });
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const correlationId = contextManager.getCorrelationId();
      const headerName = contextManager.getCorrelationIdHeaderName();
      config.headers.set(headerName, correlationId);
      return config;
    },
    (error) => Promise.reject(error)
  );
  return client;
}

async function main() {
  try {
    // 1. Initialize SyntropyLog (logger + context only; no http instances)
    await initializeSyntropyLog({
      logger: {
        serviceName: 'http-example',
        level: 'info',
        transports: [new CompactConsoleTransport()],
        serializerTimeoutMs: 100,
      },
      context: {
        correlationIdHeader: 'X-Correlation-ID',
      },
    });

    const logger = syntropyLog.getLogger('main');
    const contextManager = syntropyLog.getContextManager();
    logger.info('Initialized.');

    // 2. Create Axios client that injects correlation ID via interceptor
    const apiClient = createAxiosWithCorrelation(contextManager, MOCK_API_URL);

    // 3. Mock the external API with Nock (expects X-Correlation-ID header)
    nock(MOCK_API_URL)
      .get('/users/1')
      .reply(200, function (this: { req: { headers: Record<string, string> } }) {
        const correlationHeader = this.req.headers['x-correlation-id'];
        if (!correlationHeader) {
          throw new Error('X-Correlation-ID header was not received!');
        }
        logger.info('Nock mock confirmed: Correlation ID received!', {
          correlationId: correlationHeader,
        });
        return { id: 1, name: 'John Doe' };
      });

    // 4. Run the HTTP call inside a context (one correlation ID for this flow)
    await contextManager.run(async () => {
      logger.info('Context created. Making HTTP call...');

      try {
        await apiClient.get('/users/1');
      } catch (error) {
        logger.error('API call failed', { error });
      }

      logger.info('Request finished.');
    });

    await gracefulShutdown();
  } catch (error) {
    console.error('❌ Error in HTTP correlation example:', error);
    process.exit(1);
  }
}

main();
