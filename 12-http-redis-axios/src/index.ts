import { syntropyLog } from 'syntropylog';
import { initializeSyntropyLog, gracefulShutdown } from './boilerplate';
import { ProductDataService } from './ProductDataService';
import { ProductServer } from './ProductServer';

async function main() {
  console.log('--- Running Product Service with Redis Cache Example ---');

  // Initialize SyntropyLog with boilerplate
  await initializeSyntropyLog();

  const logger = syntropyLog.getLogger('main');

  try {
    logger.info('🚀 Starting Product Service with Redis cache...');
    
    // Get Redis instance
    const redis = await syntropyLog.getRedis('product-cache');
    
    // Test Redis connection
    await redis.ping('test');
    logger.info('✅ Redis connection verified');

    // Create data service
    const dataService = new ProductDataService(redis, logger);
    logger.info('✅ ProductDataService created');

    // Create and start HTTP server
    const server = new ProductServer(dataService, logger);
    server.start(3000);

    logger.info('✅ Product Service started successfully!');
    logger.info('📋 Available endpoints:');
    logger.info('   GET  http://localhost:3000/product/:id  - Get product (with cache)');
    logger.info('   POST http://localhost:3000/product/     - Create product');
    logger.info('   GET  http://localhost:3000/health       - Health check');

    // Keep the server running
    process.on('SIGINT', async () => {
      logger.info('🛑 Shutting down Product Service...');
      server.stop();
      await gracefulShutdown();
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Error starting Product Service', { 
      error: error instanceof Error ? error.message : String(error),
      ...(error instanceof Error && error.stack ? { stack: error.stack } : {})
    });
    await gracefulShutdown();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}); 