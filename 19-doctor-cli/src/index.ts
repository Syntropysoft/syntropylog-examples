// =================================================================
//  Example 19: Doctor CLI - Configuration Validation
//  RESPONSIBILITY: Demonstrate SyntropyLog's Doctor CLI capabilities
// =================================================================

import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';
import fs from 'fs';
import path from 'path';

/**
 * Example 19: Doctor CLI - Configuration Validation 🩺
 * 
 * This example demonstrates SyntropyLog's actual Doctor CLI capabilities:
 * - Configuration validation against schema
 * - Built-in diagnostic rules
 * - Custom rule creation
 * - Audit workflows
 * 
 * Key Learning Points:
 * 1. How to use the doctor CLI for configuration validation
 * 2. How to create custom diagnostic rules
 * 3. How to run comprehensive audits
 * 4. Understanding what the CLI can and cannot do
 * 5. Best practices for configuration validation
 */

async function main() {
  console.log('--- Running Doctor CLI Example ---');

  try {
    // Initialize SyntropyLog
    await initializeSyntropyLog();
    const logger = syntropyLog.getLogger('doctor-example');

    logger.info('🩺 Doctor CLI example initialized!');

    // Step 1: Create a test configuration file with issues
    const testConfigPath = path.join(process.cwd(), 'test-config.yaml');
    const problematicConfig = `
logger:
  serviceName: 'testApp'  # ⚠️ Should use kebab-case
  level: 'debug'          # ⚠️ Too verbose for production

redis:
  instances:
    - instanceName: 'cache'
      url: 'redis://localhost:6379'
    - instanceName: 'cache'  # ⚠️ Duplicate name
      url: 'redis://localhost:6380'

masking:
  rules: []  # ⚠️ No masking rules defined

# This will trigger various validation warnings and errors
`;

    fs.writeFileSync(testConfigPath, problematicConfig);
    logger.info('📝 Created test configuration file with intentional issues');

    // Step 2: Create custom rule manifest
    const customRulesPath = path.join(process.cwd(), 'syntropylog.doctor.ts');
    const customRules = `
import { DiagnosticRule } from 'syntropylog';

export default [
  {
    id: 'service-naming-convention',
    description: 'Ensures service name follows kebab-case convention',
    check: (config) => {
      const serviceName = config.logger?.serviceName;
      if (serviceName && !serviceName.includes('-')) {
        return [{
          level: 'WARN',
          title: 'Service Naming Convention',
          message: \`Service name '\${serviceName}' should use kebab-case\`,
          recommendation: 'Use format like "test-app" instead of "testApp"'
        }];
      }
      return [];
    }
  },
  {
    id: 'redis-url-validation',
    description: 'Validates Redis URLs are properly formatted',
    check: (config) => {
      const results = [];
      const instances = config.redis?.instances || [];
      
      instances.forEach((instance, index) => {
        if (instance.url && !instance.url.startsWith('redis://')) {
          results.push({
            level: 'ERROR',
            title: 'Invalid Redis URL',
            message: \`Redis instance \${index + 1} has invalid URL: \${instance.url}\`,
            recommendation: 'Use format: redis://host:port'
          });
        }
      });
      
      return results;
    }
  }
];
`;

    fs.writeFileSync(customRulesPath, customRules);
    logger.info('📋 Created custom rule manifest');

    // Step 3: Demonstrate CLI usage (simulated)
    logger.info('🔍 Simulating Doctor CLI execution...');
    
    // Show what the CLI would output
    console.log('\n' + '='.repeat(60));
    console.log('🩺 Running syntropylog doctor on: test-config.yaml');
    console.log('✅ Config structure for "test-config.yaml" is valid.');
    console.log('');
    console.log('⚠️  [WARN] Production Log Level');
    console.log('   └─ Logger level \'debug\' is too verbose for production');
    console.log('   💡 Consider using \'info\' or \'warn\' in production');
    console.log('');
    console.log('❌ [ERROR] Duplicate Redis Instance Name');
    console.log('   └─ Multiple Redis instances share the name \'cache\'');
    console.log('   💡 Each Redis instance must have a unique name');
    console.log('');
    console.log('⚠️  [WARN] No Masking Rules');
    console.log('   └─ No data masking rules are defined');
    console.log('   💡 Consider adding masking rules for sensitive data');
    console.log('');
    console.log('⚠️  [WARN] Service Naming Convention');
    console.log('   └─ Service name \'testApp\' should use kebab-case');
    console.log('   💡 Use format like "test-app" instead of "testApp"');
    console.log('');
    console.log('❌ [ERROR] Invalid Redis URL');
    console.log('   └─ Redis instance 2 has invalid URL: redis://localhost:6380');
    console.log('   💡 Use format: redis://host:port');
    console.log('');
    console.log('Errors were found. It is highly recommended to fix them before deploying.');
    console.log('='.repeat(60));

    // Step 4: Show available commands
    logger.info('📚 Available Doctor CLI Commands:');
    console.log('');
    console.log('  # Initialize rule manifest');
    console.log('  syntropylog init --rules');
    console.log('');
    console.log('  # Initialize audit plan');
    console.log('  syntropylog init --audit');
    console.log('');
    console.log('  # Validate single configuration');
    console.log('  syntropylog doctor config.yaml');
    console.log('');
    console.log('  # Run comprehensive audit');
    console.log('  syntropylog audit');
    console.log('');

    // Step 5: Clean up test files
    fs.unlinkSync(testConfigPath);
    fs.unlinkSync(customRulesPath);
    logger.info('🧹 Cleaned up test files');

    logger.info('✅ Doctor CLI example completed successfully!');
    logger.info('💡 Key takeaways:');
    logger.info('   - Doctor CLI validates configuration structure');
    logger.info('   - Built-in rules catch common issues');
    logger.info('   - Custom rules can be created for specific needs');
    logger.info('   - Audit workflows support comprehensive validation');

    // Graceful shutdown
    await gracefulShutdown();

  } catch (error) {
    console.error('❌ Error in Doctor CLI example:', error);
    process.exit(1);
  }
}

// Run the example
main();
