"""Tiny env reader with defaults pointing at the docker-compose infra — the Python
mirror of `packages/shared/src/env.ts`. Same broker/redis defaults as the host-side
TypeScript services, so the Python inventory joins the exact same topology."""

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class _Env:
    # aiokafka takes a comma-joined string or list; we keep the raw comma string.
    KAFKA_BROKERS: str = os.getenv("KAFKA_BROKERS", "localhost:9092")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    INVENTORY_PORT: int = int(os.getenv("INVENTORY_PORT", "3003"))
    # The .NET AOT traceability collector — where spans are pushed.
    COLLECTOR_URL: str = os.getenv("COLLECTOR_URL", "http://localhost:9317")


env = _Env()
