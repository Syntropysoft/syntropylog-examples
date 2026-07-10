"""
slpy bootstrap for the Python inventory service — the Python mirror of
`packages/shared/src/syntropy.ts`.

Two things happen here, declared once:

  1. `CONTEXT_CONFIG` — the inbound/outbound maps. The conceptual field
     `correlationId` maps to the Kafka wire header `correlationId` (inbound *and*
     outbound), so the id the browser started travels coherently across the broker
     and lands in every log line — exactly like the TypeScript services.

  2. A collector-log transport (`CollectorLogTransport`) — an `AdapterTransport` whose
     executor pushes every already-masked, context-enriched entry to the .NET collector's
     `/v1/logs` over HTTP, which streams it to the live dashboard over SSE, grouped by
     `correlationId`. The entry already carries `service` (the logger name), so it is
     emitted verbatim — see `LOGBUS-CONTRACT.md`.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from slpy import slpy, PrettyConsoleTransport

from constants import (
    FIELD_CORRELATION,
    FIELD_TENANT,
    SOURCE_FRONTEND,
    SOURCE_KAFKA,
    TARGET_HTTP,
    TARGET_KAFKA,
)
from env import env
from tracing import CollectorLogTransport


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
    shutdown: Callable[[], Any]


async def bootstrap(service_name: str) -> Bootstrapped:
    """Init slpy with a console transport + the collector-log transport.

    Logs are pushed to the .NET collector over HTTP (batched, via CollectorLogTransport),
    which serves the live dashboard over SSE. Redis is state-only in this service.
    """
    collector_logs = CollectorLogTransport(env.COLLECTOR_URL)

    await slpy.init(
        {
            "logger": {
                "level": env.LOG_LEVEL,
                "transports": [PrettyConsoleTransport(), collector_logs.transport],
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
                await collector_logs.shutdown()
            except Exception:
                pass

    return Bootstrapped(logger=logger, shutdown=shutdown)
