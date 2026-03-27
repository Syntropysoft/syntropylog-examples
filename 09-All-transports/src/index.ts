/**
 * Example 09: All transports
 *
 * API fluente del logger (ILogger — para la siguiente llamada a log):
 * - override(...names): enviar el próximo log solo a esos transportes por nombre.
 * - add(...names): añadir esos transportes al conjunto por defecto para el próximo log.
 * - remove(...names): quitar esos transportes del conjunto por defecto para el próximo log.
 *
 * @see syntropyLog/src/logger/ILogger.ts
 */

import {
  syntropyLog,
  ConsoleTransport,
  ClassicConsoleTransport,
  PrettyConsoleTransport,
  CompactConsoleTransport,
} from 'syntropylog';

async function main() {
  type InitConfig = Parameters<typeof syntropyLog.init>[0] & {
    logger?: { transportList?: Record<string, unknown>; env?: Record<string, string[]>; envKey?: string };
  };
  await syntropyLog.init({
    logger: {
      serviceName: 'all-transports-example',
      level: 'info',
      serializerTimeoutMs: 100,
      transportList: {
        json: new ConsoleTransport(),
        classic: new ClassicConsoleTransport(),
        pretty: new PrettyConsoleTransport(),
        compact: new CompactConsoleTransport(),
      },
      env: { development: ['json'] },
      envKey: 'NODE_ENV',
    },
  } as InitConfig);

  if (syntropyLog.isNativeAddonInUse()) {
    console.log('⚡ Native Rust addon active');
  } else {
    console.log('ℹ️  Native addon not active — JS pipeline in use');
    console.log('   → Requires Node ≥ 20, supported platform (Linux/macOS/Windows x64/arm64)');
    console.log('   → To force JS mode intentionally: set SYNTROPYLOG_NATIVE_DISABLE=1');
  }

  const log = syntropyLog.getLogger('all-transports');

  // ILogger: override, add, remove retornan ILogger para encadenar .info(), .warn(), etc.
  console.log('\n' + '='.repeat(60));
  console.log('  1. override("json")');
  console.log('='.repeat(60));
  await log.override('json').info('Mensaje de prueba info');
  await log.override('json').warn('Mensaje de prueba warn');
  await log.override('json').info('Con metadata', { userId: 'u-1', action: 'login' });

  console.log('\n' + '='.repeat(60));
  console.log('  2. override("classic")');
  console.log('='.repeat(60));
  await log.override('classic').info('Mensaje de prueba info');
  await log.override('classic').warn('Mensaje de prueba warn');
  await log.override('classic').info('Con metadata', { userId: 'u-1', action: 'login' });

  console.log('\n' + '='.repeat(60));
  console.log('  3. override("pretty")');
  console.log('='.repeat(60));
  await log.override('pretty').info('Mensaje de prueba info');
  await log.override('pretty').info('Con metadata', { userId: 'u-1', action: 'login' });

  console.log('\n' + '='.repeat(60));
  console.log('  4. override("compact")');
  console.log('='.repeat(60));
  await log.override('compact').info('Mensaje de prueba info');
  await log.override('compact').warn('Mensaje de prueba warn');

  console.log('\n' + '='.repeat(60));
  console.log('  5. add("classic", "json") — próximo log = default + classic + json');
  console.log('='.repeat(60));
  await log.add('classic', 'json').info('Este log va a default + classic + json');

  console.log('\n' + '='.repeat(60));
  console.log('  6. remove("compact") — próximo log = default sin compact');
  console.log('='.repeat(60));
  await log.remove('compact').info('Este log va al default sin compact');

  console.log('\n' + '='.repeat(60));
  console.log('  All transports listo (override, add, remove)');
  console.log('='.repeat(60) + '\n');

  await syntropyLog.shutdown();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
