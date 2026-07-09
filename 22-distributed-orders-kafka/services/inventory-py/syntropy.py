"""
slpy bootstrap for the Python inventory service — the Python mirror of
`packages/shared/src/syntropy.ts`.

Two things happen here, declared once:

  1. `CONTEXT_CONFIG` — the inbound/outbound maps. The conceptual field
     `correlationId` maps to the Kafka wire header `correlationId` (inbound *and*
     outbound), so the id the browser started travels coherently across the broker
     and lands in every log line — exactly like the TypeScript services.

  2. A log-bus transport — an `AdapterTransport` whose executor publishes every
     already-masked, context-enriched entry to the shared Redis channel. The gateway
     subscribes there and streams each entry to the live dashboard, grouped by
     `correlationId`. The entry already carries `service` (the logger name), so it is
     emitted verbatim — see `LOGBUS-CONTRACT.md`.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Callable

import redis as sync_redis
from slpy import slpy, AdapterTransport, UniversalAdapter, PrettyConsoleTransport

from constants import (
    FIELD_CORRELATION,
    FIELD_TENANT,
    LOGBUS_CHANNEL,
    SOURCE_FRONTEND,
    SOURCE_KAFKA,
    TARGET_HTTP,
    TARGET_KAFKA,
)
from env import env


# The coherence trick, identical to CONTEXT_CONFIG in syntropy.ts: the conceptual
# field is stored under the same name the propagation headers read, so it survives
# HTTP (`x-correlation-id`) and Kafka (`correlationId`) coherently.
CONTEXT_CONFIG: dict[str, Any] = {
    "inbound": {
        SOURCE_FRONTEND: {
            FIELD_CORRELATION: "x-correlation-id",
            FIELD_TENANT: "x-tenant-id",
        },
        SOURCE_KAFKA: {
            FIELD_CORRELATION: "correlationId",
            FIELD_TENANT: "tenantId",
        },
    },
    "outbound": {
        TARGET_HTTP: {
            FIELD_CORRELATION: "x-correlation-id",
            FIELD_TENANT: "x-tenant-id",
        },
        TARGET_KAFKA: {
            FIELD_CORRELATION: "correlationId",
            FIELD_TENANT: "tenantId",
        },
    },
}

# Per-level context whitelist — mirrors `loggingMatrix` in syntropy.ts. Fields not
# whitelisted for a level never reach a transport (the correlation id and tenant are
# always allowed; error/audit see everything).
LOGGING_MATRIX: dict[str, list[str]] = {
    "default": [FIELD_CORRELATION, FIELD_TENANT],
    "info": [FIELD_CORRELATION, FIELD_TENANT, "orderId", "customerId", "operation"],
    "warn": [FIELD_CORRELATION, FIELD_TENANT, "orderId", "operation"],
    "error": ["*"],
    "audit": ["*"],
}


@dataclass
class Bootstrapped:
    logger: Any
    logbus_redis: "sync_redis.Redis"
    shutdown: Callable[[], Any]


async def bootstrap(service_name: str) -> Bootstrapped:
    """Init slpy with a console transport + the Redis log-bus transport."""
    # Dedicated, publish-only Redis connection for the log bus. A *synchronous* client
    # on purpose: the executor must run inline. slpy's UniversalAdapter dispatches an
    # async executor via a bare `loop.create_task(...)` (fire-and-forget, no reference
    # held) — under a busy consumer loop those tasks are unreliable/GC-prone and the
    # publish silently never happens. A sync executor runs synchronously inside
    # `transport.log()`, so every already-masked entry reliably reaches the log bus.
    # The publish is a single local PUBLISH (sub-millisecond); acceptable to run inline.
    logbus_redis = sync_redis.from_url(env.REDIS_URL)

    def _publish(entry: dict[str, Any]) -> None:
        # `entry` is already masked, sanitized and context-enriched — it *is* the
        # envelope defined in LOGBUS-CONTRACT.md. Best-effort: never crash the app.
        try:
            logbus_redis.publish(LOGBUS_CHANNEL, json.dumps(entry, default=str))
        except Exception:
            pass

    logbus_transport = AdapterTransport(
        name="logbus",
        adapter=UniversalAdapter(executor=_publish),
    )

    await slpy.init(
        {
            "logger": {
                "level": env.LOG_LEVEL,
                "transports": [PrettyConsoleTransport(), logbus_transport],
            },
            "masking": {"enable_default_rules": True},
            "logging_matrix": LOGGING_MATRIX,
            "context": CONTEXT_CONFIG,
        }
    )

    logger = slpy.get_logger(service_name)

    async def shutdown() -> None:
        try:
            await slpy.shutdown()
        finally:
            try:
                logbus_redis.close()
            except Exception:
                pass

    return Bootstrapped(logger=logger, logbus_redis=logbus_redis, shutdown=shutdown)
