// =================================================================
//  contextMiddleware.ts - Koa Context Middleware
//  RESPONSIBILITY: Set context and correlation IDs for each request
// =================================================================

import { Context, Next } from 'koa';
import { syntropyLog } from 'syntropylog';

/**
 * Koa middleware that sets context and correlation IDs
 */
export function contextMiddleware() {
  return async (ctx: Context, next: Next) => {
    const contextManager = syntropyLog.getContextManager();
    // Set context in Koa state
    ctx.state.correlationId = ctx.headers[contextManager.getCorrelationIdHeaderName()] || contextManager.getCorrelationId();
    ctx.state.traceId = ctx.headers[contextManager.getTransactionIdHeaderName()] || contextManager.getTransactionId();

    // Set context in SyntropyLog ContextManager using run()
    await contextManager.run(async () => {
      // Set context within the run() scope
      contextManager.set(contextManager.getCorrelationIdHeaderName(), ctx.state.correlationId);
      contextManager.set(contextManager.getTransactionIdHeaderName(), ctx.state.traceId);
      
      // Continue with the request
      await next();
    });
  };
} 