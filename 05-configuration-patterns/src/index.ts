import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady } from './boilerplate';

// Configuration patterns
const configurationPatterns = {
  // Pattern 1: Basic configuration
  basic: {
    logger: {
      serviceName: 'basic-service',
      level: 'info'
    }
  },

  // Pattern 2: Environment-based configuration
  environment: {
    development: {
      logger: {
        serviceName: 'dev-service',
        level: 'debug',
        prettyPrint: true
      }
    },
    production: {
      logger: {
        serviceName: 'prod-service',
        level: 'warn',
        prettyPrint: false
      }
    }
  },

  // Pattern 3: Service-specific configuration
  serviceSpecific: {
    api: {
      logger: {
        serviceName: 'api-service',
        level: 'info'
      },
      http: {
        instances: [
          {
            instanceName: 'external-api',
            adapter: 'axios'
          }
        ]
      }
    },
    worker: {
      logger: {
        serviceName: 'worker-service',
        level: 'debug'
      },
      brokers: {
        instances: [
          {
            instanceName: 'task-queue',
            adapter: 'kafka'
          }
        ]
      }
    }
  },

  // Pattern 4: Configuration composition
  composition: {
    base: {
      logger: {
        level: 'info'
      }
    },
    features: {
      http: {
        instances: [
          {
            instanceName: 'default',
            adapter: 'fetch'
          }
        ]
      },
      redis: {
        instances: [
          {
            instanceName: 'cache',
            url: 'redis://localhost:6379'
          }
        ]
      }
    }
  }
};

async function demonstrateConfigurationPatterns() {
  console.log('🎯 Example 05: Configuration Patterns\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();

  // Wait for SyntropyLog to be ready before proceeding
  await waitForReady();

  const logger = syntropyLog.getLogger();
  const contextManager = syntropyLog.getContextManager();

  await contextManager.run(async () => {
    contextManager.set('operation', 'config-demo');
    contextManager.set('userId', 'demo-user-123');

    console.log('📋 Demonstrating different configuration patterns:\n');

    // Pattern 1: Basic configuration
    console.log('🔧 Pattern 1: Basic Configuration');
    logger.info('Basic configuration applied', {
      pattern: 'basic',
      serviceName: configurationPatterns.basic.logger.serviceName,
      level: configurationPatterns.basic.logger.level
    });

    // Pattern 2: Environment-based configuration
    console.log('\n🌍 Pattern 2: Environment-based Configuration');
    const env = process.env.NODE_ENV || 'development';
    const envConfig = configurationPatterns.environment[env as keyof typeof configurationPatterns.environment];
    
    logger.info('Environment-based configuration applied', {
      pattern: 'environment',
      environment: env,
      serviceName: envConfig.logger.serviceName,
      level: envConfig.logger.level,
      prettyPrint: envConfig.logger.prettyPrint
    });

    // Pattern 3: Service-specific configuration
    console.log('\n🏗️ Pattern 3: Service-specific Configuration');
    
    // API Service configuration
    logger.info('API service configuration', {
      pattern: 'service-specific',
      service: 'api',
      serviceName: configurationPatterns.serviceSpecific.api.logger.serviceName,
      httpInstances: configurationPatterns.serviceSpecific.api.http.instances.length
    });

    // Worker Service configuration
    logger.info('Worker service configuration', {
      pattern: 'service-specific',
      service: 'worker',
      serviceName: configurationPatterns.serviceSpecific.worker.logger.serviceName,
      brokerInstances: configurationPatterns.serviceSpecific.worker.brokers.instances.length
    });

    // Pattern 4: Configuration composition
    console.log('\n🧩 Pattern 4: Configuration Composition');
    
    // Combine base and features
    const composedConfig = {
      ...configurationPatterns.composition.base,
      ...configurationPatterns.composition.features
    };

    logger.info('Composed configuration applied', {
      pattern: 'composition',
      baseLevel: configurationPatterns.composition.base.logger.level,
      httpInstances: composedConfig.http?.instances?.length || 0,
      redisInstances: composedConfig.redis?.instances?.length || 0
    });

    console.log('\n📊 Configuration Pattern Summary:');
    console.log('✅ Basic: Simple, single-service configuration');
    console.log('✅ Environment: Different configs for dev/prod');
    console.log('✅ Service-specific: Tailored configs per service type');
    console.log('✅ Composition: Modular, reusable configuration parts');

    console.log('\n✅ Configuration patterns demonstration completed!');
  });
  
  // Exit gracefully after demonstration
  console.log('\n🎉 Example completed successfully! Exiting...');
  await gracefulShutdown('COMPLETION');
}

// Run the demonstration
demonstrateConfigurationPatterns().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
}); 