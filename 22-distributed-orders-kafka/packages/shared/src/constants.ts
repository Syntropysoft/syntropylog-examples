/**
 * Shared naming constants. These are a convention, not a framework feature:
 * the FIELD_ keys are conceptual context keys, the SOURCE_ and TARGET_ keys name
 * the inbound and outbound maps, and the rest are infrastructure identifiers.
 */

// ── Conceptual context fields (internal keys, never travel on the wire) ──────
export const FIELD_CORRELATION = 'correlationId';
export const FIELD_TENANT = 'tenantId';

// ── Inbound sources (who is calling us) ─────────────────────────────────────
export const SOURCE_FRONTEND = 'frontend';
export const SOURCE_KAFKA = 'kafka';

// ── Outbound targets (who we are calling) ───────────────────────────────────
export const TARGET_HTTP = 'http';
export const TARGET_KAFKA = 'kafka';

// ── Kafka topics ────────────────────────────────────────────────────────────
export const TOPIC_ORDER_CREATED = 'order.created';
export const TOPIC_PAYMENT_PROCESSED = 'payment.processed';
export const TOPIC_STOCK_RESERVED = 'stock.reserved';

/** All topics, pre-created on startup so consumers never race topic auto-creation. */
export const ALL_TOPICS = [
  TOPIC_ORDER_CREATED,
  TOPIC_PAYMENT_PROCESSED,
  TOPIC_STOCK_RESERVED,
];

// ── Kafka consumer groups ───────────────────────────────────────────────────
export const GROUP_PAYMENTS = 'payments-service';
export const GROUP_INVENTORY = 'inventory-service';
export const GROUP_NOTIFICATIONS = 'notifications-service';

// ── Redis (state only — orders + stock; logs go to the collector over HTTP) ──
export const orderKey = (id: string): string => `order:${id}`;
export const stockKey = (sku: string): string => `stock:${sku}`;

// ── Service names (also used as the SyntropyLog serviceName) ────────────────
export const SVC_GATEWAY = 'gateway';
export const SVC_ORDERS = 'orders';
export const SVC_PAYMENTS = 'payments';
export const SVC_INVENTORY = 'inventory';
export const SVC_NOTIFICATIONS = 'notifications';
