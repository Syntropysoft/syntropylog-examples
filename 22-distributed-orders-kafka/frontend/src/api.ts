import type { CartLine, OrderResult } from './types';

function hex(bytes: number): string {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** A W3C trace-id (16 bytes / 32 hex). The browser sends it as BOTH the correlation id
 *  and the root of a `traceparent`, so logs and spans share ONE identity end to end —
 *  the dashboard filters both by this single id. */
export function newTraceId(): string {
  return hex(16);
}

/** Deliberately fake PII so you can watch SyntropyLog mask it across services. */
const CUSTOMER = { id: 'CUST-001', name: 'Ada Lovelace', email: 'ada.lovelace@example.com' };
const PAYMENT = {
  cardNumber: '4111 1111 1111 1234',
  cardHolder: 'ADA LOVELACE',
  cvv: '321',
  expiry: '12/29',
};

export async function placeOrder(lines: CartLine[], traceId: string): Promise<OrderResult> {
  const body = {
    customer: CUSTOMER,
    items: lines.map((l) => ({
      sku: l.product.sku,
      name: l.product.name,
      qty: l.qty,
      unitPrice: l.product.price,
    })),
    payment: PAYMENT,
  };
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-correlation-id': traceId, // correlationId === traceId (unified)
      traceparent: `00-${traceId}-${hex(8)}-01`, // W3C root — the gateway continues this trace
    },
    body: JSON.stringify(body),
  });
  return (await res.json()) as OrderResult;
}
