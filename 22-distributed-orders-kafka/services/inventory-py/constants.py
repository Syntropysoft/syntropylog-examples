"""
Shared naming constants — the Python mirror of `packages/shared/src/constants.ts`.

The FIELD_* keys are conceptual context keys (they never travel on the wire under
these names — the inbound/outbound maps translate them). SOURCE_*/TARGET_* name the
inbound and outbound maps. The rest are infrastructure identifiers, kept byte-for-byte
identical to the TypeScript services so the correlation id stitches across languages.
"""

# ── Conceptual context fields (internal keys; also the envelope field names) ──
FIELD_CORRELATION = "correlationId"
FIELD_TENANT = "tenantId"

# ── Inbound sources (who is calling us) ──────────────────────────────────────
SOURCE_FRONTEND = "frontend"
SOURCE_KAFKA = "kafka"

# ── Outbound targets (who we are calling) ────────────────────────────────────
TARGET_HTTP = "http"
TARGET_KAFKA = "kafka"

# ── Kafka topics ─────────────────────────────────────────────────────────────
TOPIC_ORDER_CREATED = "order.created"
TOPIC_PAYMENT_PROCESSED = "payment.processed"
TOPIC_STOCK_RESERVED = "stock.reserved"

# ── Kafka consumer groups ────────────────────────────────────────────────────
GROUP_INVENTORY = "inventory-service"


# ── Redis (state only — stock; logs go to the collector over HTTP) ───────────
def stock_key(sku: str) -> str:
    return f"stock:{sku}"


# ── Service name (also the SyntropyLog serviceName / logger name) ────────────
SVC_INVENTORY = "inventory"

# Seed stock once on startup. SKU-WATCH starts at 0 so some orders deterministically
# hit the out-of-stock path — same seeds as the TypeScript inventory service.
SEED_STOCK = {
    "SKU-LAPTOP": 10,
    "SKU-PHONE": 25,
    "SKU-HEADPHONES": 100,
    "SKU-WATCH": 0,
}
