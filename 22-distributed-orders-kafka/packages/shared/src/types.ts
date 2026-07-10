/** Domain + event contracts shared across services. */

export interface OrderItem {
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
}

/** Payment details — note the PII fields, which SyntropyLog masks automatically. */
export interface PaymentInfo {
  cardNumber: string; // masked by default rules → ****-****-****-1234
  cardHolder: string;
  cvv: string; // masked by a custom rule → [REDACTED]
  expiry: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string; // masked by default rules → j***@example.com
}

export interface CreateOrderRequest {
  customer: Customer;
  items: OrderItem[];
  payment: PaymentInfo;
}

export type OrderStatus =
  | 'created'
  | 'paid'
  | 'payment_declined'
  | 'reserved'
  | 'out_of_stock'
  | 'confirmed';

export interface Order {
  id: string;
  status: OrderStatus;
  customer: Customer;
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

// ── Kafka event payloads ────────────────────────────────────────────────────

export interface OrderCreatedEvent {
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  /** Carried so the payments service can demonstrate PII masking on the card. */
  payment: PaymentInfo;
}

export interface PaymentProcessedEvent {
  orderId: string;
  approved: boolean;
  amount: number;
  last4: string;
  reason?: string;
}

export interface StockReservedEvent {
  orderId: string;
  reserved: boolean;
  shortages: { sku: string; requested: number; available: number }[];
}
