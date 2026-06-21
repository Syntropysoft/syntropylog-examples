import type { CartLine, OrderResult } from './types';

export function newCorrelationId(): string {
  return `trc_web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/** Deliberately fake PII so you can watch SyntropyLog mask it across services. */
const CUSTOMER = { id: 'CUST-001', name: 'Ada Lovelace', email: 'ada.lovelace@example.com' };
const PAYMENT = {
  cardNumber: '4111 1111 1111 1234',
  cardHolder: 'ADA LOVELACE',
  cvv: '321',
  expiry: '12/29',
};

export async function placeOrder(lines: CartLine[], correlationId: string): Promise<OrderResult> {
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
    headers: { 'content-type': 'application/json', 'x-correlation-id': correlationId },
    body: JSON.stringify(body),
  });
  return (await res.json()) as OrderResult;
}
