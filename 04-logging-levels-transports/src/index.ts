import { syntropyLog, initializeSyntropyLog, gracefulShutdown } from './boilerplate';

async function demonstrateLoggingLevels() {
  console.log('🎯 Example 04: Logging Levels and Transports\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();
  
    const contextManager = syntropyLog.getContextManager();

  // Create multiple loggers with different names
  const mainLogger = syntropyLog.getLogger('main-application');
  const userLogger = syntropyLog.getLogger('user-service');
  const paymentLogger = syntropyLog.getLogger('payment-processor');
  const dbLogger = syntropyLog.getLogger('database-connection');
  const authLogger = syntropyLog.getLogger('authentication-middleware');

  // Wrap ALL logging operations in a global context
  await contextManager.run(async () => {
    const correlationId = contextManager.getCorrelationId();
    contextManager.set('operation', 'logging-demo');
    contextManager.set('userId', 'demo-user-123');

    // Logs directos CON contexto global
    mainLogger.info('🚀 Starting logging levels demonstration...');

  console.log('📊 Demonstrating different log levels with multiple loggers:\n');

  // Fatal level - Critical errors that cause application failure
  mainLogger.fatal('Application is shutting down due to critical error', {
    error: 'Database connection lost',
    impact: 'All services affected',
  });

  // Error level - Errors that don't stop the application
  userLogger.error('Failed to process user request', {
    userId: 'user-123',
    operation: 'payment-processing',
    error: 'Payment gateway timeout',
  });

  // Warn level - Warning conditions
  dbLogger.warn('High memory usage detected', {
    memoryUsage: '85%',
    threshold: '80%',
    recommendation: 'Consider scaling up',
  });

  // Info level - General information
  authLogger.info('User login successful', {
    userId: 'user-123',
    method: 'email',
    timestamp: new Date().toISOString(),
  });

  // Debug level - Detailed debugging information
  paymentLogger.debug('Processing payment request', {
    amount: 99.99,
    currency: 'USD',
    paymentMethod: 'credit-card',
    gateway: 'stripe',
  });

  // Trace level - Very detailed tracing
  dbLogger.trace('Database query executed', {
    query: 'SELECT * FROM users WHERE id = ?',
    params: ['user-123'],
    executionTime: '2.5ms',
    rowsReturned: 1,
  });

  console.log('\n🎨 Demonstrating different transports:\n');

  // Show how different transports would handle the same log
  console.log('📝 Console Transport (Pretty):');
  mainLogger.info('This is a pretty console log', {
    feature: 'console-transport',
    style: 'human-readable',
  });

  console.log('\n📄 JSON Transport:\n');
  // In production, this would be structured JSON
  console.log(
    JSON.stringify(
      {
        level: 'info',
        message: 'This is a JSON structured log',
        timestamp: new Date().toISOString(),
        service: 'logging-levels-example',
        context: {
          operation: 'logging-demo',
          userId: 'demo-user-123',
        },
        metadata: {
          feature: 'json-transport',
          style: 'structured',
        },
      },
      null,
      2
    )
  );

  console.log('\n🔧 Environment-based configuration:\n');

  // Demonstrate environment-based logging levels
  const env = process.env.NODE_ENV || 'development';
  console.log(`🌍 Environment: ${env}`);

  if (env === 'development') {
    console.log(
      '🐛 Development: All log levels enabled (including debug and trace)'
    );
    userLogger.debug('This debug message is visible in development');
    dbLogger.trace('This trace message is visible in development');
  } else if (env === 'production') {
    console.log('🏭 Production: Only info, warn, error, and fatal levels');
    userLogger.debug('This debug message is NOT visible in production');
    dbLogger.trace('This trace message is NOT visible in production');
  }

    // Logs después del contexto
    mainLogger.info('✅ Logging levels and transports demonstration completed!');

    // Exit gracefully after demonstration
    console.log('\n🎉 Example completed successfully! Exiting...');
    await gracefulShutdown('COMPLETION');
  });
}

// Run the demonstration
demonstrateLoggingLevels().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
}); 