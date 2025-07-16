import { syntropyLog } from 'syntropylog';

async function main() {
  try {
    console.log('🚀 Starting SyntropyLog...');
    
    // 1. Initialize the logger and wait for it to be ready
    console.log('🔄 Starting initialization...');
    await new Promise<void>((resolve, reject) => {
      // Set up the 'ready' event listener BEFORE calling init
      syntropyLog.once('ready', () => {
        console.log('✅ "ready" event received - SyntropyLog initialized and ready');
        resolve();
      });
      
      // Also listen for other events for debugging
      syntropyLog.once('error', (error) => {
        console.error('❌ Error during initialization:', error);
        reject(error);
      });
      
      console.log('📞 Calling syntropyLog.init()...');
      syntropyLog.init({
        logger: {
          serviceName: 'my-app',
          level: 'info',
          serializerTimeoutMs: 100,
        },
      }).then(() => {
        console.log('✅ syntropyLog.init() completed successfully');
        // The 'ready' event should be emitted automatically
      }).catch((error) => {
        console.error('❌ Error in syntropyLog.init():', error);
        reject(error);
      });
    });

    const logger = syntropyLog.getLogger('main');

    // 2. Log your first messages!
    logger.info('Hello World from SyntropyLog!');
    logger.warn('This is a warning message.');
    logger.error('This is an error message.');

    // 3. You can also add structured data to your logs.
    logger.info('User logged in successfully', {
      userId: 'user-123',
      tenantId: 'tenant-abc',
    });

    console.log('📝 Logs sent, starting shutdown...');
    
    // 4. Shutdown the framework to allow the process to exit gracefully.
    await syntropyLog.shutdown();
    
    console.log('✅ Shutdown completed successfully!');
    
    // Check what's keeping the process active
    console.log('🔍 Checking active processes...');
    const activeHandles = (process as any)._getActiveHandles?.() || [];
    const activeRequests = (process as any)._getActiveRequests?.() || [];
    
    console.log('Active handles:', activeHandles.length);
    console.log('Active requests:', activeRequests.length);
    
    // Filter only handles that are not console streams
    const nonConsoleHandles = activeHandles.filter((handle: any) => 
      !(handle.constructor.name === 'WriteStream' && handle._isStdio)
    );
    
    if (nonConsoleHandles.length > 0) {
      console.log('⚠️ Remaining non-console handles:', nonConsoleHandles.length);
    } else {
      console.log('✅ Only console streams remaining (normal)');
    }
    
    console.log('🏁 Exiting program...');
    
    // Force exit after a brief delay to ensure logs are written
    setTimeout(() => {
      console.log('🚪 Closing process...');
      process.exit(0);
    }, 100);
    
  } catch (error) {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  }
}

// Add emergency timeout (reduced since it should finish faster now)
setTimeout(() => {
  console.log('⏰ Emergency timeout - forcing exit');
  const activeHandles = (process as any)._getActiveHandles?.() || [];
  console.log('Active handles before exit:', activeHandles.length);
  process.exit(0);
}, 3000); // 3 seconds

main().catch((error) => {
  console.error('💥 Error in main:', error);
  process.exit(1);
}); 