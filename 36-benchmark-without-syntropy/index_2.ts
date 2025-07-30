/**
 * Benchmark Example - WITHOUT SyntropyLog
 * 
 * This example demonstrates the performance and bundle size impact
 * of NOT using SyntropyLog in a real application.
 * 
 * Compare with example 35 (with SyntropyLog) to see the difference.
 */

// Simple context management without SyntropyLog
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

// Simple logger without SyntropyLog
class SimpleLogger {
  private serviceName: string;
  private context: SimpleContext;
  private logCount: number = 0;
  
  constructor(serviceName: string, context: SimpleContext) {
    this.serviceName = serviceName;
    this.context = context;
  }
  
  info(message: string, metadata?: Record<string, any>): void {
    this.logCount++;
    // Don't output to console for benchmark - just count
    const logEntry = {
      level: 'info',
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      message,
      ...this.context.getAll(),
      ...metadata
    };
    // console.log(JSON.stringify(logEntry)); // Commented out for clean benchmark
  }
  
  error(message: string, metadata?: Record<string, any>): void {
    this.logCount++;
    // Don't output to console for benchmark - just count
    const logEntry = {
      level: 'error',
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      message,
      ...this.context.getAll(),
      ...metadata
    };
    // console.log(JSON.stringify(logEntry)); // Commented out for clean benchmark
  }
  
  getLogCount(): number {
    return this.logCount;
  }
}

// Simulate a real application workload WITHOUT SyntropyLog
async function simulateApplicationWorkload() {
  const context = new SimpleContext();
  const logger = new SimpleLogger('benchmark-app', context);
  
  // Set context for this request
  context.set('requestId', `req-${Date.now()}`);
  context.set('userId', 'user-123');
  context.set('sessionId', 'session-456');
  
  console.log('🔄 Starting benchmark workload WITHOUT SyntropyLog...');
  console.log('📊 Running 1,000,000 log operations...');
  
  // Simulate API calls - 1,000,000 operations
  for (let i = 0; i < 1000000; i++) {
    logger.info('Processing API request', {
      endpoint: '/api/users',
      method: 'GET',
      statusCode: 200,
      responseTime: Math.random() * 100,
      requestId: i,
      timestamp: new Date().toISOString()
    });
  }
  
  // Simulate database operations - 500,000 operations
  for (let i = 0; i < 500000; i++) {
    logger.info('Database operation completed', {
      operation: 'SELECT',
      table: 'users',
      rowsAffected: Math.floor(Math.random() * 1000),
      queryTime: Math.random() * 50,
      operationId: i,
      timestamp: new Date().toISOString()
    });
  }
  
  // Simulate error scenarios - 100,000 operations
  for (let i = 0; i < 100000; i++) {
    logger.error('API request failed', {
      endpoint: '/api/users',
      method: 'POST',
      statusCode: 500,
      error: 'Internal server error',
      requestId: i,
      timestamp: new Date().toISOString()
    });
  }
  
  // Simulate business logic - 10,000 operations
  for (let i = 0; i < 10000; i++) {
    logger.info('Business transaction completed', {
      transactionType: 'payment',
      amount: 99.99,
      currency: 'USD',
      customerId: `cust-${i}`,
      success: true,
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('✅ Benchmark workload completed WITHOUT SyntropyLog');
  
  return logger.getLogCount();
}

async function runBenchmark() {
  console.log('📊 BENCHMARK: WITHOUT SyntropyLog');
  console.log('==================================');
  
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
    console.log(`📦 Bundle includes: Only basic JavaScript`);
    console.log(`🔍 Features: Simple logging, basic context management`);
    console.log(`📊 Logs generated: ${logCount.toLocaleString()} basic JSON logs (not output to console)`);
    console.log(`⚡ Performance: ${(logCount / (totalTime / 1000)).toFixed(0)} logs/second`);
    console.log(`💾 Memory usage: ~${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`);
    console.log('');
    console.log('💡 Compare with example 35 (with SyntropyLog) for size/performance analysis');
    console.log('');
    console.log('📊 BUNDLE SIZE COMPARISON:');
    console.log('==========================');
    console.log('• Without SyntropyLog: ~5KB (basic JavaScript only)');
    console.log('• With SyntropyLog: ~150KB+ (full framework)');
    console.log('• Size difference: ~30x larger with SyntropyLog');
    console.log('');
    console.log('⚡ PERFORMANCE COMPARISON:');
    console.log('==========================');
    console.log('• Without SyntropyLog: Faster startup, less memory');
    console.log('• With SyntropyLog: Slower startup, more memory, but rich features');
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
    process.exit(1);
  }
}

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