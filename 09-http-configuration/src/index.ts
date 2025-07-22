import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady } from './boilerplate';

// Different HTTP configurations
const httpConfigurations = {
  // Single HTTP instance
  single: {
    http: {
      instances: [
        {
          instanceName: 'default',
          adapter: 'fetch',
        },
      ],
    },
  },

  // Multiple HTTP instances
  multiple: {
    http: {
      instances: [
        {
          instanceName: 'user-api',
          adapter: 'axios',
          baseURL: 'https://api.users.com',
        },
        {
          instanceName: 'payment-api',
          adapter: 'axios',
          baseURL: 'https://api.payments.com',
        },
        {
          instanceName: 'external-api',
          adapter: 'fetch',
          baseURL: 'https://api.external.com',
        },
      ],
    },
  },

  // HTTP with context propagation
  withContext: {
    http: {
      instances: [
        {
          instanceName: 'correlated-api',
          adapter: 'axios',
          baseURL: 'https://api.example.com',
          propagateContext: true,
        },
      ],
    },
  },

  // HTTP with logging configuration
  withLogging: {
    http: {
      instances: [
        {
          instanceName: 'logged-api',
          adapter: 'fetch',
          baseURL: 'https://api.example.com',
          logging: {
            success: true,
            error: true,
            request: false,
            response: false,
          },
        },
      ],
    },
  },

  // Complete HTTP configuration
  complete: {
    http: {
      instances: [
        {
          instanceName: 'user-service',
          adapter: 'axios',
          baseURL: 'https://api.users.com',
          propagateContext: true,
          logging: {
            success: true,
            error: true,
            request: true,
            response: false,
          },
          timeout: 5000,
          retries: 3,
        },
        {
          instanceName: 'payment-service',
          adapter: 'axios',
          baseURL: 'https://api.payments.com',
          propagateContext: true,
          logging: {
            success: false,
            error: true,
            request: false,
            response: false,
          },
          timeout: 10000,
          retries: 2,
        },
      ],
    },
  },
};

async function demonstrateHttpConfiguration() {
  console.log('🎯 Example 09: HTTP Configuration\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();

  // Wait for SyntropyLog to be ready before proceeding
  await waitForReady();

  const contextManager = syntropyLog.getContextManager();

  await contextManager.run(async () => {
    const correlationId = contextManager.getCorrelationId();
    contextManager.set('operation', 'http-config-demo');
    contextManager.set('userId', 'demo-user-123');

    console.log('🔗 Correlation ID:', correlationId);
    console.log('📊 Demonstrating different HTTP configurations:\n');

    // Configuration 1: Single HTTP instance
    console.log('🔧 Configuration 1: Single HTTP Instance');
    syntropyLog.init(httpConfigurations.single);

    const singleHttp = syntropyLog.getHttp('default');
    console.log(
      '✅ Single HTTP instance configured:',
      singleHttp ? 'Available' : 'Not available'
    );

    // Configuration 2: Multiple HTTP instances
    console.log('\n🌐 Configuration 2: Multiple HTTP Instances');
    syntropyLog.init(httpConfigurations.multiple);

    const userApi = syntropyLog.getHttp('user-api');
    const paymentApi = syntropyLog.getHttp('payment-api');
    const externalApi = syntropyLog.getHttp('external-api');

    console.log(
      '✅ User API instance:',
      userApi ? 'Available' : 'Not available'
    );
    console.log(
      '✅ Payment API instance:',
      paymentApi ? 'Available' : 'Not available'
    );
    console.log(
      '✅ External API instance:',
      externalApi ? 'Available' : 'Not available'
    );

    // Configuration 3: HTTP with context propagation
    console.log('\n🔗 Configuration 3: HTTP with Context Propagation');
    syntropyLog.init(httpConfigurations.withContext);

    const correlatedApi = syntropyLog.getHttp('correlated-api');
    console.log(
      '✅ Correlated API instance:',
      correlatedApi ? 'Available' : 'Not available'
    );
    console.log('✅ Context propagation enabled');

    // Configuration 4: HTTP with logging configuration
    console.log('\n📝 Configuration 4: HTTP with Logging Configuration');
    syntropyLog.init(httpConfigurations.withLogging);

    const loggedApi = syntropyLog.getHttp('logged-api');
    console.log(
      '✅ Logged API instance:',
      loggedApi ? 'Available' : 'Not available'
    );
    console.log('✅ Success and error logging enabled');

    // Configuration 5: Complete HTTP configuration
    console.log('\n🏗️ Configuration 5: Complete HTTP Configuration');
    syntropyLog.init(httpConfigurations.complete);

    const userService = syntropyLog.getHttp('user-service');
    const paymentService = syntropyLog.getHttp('payment-service');

    console.log(
      '✅ User Service instance:',
      userService ? 'Available' : 'Not available'
    );
    console.log(
      '✅ Payment Service instance:',
      paymentService ? 'Available' : 'Not available'
    );

    // Demonstrate HTTP instance features
    console.log('\n⚙️ HTTP Instance Features:');
    console.log('✅ Instance Naming: Different names for different APIs');
    console.log('✅ Adapter Selection: Axios, Fetch, or custom adapters');
    console.log('✅ Base URL Configuration: Different base URLs per instance');
    console.log(
      '✅ Context Propagation: Automatic correlation header injection'
    );
    console.log('✅ Logging Control: Granular control over what gets logged');
    console.log('✅ Timeout Configuration: Different timeouts per service');
    console.log('✅ Retry Logic: Automatic retry configuration');

    // Show configuration patterns
    console.log('\n📋 Configuration Patterns:');
    console.log('🔧 Single: Simple, one HTTP client');
    console.log('🌐 Multiple: Different clients for different APIs');
    console.log('🔗 Context: Automatic correlation propagation');
    console.log('📝 Logging: Controlled logging per instance');
    console.log('🏗️ Complete: Full-featured configuration');

    // Demonstrate benefits
    console.log('\n🎯 HTTP Configuration Benefits:');
    console.log('✅ Organization: Clear separation of API clients');
    console.log('✅ Flexibility: Different configurations per service');
    console.log('✅ Observability: Automatic correlation and logging');
    console.log('✅ Performance: Optimized settings per API');
    console.log('✅ Maintainability: Centralized configuration');

    console.log('\n✅ HTTP configuration demonstration completed!');
  });
  
  // Exit gracefully after demonstration
  console.log('\n🎉 Example completed successfully! Exiting...');
  await gracefulShutdown('COMPLETION');
}

// Run the demonstration
demonstrateHttpConfiguration().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
});