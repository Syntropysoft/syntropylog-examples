"""
Inventory · FastAPI (Python) — the *imperative shell*.

The polyglot twin of the TypeScript `inventory` service. Consumes `order.created`,
reserves stock in Redis, publishes `stock.reserved` — carrying the SAME correlation id,
rehydrated from the Kafka headers. A single order placed in the browser now crosses a
language boundary (Express/NestJS → Kafka → **Python**) and still stitches into one live
trace on the dashboard, because slpy builds the same log envelope as SyntropyLog.

This file is all side effects: Redis, Kafka, slpy, FastAPI wiring. The reservation
*decision* lives in domain.py as a pure function. Dependencies are passed explicitly via
`Deps` (no global mutable state), so nothing here reaches into a shared singleton.

Run:  uvicorn main:app --host 0.0.0.0 --port 3003   (see run.sh)
"""

from __future__ import annotations

import asyncio
import contextlib
import json
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import Any

import redis.asyncio as aioredis
import uvicorn
from fastapi import FastAPI, Request
from slpy import slpy

from constants import (
    GROUP_INVENTORY,
    SEED_STOCK,
    SVC_INVENTORY,
    TOPIC_ORDER_CREATED,
    TOPIC_STOCK_RESERVED,
    stock_key,
)
from domain import plan_reservation, stock_reserved_event
from env import env
from kafka_bus import (
    create_consumer,
    create_producer,
    extract_inbound_context,
    fallback_correlation_id,
    normalize_headers,
    publish_event,
)
from syntropy import FIELD_CORRELATION, bootstrap
from tracing import Tracer, create_tracing

CLIENT_ID = f"{SVC_INVENTORY}-py"


@dataclass(frozen=True)
class Deps:
    """The service's injected collaborators — passed explicitly, never a global."""

    logger: Any
    redis: "aioredis.Redis"
    producer: Any
    tracer: Tracer


# ── I/O helpers (each does one thing) ────────────────────────────────────────
async def read_availability(redis: "aioredis.Redis", items: list[dict[str, Any]]) -> dict[str, int]:
    """Snapshot current stock for the order's SKUs — the input to the pure core."""
    skus = {item["sku"] for item in items}
    return {sku: int(await redis.get(stock_key(sku)) or 0) for sku in skus}


async def apply_decrements(redis: "aioredis.Redis", decrements: dict[str, int]) -> None:
    for sku, qty in decrements.items():
        await redis.decrby(stock_key(sku), qty)


async def seed_stock(redis: "aioredis.Redis") -> None:
    """Seed stock once (nx = only if absent) — same seeds as the TypeScript service."""
    for sku, qty in SEED_STOCK.items():
        await redis.set(stock_key(sku), str(qty), nx=True)


# ── Domain flow (imperative shell around the pure core) ──────────────────────
async def handle_order(order: dict[str, Any], deps: Deps) -> None:
    """Reserve stock for one order. Runs inside a context scope that already carries the
    rehydrated correlationId/tenantId, so every log below is stitched to the trace."""
    order_id = order["orderId"]

    async with slpy.context(orderId=order_id, operation="reserve_stock"):
        deps.logger.info("reserving stock", orderId=order_id, itemCount=len(order["items"]))

        availability = await read_availability(deps.redis, order["items"])
        reservation = plan_reservation(order["items"], availability)  # ← pure core
        await apply_decrements(deps.redis, reservation.decrements)

        if reservation.reserved:
            deps.logger.info("stock reserved", orderId=order_id)
        else:
            deps.logger.warn(
                "stock shortage", orderId=order_id, shortageCount=len(reservation.shortages)
            )

        event = stock_reserved_event(order_id, reservation)
        # Producer span: inject a traceparent onto the Kafka headers so notifications
        # continues the trace across the broker (alongside the correlationId).
        async with deps.tracer.span("publish stock.reserved", "producer", orderId=order_id):
            headers = slpy.get_propagation_headers("kafka")
            deps.tracer.inject(headers)
            await publish_event(deps.producer, TOPIC_STOCK_RESERVED, order_id, json.dumps(event), headers)


async def consume_loop(consumer: Any, deps: Deps) -> None:
    """Drain `order.created`. Each message opens a fresh context scope rehydrated from the
    Kafka headers — the correlation id survives the hop through the broker."""
    async for msg in consumer:
        if msg.value is None:  # guard: skip tombstones / empty payloads
            continue

        raw_headers = normalize_headers(msg.headers)
        fields = extract_inbound_context(raw_headers)
        if not fields.get(FIELD_CORRELATION):  # guard: never orphan a log line
            fields[FIELD_CORRELATION] = fallback_correlation_id(CLIENT_ID)
        # traceId + parentSpanId from the W3C traceparent orders put on the Kafka message.
        trace_fields = deps.tracer.extract(raw_headers)

        async with slpy.context(**fields, **trace_fields):
            try:
                order = json.loads(msg.value.decode("utf-8"))
                # Consumer span — the trace crosses the broker AND the language boundary here.
                async with deps.tracer.span(
                    "consume order.created", "consumer", orderId=order.get("orderId", "")
                ):
                    await handle_order(order, deps)
            except Exception as err:  # noqa: BLE001 — one bad message never kills the loop
                deps.logger.error("kafka consumer handler failed", error=str(err))


# ── FastAPI wiring ───────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    boot = await bootstrap(SVC_INVENTORY)
    redis = aioredis.from_url(env.REDIS_URL)
    await seed_stock(redis)
    producer = await create_producer(f"{CLIENT_ID}-producer", env.KAFKA_BROKERS)
    consumer = await create_consumer(
        f"{CLIENT_ID}-consumer", GROUP_INVENTORY, TOPIC_ORDER_CREATED, env.KAFKA_BROKERS
    )

    tracer, trace_exporter = create_tracing(SVC_INVENTORY, env.COLLECTOR_URL)
    deps = Deps(logger=boot.logger, redis=redis, producer=producer, tracer=tracer)
    app.state.deps = deps
    consumer_task = asyncio.create_task(consume_loop(consumer, deps))

    boot.logger.info(
        "inventory (FastAPI) listening + consuming order.created",
        port=env.INVENTORY_PORT,
        operation="startup",
    )

    try:
        yield
    finally:
        consumer_task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await consumer_task
        for close in (consumer.stop, producer.stop, redis.aclose):
            with contextlib.suppress(Exception):
                await close()
        await trace_exporter.shutdown()
        await boot.shutdown()


app = FastAPI(lifespan=lifespan)


@app.get("/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "service": SVC_INVENTORY}


@app.get("/stock")
async def stock(request: Request) -> dict[str, int]:
    redis: "aioredis.Redis" = request.app.state.deps.redis
    return {sku: int(await redis.get(stock_key(sku)) or 0) for sku in SEED_STOCK}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=env.INVENTORY_PORT, log_level="warning")
