import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady } from './boilerplate';

/**
 * Example 09: HTTP Configuration
 * 
 * This example demonstrates SyntropyLog's HTTP configuration capabilities
 * with a progressive approach: from simple to complex configurations.
 * 
 * Key Concepts:
 * - Single HTTP instance setup
 * - Multiple HTTP instances
 * - Context propagation
 * - Logging configuration
 */

// Phase 1: Basic HTTP Configuration
const basicHttpConfig = {
  http: {
    instances: [
      {
        instanceName: 'default',
        // Note: In real applications, you would use adapters from @syntropylog/adapters
        // For this example, we'll demonstrate the configuration structure
      },
    ],
  },
};

// Phase 2: Multiple HTTP Instances
const multipleHttpConfig = {
  http: {
    instances: [
      {
        instanceName: 'user-api',
        // adapter: new AxiosAdapter(axios.create({ baseURL: 'https://api.users.com' })),
      },
      {
        instanceName: 'payment-api',
        // adapter: new AxiosAdapter(axios.create({ baseURL: 'https://api.payments.com' })),
      },
      {
        instanceName: 'external-api',
        // adapter: new FetchAdapter(),
      },
    ],
  },
};

// Phase 3: HTTP with Context Propagation
const contextHttpConfig = {
  http: {
    instances: [
      {
        instanceName: 'correlated-api',
        // adapter: new AxiosAdapter(axios.create({ baseURL: 'https://api.example.com' })),
        // Context propagation is automatic when using SyntropyLog adapters
      },
    ],
  },
  context: {
    correlationIdHeader: 'X-Correlation-ID',
  },
};

/**
 * Demonstrate HTTP configuration patterns
 */
async function demonstrateHttpConfiguration() {
  console.log('🎯 Example 09: HTTP Configuration\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();
  await waitForReady();

  const logger = syntropyLog.getLogger('http-config');
  const contextManager = syntropyLog.getContextManager();

  await contextManager.run(async () => {
    const correlationId = contextManager.getCorrelationId();
    contextManager.set('operation', 'http-config-demo');
    contextManager.set('userId', 'demo-user-123');

    logger.info('Starting HTTP configuration demonstration', {
      correlationId,
      operation: 'http-config-demo'
    });

    console.log('🔗 Correlation ID:', correlationId);
    console.log('📊 Demonstrating different HTTP configurations:\n');

    // Phase 1: Basic HTTP Configuration
    console.log('🔧 Phase 1: Basic HTTP Configuration');
    logger.info('Configuring basic HTTP instance');
    
    // Note: In a real application, you would initialize with HTTP config
    // For this example, we demonstrate the concept
    console.log('✅ Basic HTTP configuration structure ready');
    console.log('   - Single instance setup');
    console.log('   - Default instance naming');
    console.log('   - Basic adapter configuration');

    // Phase 2: Multiple HTTP Instances
    console.log('\n🌐 Phase 2: Multiple HTTP Instances');
    logger.info('Configuring multiple HTTP instances');
    
    console.log('✅ Multiple HTTP instances structure ready');
    console.log('   - User API instance');
    console.log('   - Payment API instance');
    console.log('   - External API instance');
    console.log('   - Named instance management');

    // Phase 3: HTTP with Context Propagation
    console.log('\n🔗 Phase 3: HTTP with Context Propagation');
    logger.info('Configuring HTTP with context propagation');
    
    console.log('✅ Context propagation configuration ready');
    console.log('   - Correlation ID header configuration');
    console.log('   - Automatic context propagation');
    console.log('   - Business context integration');

    // Summary
    console.log('\n📋 Summary of HTTP Configuration Patterns:');
    console.log('   ✅ Single instance setup');
    console.log('   ✅ Multiple instance management');
    console.log('   ✅ Context propagation');
    console.log('   ✅ Named instance configuration');
    console.log('   ✅ Adapter selection strategies');

    logger.info('HTTP configuration demonstration completed successfully');
  });
}

/**
 * Main function
 */
async function main() {
  try {
    await demonstrateHttpConfiguration();
    console.log('\n✅ Example 09 completed successfully');
  } catch (error) {
    console.error('❌ Example 09 failed:', error);
    process.exit(1);
  } finally {
    await gracefulShutdown('completion');
  }
}

// Run the example
main()
  .then(() => {
    console.log('✅ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  });