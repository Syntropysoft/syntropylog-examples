import { SyntropyLog } from 'syntropylog';
import { PrettyConsoleTransport } from 'syntropylog';

// 🎯 Sample user request data with many fields
const userRequest = {
  userId: 123,
  email: "user@example.com",
  password: "secret123", // will be masked
  firstName: "John",
  lastName: "Doe",
  address: "123 Main St, New York, NY",
  phone: "+1-555-0123",
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  sessionId: "sess-789",
  requestId: "req-456",
  preferences: { theme: "dark", language: "en" },
  metadata: { source: "web", version: "1.0" }
};

// 🎯 Simple function that processes user data
async function processUserRequest(syntropyLog: SyntropyLog, userData: any, operation: string) {
  const logger = syntropyLog.getLogger();
  
  // Set context with all the user data
  const contextManager = syntropyLog.getContextManager();
  Object.entries(userData).forEach(([key, value]) => {
    contextManager.set(key, value as string | number | boolean);
  });
  contextManager.set('operation', operation);
  
  // Simulate processing
  if (userData.userId < 0) {
    logger.error('Invalid user ID provided', { 
      error: 'ID must be positive',
      errorCode: 'INVALID_USER_ID'
    });
    return false;
  }
  
  logger.info('User request processed successfully', { 
    status: 'completed',
    duration: '150ms'
  });
  
  logger.debug('Processing details', { 
    steps: ['validation', 'processing', 'response'],
    timestamp: new Date().toISOString()
  });
  
  return true;
}

// 🎯 Demonstrate logging matrix with hot configuration changes
async function demonstrateLoggingMatrix() {
  console.log('\n🧮 LOGGING MATRIX DEMO');
  console.log('========================\n');

  // 🌟 Initialize SyntropyLog with pretty transport
  const syntropyLog = SyntropyLog.getInstance();
  await syntropyLog.init({
    logger: {
      serviceName: 'logging-matrix-demo',
      transports: [new PrettyConsoleTransport()],
      serializerTimeoutMs: 100,
    }
  });

  console.log('🚀 CONFIGURATION 1: Default Logging Matrix');
  console.log('──────────────────────────────────────────');
  console.log('✅ INFO: correlationId, serviceName (minimal)');
  console.log('✅ ERROR: Everything (*) (complete context)\n');

  // Set context for correlation ID
  await syntropyLog.getContextManager().run(async () => {
    console.log('📝 PROCESSING USER REQUEST (Default Config):');
    console.log('─────────────────────────────────────────────\n');
    
    await processUserRequest(syntropyLog, userRequest, 'user-login');
  });

  console.log('\n' + '─'.repeat(60) + '\n');

  // 🔄 Change configuration in hot
  console.log('🔄 CHANGING CONFIGURATION IN HOT...\n');
  
  syntropyLog.reconfigureLoggingMatrix({
    default: ['userId', 'operation', 'status'],
    warn: ['userId', 'email', 'errorCode'],
    error: ['userId', 'email', 'address', 'phone', 'errorDetails'],
    debug: ['*']
  });

  console.log('🚀 CONFIGURATION 2: Custom Logging Matrix');
  console.log('──────────────────────────────────────────');
  console.log('✅ INFO: userId, operation, status');
  console.log('✅ WARNING: userId, email, errorCode');
  console.log('✅ ERROR: userId, email, address, phone, errorDetails');
  console.log('✅ DEBUG: Everything (*)\n');

  // Set context for correlation ID
  await syntropyLog.getContextManager().run(async () => {
    console.log('📝 PROCESSING USER REQUEST (Custom Config):');
    console.log('─────────────────────────────────────────────\n');
    
    await processUserRequest(syntropyLog, userRequest, 'user-login');
  });

  console.log('\n' + '─'.repeat(60) + '\n');

  // 🔄 Change to minimal configuration
  console.log('🔄 CHANGING TO MINIMAL CONFIGURATION...\n');
  
  await syntropyLog.init({
    logger: {
      serviceName: 'logging-matrix-demo',
      transports: [new PrettyConsoleTransport()],
      serializerTimeoutMs: 100,
    },
    loggingMatrix: {
      default: ['correlationId'],
      error: ['correlationId', 'userId', 'errorCode']
    }
  });

  console.log('🚀 CONFIGURATION 3: Minimal Logging Matrix');
  console.log('──────────────────────────────────────────');
  console.log('✅ INFO: Only correlationId (ultra minimal)');
  console.log('✅ ERROR: correlationId, userId, errorCode (minimal error)\n');

  // Set context for correlation ID
  await syntropyLog.getContextManager().run(async () => {
    console.log('📝 PROCESSING USER REQUEST (Minimal Config):');
    console.log('─────────────────────────────────────────────\n');
    
    await processUserRequest(syntropyLog, userRequest, 'user-login');
  });

  await syntropyLog.shutdown();
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  // 📊 Summary
  console.log('📊 LOGGING MATRIX SUMMARY:');
  console.log('─────────────────────────');
  console.log('✅ Same log call, different information based on configuration');
  console.log('✅ Hot configuration changes work seamlessly');
  console.log('✅ Cost control: Minimal info for success, complete for errors');
  console.log('✅ Full customization: Define exactly what appears in each level');
  console.log('✅ Smart defaults: Good starting point, completely customizable');
  
  console.log('\n🎯 Key Takeaway:');
  console.log('   Control what information appears in your logs to save costs!');
}

// 🚀 Main execution
async function main() {
  try {
    // Run the demonstration
    await demonstrateLoggingMatrix();
    
    console.log('\n✅ Logging matrix demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Error in logging matrix demo:', error);
    process.exit(1);
  }
}

// 🎯 Start the application
if (require.main === module) {
  main();
}
 