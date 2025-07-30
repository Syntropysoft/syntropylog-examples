/**
 * Tree Shaking Demo - Full Import (Anti-pattern)
 * 
 * This example demonstrates what happens when you import everything
 * instead of using tree shaking. This is NOT recommended for production.
 * 
 * Expected behavior: The entire framework will be included in the bundle,
 * even if you only use a small portion of it.
 */

// 🚫 ANTI-PATTERN: Importing everything
import { syntropyLog, SyntropyLog } from 'syntropylog';
import { MaskingEngine } from 'syntropylog';
import { SanitizationEngine } from 'syntropylog';
import { Transport, ConsoleTransport, PrettyConsoleTransport } from 'syntropylog';
import { MockBrokerAdapter, MockHttpClient, MockSerializerRegistry } from 'syntropylog';

async function demonstrateFullImport() {
  console.log('🌳 Tree Shaking Demo - Full Import (Anti-pattern)');
  console.log('📦 Importing: Everything (even unused modules)');
  
  // Initialize with minimal config (same as before)
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
  });

  // Use only logger and context (same as minimal example)
  const logger = syntropyLog.getLogger('full-import-demo');
  const contextManager = syntropyLog.getContextManager();
  
  contextManager.setContext({
    userId: 'user123',
    requestId: 'req456',
    environment: 'development'
  });
  
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
  console.log('   - Mock adapters:', typeof MockBrokerAdapter);
  
  await syntropyLog.shutdown();
  
  console.log('❌ Full import demo completed!');
  console.log('📊 Bundle will include everything:');
  console.log('   ✅ Logger functionality');
  console.log('   ✅ Context management');
  console.log('   ✅ Console transport');
  console.log('   ❌ HTTP clients (included but unused)');
  console.log('   ❌ Redis (included but unused)');
  console.log('   ❌ Message brokers (included but unused)');
  console.log('   ❌ Serializers (included but unused)');
  console.log('   ❌ Mock adapters (included but unused)');
  console.log('   ❌ Masking/Sanitization (included but unused)');
}

// Run the demo
demonstrateFullImport().catch(console.error); 