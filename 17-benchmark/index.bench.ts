// ============================================================================
// 17-benchmark — SyntropyLog vs Pino vs Winston
// ----------------------------------------------------------------------------
// Mide overhead de la pipeline de logging (sin I/O) en throughput y memoria.
// Todos los loggers escriben a /dev/null para aislar el costo de la lógica
// (serialización, masking, contexto, fluent API) del costo del sink.
//
// Comparación justa requiere que los tres loggers usen el MISMO modelo de I/O:
// SyntropyLog escribe síncrono al stream desde BenchTransport, Winston usa
// Stream sync, y Pino se fuerza a `sync: true` (sin SonicBoom buffering) —
// sin esto, el buffer async de Pino contamina las mediciones de memoria al
// acumular chunks bajo alta carga.
// ============================================================================

import { run, bench, baseline, group } from 'mitata';
import {
  syntropyLog as sl,
  ConsoleTransport,
  MaskingEngine,
} from 'syntropylog';
import type { SyntropyLogConfig } from 'syntropylog';
import pino from 'pino';
import winston from 'winston';
import fs from 'fs';

function flushStdout() {
  if (typeof process !== 'undefined' && process.stdout?.write) {
    process.stdout.write('', () => {});
  }
}

console.log('\n=== SyntropyLog Benchmark (SyntropyLog vs Pino vs Winston) ===\n');
flushStdout();

// ----------------------------------------------------------------------------
// SETUP — sinks y configuración por lib
// ----------------------------------------------------------------------------
// Stream compartido a /dev/null (lo usan SyntropyLog vía BenchTransport y
// Winston). Pino tiene su propio destination configurado más abajo.
// ----------------------------------------------------------------------------
const devNull = fs.createWriteStream(
  process.platform === 'win32' ? '\\\\.\\nul' : '/dev/null'
);

// SyntropyLog: el singleton ya existe; configuramos el logger con un transport
// que escribe al devNull en vez de stdout. BenchTransport debe manejar AMBOS
// formatos: object (path JS) y string pre-serializado (path nativo del addon
// Rust). Sin el typeof check habría double-stringify cuando el addon está activo.
class BenchTransport extends ConsoleTransport {
  public override log(entry: unknown): void {
    const logString =
      (typeof entry === 'string' ? entry : JSON.stringify(entry)) + '\n';
    devNull.write(logString);
  }
}

const benchTransport = new BenchTransport();

await sl.init({
  logger: {
    level: 'info',
    transports: [benchTransport],
  },
} as SyntropyLogConfig);

const slLogger = sl.getLogger('bench');

// Reproducibility: report if Rust addon is used (same resolution as SerializationManager)
const nativeAddonInUse =
  typeof (sl as unknown as { isNativeAddonInUse?: () => boolean })
    .isNativeAddonInUse === 'function'
    ? (
        sl as unknown as { isNativeAddonInUse: () => boolean }
      ).isNativeAddonInUse()
    : false;
console.log(
  'SyntropyLog native addon (Rust):',
  nativeAddonInUse ? 'yes' : 'no'
);
if (!nativeAddonInUse) {
  console.log(
    'Tip: build addon (cd syntropylog-native && pnpm run build). To force JS-only (e.g. for comparison): SYNTROPYLOG_NATIVE_DISABLE=1'
  );
}

// Pino: forzamos `sync: true` para eliminar el buffering de SonicBoom.
// Sin esto, Pino acumula logs en un buffer interno cuando el throughput es
// alto (caso "Hello Bench"), inflando artificialmente la memoria medida y
// haciendo la comparación contra SyntropyLog injusta (SL escribe síncrono).
// Con sync:true, ambos loggers entregan cada log al sink en el mismo tick.
const pinoLogger = pino(
  { level: 'info' },
  pino.destination({
    dest: process.platform === 'win32' ? '\\\\.\\nul' : '/dev/null',
    sync: true,
  })
);

// Winston: el Stream transport ya escribe síncrono al stream provisto.
const winstonLogger = winston.createLogger({
  level: 'info',
  transports: [new winston.transports.Stream({ stream: devNull })],
});

const ITERATIONS = 5_000;

// Objeto complejo con campos sensibles (email, token) que activan masking
// en SyntropyLog. Se reutiliza la misma referencia en todos los tests para
// que no haya overhead extra de allocation del payload entre libs.
const complexObj = {
  user: {
    id: 123,
    email: 'secret@example.com',
    name: 'John Doe',
    nested: { token: 'very-secret-token', active: true },
  },
  meta: { reqId: 'abc-123', ua: 'Mozilla/5.0...' },
};

// ----------------------------------------------------------------------------
// BLOQUE 1 — Logging Throughput simple (string message, sin payload)
// ----------------------------------------------------------------------------
// Mide el costo base de emitir un log con sólo un message string. Es el caso
// peor para SyntropyLog vs Pino: no hay masking ni serialización pesada, y
// SyntropyLog igual hace todo su pipeline (matrix, hooks, context lookup),
// mientras que Pino sólo wrappea el string en JSON. Refleja el costo del
// "framework completo" vs el "JSON-only logger".
// ----------------------------------------------------------------------------
group(`Logging Throughput (${ITERATIONS.toLocaleString()} iterations)`, () => {
  bench('console.log (baseline)', () => {
    devNull.write('Hello Bench\n');
  });

  bench('SyntropyLog (JSON)', () => {
    slLogger.info('Hello Bench');
  });

  bench('Pino', () => {
    pinoLogger.info('Hello Bench');
  });

  bench('Winston', () => {
    winstonLogger.info('Hello Bench');
  });
});

// ----------------------------------------------------------------------------
// BLOQUE 2 — MaskingEngine en aislamiento (p99/p999 hot path)
// ----------------------------------------------------------------------------
// Mide SOLO el costo del MaskingEngine procesando complexObj, sin pasar por
// el logger ni el transport. Sirve de baseline para entender qué fracción
// del costo de "SyntropyLog (with masking)" corresponde al masking en sí
// vs al resto de la pipeline. Se clona el objeto en cada iteración porque
// process() muta in-place (defensa pre-establecida del engine).
// ----------------------------------------------------------------------------
const maskingEngine = new MaskingEngine({ enableDefaultRules: true });
group('MaskingEngine only (complex object, p99/p999 baseline)', () => {
  bench('MaskingEngine.process(complexObj)', () => {
    maskingEngine.process(
      JSON.parse(JSON.stringify(complexObj)) as Record<string, unknown>
    );
  });
});

// ----------------------------------------------------------------------------
// BLOQUE 3 — Complex object (comparación justa con payload real)
// ----------------------------------------------------------------------------
// Mide el caso de uso realista: log con payload nested + campos sensibles.
// Acá SyntropyLog hace masking automático (email, token) además de la
// serialización; Pino y Winston solo serializan. Por eso es el comparativo
// más honesto: muestra el costo de "tener compliance built-in" vs no.
// SyntropyLog se declara baseline para que el summary lo ponga primero.
// ----------------------------------------------------------------------------
group('Complex Object (same payload, fair comparison)', () => {
  baseline('SyntropyLog (with masking)', () => {
    slLogger.info('User action', complexObj);
  });
  bench('Pino (complex object)', () => {
    pinoLogger.info(complexObj, 'User action');
  });
  bench('Winston (complex object)', () => {
    winstonLogger.info('User action', complexObj);
  });
});

// ----------------------------------------------------------------------------
// BLOQUE 4 — Fluent API (withRetention + JSON complejo anidado)
// ----------------------------------------------------------------------------
// Mide el costo del feature distintivo de SyntropyLog: attach de metadata de
// compliance/retención por log. Cada iteración crea un child logger via
// .withRetention(...) Y emite el log — peor caso de la fluent API. Sin
// comparativos directos en Pino/Winston porque no tienen equivalente
// out-of-the-box; sirve para trackear regresiones internas entre versiones.
// ----------------------------------------------------------------------------
const complexRetention = {
  ttl: 86400,
  maxSize: 100_000,
  policy: {
    region: 'eu',
    buckets: ['audit', 'compliance'],
    tiers: { hot: 7, cold: 90 },
  },
  tags: ['pii', 'audit'],
} as Parameters<typeof slLogger.withRetention>[0];

group('Fluent API (withRetention + complex JSON)', () => {
  bench('SyntropyLog (withRetention complex)', () => {
    slLogger.withRetention(complexRetention).info('Audit event');
  });
});

// ----------------------------------------------------------------------------
// EJECUCIÓN + REPORTE (throughput)
// ----------------------------------------------------------------------------
// Mitata guarda los tiempos en ns y su reporter default mezcla unidades
// (ns/µs según magnitud). Acá corremos run() y después imprimimos una tabla
// y summary unificados, todo en µs, para que la comparación visual sea
// directa sin que el lector tenga que reconvertir unidades.
// ----------------------------------------------------------------------------
console.log('Running benchmarks...\n');
flushStdout();

const report = await run({
  avg: true,
  json: false,
  colors: true,
  min_max: true,
  percentiles: true,
});

flushStdout();

interface BenchStats {
  avg: number;
  min: number;
  max: number;
  p75: number;
  p99: number;
  p999: number;
}
interface BenchEntry {
  name: string;
  group?: string;
  stats?: BenchStats;
  error?: unknown;
}

// Tabla unificada: todos los tiempos en microsegundos (1 µs = 1000 ns)
function nsToUs(ns: number): string {
  const us = ns / 1e3;
  return us >= 1000
    ? us.toLocaleString('en-US', { maximumFractionDigits: 0 })
    : us.toFixed(2);
}

const benchList = report.benchmarks.filter(
  (b: BenchEntry) => b.stats && !b.error
) as (BenchEntry & { stats: BenchStats })[];
if (benchList.length > 0) {
  const w = Math.max(32, ...benchList.map((b) => b.name.length));
  console.log('\n--- All times in µs (same unit for correct comparison) ---');
  console.log(
    'benchmark'.padEnd(w, ' ') +
      '  avg (µs)   (min … max) (µs)     p75      p99     p999'
  );
  console.log('-'.repeat(w + 60));
  for (const b of benchList) {
    const s = b.stats!;
    const avg = nsToUs(s.avg);
    const min = nsToUs(s.min);
    const max = nsToUs(s.max);
    const p75 = nsToUs(s.p75);
    const p99 = nsToUs(s.p99);
    const p999 = nsToUs(s.p999);
    console.log(
      b.name.padEnd(w, ' ') +
        `  ${avg.padStart(9)}   (${min} … ${max})  ${p75.padStart(8)} ${p99.padStart(8)} ${p999.padStart(8)}`
    );
  }

  // Summary: same ratios as above, all averages in µs for consistency with the main table.
  const groupNames = Array.from(
    new Set(benchList.map((b) => b.group).filter(Boolean))
  ) as string[];
  for (const groupName of groupNames) {
    const inGroup = benchList
      .filter((b) => b.group === groupName)
      .sort((a, b) => a.stats.avg - b.stats.avg);
    if (inGroup.length < 2) continue;
    const baseline = inGroup[0];
    const baselineAvgNs = baseline.stats!.avg;
    console.log(
      `\n--- Summary for "${groupName}" (all avg in µs, ratio = other/baseline) ---`
    );
    console.log(
      `  ${baseline.name}: avg = ${nsToUs(baselineAvgNs)} µs (baseline)`
    );
    for (let i = 1; i < inGroup.length; i++) {
      const b = inGroup[i];
      const avgNs = b.stats!.avg;
      const ratio = avgNs / baselineAvgNs;
      console.log(
        `  ${b.name}: avg = ${nsToUs(avgNs)} µs → ${ratio.toFixed(2)}x slower than baseline`
      );
    }
  }
  flushStdout();
} else {
  console.log('\n--- Benchmark results ---');
  console.log('No benchmark stats (errors or empty report). Raw benchmarks count:', report.benchmarks?.length ?? 0);
  if (report.benchmarks?.length) {
    report.benchmarks.forEach((b: BenchEntry, i: number) => {
      console.log(`  ${i + 1}. ${b.name}: ${b.error ? `error: ${(b.error as Error)?.message}` : 'stats=' + JSON.stringify(b.stats)}`);
    });
  }
  flushStdout();
}

// ============================================================================
// BLOQUE 5 — Consumo de memoria (heap delta sobre N iteraciones)
// ----------------------------------------------------------------------------
// Mide la presión real sobre el heap V8 por cada iteración de log. Para que
// los números sean confiables hay que correr con `--expose-gc` (use
// `pnpm run bench:memory`, que ya pasa NODE_OPTIONS=--expose-gc): sin GC
// controlado entre tasks, el "before" de cada test incluye el heap residual
// del anterior, y los low-allocators pueden mostrar delta negativo (que se
// clampea a 0 = "noise").
//
// Caveat importante de comparación: requiere que todos los loggers usen el
// MISMO modelo I/O (sync) — de lo contrario buffers internos async (ej.
// SonicBoom en Pino default) inflan el delta artificialmente. El setup de
// arriba fuerza `sync: true` en Pino para evitar este sesgo.
// ============================================================================
const MEMORY_ITERATIONS = 100_000;
const gc = typeof globalThis.gc === 'function' ? globalThis.gc : null;

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

interface MemoryTask {
  name: string;
  fn: () => void;
}

const memoryTasks: MemoryTask[] = [
  { name: 'console.log (baseline)', fn: () => devNull.write('Hello Bench\n') },
  { name: 'SyntropyLog (JSON)', fn: () => slLogger.info('Hello Bench') },
  { name: 'Pino', fn: () => pinoLogger.info('Hello Bench') },
  { name: 'Winston', fn: () => winstonLogger.info('Hello Bench') },
  {
    name: 'SyntropyLog (with masking)',
    fn: () => slLogger.info('User action', complexObj),
  },
  {
    name: 'Pino (complex object)',
    fn: () => pinoLogger.info(complexObj, 'User action'),
  },
  {
    name: 'Winston (complex object)',
    fn: () => winstonLogger.info('User action', complexObj),
  },
  {
    name: 'SyntropyLog (withRetention complex)',
    fn: () => slLogger.withRetention(complexRetention).info('Audit event'),
  },
];

console.log('\n--- Memory consumption ---');
flushStdout();
if (!gc) {
  console.log(
    'Tip: run with node --expose-gc for stable results (negative deltas = GC noise).\n'
  );
}

// Without --expose-gc we never call gc() between tasks, so "before" is the heap left by
// the *previous* task. Low-allocators (e.g. Pino) can then show heapDelta < 0 (GC freed
// more than this task allocated), which we clamp to 0 — so "0 B" is often measurement
// noise, not real zero allocation. Use pnpm run bench:memory for reliable numbers.
const results: {
  name: string;
  heapDelta: number;
  bytesPerOp: number;
  wasClamped: boolean;
}[] = [];
for (const task of memoryTasks) {
  if (gc) gc();
  const before = process.memoryUsage().heapUsed;
  for (let i = 0; i < MEMORY_ITERATIONS; i++) task.fn();
  const after = process.memoryUsage().heapUsed;
  const rawDelta = after - before;
  const wasClamped = rawDelta < 0;
  const heapDelta = wasClamped ? 0 : rawDelta;
  results.push({
    name: task.name,
    heapDelta,
    bytesPerOp: heapDelta / MEMORY_ITERATIONS,
    wasClamped,
  });
}

const maxNameLen = Math.max(...results.map((r) => r.name.length));
console.log(
  `${'benchmark'.padEnd(maxNameLen)}  heap delta (${MEMORY_ITERATIONS.toLocaleString()} iter)  bytes/op`
);
console.log('-'.repeat(maxNameLen + 50));
for (const r of results) {
  const deltaStr = r.wasClamped
    ? `${formatBytes(r.heapDelta)} (noise)`
    : formatBytes(r.heapDelta);
  console.log(
    `${r.name.padEnd(maxNameLen)}  ${deltaStr.padStart(14)}  ${r.bytesPerOp.toFixed(2)}`
  );
}
if (results.some((r) => r.wasClamped)) {
  console.log(
    '\n(Some "0 (noise)" = negative delta clamped; run `npm run bench:memory` for stable memory results.)'
  );
} else {
  console.log(
    '\n(Memory: run `npm run bench:memory` for reliable deltas; otherwise values can be noisy.)'
  );
}
