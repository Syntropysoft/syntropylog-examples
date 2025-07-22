import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady } from './boilerplate';

// Different logging matrix configurations
const loggingMatrixConfigurations = {
  // Minimal context for success logs
  success: {
    info: ['correlationId', 'serviceName'],
    debug: ['correlationId', 'serviceName', 'operation']
  },

  // Medium context for warning logs
  warning: {
    warn: ['correlationId', 'userId', 'errorCode', 'operation']
  },

  // Full context for error logs
  error: {
    error: ['*'], // All context fields
    fatal: ['*']  // All context fields
  },

  // Cost-optimized configuration
  costOptimized: {
    info: ['correlationId'],           // Minimal for success
    warn: ['correlationId', 'userId'], // Medium for warnings
    error: ['*'],                      // Full for errors
    debug: ['correlationId', 'operation'], // Limited for debug
    trace: ['*']                       // Full for trace
  },

  // Business-focused configuration
  business: {
    info: ['correlationId', 'userId', 'operation'],
    warn: ['correlationId', 'userId', 'errorCode', 'orderId'],
    error: ['*'],
    debug: ['correlationId', 'operation', 'paymentId']
  }
};

async function demonstrateLoggingMatrix() {
  console.log('🎯 Example 08: Logging Matrix - Smart Context Filtering\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();

  // Wait for SyntropyLog to be ready before proceeding
  await waitForReady();

  const contextManager = syntropyLog.getContextManager();

  await contextManager.run(async () => {
    // Set rich context for demonstration
    const correlationId = contextManager.getCorrelationId();
    contextManager.set('operation', 'payment-processing');
    contextManager.set('userId', 'user-123');
    contextManager.set('orderId', 'order-456');
    contextManager.set('paymentId', 'payment-789');
    contextManager.set('errorCode', 'PAYMENT_TIMEOUT');
    contextManager.set('serviceName', 'payment-service');
    contextManager.set('amount', 99.99);
    contextManager.set('currency', 'USD');

    console.log('🔗 Full Context Available:', contextManager.getAll());
    console.log('\n📊 Demonstrating different logging matrix configurations:\n');

    // Configuration 1: Success-focused matrix
    console.log('✅ Configuration 1: Success-focused Matrix');
    syntropyLog.init({
      logger: {
        serviceName: 'success-matrix-service',
        level: 'info'
      },
      loggingMatrix: loggingMatrixConfigurations.success
    });

    const successLogger = syntropyLog.getLogger();
    successLogger.info('Payment processed successfully', { amount: 99.99 });
    successLogger.debug('Payment validation completed');

    // Configuration 2: Warning-focused matrix
    console.log('\n⚠️ Configuration 2: Warning-focused Matrix');
    syntropyLog.init({
      logger: {
        serviceName: 'warning-matrix-service',
        level: 'warn'
      },
      loggingMatrix: loggingMatrixConfigurations.warning
    });

    const warningLogger = syntropyLog.getLogger();
    warningLogger.warn('Payment gateway slow response', { timeout: 5000 });

    // Configuration 3: Error-focused matrix
    console.log('\n❌ Configuration 3: Error-focused Matrix');
    syntropyLog.init({
      logger: {
        serviceName: 'error-matrix-service',
        level: 'error'
      },
      loggingMatrix: loggingMatrixConfigurations.error
    });

    const errorLogger = syntropyLog.getLogger();
    errorLogger.error('Payment processing failed', { 
      error: 'Gateway timeout',
      retryCount: 3 
    });

    // Configuration 4: Cost-optimized matrix
    console.log('\n💰 Configuration 4: Cost-optimized Matrix');
    syntropyLog.init({
      logger: {
        serviceName: 'cost-optimized-service',
        level: 'info'
      },
      loggingMatrix: loggingMatrixConfigurations.costOptimized
    });

    const costLogger = syntropyLog.getLogger();
    costLogger.info('User login successful'); // Minimal context
    costLogger.warn('High memory usage'); // Medium context
    costLogger.error('Database connection failed'); // Full context
    costLogger.debug('Processing user request'); // Limited context

    // Configuration 5: Business-focused matrix
    console.log('\n🏢 Configuration 5: Business-focused Matrix');
    syntropyLog.init({
      logger: {
        serviceName: 'business-service',
        level: 'info'
      },
      loggingMatrix: loggingMatrixConfigurations.business
    });

    const businessLogger = syntropyLog.getLogger();
    businessLogger.info('Order created successfully');
    businessLogger.warn('Payment verification pending');
    businessLogger.error('Payment declined by bank');
    businessLogger.debug('Processing payment details');

    // Demonstrate cost savings
    console.log('\n📈 Cost Optimization Analysis:');
    
    const scenarios = [
      { level: 'info', context: 'minimal', cost: 'low' },
      { level: 'warn', context: 'medium', cost: 'medium' },
      { level: 'error', context: 'full', cost: 'high' },
      { level: 'debug', context: 'limited', cost: 'low' }
    ];

    scenarios.forEach(scenario => {
      console.log(`✅ ${scenario.level.toUpperCase()}: ${scenario.context} context (${scenario.cost} cost)`);
    });

    // Show context filtering by level
    console.log('\n🔍 Context Filtering by Level:');
    console.log('📝 INFO: Only correlationId, serviceName (minimal cost)');
    console.log('⚠️ WARN: correlationId, userId, errorCode (medium cost)');
    console.log('❌ ERROR: All context fields (full debugging)');
    console.log('🐛 DEBUG: correlationId, operation (limited cost)');

    // Demonstrate smart logging benefits
    console.log('\n🧠 Smart Logging Benefits:');
    console.log('✅ Cost Optimization: Minimal context for success logs');
    console.log('✅ Debugging Power: Full context for error logs');
    console.log('✅ Performance: Faster logging with less data');
    console.log('✅ Compliance: Full audit trail for errors');
    console.log('✅ Flexibility: Different strategies per environment');

    console.log('\n✅ Logging matrix demonstration completed!');
  });
  
  // Exit gracefully after demonstration
  console.log('\n🎉 Example completed successfully! Exiting...');
  await gracefulShutdown('COMPLETION');
}

// Run the demonstration
demonstrateLoggingMatrix().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
});
 