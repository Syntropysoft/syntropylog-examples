/**
 * Tree Shaking Demo - Full Import (Anti-pattern)
 * 
 * This example demonstrates what happens when you import everything
 * instead of using tree shaking. This is NOT recommended for production.
 * 
 * Key points:
 * - Importing unused modules prevents tree shaking
 * - All imported modules will be included in the bundle
 * - Results in larger bundle size
 * - Slower load times and more memory usage
 */

// 🚫 ANTI-PATTERN: Importing everything (even unused modules)
import { syntropyLog, SyntropyLog } from 'syntropylog';
import { MaskingEngine } from 'syntropylog';
import { SanitizationEngine } from 'syntropylog';
import { Transport, ConsoleTransport, PrettyConsoleTransport } from 'syntropylog';

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

    // Initialize with same config as minimal example
    syntropyLog.init({
      logger: {
        serviceName: 'tree-shaking-full',
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

async function demonstrateFullImport() {
  console.log('🌳 Tree Shaking Demo - Full Import (Anti-pattern)');
  console.log('📦 Importing: Everything (even unused modules)');
  console.log('❌ This prevents tree shaking from working');
  
  try {
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();
    
    // 2. Get context manager
    const contextManager = syntropyLog.getContextManager();
    
    // 3. Run everything within a context - TODO LO DEMÁS MUERE FUERA
    await contextManager.run(async () => {
      // Get logger instance (dentro del contexto)
      const logger = syntropyLog.getLogger('full-import-demo');
      
      // Add some context
      contextManager.set('userId', 'user123');
      contextManager.set('requestId', 'req456');
      contextManager.set('environment', 'development');
      
      // Log with context
      logger.info('Hello from full import demo!', {
        feature: 'full-import',
        treeShaking: 'disabled'
      });
      
      // 🚫 UNUSED IMPORTS - These will still be included in the bundle
      // even though we don't use them
      console.log('📦 Unused imports that will be included:');
      console.log('   - MaskingEngine:', typeof MaskingEngine);
      console.log('   - SanitizationEngine:', typeof SanitizationEngine);
      console.log('   - Transport classes:', typeof Transport);
      
      // Get filtered context
      const filteredContext = contextManager.getFilteredContext('info');
      console.log('📋 Current context:', filteredContext);
      
      // Get all context
      const allContext = contextManager.getAll();
      console.log('📋 All context:', allContext);
      
      console.log('❌ Full import demo completed!');
      console.log('');
      console.log('📊 To verify the problem:');
      console.log('   1. Build this example: npm run build');
      console.log('   2. Check bundle size in dist/index.js');
      console.log('   3. Compare with example 33 (minimal import)');
      console.log('   4. Use bundle analyzer to see all included modules');
      console.log('');
      console.log('🎯 Expected result:');
      console.log('   ✅ Logger and context modules included');
      console.log('   ❌ HTTP, Redis, Brokers included (but unused)');
      console.log('   ❌ Masking, Sanitization included (but unused)');
      console.log('   📦 Larger bundle size than minimal import');
      console.log('   ⚠️  Tree shaking disabled due to unused imports');
    });
    
    // 4. Graceful shutdown
    await gracefulShutdown();
    
  } catch (error) {
    console.error('❌ Error in full import demo:', error);
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
demonstrateFullImport()
  .then(() => {
    console.log('✅ Example completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Example failed:', error);
    process.exit(1);
  }); 