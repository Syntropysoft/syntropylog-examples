import { randomUUID } from 'crypto';
import { syntropyLog, initializeSyntropyLog, shutdownSyntropyLog, setupGracefulShutdown } from '../../shared/src/index.js';

// Setup graceful shutdown
setupGracefulShutdown();

// Types for our domain
interface Order {
  productId: string;
  quantity: number;
  customerId: string;
}

interface InventoryItem {
  id: string;
  stock: number;
  price: number;
}

// This simulates a service responsible for inventory management.
const inventoryService = {
  checkStock: (itemId: string): InventoryItem => {
    // No need to pass the logger around. We can get it from the singleton.
    const stockLogger = syntropyLog.getLogger('inventory-service');
    
    stockLogger.info({ itemId }, 'Checking inventory...');
    
    // Simulate some business logic
    const inventoryItem: InventoryItem = {
      id: itemId,
      stock: Math.floor(Math.random() * 100) + 1,
      price: Math.floor(Math.random() * 1000) + 100
    };
    
    stockLogger.info({ 
      itemId, 
      stock: inventoryItem.stock, 
      price: inventoryItem.price 
    }, 'Inventory check completed');
    
    return inventoryItem;
  },

  reserveStock: (itemId: string, quantity: number): boolean => {
    const stockLogger = syntropyLog.getLogger('inventory-service');
    
    stockLogger.info({ itemId, quantity }, 'Reserving stock...');
    
    // Simulate stock reservation logic
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      stockLogger.info({ itemId, quantity }, 'Stock reserved successfully');
    } else {
      stockLogger.warn({ itemId, quantity }, 'Failed to reserve stock - insufficient inventory');
    }
    
    return success;
  }
};

// This simulates a service responsible for handling orders.
const orderService = {
  process: async (order: Order): Promise<boolean> => {
    const orderLogger = syntropyLog.getLogger('order-service');
    
    orderLogger.info({ 
      orderId: order.productId, 
      quantity: order.quantity,
      customerId: order.customerId 
    }, 'Processing order...');
    
    try {
      // Check inventory
      const inventoryItem = inventoryService.checkStock(order.productId);
      
      if (inventoryItem.stock < order.quantity) {
        orderLogger.warn({ 
          orderId: order.productId, 
          requested: order.quantity, 
          available: inventoryItem.stock 
        }, 'Insufficient stock for order');
        return false;
      }
      
      // Reserve stock
      const reserved = inventoryService.reserveStock(order.productId, order.quantity);
      
      if (!reserved) {
        orderLogger.error({ 
          orderId: order.productId, 
          quantity: order.quantity 
        }, 'Failed to reserve stock');
        return false;
      }
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      orderLogger.info({ 
        orderId: order.productId, 
        quantity: order.quantity,
        totalPrice: inventoryItem.price * order.quantity 
      }, 'Order processed successfully');
      
      return true;
      
    } catch (error) {
      orderLogger.error({ 
        orderId: order.productId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'Error processing order');
      return false;
    }
  }
};

// This simulates a payment service
const paymentService = {
  processPayment: async (amount: number, customerId: string): Promise<boolean> => {
    const paymentLogger = syntropyLog.getLogger('payment-service');
    
    paymentLogger.info({ amount, customerId }, 'Processing payment...');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const success = Math.random() > 0.05; // 95% success rate
    
    if (success) {
      paymentLogger.info({ amount, customerId }, 'Payment processed successfully');
    } else {
      paymentLogger.error({ amount, customerId }, 'Payment failed');
    }
    
    return success;
  }
};

// Main application logic
async function main() {
  try {
    // 1. Initialize SyntropyLog
    await initializeSyntropyLog();

    const mainLogger = syntropyLog.getLogger('main');
    const contextManager = syntropyLog.getContextManager();

    mainLogger.info('Starting e-commerce application...');

    // 2. Simulate multiple incoming requests with different correlation IDs
    const orders: Order[] = [
      { productId: 'PROD-001', quantity: 2, customerId: 'CUST-001' },
      { productId: 'PROD-002', quantity: 1, customerId: 'CUST-002' },
      { productId: 'PROD-003', quantity: 3, customerId: 'CUST-003' }
    ];

    // Process each order in its own context
    for (const order of orders) {
      const correlationId = randomUUID();
      
      mainLogger.info({ 
        correlationId, 
        customerId: order.customerId 
      }, 'Starting new order processing session');

      // 3. This is the magic! Create an async context for each order
      await contextManager.run(async () => {
        // Set correlation ID in the context
        contextManager.set(contextManager.getCorrelationIdHeaderName(), correlationId);
        
        // Add additional context data
        contextManager.set('customerId', order.customerId);
        contextManager.set('sessionId', randomUUID());

        // Process the order
        const orderSuccess = await orderService.process(order);
        
        if (orderSuccess) {
          // Simulate payment processing
          const inventoryItem = inventoryService.checkStock(order.productId);
          const paymentSuccess = await paymentService.processPayment(
            inventoryItem.price * order.quantity, 
            order.customerId
          );
          
          if (paymentSuccess) {
            mainLogger.info({ 
              orderId: order.productId, 
              customerId: order.customerId 
            }, 'Order and payment completed successfully');
          } else {
            mainLogger.error({ 
              orderId: order.productId, 
              customerId: order.customerId 
            }, 'Order completed but payment failed');
          }
        } else {
          mainLogger.warn({ 
            orderId: order.productId, 
            customerId: order.customerId 
          }, 'Order processing failed');
        }
      });

      // Small delay between orders
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    mainLogger.info('All orders processed. Application finished.');

  } catch (error) {
    console.error('Application error:', error);
  } finally {
    // 4. Always shutdown SyntropyLog to ensure all logs are flushed
    await shutdownSyntropyLog();
  }
}

// Run the application
main().catch(console.error); 