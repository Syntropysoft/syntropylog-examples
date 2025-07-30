// =================================================================
//  contextMiddleware.ts - SyntropyLog Context Middleware for Express
//  RESPONSIBILITY: Create and manage context for each HTTP request
// =================================================================

import { Request, Response, NextFunction } from 'express';
import { syntropyLog } from 'syntropyLog';

/**
 * Middleware that creates a SyntropyLog context for each HTTP request
 * and ensures all operations within the request use the same context.
 */
export function syntropyContextMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const contextManager = syntropyLog.getContextManager();
    
    // Create a new context for this request
    contextManager.run(async () => {
      // Extract correlation ID from headers or generate one
      const correlationId = req.headers['x-correlation-id'] as string || contextManager.getCorrelationId();
      const transactionId = req.headers[contextManager.getTransactionIdHeaderName()];
      
      // Set the correlation ID in the context
      contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
      contextManager.set(contextManager.getTransactionIdHeaderName(), transactionId);
      
      // Continue with the request
      next();
    });
  };
} 