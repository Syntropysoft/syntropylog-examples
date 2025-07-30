/**
 * Tree Shaking Demo - Minimal Import
 * 
 * This example demonstrates how to use SyntropyLog with minimal imports
 * to enable tree shaking in your build process.
 * 
 * Key points:
 * - Only import what you need: syntropyLog
 * - Don't import unused modules (HTTP, Redis, Brokers, etc.)
 * - This allows bundlers to exclude unused code
 * - Check bundle size after building to verify tree shaking
 */

// 🎯 MINIMAL IMPORT - Only what we need
import { syntropyLog } from 'syntropylog';

async function initializeSyntropyLog() {
  console.log('🚀 Initializing SyntropyLog...');
  
  return new Promise<void>((resolve, reject) => {
    // Set up event listeners before initialization
    syntropyLog.on('ready', () => {
      console.log('✅ SyntropyLog initialized successfully!');
      resolve();
    });
    
    syntropyLog.on('error', (err) => {
      console.error('❌ SyntropyLog initialization failed:', err);
      reject(err);
    });

    // Initialize with minimal config
    syntropyLog.init({
      logger: {
        serviceName: 'tree-shaking-demo',
        level: 'info',
        serializerTimeoutMs: 50,
      },
      context: {
        correlationIdHeader: 'x-correlation-id',
      }
    });
  });
}

async function gracefulShutdown() {
  console.log('🔄 Shutting down SyntropyLog gracefully...');
  
  try {
    await syntropyLog.shutdown();
    console.log('✅ SyntropyLog shutdown completed');
  } catch (err) {
    console.error('❌ Error during shutdown:', err);
  }
}

async function demonstrateMinimalUsage() {
  console.log('🌳 Tree Shaking Demo - Minimal Import');
  console.log('📦 Only importing: syntropyLog');
  console.log('🎯 This allows tree shaking to exclude unused modules');
  
  try {
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();
    
    // 2. Get context manager
    const contextManager = syntropyLog.getContextManager();
    
    // 3. Run everything within a context - TODO LO DEMÁS MUERE FUERA
    await contextManager.run(async () => {
      // Get logger instance (dentro del contexto)
      const logger = syntropyLog.getLogger('minimal-demo');
      
      // Add some context - ESTOS VALORES APARECERÁN EN LOS LOGS JSON
      contextManager.set('userId', 'user123');
      contextManager.set('requestId', 'req456');
      contextManager.set('environment', 'development');
      contextManager.set('demo', 'tree-shaking-minimal');
      
      console.log('📋 Context values set:');
      console.log('   - userId: user123');
      console.log('   - requestId: req456');
      console.log('   - environment: development');
      console.log('   - demo: tree-shaking-minimal');
      console.log('');
      console.log('🔍 Look for these values in the JSON logs below:');
      console.log('');
      
      // Log with context - LOS VALORES APARECEN AUTOMÁTICAMENTE EN EL JSON
      logger.info('Hello from minimal import demo!', {
        feature: 'minimal-logging',
        treeShaking: 'enabled'
      });
      
      // Log error with context
      logger.error('This is a test error', {
        errorCode: 'DEMO_ERROR',
        severity: 'low'
      });
      
      // Get filtered context
      const filteredContext = contextManager.getFilteredContext('info');
      console.log('📋 Current context (filtered):', filteredContext);
      
      // Get all context
      const allContext = contextManager.getAll();
      console.log('📋 All context:', allContext);
      
      console.log('✅ Minimal import demo completed!');
      console.log('');
      console.log('📊 To verify tree shaking:');
      console.log('   1. Build this example: npm run build');
      console.log('   2. Check bundle size in dist/index.js');
      console.log('   3. Compare with example 34 (full import)');
      console.log('   4. Use bundle analyzer to see included modules');
      console.log('');
      console.log('🎯 Expected result:');
      console.log('   ✅ Only logger and context modules included');
      console.log('   ❌ HTTP, Redis, Brokers excluded');
      console.log('   📦 Smaller bundle size than full import');
    });
    
    // 4. Graceful shutdown
    await gracefulShutdown();
    
  } catch (error) {
    console.error('❌ Error in minimal import demo:', error);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  await gracefulShutdown();
  process.exit(0);
});

// Run the application
demonstrateMinimalUsage()
  .then(() => {
    console.log('✅ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }); 