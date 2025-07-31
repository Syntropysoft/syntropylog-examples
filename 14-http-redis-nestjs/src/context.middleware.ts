import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { syntropyLog } from 'syntropylog';

@Injectable()
export class SyntropyContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (syntropyLog.getState() !== 'READY') {
      return next();
    }

    const contextManager = syntropyLog.getContextManager();
    const correlationIdHeader = contextManager.getCorrelationIdHeaderName();
    const transactionIdHeader = contextManager.getTransactionIdHeaderName();

    // Extract or generate correlation ID
    const correlationId = contextManager.getCorrelationId();

    const transactionId = req.headers[transactionIdHeader] as string;

    // Run request in context
    contextManager.run(async () => {
      contextManager.set('correlationId', correlationId);

      if (transactionId) {
        contextManager.set('transactionId', transactionId);
      }

      // Add to response headers
      res.setHeader(correlationIdHeader, correlationId);

      if (transactionId) {
        res.setHeader(transactionIdHeader, transactionId);
      }

      next();
    });
  }
}
