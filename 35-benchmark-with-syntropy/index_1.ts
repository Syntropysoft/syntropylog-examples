/**
 * Benchmark Example - WITH SyntropyLog
 * 
 * This example demonstrates the performance and bundle size impact
 * of using SyntropyLog in a real application.
 * 
 * Compare with example 36 (without SyntropyLog) to see the difference.
 */

import { syntropyLog, SpyTransport } from 'syntropylog';

async function initializeSyntropyLog() {
  console.log('🚀 Initializing SyntropyLog...');
  
  return new Promise<void>((resolve, reject) => {
    syntropyLog.on('ready', () => {
      console.log('✅ SyntropyLog initialized successfully!');
      resolve();
    });
    
    syntropyLog.on('error', (err) => {
      console.error('❌ SyntropyLog initialization failed:', err);
      reject(err);
    });

    syntropyLog.init({
      logger: {
        serviceName: 'benchmark-app',
        level: 'info',
        serializerTimeoutMs: 50,
        transports: [
          new SpyTransport() // Use SpyTransport to capture logs without console output
        ]
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

// Simulate a real application workload
async function simulateApplicationWorkload() {
  const logger = syntropyLog.getLogger('benchmark');
  const contextManager = syntropyLog.getContextManager();
  let logCount = 0;
  
  await contextManager.run(async () => {
    // Set context for this request
    contextManager.set('requestId', `req-${Date.now()}`);
    contextManager.set('userId', 'user-123');
    contextManager.set('sessionId', 'session-456');
    
    console.log('🔄 Starting benchmark workload with SyntropyLog...');
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
      logCount++;
      
      // No artificial delays for real performance testing
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
      logCount++;
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
      logCount++;
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
      logCount++;
    }
    
    console.log('✅ Benchmark workload completed with SyntropyLog');
  });
  
  return logCount;
}

async function runBenchmark() {
  console.log('📊 BENCHMARK: WITH SyntropyLog');
  console.log('================================');
  
  const startTime = Date.now();
  
  try {
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();
    
    // 2. Run benchmark workload
    const logCount = await simulateApplicationWorkload();
    
    // 3. Calculate metrics
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('');
    console.log('📈 BENCHMARK RESULTS:');
    console.log('=====================');
    console.log(`⏱️  Total execution time: ${totalTime}ms`);
    console.log(`📦 Bundle includes: SyntropyLog framework`);
    console.log(`🔍 Features: Structured logging, context management, correlation IDs`);
    console.log(`📊 Logs generated: ${logCount.toLocaleString()} structured JSON logs (captured by SpyTransport)`);
    console.log(`⚡ Performance: ${(logCount / (totalTime / 1000)).toFixed(0)} logs/second`);
    console.log(`💾 Memory usage: ~${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1)}MB`);
    console.log('');
    console.log('💡 Compare with example 36 (without SyntropyLog) for size/performance analysis');
    
    // 4. Graceful shutdown
    await gracefulShutdown();
    
  } catch (error) {
    console.error('❌ Benchmark failed:', error);
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