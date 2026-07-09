"""
Unit tests for the pure domain core — no Redis, no Kafka, no slpy, no async.
This is the payoff of the functional-core / imperative-shell split: the reservation
decision is tested in isolation, deterministically.

    python -m pytest test_domain.py      (or: python test_domain.py)
"""

from domain import Shortage, plan_reservation, stock_reserved_event


def test_all_in_stock_reserves_everything():
    items = [{"sku": "SKU-PHONE", "qty": 1}, {"sku": "SKU-HEADPHONES", "qty": 2}]
    availability = {"SKU-PHONE": 25, "SKU-HEADPHONES": 100}

    result = plan_reservation(items, availability)

    assert result.reserved is True
    assert result.decrements == {"SKU-PHONE": 1, "SKU-HEADPHONES": 2}
    assert result.shortages == []


def test_out_of_stock_records_shortage_and_does_not_reserve():
    items = [{"sku": "SKU-WATCH", "qty": 1}]
    availability = {"SKU-WATCH": 0}

    result = plan_reservation(items, availability)

    assert result.reserved is False
    assert result.decrements == {}
    assert result.shortages == [Shortage(sku="SKU-WATCH", requested=1, available=0)]


def test_repeated_sku_draws_down_the_snapshot():
    # Two lines of the same SKU: 3 available, 2 + 2 requested → second line short.
    items = [{"sku": "SKU-PHONE", "qty": 2}, {"sku": "SKU-PHONE", "qty": 2}]
    availability = {"SKU-PHONE": 3}

    result = plan_reservation(items, availability)

    assert result.reserved is False
    assert result.decrements == {"SKU-PHONE": 2}
    assert result.shortages == [Shortage(sku="SKU-PHONE", requested=2, available=1)]


def test_inputs_are_never_mutated():
    availability = {"SKU-PHONE": 5}
    plan_reservation([{"sku": "SKU-PHONE", "qty": 2}], availability)
    assert availability == {"SKU-PHONE": 5}  # snapshot untouched


def test_event_payload_shape_matches_the_contract():
    result = plan_reservation([{"sku": "SKU-PHONE", "qty": 1}], {"SKU-PHONE": 5})
    event = stock_reserved_event("ORD-123", result)
    assert event == {"orderId": "ORD-123", "reserved": True, "shortages": []}


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"ok  {name}")
    print("all domain tests passed")
