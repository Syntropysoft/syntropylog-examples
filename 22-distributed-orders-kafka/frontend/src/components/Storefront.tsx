import { useState } from 'react';
import type { CartLine, OrderResult, Product } from '../types';

export function Storefront({
  catalog,
  placing,
  onPlaceOrder,
  lastResult,
}: {
  catalog: Product[];
  placing: boolean;
  onPlaceOrder: (lines: CartLine[]) => void;
  lastResult: OrderResult | null;
}) {
  const [qty, setQty] = useState<Record<string, number>>({ 'SKU-PHONE': 1 });

  const lines: CartLine[] = catalog
    .map((p) => ({ product: p, qty: qty[p.sku] ?? 0 }))
    .filter((l) => l.qty > 0);
  const total = lines.reduce((s, l) => s + l.qty * l.product.price, 0);

  const inc = (sku: string, d: number) =>
    setQty((q) => ({ ...q, [sku]: Math.max(0, (q[sku] ?? 0) + d) }));

  return (
    <section className="storefront">
      <h2>Storefront</h2>
      <div className="catalog">
        {catalog.map((p) => (
          <div className="product" key={p.sku}>
            <div className="emoji">{p.emoji}</div>
            <div className="pinfo">
              <div className="pname">{p.name}</div>
              <div className="psku">
                {p.sku}
                {p.note ? ` · ${p.note}` : ''}
              </div>
            </div>
            <div className="pprice">${p.price.toLocaleString()}</div>
            <div className="qty">
              <button onClick={() => inc(p.sku, -1)} aria-label="decrease">
                −
              </button>
              <span>{qty[p.sku] ?? 0}</span>
              <button onClick={() => inc(p.sku, 1)} aria-label="increase">
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart">
        <div className="cart-total">
          Total: <b>${total.toLocaleString()}</b>
        </div>
        <button className="place" disabled={placing || lines.length === 0} onClick={() => onPlaceOrder(lines)}>
          {placing ? 'Placing…' : 'Place order'}
        </button>
      </div>

      <div className="hint">
        Paying with card <code>4111 1111 1111 1234</code>, CVV <code>321</code>, email{' '}
        <code>ada.lovelace@example.com</code> — watch them get <b>masked</b> in the trace. Totals over
        <b> $5,000</b> are declined; <b>Smart Watch</b> is out of stock.
      </div>

      {lastResult && (
        <div className={`result ${lastResult.ok === false ? 'err' : 'ok'}`}>
          {lastResult.order ? (
            <>
              Order <b>{lastResult.order.id}</b> created · corr{' '}
              <code>{lastResult.correlationId}</code>
            </>
          ) : (
            <>Error: {String(lastResult.error)}</>
          )}
        </div>
      )}
    </section>
  );
}
