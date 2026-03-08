import { syntropyLog, ClassicConsoleTransport, ConsoleTransport } from 'syntropylog';

// Global variables for graceful shutdown
let isShuttingDown = false;
let readyPromise: Promise<void>;
let readyResolve: () => void;

// Initialize ready promise
readyPromise = new Promise<void>((resolve) => {
  readyResolve = resolve;
});

// Initialize SyntropyLog with universal context configuration
export async function initializeSyntropyLog() {
  try {
    await syntropyLog.init({
      logger: {
        serviceName: 'universal-context-demo',
        level: 'info',
        prettyPrint: { enabled: true },
        serializerTimeoutMs: 100,
        transports: [new ClassicConsoleTransport(), new ConsoleTransport()],
      },
      context: {
        correlationIdHeader: 'x-correlation-id'
      }
    });
    
    console.log('✅ SyntropyLog initialized successfully');
    readyResolve();
  } catch (error) {
    console.error('❌ Failed to initialize SyntropyLog:', error);
    throw error;
  }
}

// Wait for SyntropyLog to be ready
export async function waitForReady(): Promise<void> {
  return readyPromise;
}

// Graceful shutdown function
export async function gracefulShutdown(reason: string) {
  if (isShuttingDown) return;
  
  isShuttingDown = true;
  console.log(`\n🔄 Shutting down gracefully (${reason})...`);
  
  try {
    // Give time for pending operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Shutdown completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
}

// Setup graceful shutdown handlers
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Export SyntropyLog instance
export { syntropyLog };

// Function to get context manager (only after initialization)
export function getContextManager() {
  return syntropyLog.getContextManager();
} 