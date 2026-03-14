/**
 * Axios with interceptors for SyntropyLog.
 *
 * --- How we use the library (from index.ts) ---
 *
 * 1. index.ts gets from the library:
 *    - logger = syntropyLog.getLogger('http')
 *    - contextManager = syntropyLog.getContextManager()
 *
 * 2. contextManager:
 *    - index.ts wraps each scenario in contextManager.run(async () => { ... client.get() ... }).
 *      So each run has its own correlation ID for that "context" (the callback).
 *    - Here in the interceptor we only need:
 *      - getCorrelationId(): returns the ID of the current context. We put it in the outgoing
 *        request header and in every log so all logs for that request chain share the same ID.
 *      - getCorrelationIdHeaderName(): returns the header name (e.g. 'X-Correlation-ID', from
 *        init config). We set that header on the request so the next service can propagate it.
 *    So: request interceptor calls contextManager.getCorrelationId() and
 *    contextManager.getCorrelationIdHeaderName(), sets config.headers[headerName] = correlationId.
 *    We do not add correlationId to log payloads — SyntropyLog injects it from context so it appears once per log.
 *
 * 3. logger:
 *    - We call logger.info(), logger.debug(), logger.error() with a message and a metadata object.
 *    - The library (SyntropyLog) does the rest: masking (per init config), serialization,
 *      and transport. We don't sanitize here; we pass raw data and the library masks sensitive keys.
 *
 * 4. Why interfaces (LoggerLike, ContextManagerLike) here instead of importing from syntropylog?
 *    This file stays a "plain" Axios instrumenter: it only needs the shape we use (info/debug/error,
 *    getCorrelationId, getCorrelationIdHeaderName). We define minimal interfaces; index.ts passes
 *    the real logger and contextManager from the library. So this module doesn't depend on syntropylog;
 *    index.ts is the only place that imports syntropylog and wires these in.
 *
 * --- Behaviour ---
 * - Request: inject correlation ID header, record start time, log "HTTP request" with method, url (correlationId from context).
 * - Response (success or error): duration is calculated in the response path (same helper for both). Then:
 *   - Success: log "HTTP response" with status, durationMs; debug with full payload (library masks).
 *   - Error: log "HTTP request failed" with full context including durationMs (library masks).
 *
 * --- Axios error types (we handle all; never assume response or config) ---
 * - response: error.response is set — server answered with 4xx/5xx. We have status, data. config usually present.
 * - request: error.request is set but no response — network error, timeout, CORS, connection refused. config usually present; durationMs = time until failure.
 * - other: request was never sent (e.g. validation, cancel before send). config may be undefined; durationMs may be undefined.
 * We use optional chaining throughout and include errorKind in the log so you can tell which case it was.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/** Axios error phase: response = server answered with error; request = no response (network/timeout); other = request not sent. */
type AxiosErrorKind = 'response' | 'request' | 'other';

function getAxiosErrorKind(error: AxiosError): AxiosErrorKind {
  if (error.response) return 'response';
  if (error.request) return 'request';
  return 'other';
}

/** Minimum logger shape we need: info, debug, error. Filled in index.ts with syntropyLog.getLogger(). */
interface LoggerLike {
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  error(...args: unknown[]): void;
}

/** Minimum context manager shape we need: correlation ID and header name. Filled in index.ts with syntropyLog.getContextManager(). */
interface ContextManagerLike {
  getCorrelationId(): string;
  getCorrelationIdHeaderName(): string;
}

const START_TIME_KEY = '_syntropyLogStartTime';

type ConfigWithStart = InternalAxiosRequestConfig & { [k: string]: number };

/** Duration for this request (response path: success or error). Same calculation in both. */
function getRequestDurationMs(config: InternalAxiosRequestConfig | undefined): number | undefined {
  const start = (config as ConfigWithStart | undefined)?.[START_TIME_KEY];
  return typeof start === 'number' ? Date.now() - start : undefined;
}

/** Axios headers to plain object so SyntropyLog can apply masking to keys. */
function headersToObject(headers: unknown): Record<string, unknown> {
  if (!headers || typeof headers !== 'object') return {};
  if (typeof (headers as Record<string, unknown>).toJSON === 'function') {
    return (headers as { toJSON(): Record<string, unknown> }).toJSON() as Record<string, unknown>;
  }
  return { ...(headers as Record<string, unknown>) };
}

export interface CreateInstrumentedAxiosOptions {
  baseURL?: string;
  timeout?: number;
}

/**
 * Creates an instrumented Axios instance:
 * - Request: injects correlation ID, records start time.
 * - Response: info log with method, url, duration, status; debug with full payload (SyntropyLog masks by config).
 * - Error: full context to logger; SyntropyLog masking applies so sensitive fields never appear in clear.
 */
export function createInstrumentedAxios(
  logger: LoggerLike,
  contextManager: ContextManagerLike,
  options: CreateInstrumentedAxiosOptions = {}
): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout ?? 10000,
  });

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config[START_TIME_KEY as keyof InternalAxiosRequestConfig] = Date.now();
      const correlationId = contextManager.getCorrelationId();
      const headerName = contextManager.getCorrelationIdHeaderName();
      config.headers.set(headerName, correlationId);
      // Info: always route/endpoint
      const method = (config.method ?? 'GET').toUpperCase();
      const url = config.url ?? config.baseURL ?? '';
      const fullUrl = url.startsWith('http') ? url : `${config.baseURL || ''}${url}`;
      logger.info('HTTP request', {
        method,
        url: fullUrl,
        endpoint: config.url,
      });
      return config;
    },
    (error) => {
      logger.error('HTTP request setup failed', { error: error?.message });
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      const durationMs = getRequestDurationMs(response.config);
      const method = (response.config?.method ?? 'GET').toUpperCase();
      const url = response.config?.url ?? '';
      const fullUrl = response.config?.baseURL
        ? `${response.config.baseURL}${url}`
        : response.config?.url ?? url;

      // Info: endpoint + partial duration (this request only) + status
      logger.info('HTTP response', {
        method,
        url: fullUrl,
        endpoint: url,
        status: response.status,
        durationMs, // partial: time for this endpoint only
      });

      // Debug: full payload; SyntropyLog masks sensitive keys per init() config
      logger.debug('HTTP response payload', {
        method,
        endpoint: url,
        status: response.status,
        durationMs,
        requestHeaders: headersToObject(response.config?.headers),
        responseData: response.data,
      });

      return response;
    },
    (error: AxiosError) => {
      const config = error.config;
      const durationMs = getRequestDurationMs(config);
      const errorKind = getAxiosErrorKind(error);
      const method = config?.method ?? 'GET';
      const url = config?.url ?? '';
      const fullUrl = config?.baseURL ? `${config.baseURL}${url}` : url;

      // Full context to logger; durationMs = partial (this endpoint only). Never assume config/response; errorKind distinguishes response vs request vs other.
      const contextForLog = {
        errorKind, // 'response' | 'request' | 'other' — which type of Axios error
        method: (typeof method === 'string' ? method : 'GET').toUpperCase(),
        url: fullUrl,
        endpoint: url,
        durationMs, // partial: time for this endpoint only; may be undefined if request never sent (errorKind === 'other')
        status: error.response?.status, // only set when errorKind === 'response'
        statusText: error.response?.statusText,
        message: error.message,
        requestHeaders: headersToObject(config?.headers),
        requestData: config?.data,
        responseData: error.response?.data, // only set when errorKind === 'response'
      };

      logger.error('HTTP request failed', contextForLog);
      if (error.response) {
        logger.error('HTTP error response', {
          status: error.response.status,
          data: error.response.data,
        });
      }

      return Promise.reject(error);
    }
  );

  return client;
}
