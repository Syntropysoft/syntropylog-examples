# UniversalAdapter: ejemplo de uso (cualquier destino)

En la librería hay **un solo adapter**: **UniversalAdapter**. Los transportes se cargan en la configuración (`logger.transports`); después se pueden sacar, agregar o reemplazar.

El **UniversalAdapter** recibe un `executor` al que se le pasa el log ya formado y enmascarado; ahí podés enviarlo a donde quieras (DB, HTTP, broker, S3, etc.). Un solo contrato, cualquier destino — y podés **elegir el destino por log** (p. ej. por política de retención o compliance). Sumando **UniversalLogFormatter** + **AdapterTransport** tenés N mapeos a N esquemas (SIEM, Datadog, interno) sin tocar una línea de negocio: un logger, cualquier formato, cualquier destino.

## Ejemplo: enviar logs a base de datos (Prisma)

```ts
import { UniversalAdapter } from 'syntropylog';
import { prisma } from './db'; // tu cliente Prisma, modelo Mongoose, pool pg, etc.

const dbTransport = new UniversalAdapter({
  executor: async (logEntry) => {
    // logEntry es el objeto de log ya formado y enmascarado
    await prisma.systemLog.create({
      data: {
        level:         logEntry.level,
        message:       logEntry.message,
        service:       logEntry.serviceName,
        correlationId: logEntry.correlationId,
        payload:       logEntry.meta,   // columna JSON
        timestamp:     new Date(logEntry.timestamp),
      },
    });
  },
});

await syntropyLog.init({
  logger: {
    serviceName: 'ecommerce-app',
    transports: [new ClassicConsoleTransport(), dbTransport], // junto a consola
  },
  // ...
});
```

Mismo patrón sirve para Mongoose, `pg`, Drizzle, etc.: el `executor` recibe `logEntry` y lo persistís donde quieras.

## Ejemplo: enrutar por política de retención (múltiples tablas)

El `executor` puede decidir **a dónde** va cada log según `logEntry` (p. ej. `logEntry.retention?.policy` para compliance):

```ts
const dbTransport = new UniversalAdapter({
  executor: async (logEntry) => {
    const policy = logEntry.retention?.policy;

    const destination =
      policy === 'GDPR_ARTICLE_17' || policy === 'SOX_AUDIT_TRAIL' ? 'audit_logs'
      : policy === 'PCI_DSS'                                        ? 'payment_audit_logs'
      : policy === 'EPHEMERAL'                                      ? 'debug_logs'
      :                                                               'system_logs';

    await db[destination].insert(logEntry);
  },
});
```

Así un solo adapter manda a `audit_logs`, `payment_audit_logs`, `debug_logs` o `system_logs` según la política (GDPR, SOX, PCI-DSS, efímero o por defecto).

## N mappers: UniversalLogFormatter + UniversalAdapter + AdapterTransport

Un solo logger, N destinos con esquemas distintos: definís **N formateadores** (mapeos) y **N adapters/transports**: cada uno traduce el log a un esquema distinto (p. ej. Legacy SIEM, Datadog, interno) sin tocar el código de negocio. El flujo es: **logger** → **AdapterTransport** (formatter + adapter) → **UniversalLogFormatter** mapea el log a tu esquema → **UniversalAdapter** ejecutor envía el objeto ya mapeado.

Ejemplo: mapear logs de la app a un esquema plano "Legacy SIEM" (`evt_time`, `sev`, `msg`, `app_id`, `tx_id`, etc.) y enviarlos a un endpoint o cola:

```ts
import {
  syntropyLog,
  UniversalAdapter,
  UniversalLogFormatter,
  AdapterTransport,
} from 'syntropylog';

async function runExample() {
  // 1. Mapeo para el Legacy SIEM (campos que espera el destino)
  const legacyFormatter = new UniversalLogFormatter({
    mapping: {
      evt_time: 'timestamp',
      sev: 'level',
      msg: 'message',
      app_id: { value: 'PAYMENT-GATEWAY-01' },                    // valor estático
      tx_id: ['transactionId', 'correlationId', { value: 'N/A' }], // fallbacks en cascada
      user: 'user.id',                                           // path profundo (metadatos)
      retention_days: 'retention.days',
    },
  });

  // 2. Adapter universal: el executor recibe el objeto ya mapeado por el formatter
  const siemAdapter = new UniversalAdapter({
    executor: async (mappedData) => {
      // mappedData tiene ya evt_time, sev, msg, app_id, tx_id, ...
      // await axios.post('http://siem.local/logs', mappedData);
      console.log('[DESTINO LEGACY SIEM]', JSON.stringify(mappedData, null, 2));
    },
  });

  // 3. Transport = adapter + formatter (nombre para override/add/remove si usás pool)
  const legacyTransport = new AdapterTransport({
    adapter: siemAdapter,
    formatter: legacyFormatter,
    name: 'LegacySiemTransport',
  });

  await syntropyLog.init({
    logger: {
      serviceName: 'payment-service',
      level: 'info',
      serializerTimeoutMs: 5000,
      transports: [legacyTransport],
    },
  });

  const logger = syntropyLog.getLogger('payment-service');

  // 4. El código de negocio solo loguea con metadatos estándar
  // SyntropyLog hace el mapeo y el envío
  await logger
    .withTransactionId('TX-999555')
    .info('Procesando pago de tarjeta', {
      user: { id: 'usr_4422', email: 'test@example.com' },
      amount: 1500.5,
      retention: { days: 90, policy: 'FINANCIAL_RECORDS' },
    });

  await syntropyLog.shutdown();
}
```

Con esto podés tener varios `UniversalLogFormatter` + `UniversalAdapter` + `AdapterTransport` (uno por SIEM, uno por Datadog, uno por tabla interna) y agregarlos al pool de transportes; el negocio sigue logueando igual.

### Por qué override / add / remove en la API fluente del logger

Definís transportes con **nombre** (p. ej. `LegacySiemTransport`, `console`, `db`, `audit`). Esa lista es el pool. En la API fluente del logger están **override**, **add** y **remove** justamente para usar esa lista por log: podés mandar este log solo a ciertos transportes (`override('LegacySiemTransport')`), sumar uno al default (`add('audit')`) o sacar uno (`remove('compact')`). Así el pool de transportes (incluidos los AdapterTransport con mappers) y el control por llamada trabajan juntos: mismo logger, N destinos con nombres, y por cada log decidís a quién va.

## Próximos ejemplos a agregar

- UniversalAdapter → HTTP (axios/fetch)
- UniversalAdapter → Brokers (Kafka, RabbitMQ, NATS)
- Ejemplo 09 (All transports) ya muestra override/add/remove; sumar un AdapterTransport al pool y usarlo por nombre
