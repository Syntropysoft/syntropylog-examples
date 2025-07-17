import { syntropyLog, CompactConsoleTransport } from 'syntropylog';
import { SerializationManager } from 'syntropylog/src/serialization/SerializationManager';
import { PrismaSerializer } from 'syntropylog-adapters';

// Ejemplo de datos simulados para diferentes complejidades
const simplePrismaQuery = {
  model: 'User',
  action: 'findFirst',
  args: {
    where: { id: 1 }
  },
  duration: 15
};

const complexPrismaQuery = {
  model: 'User',
  action: 'findMany',
  args: {
    where: {
      OR: [
        { email: { contains: 'test' } },
        { name: { contains: 'admin' } }
      ],
      AND: [
        { active: true },
        { verified: true }
      ]
    },
    include: {
      profile: true,
      posts: {
        include: {
          comments: true,
          tags: true
        }
      }
    },
    orderBy: [
      { createdAt: 'desc' },
      { updatedAt: 'desc' }
    ],
    take: 50,
    skip: 0
  },
  duration: 45,
  runInTransaction: false
};

const criticalPrismaQuery = {
  model: 'Order',
  action: 'findMany',
  args: {
    where: {
      AND: [
        { status: { in: ['pending', 'processing'] } },
        { createdAt: { gte: new Date('2024-01-01') } },
        {
          OR: [
            { customer: { tier: 'premium' } },
            { total: { gte: 1000 } }
          ]
        }
      ]
    },
    include: {
      customer: {
        include: {
          profile: true,
          preferences: true,
          addresses: true
        }
      },
      items: {
        include: {
          product: {
            include: {
              category: true,
              variants: true,
              reviews: true
            }
          },
          options: true
        }
      },
      payments: {
        include: {
          method: true,
          transactions: true
        }
      },
      shipping: {
        include: {
          carrier: true,
          tracking: true
        }
      }
    },
    orderBy: [
      { createdAt: 'desc' },
      { updatedAt: 'desc' },
      { total: 'desc' }
    ],
    take: 100,
    skip: 0
  },
  duration: 120,
  runInTransaction: true
};

async function demonstrateIntelligentSerialization() {
  try {
    // Inicializar SyntropyLog con el nuevo sistema de serialización
    await syntropyLog.init({
      logger: {
        level: 'info',
        serviceName: 'intelligent-serialization-demo',
        transports: [new CompactConsoleTransport()],
        serialization: {
          timeouts: {
            simple: 30,
            complex: 100,
            critical: 200
          },
          autoDetect: true,
          enableMetrics: true,
          serializers: {
            prisma: {
              timeout: 150,
              sensitiveFields: ['password', 'token', 'secret']
            }
          }
        }
      }
    });

    // Crear el SerializationManager
    const serializationManager = new SerializationManager({
      timeouts: {
        simple: 30,
        complex: 100,
        critical: 200
      },
      autoDetect: true,
      enableMetrics: true,
      serializers: {
        prisma: {
          timeout: 150,
          sensitiveFields: ['password', 'token', 'secret']
        }
      }
    });

    // Registrar serializadores
    serializationManager.register(new PrismaSerializer(), {
      timeout: 150,
      sensitiveFields: ['password', 'token', 'secret']
    });

    console.log('\n🧠 Demostrando Serialización Inteligente...\n');

    // Probar serialización simple
    console.log('📊 Query Simple:');
    const simpleResult = await serializationManager.serialize(
      simplePrismaQuery,
      syntropyLog.logger
    );
    console.log(`Serializer: ${simpleResult.serializer}`);
    console.log(`Complexity: ${simpleResult.complexity}`);
    console.log(`Duration: ${simpleResult.duration}ms`);
    console.log(`Sanitized: ${simpleResult.sanitized}`);
    console.log('');

    // Probar serialización compleja
    console.log('📊 Query Compleja:');
    const complexResult = await serializationManager.serialize(
      complexPrismaQuery,
      syntropyLog.logger
    );
    console.log(`Serializer: ${complexResult.serializer}`);
    console.log(`Complexity: ${complexResult.complexity}`);
    console.log(`Duration: ${complexResult.duration}ms`);
    console.log(`Sanitized: ${complexResult.sanitized}`);
    console.log('');

    // Probar serialización crítica
    console.log('📊 Query Crítica:');
    const criticalResult = await serializationManager.serialize(
      criticalPrismaQuery,
      syntropyLog.logger
    );
    console.log(`Serializer: ${criticalResult.serializer}`);
    console.log(`Complexity: ${criticalResult.complexity}`);
    console.log(`Duration: ${criticalResult.duration}ms`);
    console.log(`Sanitized: ${criticalResult.sanitized}`);
    console.log('');

    // Mostrar métricas
    console.log('📈 Métricas de Serialización:');
    const metrics = serializationManager.getMetrics();
    console.log(`Total serializaciones: ${metrics.total}`);
    console.log(`Tiempo promedio: ${metrics.averageTime.toFixed(2)}ms`);
    console.log(`Por complejidad:`, metrics.byComplexity);
    console.log(`Por serializador:`, metrics.bySerializer);
    console.log(`Timeouts: ${metrics.timeouts}`);
    console.log(`Errores: ${metrics.errors}`);
    console.log('');

    // Probar con logger real
    console.log('📝 Logging con serialización automática:');
    syntropyLog.logger.info('Query simple ejecutada', { query: simplePrismaQuery });
    syntropyLog.logger.info('Query compleja ejecutada', { query: complexPrismaQuery });
    syntropyLog.logger.info('Query crítica ejecutada', { query: criticalPrismaQuery });

    console.log('\n✅ Demostración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la demostración:', error);
  } finally {
    await syntropyLog.shutdown();
  }
}

// Ejecutar la demostración
if (require.main === module) {
  demonstrateIntelligentSerialization();
}

export { demonstrateIntelligentSerialization }; 