import type { Provider } from '@nestjs/common';
import { createTracing, env, SVC_ORDERS } from '@distributed/shared';

/**
 * Tracing wired as NestJS providers (DIP): the controller and service depend on the
 * `TRACER` token, not on a concrete tracer. Created once at module load — `withSpan`
 * reads the SyntropyLog context lazily at request time, so this is safe before init().
 */
export const TRACER = 'TRACER';

const tracing = createTracing(SVC_ORDERS, env.COLLECTOR_URL);

export const tracingProviders: Provider[] = [{ provide: TRACER, useValue: tracing.tracer }];

/** Flush any buffered spans — called on shutdown. */
export const shutdownTracing = (): Promise<void> => tracing.shutdown();
