/**
 * Tree Shaking Demo - Minimal Usage
 * 
 * This example demonstrates how SyntropyLog supports tree shaking
 * when you only import and use the logger and context functionality.
 * 
 * Expected behavior: Only the logger and context modules should be
 * included in the final bundle, excluding HTTP, Redis, Brokers, etc.
 */

// 🎯 MINIMAL IMPORTS - Only what we need
import { syntropyLog } from 'syntropylog';

async function demonstrateTreeShaking() {
  console.log('🌳 Tree Shaking Demo - Minimal Usage');
  console.log('📦 Only importing: syntropyLog (logger + context)');
  
  // Initialize with minimal config - only logger and context
  await syntropyLog.init({
    logger: {
      level: 'info',
      transports: [
        {
          type: 'console',
          format: 'pretty'
        }
      ]
    },
    context: {
      enabled: true,
      includeSystemInfo: true,
      includeProcessInfo: true
    }
    // 🚫 NO HTTP, NO REDIS, NO BROKERS - Tree shaking will exclude these
  });

  // Get logger instance
  const logger = syntropyLog.getLogger('tree-shaking-demo');
  
  // Get context manager
  const contextManager = syntropyLog.getContextManager();
  
  // Add some context
  contextManager.setContext({
    userId: 'user123',
    requestId: 'req456',
    environment: 'development'
  });
  
  // Log with context
  logger.info('Hello from tree-shaking demo!', {
    feature: 'minimal-logging',
    treeShaking: 'enabled'
  });
  
  // Log error with context
  logger.error('This is a test error', {
    errorCode: 'TREE_SHAKING_TEST',
    severity: 'low'
  });
  
  // Get filtered context
  const filteredContext = syntropyLog.getFilteredContext('info');
  console.log('📋 Current context:', filteredContext);
  
  // Clean shutdown
  await syntropyLog.shutdown();
  
  console.log('✅ Tree shaking demo completed!');
  console.log('📊 Bundle should only include:');
  console.log('   - Logger functionality');
  console.log('   - Context management');
  console.log('   - Console transport');
  console.log('   ❌ HTTP clients (excluded)');
  console.log('   ❌ Redis (excluded)');
  console.log('   ❌ Message brokers (excluded)');
  console.log('   ❌ Serializers (excluded)');
}

// Run the demo
demonstrateTreeShaking().catch(console.error); 