import { syntropyLog, CompactConsoleTransport } from 'syntropylog';
import { registerDatabaseSerializers } from 'syntropylog-adapters';

// Ejemplo de datos simulados para diferentes bases de datos
const mockPrismaQuery = {
  model: 'User',
  action: 'findMany',
  args: {
    where: {
      email: 'user@example.com',
      password: 'secret123' // Será redactado
    },
    select: {
      id: true,
      email: true,
      name: true
    }
  },
  duration: 45,
  clientMethod: 'findMany'
};

const mockTypeORMQuery = {
  query: 'SELECT * FROM users WHERE email = ? AND password = ?',
  parameters: ['user@example.com', 'secret123'], // Será redactado
  duration: 32,
  type: 'SELECT' as const,
  table: 'users',
  affectedRows: 1
};

const mockMySQLError = {
  code: 'ER_ACCESS_DENIED_ERROR',
  errno: 1045,
  sqlState: '28000',
  sqlMessage: 'Access denied for user',
  message: 'Access denied for user \'root\'@\'localhost\' (using password: YES)',
  sql: 'SELECT * FROM users WHERE password = "secret123"', // Será redactado
  values: ['user@example.com', 'secret123'] // Será redactado
};

const mockPostgreSQLQuery = {
  text: 'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
  values: ['user@example.com', 'hashed_password_here'], // Será redactado
  duration: 28,
  type: 'INSERT' as const,
  table: 'users',
  rowCount: 1
};

const mockMongoDBQuery = {
  collection: 'users',
  operation: 'find',
  filter: {
    email: 'user@example.com',
    password: 'secret123' // Será redactado
  },
  projection: {
    password: 0,
    _id: 1,
    email: 1,
    name: 1
  },
  limit: 10,
  duration: 35,
  documentsReturned: 1
};

const mockMongoDBAggregation = {
  collection: 'orders',
  pipeline: [
    { $match: { userId: '123', secret: 'sensitive_data' } }, // Será redactado
    { $group: { _id: '$status', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } }
  ],
  duration: 42,
  documentsReturned: 5,
  stages: ['$match', '$group', '$sort']
};

async function demonstrateSerializers() {
  try {
    // Inicializar SyntropyLog con serializadores de bases de datos
    await syntropyLog.init({
      logger: {
        level: 'info',
        serviceName: 'database-serializers-demo',
        transports: [new CompactConsoleTransport()],
        serializerTimeoutMs: 50
      },
      context: {
        correlationIdHeader: 'X-Correlation-ID'
      }
    });

    // Registrar los serializadores de bases de datos
    registerDatabaseSerializers(syntropyLog.serializerRegistry);

    console.log('\n🔍 Demostrando serializadores de bases de datos...\n');

    // Probar serializador de Prisma
    console.log('📊 Prisma Query:');
    const prismaSerialized = syntropyLog.serializerRegistry.serialize(mockPrismaQuery);
    console.log(prismaSerialized);
    console.log('');

    // Probar serializador de TypeORM
    console.log('📊 TypeORM Query:');
    const typeormSerialized = syntropyLog.serializerRegistry.serialize(mockTypeORMQuery);
    console.log(typeormSerialized);
    console.log('');

    // Probar serializador de MySQL (error)
    console.log('📊 MySQL Error:');
    const mysqlSerialized = syntropyLog.serializerRegistry.serialize(mockMySQLError);
    console.log(mysqlSerialized);
    console.log('');

    // Probar serializador de PostgreSQL
    console.log('📊 PostgreSQL Query:');
    const postgresSerialized = syntropyLog.serializerRegistry.serialize(mockPostgreSQLQuery);
    console.log(postgresSerialized);
    console.log('');

    // Probar serializador de MongoDB (query)
    console.log('📊 MongoDB Query:');
    const mongoQuerySerialized = syntropyLog.serializerRegistry.serialize(mockMongoDBQuery);
    console.log(mongoQuerySerialized);
    console.log('');

    // Probar serializador de MongoDB (aggregation)
    console.log('📊 MongoDB Aggregation:');
    const mongoAggregationSerialized = syntropyLog.serializerRegistry.serialize(mockMongoDBAggregation);
    console.log(mongoAggregationSerialized);
    console.log('');

    // Probar con logger real
    console.log('📝 Logging con serializadores automáticos:');
    syntropyLog.logger.info('Prisma query executed', { query: mockPrismaQuery });
    syntropyLog.logger.error('MySQL connection failed', { error: mockMySQLError });
    syntropyLog.logger.info('PostgreSQL insert completed', { query: mockPostgreSQLQuery });
    syntropyLog.logger.info('MongoDB query executed', { query: mockMongoDBQuery });
    syntropyLog.logger.info('MongoDB aggregation completed', { aggregation: mockMongoDBAggregation });

    console.log('\n✅ Demostración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la demostración:', error);
  } finally {
    await syntropyLog.shutdown();
  }
}

// Ejecutar la demostración
if (require.main === module) {
  demonstrateSerializers();
}

export { demonstrateSerializers }; 