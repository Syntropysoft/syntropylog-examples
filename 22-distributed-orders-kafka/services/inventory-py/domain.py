"""
Pure domain core for the inventory service — the *functional core* of the
functional-core / imperative-shell split.

No I/O here: no Redis, no Kafka, no slpy, no clock. Just the stock-reservation
decision as a pure, deterministic function over its inputs. That makes it trivially
unit-testable (see test_domain.py) and keeps every side effect in main.py's shell.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Mapping, Sequence


@dataclass(frozen=True)
class Shortage:
    """A line that could not be fully reserved."""

    sku: str
    requested: int
    available: int

    def as_dict(self) -> dict[str, Any]:
        return {"sku": self.sku, "requested": self.requested, "available": self.available}


@dataclass(frozen=True)
class Reservation:
    """The outcome of planning a reservation: what to decrement, and what fell short."""

    reserved: bool
    decrements: Mapping[str, int]
    shortages: Sequence[Shortage]


def plan_reservation(
    items: Sequence[Mapping[str, Any]], availability: Mapping[str, int]
) -> Reservation:
    """Decide, purely, what to reserve given the order items and a snapshot of stock.

    Guard-claused per line: not enough stock → record a shortage and move on;
    otherwise schedule a decrement. A local copy of `availability` is drawn down as we
    go, so repeated SKUs are accounted correctly — the inputs are never mutated.
    Side-effect free: the imperative shell applies the returned decrements to Redis.
    """
    remaining: dict[str, int] = dict(availability)
    decrements: dict[str, int] = {}
    shortages: list[Shortage] = []

    for item in items:
        sku = item["sku"]
        qty = item["qty"]
        have = remaining.get(sku, 0)
        if have < qty:
            shortages.append(Shortage(sku=sku, requested=qty, available=have))
            continue
        remaining[sku] = have - qty
        decrements[sku] = decrements.get(sku, 0) + qty

    return Reservation(reserved=not shortages, decrements=decrements, shortages=shortages)


def stock_reserved_event(order_id: str, reservation: Reservation) -> dict[str, Any]:
    """Pure: build the `stock.reserved` event payload from a reservation outcome."""
    return {
        "orderId": order_id,
        "reserved": reservation.reserved,
        "shortages": [s.as_dict() for s in reservation.shortages],
    }
