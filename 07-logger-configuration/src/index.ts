import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady } from './boilerplate';

// Different logger configurations
const loggerConfigurations = {
  // Basic logger configuration
  basic: {
    logger: {
      serviceName: 'basic-service',
      level: 'info'
    }
  },

  // Development logger configuration
  development: {
    logger: {
      serviceName: 'dev-service',
      level: 'debug',
      prettyPrint: true,
      timeout: 5000
    }
  },

  // Production logger configuration
  production: {
    logger: {
      serviceName: 'prod-service',
      level: 'warn',
      prettyPrint: false,
      timeout: 3000
    }
  },

  // Multiple transports configuration
  multipleTransports: {
    logger: {
      serviceName: 'multi-transport-service',
      level: 'info',
      transports: [
        {
          type: 'console',
          level: 'info'
        },
        {
          type: 'json',
          level: 'error'
        }
      ]
    }
  },

  // Custom serializers configuration
  customSerializers: {
    logger: {
      serviceName: 'custom-serializer-service',
      level: 'info',
      serializers: {
        user: (user: any) => ({
          id: user.id,
          email: user.email,
          name: user.name
        }),
        order: (order: any) => ({
          id: order.id,
          total: order.total,
          status: order.status
        })
      }
    }
  }
};

async function demonstrateLoggerConfiguration() {
  console.log('🎯 Example 07: Logger Configuration\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();

  // Wait for SyntropyLog to be ready before proceeding
  await waitForReady();

  const contextManager = syntropyLog.getContextManager();

  await contextManager.run(async () => {
    contextManager.set('operation', 'logger-config-demo');
    contextManager.set('userId', 'demo-user-123');

    console.log('📋 Demonstrating different logger configurations:\n');

    // Configuration 1: Basic logger
    console.log('🔧 Configuration 1: Basic Logger');
    syntropyLog.init(loggerConfigurations.basic);
    const basicLogger = syntropyLog.getLogger();
    
    basicLogger.info('Basic logger configured', {
      serviceName: loggerConfigurations.basic.logger.serviceName,
      level: loggerConfigurations.basic.logger.level
    });

    // Configuration 2: Development logger
    console.log('\n🐛 Configuration 2: Development Logger');
    syntropyLog.init(loggerConfigurations.development);
    const devLogger = syntropyLog.getLogger();
    
    devLogger.debug('Development logger with debug level', {
      serviceName: loggerConfigurations.development.logger.serviceName,
      level: loggerConfigurations.development.logger.level,
      prettyPrint: loggerConfigurations.development.logger.prettyPrint
    });

    // Configuration 3: Production logger
    console.log('\n🏭 Configuration 3: Production Logger');
    syntropyLog.init(loggerConfigurations.production);
    const prodLogger = syntropyLog.getLogger();
    
    prodLogger.warn('Production logger with warn level', {
      serviceName: loggerConfigurations.production.logger.serviceName,
      level: loggerConfigurations.production.logger.level,
      prettyPrint: loggerConfigurations.production.logger.prettyPrint
    });

    // Configuration 4: Multiple transports
    console.log('\n🚚 Configuration 4: Multiple Transports');
    syntropyLog.init(loggerConfigurations.multipleTransports);
    const multiLogger = syntropyLog.getLogger();
    
    multiLogger.info('Multiple transports logger', {
      serviceName: loggerConfigurations.multipleTransports.logger.serviceName,
      transportCount: loggerConfigurations.multipleTransports.logger.transports?.length || 0
    });

    multiLogger.error('Error log with multiple transports', {
      error: 'Sample error',
      serviceName: loggerConfigurations.multipleTransports.logger.serviceName
    });

    // Configuration 5: Custom serializers
    console.log('\n🔧 Configuration 5: Custom Serializers');
    syntropyLog.init(loggerConfigurations.customSerializers);
    const customLogger = syntropyLog.getLogger();
    
    const user = {
      id: 123,
      email: 'user@example.com',
      name: 'John Doe',
      password: 'secret123', // This should be masked
      internalData: 'should-not-appear'
    };

    const order = {
      id: 'order-456',
      total: 99.99,
      status: 'pending',
      internalNotes: 'customer is VIP',
      paymentDetails: 'should-be-masked'
    };

    customLogger.info('User data with custom serializer', {
      user,
      operation: 'user-login'
    });

    customLogger.info('Order data with custom serializer', {
      order,
      operation: 'order-created'
    });

    // Demonstrate logger levels
    console.log('\n📊 Logger Level Demonstration:');
    
    const testLogger = syntropyLog.getLogger();
    
    testLogger.fatal('Fatal error - application will crash');
    testLogger.error('Error occurred but application continues');
    testLogger.warn('Warning condition detected');
    testLogger.info('General information message');
    testLogger.debug('Debug information (only in development)');
    testLogger.trace('Trace information (very detailed)');

    // Demonstrate service configuration
    console.log('\n⚙️ Service Configuration:');
    console.log('✅ Service Name: Identifies the service in logs');
    console.log('✅ Log Level: Controls which messages are logged');
    console.log('✅ Pretty Print: Human-readable vs structured logs');
    console.log('✅ Timeout: Prevents slow logging operations');
    console.log('✅ Transports: Multiple output destinations');
    console.log('✅ Serializers: Custom object serialization');

    console.log('\n✅ Logger configuration demonstration completed!');
  });
  
  // Exit gracefully after demonstration
  console.log('\n🎉 Example completed successfully! Exiting...');
  await gracefulShutdown('COMPLETION');
}

// Run the demonstration
demonstrateLoggerConfiguration().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
}); 