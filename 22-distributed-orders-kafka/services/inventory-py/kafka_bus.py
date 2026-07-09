"""
Kafka helpers that carry the slpy correlation context across the broker — the Python
mirror of `packages/shared/src/kafka.ts`.

  - producers attach `slpy.get_propagation_headers('kafka')` as message headers
    → { correlationId, tenantId } on the wire.
  - the consumer opens a fresh context scope per message and rehydrates it from those
    headers using the `context.inbound.kafka` map, so every log emitted while handling
    the message carries the SAME correlation id that started in the browser.

slpy ships a FastAPI middleware for inbound HTTP extraction, but there is no framework
helper for a broker — so we do the inbound mapping here, exactly as `extractInboundContext`
does on the TypeScript side: read the `context.inbound[source]` map ({conceptual → wire})
and pull each conceptual field's value from the (lowercased) message headers.
"""

from __future__ import annotations

import time
from typing import Any, Optional

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from constants import FIELD_CORRELATION, SOURCE_KAFKA
from syntropy import CONTEXT_CONFIG


def _brokers(raw: str) -> list[str]:
    return [b.strip() for b in raw.split(",") if b.strip()]


async def create_producer(client_id: str, brokers: str) -> AIOKafkaProducer:
    producer = AIOKafkaProducer(bootstrap_servers=_brokers(brokers), client_id=client_id)
    await producer.start()
    return producer


async def create_consumer(
    client_id: str, group_id: str, topic: str, brokers: str
) -> AIOKafkaConsumer:
    consumer = AIOKafkaConsumer(
        topic,
        bootstrap_servers=_brokers(brokers),
        client_id=client_id,
        group_id=group_id,
        enable_auto_commit=True,
        auto_offset_reset="latest",  # fromBeginning: false
    )
    await consumer.start()
    return consumer


async def publish_event(
    producer: AIOKafkaProducer,
    topic: str,
    key: Optional[str],
    value: str,
    propagation_headers: dict[str, str],
) -> None:
    """Publish an event, translating the current context to Kafka wire headers.

    `propagation_headers` comes from `slpy.get_propagation_headers('kafka')` — the caller
    passes it in so this module stays free of the global slpy singleton.
    """
    headers = [(k, v.encode("utf-8")) for k, v in propagation_headers.items()]
    await producer.send_and_wait(
        topic,
        key=key.encode("utf-8") if key is not None else None,
        value=value.encode("utf-8"),
        headers=headers,
    )


def normalize_headers(raw: Optional[list[tuple[str, bytes]]]) -> dict[str, str]:
    """aiokafka delivers headers as [(key, value_bytes)]. Lowercase keys so the inbound
    map finds them regardless of the casing used on the producer side."""
    out: dict[str, str] = {}
    if not raw:
        return out
    for k, v in raw:
        if v is None:
            continue
        out[k.lower()] = v.decode("utf-8") if isinstance(v, (bytes, bytearray)) else str(v)
    return out


def extract_inbound_context(
    headers: dict[str, str], source: str = SOURCE_KAFKA
) -> dict[str, str]:
    """The Python equivalent of `extractInboundContext(headers, source, config)`:
    map each conceptual field to its value using `context.inbound[source]`."""
    inbound_map: dict[str, str] = CONTEXT_CONFIG.get("inbound", {}).get(source, {})
    fields: dict[str, str] = {}
    for conceptual_field, wire_name in inbound_map.items():
        value = headers.get(wire_name.lower())
        if value is not None:
            fields[conceptual_field] = value
    return fields


def fallback_correlation_id(client_id: str) -> str:
    """When a message arrives with no correlation header (e.g. replayed directly on the
    broker), mint one so the log line is never orphaned — mirrors the TS `trc_…` fallback."""
    return f"trc_{client_id}_{int(time.time() * 1000)}"


__all__ = [
    "create_producer",
    "create_consumer",
    "publish_event",
    "normalize_headers",
    "extract_inbound_context",
    "fallback_correlation_id",
    "FIELD_CORRELATION",
]
