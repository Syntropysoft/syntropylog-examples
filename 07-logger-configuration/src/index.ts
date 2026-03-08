import { SyntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';

// 🎯 Simple function that does something and logs
async function processUserData(syntropyLog: SyntropyLog, userId: number, userName: string) {
  const logger = syntropyLog.getLogger();
  
  logger.info('Processing user data', { userId, userName });
  
  // Simulate some processing
  if (userId < 0) {
    logger.error('Invalid user ID provided', { userId, error: 'ID must be positive' });
    return false;
  }
  
  logger.debug('User details retrieved', { 
    user: { id: userId, name: userName, status: 'active' } 
  });
  
  logger.info('User data processed successfully', { userId });
  return true;
}

// 🎯 Demonstrate multiple transports configuration
async function demonstrateMultipleTransports() {
  console.log('\n🎛️  LOGGER CONFIGURATION DEMO');
  console.log('================================\n');

  console.log('🚀 CONFIGURATION: Multiple Transports');
  console.log('─────────────────────────────────────');
  console.log('✅ ClassicConsoleTransport: Colored, human-readable for development');
  console.log('✅ ConsoleTransport: JSON for production');
  console.log('✅ Both active: Same logs, different formats\n');
  
  // 🌟 Single configuration with multiple transports
  const syntropyLog = SyntropyLog.getInstance();
  await syntropyLog.init({
    logger: {
      serviceName: 'user-processor-multi',
      serializerTimeoutMs: 100,
      transports: [
        new ClassicConsoleTransport(), // colored, human-readable
        new ConsoleTransport(),        // JSON for production
      ]
    }
  });
  
  // Set context for correlation ID
  await syntropyLog.getContextManager().run(async () => {
    console.log('\n📝 PROCESSING USER DATA:');
    console.log('───────────────────────');
    console.log('(You will see both Pretty and JSON outputs below)\n');
    
    await processUserData(syntropyLog, 123, 'John Doe');
    await processUserData(syntropyLog, -1, 'Invalid User');
    await processUserData(syntropyLog, 456, 'Jane Smith');
  });
  
  await syntropyLog.shutdown();
  
  console.log('\n' + '─'.repeat(50) + '\n');
  
  // 📊 Summary
  console.log('📊 CONFIGURATION SUMMARY:');
  console.log('─────────────────────────');
  console.log('✅ Single instance: No singleton conflicts');
  console.log('✅ Multiple transports: Classic (colored) + JSON');
  console.log('✅ Same logs: Different output formats');
  console.log('✅ Real-world pattern: Development + Production');
  console.log('✅ Easy switching: Just change transport config');
  
  console.log('\n🎯 Key Takeaway:');
  console.log('   Multiple transports = Same logs, multiple formats!');
}

// 🚀 Main execution
async function main() {
  try {
    // Run the demonstration
    await demonstrateMultipleTransports();
    
    console.log('\n✅ Logger configuration demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in logger configuration demo:', error);
    process.exit(1);
  }
}

// 🎯 Start the application
if (require.main === module) {
  main();
} 