/**
 * Example 11: Axios with interceptors and level-based logging
 *
 * We load the logging matrix and generic masking patterns at init. On error we
 * include all fields (matrix ['*']), but fields that match masking are never
 * shown in clear—only masked.
 *
 * - Interceptors: inject X-Correlation-ID and measure request duration.
 * - Info: method and endpoint (route).
 * - Debug: full payload; error: full context. SyntropyLog does all sanitization via masking config.
 *
 * No legacy API (getHttp, init({ http })); Axios + interceptors + logger + contextManager.
 *
 * --- Context and correlationId (important) ---
 * One contextManager.run() = one context = one correlationId. All logs inside that run() share the same ID.
 * - If you call run() once per "request" (e.g. per HTTP request in Express), all logs for that request have the same correlationId.
 * - If you call run() once per "scenario" (like below), each scenario gets a different correlationId.
 * - If you do several HTTP calls inside a single run(), they all keep the same correlationId — see "Scenario 5" below.
 */
import {
  syntropyLog,
  ColorfulConsoleTransport,
  maskEnum,
  MaskingStrategy,
  getDefaultMaskingRules,
} from 'syntropylog';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';
import { createInstrumentedAxios } from './axiosInstrumented';
import nock from 'nock';

const MOCK_API_URL = 'https://api.example.com';

/**
 * App-specific keys/patterns we add on top of maskEnum. Kept here for readability;
 * in a real app this can live in a dedicated file (e.g. config/masking.ts or constants/masking.ts).
 */
const APP_EXTRA_MASK = {
  tokenHeaders: ['x-api-key', 'x-secret', 'x-internal-secret'],
  credentialLike: ['credentials', 'cvv', 'cvc'],
  cookieHeader: /cookie|set-cookie/i,
} as const;

/**
 * Full masking for this app: spread library defaults + maskEnum, then add what we need.
 * Single source of truth, aligned with library patterns (maskEnum, getDefaultMaskingRules).
 */
const MASK_APP = [
  ...getDefaultMaskingRules({ maskChar: '*', preserveLength: false }),
  { pattern: new RegExp([maskEnum.MASK_KEY_AUTHORIZATION, maskEnum.MASK_KEY_AUTH_TOKEN].join('|'), 'i'), strategy: MaskingStrategy.PASSWORD },
  { pattern: new RegExp([...maskEnum.MASK_KEYS_TOKEN, ...APP_EXTRA_MASK.tokenHeaders].join('|'), 'i'), strategy: MaskingStrategy.TOKEN },
  { pattern: APP_EXTRA_MASK.cookieHeader, strategy: MaskingStrategy.PASSWORD },
  { pattern: new RegExp([maskEnum.MASK_KEY_CREDENTIAL, ...APP_EXTRA_MASK.credentialLike].join('|'), 'i'), strategy: MaskingStrategy.PASSWORD },
];

async function main() {
  await initializeSyntropyLog({
    logger: {
      serviceName: 'axios-interceptors-example',
      level: 'info', // Set to 'debug' to see payloads (sensitive fields masked by SyntropyLog)
      transports: [new ColorfulConsoleTransport()],
      serializerTimeoutMs: 100,
    },
    context: {
      correlationIdHeader: 'X-Correlation-ID',
    },
    // Logging matrix: which fields are included per level. Loaded once at init.
    // At error we include all fields (*), but masking still applies—sensitive ones never appear in clear.
    loggingMatrix: {
      default: ['correlationId'],
      info: ['correlationId'],
      warn: ['correlationId'],
      error: ['*'],
      fatal: ['*'],
    },
    masking: {
      enableDefaultRules: false,
      maskChar: '*',
      preserveLength: false,
      rules: MASK_APP,
    },
  });

  const logger = syntropyLog.getLogger('http');
  const contextManager = syntropyLog.getContextManager();

  const client = createInstrumentedAxios(logger, contextManager, {
    baseURL: MOCK_API_URL,
    timeout: 5000,
  });

  logger.info('Instrumented Axios ready. Running example requests...');

  /**
   * Runs the callback inside a single context (one correlationId for the whole callback).
   * Logs total context time in finally. The client only reports its own request duration (durationMs).
   */
  async function runWithTiming(
    scenario: string,
    fn: () => Promise<void>
  ): Promise<void> {
    const contextStart = Date.now();
    await contextManager.run(async () => {
      try {
        await fn();
      } finally {
        const totalContextMs = Date.now() - contextStart;
        logger.info(`${scenario} — context completed`, {
          totalContextMs,
        });
      }
    });
  }

  // Scenario 1: Successful GET
  nock(MOCK_API_URL)
    .get('/api/users')
    .reply(200, { users: [{ id: 1, name: 'Alice' }], count: 1 });

  await runWithTiming('Scenario 1 (GET users)', async () => {
    try {
      const res = await client.get('/api/users');
      logger.info('GET example completed', { count: res.data?.count ?? 0 });
    } catch (e) {
      logger.error('GET failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  });

  // Scenario 2: POST with body (password/token masked by SyntropyLog default + custom rules)
  nock(MOCK_API_URL)
    .post('/api/login')
    .reply(200, () => ({ token: 'secret-jwt', userId: 'u1' }));

  await runWithTiming('Scenario 2 (POST login)', async () => {
    try {
      await client.post('/api/login', { user: 'admin', password: 'should-be-redacted' });
    } catch (e) {
      logger.error('POST failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  });

  // Scenario 3: Request with sensitive headers (masked by SyntropyLog per init masking rules)
  nock(MOCK_API_URL)
    .get('/api/secure')
    .matchHeader('X-Api-Key', 'secret-key-12345')
    .reply(200, { ok: true });

  await runWithTiming('Scenario 3 (GET secure)', async () => {
    try {
      await client.get('/api/secure', {
        headers: {
          'X-Api-Key': 'secret-key-12345',
          'X-Internal-Secret': 'confidential-value',
        },
      });
      logger.info('Secure request completed; sensitive headers masked by SyntropyLog.');
    } catch (e) {
      logger.error('Secure request failed', {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  });

  // Scenario 4: 404 error to see error log with full context
  nock(MOCK_API_URL).get('/api/not-found').reply(404, { error: 'Not Found' });

  await runWithTiming('Scenario 4 (GET not-found)', async () => {
    try {
      await client.get('/api/not-found');
    } catch {
      // Error and durationMs already logged by the interceptor; total time is logged by runWithTiming in finally
      logger.info('404 was expected; check lines above for the error log.');
    }
  });

  // --- Scenario 5: several HTTP calls in ONE context — same correlationId for all (data intact) ---
  nock(MOCK_API_URL).get('/api/users').reply(200, { users: [{ id: 1, name: 'Alice' }], count: 1 });
  nock(MOCK_API_URL).get('/api/secure').matchHeader('X-Api-Key', /.*/).reply(200, { ok: true });

  await runWithTiming('Scenario 5 (multiple requests, one context)', async () => {
    const res1 = await client.get('/api/users');
    logger.info('First call done', { count: res1.data?.count ?? 0 });
    const res2 = await client.get('/api/secure', { headers: { 'X-Api-Key': 'key-for-demo' } });
    logger.info('Second call done', { ok: res2.data?.ok });
    logger.info('All calls in this block share the same correlationId (see logs above).');
  });

  await gracefulShutdown();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
