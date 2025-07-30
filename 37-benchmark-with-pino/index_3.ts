/**
 * Benchmark Example - WITH Pino Logger
 * 
 * This example demonstrates the performance and bundle size impact
 * of using Pino (one of the fastest Node.js loggers) in a real application.
 * 
 * Compare with examples 35 (with SyntropyLog) and 36 (without any logger) to see the difference.
 */

import pino from 'pino';

// Simple context management (Pino doesn't have built-in context)
class SimpleContext {
  private context: Record<string, any> = {};
  
  set(key: string, value: any): void {
    this.context[key] = value;
  }
  
  get(key: string): any {
    return this.context[key];
  }
  
  getAll(): Record<string, any> {
    return { ...this.context };
  }
  
  clear(): void {
    this.context = {};
  }
}

// Initialize Pino logger
function initializePino() {
  console.log('🚀 Initializing Pino logger...');
  
  // Create Pino logger with minimal configuration for performance
  const logger = pino({
    level: 'info',
    // Disable pretty printing for performance
    transport: {
      target: 'pino/file',
      options: {
        destination: '/dev/null' // Redirect to null for clean benchmark
      }
    }
  });
  
  console.log('✅ Pino logger initialized successfully!');
  return logger;
}

// Simulate a real application workload with Pino
async function simulateApplicationWorkload() {
  const logger = initializePino();
  const context = new SimpleContext();
  let logCount = 0;
  
  // Set context for this request
  context.set('requestId', `req-${Date.now()}`);
  context.set('userId', 'user-123');
  context.set('sessionId', 'session-456');
  
  console.log('🔄 Starting benchmark workload with Pino...');
  console.log('📊 Running 1,000,000 log operations...');
  
  // Simulate API calls - 1,000,000 operations
  for (let i = 0; i < 1000000; i++) {
    logger.info({
      endpoint: '/api/users',
      method: 'GET',
      statusCode: 200,
      responseTime: Math.random() * 100,
      requestId: i,
      timestamp: new Date().toISOString(),
      ...context.getAll()
    }, 'Processing API request');
    logCount++;
  }
  
  // Simulate database operations - 500,000 operations
  for (let i = 0; i < 500000; i++) {
    logger.info({
      operation: 'SELECT',
      table: 'users',
      rowsAffected: Math.floor(Math.random() * 1000),
      queryTime: Math.random() * 50,
      operationId: i,
      timestamp: new Date().toISOString(),
      ...context.getAll()
    }, 'Database operation completed');
    logCount++;
  }
  
  // Simulate error scenarios - 100,000 operations
  for (let i = 0; i < 100000; i++) {
    logger.error({
      endpoint: '/api/users',
      method: 'POST',
      statusCode: 500,
      error: 'Internal server error',
      requestId: i,
      timestamp: new Date().toISOString(),
      ...context.getAll()
    }, 'API request failed');
    logCount++;
  }
  
  // Simulate business logic - 10,000 operations
  for (let i = 0; i < 10000; i++) {
    logger.info({
      transactionType: 'payment',
      amount: 99.99,
      currency: 'USD',
      customerId: `cust-${i}`,
      success: true,
      timestamp: new Date().toISOString(),
      ...context.getAll()
    }, 'Business transaction completed');
    logCount++;
  }
  
  console.log('✅ Benchmark workload completed with Pino');
  return logCount;
}

async function runBenchmark() {
  console.log('📊 BENCHMARK: WITH Pino Logger');
  console.log('===============================');
  
  const startTime = Date.now();
  
  try {
    // Run benchmark workload
    const logCount = await simulateApplicationWorkload();
    
    // Calculate metrics
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('');
    console.log('📈 BENCHMARK RESULTS:');
    console.log('=====================');
    console.log(`⏱️  Total execution time: ${totalTime}ms`);
    console.log(`📦 Bundle includes: Pino logger framework`);
    console.log(`🔍 Features: Fast JSON logging, minimal overhead`);
    console.log(`📊 Logs generated: ${logCount.toLocaleString()} JSON logs (redirected to /dev/null)`);
    console.log(`⚡ Performance: ${(logCount / (totalTime / 1000)).toFixed(0)} logs/second`);
    console.log(`💾 Memory usage: ~${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`);
    console.log('');
    console.log('💡 Compare with examples 35 (SyntropyLog) and 36 (no logger) for analysis');
    console.log('');
    console.log('📊 EXPECTED COMPARISON:');
    console.log('========================');
    console.log('• Pino: Fastest JSON logging, minimal features');
    console.log('• SyntropyLog: Rich features, context management, distributed tracing');
    console.log('• No logger: Fastest but no logging capabilities');
    console.log('');
    console.log('🎯 Pino is known for being one of the fastest Node.js loggers');
    console.log('   This will be a good test of SyntropyLog\'s performance!');
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

// Handle process termination signals
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  process.exit(0);
});

// Run the benchmark
runBenchmark()
  .then(() => {
    console.log('✅ Benchmark completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }); 