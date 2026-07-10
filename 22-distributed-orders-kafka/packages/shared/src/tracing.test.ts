/**
 * Unit tests for the pure tracing core — the W3C traceparent codec. No I/O, no context.
 * The payoff of keeping the codec pure: it verifies in isolation.
 *
 *   npx tsx packages/shared/src/tracing.test.ts
 */
import assert from 'node:assert/strict';
import {
  composeTraceparent,
  parseTraceparent,
  readHeader,
  newTraceId,
  newSpanId,
} from './tracing';

function test(name: string, fn: () => void): void {
  fn();
  // eslint-disable-next-line no-console
  console.log(`ok  ${name}`);
}

test('compose builds a sampled W3C traceparent', () => {
  const tp = composeTraceparent('4bf92f3577b34da6a3ce929d0e0e4736', '00f067aa0ba902b7');
  assert.equal(tp, '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01');
});

test('parse round-trips a composed header', () => {
  const traceId = '4bf92f3577b34da6a3ce929d0e0e4736';
  const spanId = '00f067aa0ba902b7';
  const parsed = parseTraceparent(composeTraceparent(traceId, spanId));
  assert.deepEqual(parsed, { traceId, parentSpanId: spanId });
});

test('parse rejects malformed / absent / all-zero', () => {
  assert.equal(parseTraceparent(undefined), null);
  assert.equal(parseTraceparent(''), null);
  assert.equal(parseTraceparent('not-a-traceparent'), null);
  assert.equal(parseTraceparent('00-tooshort-00f067aa0ba902b7-01'), null);
  assert.equal(
    parseTraceparent('00-00000000000000000000000000000000-00f067aa0ba902b7-01'),
    null
  ); // all-zero trace-id
  assert.equal(
    parseTraceparent('00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01'),
    null
  ); // all-zero span-id
});

test('parse is case-insensitive and trims', () => {
  const parsed = parseTraceparent('  00-4BF92F3577B34DA6A3CE929D0E0E4736-00F067AA0BA902B7-01  ');
  assert.deepEqual(parsed, {
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    parentSpanId: '00f067aa0ba902b7',
  });
});

test('readHeader is case-insensitive and handles arrays/absent', () => {
  assert.equal(readHeader({ Traceparent: 'abc' }, 'traceparent'), 'abc');
  assert.equal(readHeader({ traceparent: ['a', 'b'] }, 'traceparent'), 'a');
  assert.equal(readHeader({}, 'traceparent'), undefined);
  assert.equal(readHeader({ traceparent: undefined }, 'traceparent'), undefined);
});

test('id generators have the W3C widths and are hex', () => {
  assert.match(newTraceId(), /^[\da-f]{32}$/);
  assert.match(newSpanId(), /^[\da-f]{16}$/);
  assert.notEqual(newTraceId(), newTraceId()); // random
});

// eslint-disable-next-line no-console
console.log('all tracing codec tests passed');
