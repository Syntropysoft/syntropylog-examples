// Test simple sin TypeScript
const { syntropyLog } = require('syntropylog');

console.log('✅ syntropyLog importado correctamente:', typeof syntropyLog);
console.log('✅ syntropyLog es una instancia:', syntropyLog.constructor.name);

// Probar la inicialización
syntropyLog.init({
  logger: {
    serviceName: 'test-app',
    level: 'info',
    serializerTimeoutMs: 100,
  },
});

const logger = syntropyLog.getLogger('test');
logger.info('¡Funciona! El paquete está bien importado.');

syntropyLog.shutdown().then(() => {
  console.log('✅ Test completado exitosamente');
}); 