import { syntropyLog, initializeSyntropyLog, gracefulShutdown, waitForReady, getContextManager } from './boilerplate';

// Universal context pattern - same code works everywhere
async function universalContextPattern(operationType: string, operationData: any) {
  const logger = syntropyLog.getLogger();
  const contextManager = getContextManager();
  
  // 🎯 UNIVERSAL PATTERN: Same context code for ALL application types
  await contextManager.run(async () => {
    // Set operation context
    contextManager.set('operationType', operationType);
    contextManager.set('operationData', operationData);
    
    // Log with automatic correlation ID
    logger.info(`Processing ${operationType}`, {
      operationType,
      operationData,
      timestamp: new Date().toISOString()
    });
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Log completion
    logger.info(`${operationType} completed successfully`, {
      operationType,
      duration: '100ms'
    });
  });
}

// 🚀 Phase 1: Serverless Functions
async function demonstrateServerlessPatterns() {
  console.log('\n🌐 Phase 1: Serverless Functions');
  
  // AWS Lambda handler pattern
  await universalContextPattern('aws-lambda', {
    eventType: 'S3',
    bucket: 'my-bucket',
    key: 'user-upload.jpg'
  });
  
  // Google Cloud Functions pattern
  await universalContextPattern('gcp-function', {
    eventType: 'Pub/Sub',
    topic: 'user-events',
    messageId: 'msg-123'
  });
  
  // Azure Functions pattern
  await universalContextPattern('azure-function', {
    eventType: 'HTTP',
    method: 'POST',
    path: '/api/users'
  });
}

// ⚙️ Phase 2: Background Workers
async function demonstrateWorkerPatterns() {
  console.log('\n⚙️ Phase 2: Background Workers');
  
  // Bull job processor pattern
  await universalContextPattern('bull-job', {
    jobId: 'job-123',
    queue: 'payment-processing',
    data: { userId: 456, amount: 99.99 }
  });
  
  // Agenda scheduled job pattern
  await universalContextPattern('agenda-job', {
    jobId: 'scheduled-456',
    type: 'daily-report',
    scheduledAt: new Date().toISOString()
  });
  
  // Cron job pattern
  await universalContextPattern('cron-job', {
    jobId: 'cron-789',
    schedule: '0 2 * * *',
    type: 'backup-database'
  });
}

// 📨 Phase 3: Message Queue Handlers
async function demonstrateMessageQueuePatterns() {
  console.log('\n📨 Phase 3: Message Queue Handlers');
  
  // Kafka consumer pattern
  await universalContextPattern('kafka-consumer', {
    topic: 'order-events',
    partition: 0,
    offset: 12345,
    message: { orderId: 'order-123', customerId: 'cust-456' }
  });
  
  // RabbitMQ consumer pattern
  await universalContextPattern('rabbitmq-consumer', {
    queue: 'payment-queue',
    routingKey: 'payment.process',
    message: { paymentId: 'pay-789', amount: 150.00 }
  });
  
  // NATS subscriber pattern
  await universalContextPattern('nats-subscriber', {
    subject: 'user.created',
    queueGroup: 'user-processors',
    message: { userId: 'user-999', email: 'user@example.com' }
  });
}

// 🌐 Phase 4: HTTP Servers
async function demonstrateHttpServerPatterns() {
  console.log('\n🌐 Phase 4: HTTP Servers');
  
  // Express middleware pattern
  await universalContextPattern('express-request', {
    method: 'POST',
    path: '/api/orders',
    headers: { 'user-agent': 'Mozilla/5.0' },
    body: { productId: 'prod-123', quantity: 2 }
  });
  
  // Fastify plugin pattern
  await universalContextPattern('fastify-request', {
    method: 'GET',
    path: '/api/users/123',
    query: { include: 'orders' },
    params: { id: '123' }
  });
  
  // Koa middleware pattern
  await universalContextPattern('koa-request', {
    method: 'PUT',
    path: '/api/products/456',
    body: { name: 'Updated Product', price: 29.99 }
  });
}

// 🎯 Phase 5: Universal Pattern Demonstration
async function demonstrateUniversalPattern() {
  console.log('\n🎯 Phase 5: Universal Pattern Demonstration');
  
  const logger = syntropyLog.getLogger();
  const contextManager = getContextManager();
  
  await contextManager.run(async () => {
    logger.info('🎉 UNIVERSAL PATTERN DEMONSTRATION', {
      message: 'Same context code works across ALL Node.js application types!',
      correlationId: contextManager.getCorrelationId(),
      headerName: contextManager.getCorrelationIdHeaderName()
    });
    
    console.log('\n📊 Universal Pattern Summary:');
    console.log('✅ Serverless Functions: AWS Lambda, GCP, Azure');
    console.log('✅ Background Workers: Bull, Agenda, Cron Jobs');
    console.log('✅ Message Queues: Kafka, RabbitMQ, NATS');
    console.log('✅ HTTP Servers: Express, Fastify, Koa');
    console.log('✅ Same Context Code: Works everywhere!');
    
    logger.info('Universal pattern demonstration completed', {
      totalPatterns: 4,
      totalOperations: 12,
      success: true
    });
  });
}

async function demonstrateUniversalContextPatterns() {
  console.log('🎯 Example 05: Universal Context Patterns\n');
  console.log('🌐 Demonstrating SyntropyLog\'s universal context patterns across ALL Node.js application types\n');

  // Initialize SyntropyLog first
  await initializeSyntropyLog();

  // Wait for SyntropyLog to be ready before proceeding
  await waitForReady();

  console.log('✅ SyntropyLog ready! Starting universal context demonstrations...\n');

  try {
    // Demonstrate all patterns
    await demonstrateServerlessPatterns();
    await demonstrateWorkerPatterns();
    await demonstrateMessageQueuePatterns();
    await demonstrateHttpServerPatterns();
    await demonstrateUniversalPattern();
    
    console.log('\n🎉 All universal context patterns demonstrated successfully!');
    console.log('\n💡 Key Takeaway: The SAME context code works in ANY Node.js application!');
    
  } catch (error) {
    console.error('❌ Error during demonstration:', error);
    throw error;
  }
  
  // Exit gracefully after demonstration
  console.log('\n🎉 Example completed successfully! Exiting...');
  await gracefulShutdown('COMPLETION');
}

// Run the demonstration
demonstrateUniversalContextPatterns().catch((error) => {
  console.error('❌ Error in demonstration:', error);
  process.exit(1);
}); 