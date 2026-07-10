"""
The Python observability helper for inventory-py — the slpy mirror of the TS `tracing.ts`.
One helper per language (the OTel-SDK-per-language model): a pure W3C traceparent codec, a
batched async HTTP exporter to the .NET collector, and a `span()` async context manager.

Functional core / imperative shell:
  - PURE core: compose/parse traceparent, id generation, header reading — no I/O, no context.
  - Shell: the exporter (httpx) and the tracer (reads/writes the slpy context).

Note on the Python shape: slpy context is scope-based (`async with slpy.context(...)`), not
imperative, so `extract` RETURNS the context fields for the caller to open a scope with — the
per-language helper adapts to the language while keeping the same concepts.
"""

from __future__ import annotations

import asyncio
import contextlib
import re
import secrets
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from slpy import slpy, AdapterTransport, UniversalAdapter

FIELD_TRACE_ID = "traceId"
FIELD_SPAN_ID = "spanId"


# ══════════════════════════════════════════════════════════════════════════════
# PURE CORE — id generation + W3C traceparent codec. No I/O, no context.
# ══════════════════════════════════════════════════════════════════════════════
def new_trace_id() -> str:
    """16 bytes / 32 hex — a W3C trace-id."""
    return secrets.token_hex(16)


def new_span_id() -> str:
    """8 bytes / 16 hex — a W3C span-id."""
    return secrets.token_hex(8)


_TRACEPARENT_RE = re.compile(r"^([\da-f]{2})-([\da-f]{32})-([\da-f]{16})-([\da-f]{2})$", re.IGNORECASE)
_ZERO_TRACE = "0" * 32
_ZERO_SPAN = "0" * 16


def compose_traceparent(trace_id: str, span_id: str) -> str:
    """Compose a sampled W3C traceparent: 00-<traceId>-<spanId>-01. Pure."""
    return f"00-{trace_id}-{span_id}-01"


def parse_traceparent(header: Optional[str]) -> Optional[dict[str, str]]:
    """Parse a W3C traceparent → {traceId, parentSpanId}. Pure; guard-claused; rejects all-zero."""
    if not header:
        return None
    m = _TRACEPARENT_RE.match(header.strip())
    if m is None:
        return None
    trace_id = m.group(2).lower()
    parent_span_id = m.group(3).lower()
    if trace_id == _ZERO_TRACE or parent_span_id == _ZERO_SPAN:
        return None
    return {"traceId": trace_id, "parentSpanId": parent_span_id}


def read_header(headers: dict[str, Any], name: str) -> Optional[str]:
    """Read a header case-insensitively from a plain dict. Pure."""
    wanted = name.lower()
    for key, value in headers.items():
        if key.lower() != wanted:
            continue
        return None if value is None else str(value)
    return None


def _iso_now() -> str:
    """ISO-8601 with milliseconds + offset — the family timestamp the collector parses."""
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds")


# ══════════════════════════════════════════════════════════════════════════════
# SHELL — batched async HTTP exporter (the executor's sink).
# ══════════════════════════════════════════════════════════════════════════════
class OtlpLiteExporter:
    """Buffers spans and flushes them to the collector on a short interval. Best-effort
    (Silent Observer): a failed flush drops the batch rather than raising. Reliable delivery
    (not fire-and-forget-per-span): a single owned background task drains the buffer."""

    def __init__(self, endpoint: str, flush_interval: float = 0.25) -> None:
        self._endpoint = endpoint.rstrip("/")
        self._spans: list[dict[str, Any]] = []
        self._client = httpx.AsyncClient(timeout=2.0)
        self._task = asyncio.create_task(self._loop(flush_interval))

    def add_span(self, span: dict[str, Any]) -> None:
        self._spans.append(span)

    async def _loop(self, interval: float) -> None:
        with contextlib.suppress(asyncio.CancelledError):
            while True:
                await asyncio.sleep(interval)
                await self._flush()

    async def _flush(self) -> None:
        if not self._spans:
            return
        batch = self._spans
        self._spans = []
        try:
            await self._client.post(f"{self._endpoint}/v1/spans", json=batch)
        except Exception:
            pass  # Silent Observer — telemetry never touches the request path

    async def shutdown(self) -> None:
        self._task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await self._task
        await self._flush()
        await self._client.aclose()


# ══════════════════════════════════════════════════════════════════════════════
# SHELL — the tracer: span() + traceparent extract/inject over the slpy context.
# ══════════════════════════════════════════════════════════════════════════════
class Tracer:
    def __init__(self, service: str, exporter: OtlpLiteExporter) -> None:
        self._service = service
        self._exporter = exporter

    @asynccontextmanager
    async def span(self, name: str, kind: str = "internal", **attributes: Any):
        """A timed span. Opens a child slpy scope (inherits the parent): the current spanId
        becomes this span's parent, the new spanId is set for the body. Re-raises on error."""
        parent_span_id = slpy.get(FIELD_SPAN_ID)
        trace_id = slpy.get(FIELD_TRACE_ID) or new_trace_id()
        span_id = new_span_id()
        start_iso = _iso_now()
        started = time.perf_counter()
        status = "ok"
        async with slpy.context(**{FIELD_TRACE_ID: trace_id, FIELD_SPAN_ID: span_id}):
            try:
                yield
            except Exception:
                status = "error"
                raise  # tracing never swallows
            finally:
                self._exporter.add_span(
                    {
                        "traceId": trace_id,
                        "spanId": span_id,
                        "parentSpanId": parent_span_id,
                        "name": name,
                        "service": self._service,
                        "kind": kind,
                        "startTime": start_iso,
                        "endTime": _iso_now(),
                        "durationMs": (time.perf_counter() - started) * 1000.0,
                        "status": status,
                        "attributes": attributes,
                    }
                )

    def extract(self, headers: dict[str, Any]) -> dict[str, str]:
        """Parse an inbound traceparent → the context fields to open a scope with (or {})."""
        parsed = parse_traceparent(read_header(headers, "traceparent"))
        if parsed is None:
            return {}
        return {FIELD_TRACE_ID: parsed["traceId"], FIELD_SPAN_ID: parsed["parentSpanId"]}

    def inject(self, headers: dict[str, str]) -> None:
        """Compose traceparent from the active context onto outbound headers."""
        trace_id = slpy.get(FIELD_TRACE_ID)
        span_id = slpy.get(FIELD_SPAN_ID)
        if not trace_id or not span_id:
            return
        headers["traceparent"] = compose_traceparent(trace_id, span_id)


def create_tracing(service: str, endpoint: str) -> tuple[Tracer, OtlpLiteExporter]:
    """Convenience: an exporter + tracer, pointed at the collector. Call inside a running loop."""
    exporter = OtlpLiteExporter(endpoint)
    return Tracer(service, exporter), exporter


class CollectorLogTransport:
    """An slpy transport that batches already-masked log entries and POSTs them to the
    collector's /v1/logs (background drain), so the dashboard can be fed by the collector
    instead of the Redis log bus. The executor append is SYNC (reliable — no fire-and-forget
    drop under load); the flush is an owned task. Coexists with the Redis log bus."""

    def __init__(self, endpoint: str, flush_interval: float = 1.0) -> None:
        self._endpoint = endpoint.rstrip("/")
        self._logs: list[dict[str, Any]] = []
        self._client = httpx.AsyncClient(timeout=2.0)
        self._task = asyncio.create_task(self._loop(flush_interval))
        self.transport = AdapterTransport("collector-logs", UniversalAdapter(self._add))

    def _add(self, entry: dict[str, Any]) -> None:
        self._logs.append(entry)  # sync, reliable

    async def _loop(self, interval: float) -> None:
        with contextlib.suppress(asyncio.CancelledError):
            while True:
                await asyncio.sleep(interval)
                await self._flush()

    async def _flush(self) -> None:
        if not self._logs:
            return
        batch = self._logs
        self._logs = []
        try:
            await self._client.post(f"{self._endpoint}/v1/logs", json=batch)
        except Exception:
            pass  # Silent Observer

    async def shutdown(self) -> None:
        self._task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await self._task
        await self._flush()
        await self._client.aclose()
