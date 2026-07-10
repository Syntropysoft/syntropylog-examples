"""
Unit tests for the pure tracing core — the W3C traceparent codec. No I/O, no context.
Mirrors packages/shared/src/tracing.test.ts.

    python -m pytest test_tracing.py     (or: python test_tracing.py)
"""

import re

from tracing import (
    compose_traceparent,
    new_span_id,
    new_trace_id,
    parse_traceparent,
    read_header,
)


def test_compose_builds_a_sampled_traceparent():
    tp = compose_traceparent("4bf92f3577b34da6a3ce929d0e0e4736", "00f067aa0ba902b7")
    assert tp == "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01"


def test_parse_round_trips():
    trace_id, span_id = "4bf92f3577b34da6a3ce929d0e0e4736", "00f067aa0ba902b7"
    assert parse_traceparent(compose_traceparent(trace_id, span_id)) == {
        "traceId": trace_id,
        "parentSpanId": span_id,
    }


def test_parse_rejects_malformed_absent_and_all_zero():
    assert parse_traceparent(None) is None
    assert parse_traceparent("") is None
    assert parse_traceparent("not-a-traceparent") is None
    assert parse_traceparent("00-short-00f067aa0ba902b7-01") is None
    assert parse_traceparent("00-" + "0" * 32 + "-00f067aa0ba902b7-01") is None
    assert parse_traceparent("00-4bf92f3577b34da6a3ce929d0e0e4736-" + "0" * 16 + "-01") is None


def test_parse_is_case_insensitive_and_trims():
    assert parse_traceparent("  00-4BF92F3577B34DA6A3CE929D0E0E4736-00F067AA0BA902B7-01  ") == {
        "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
        "parentSpanId": "00f067aa0ba902b7",
    }


def test_read_header_is_case_insensitive():
    assert read_header({"Traceparent": "abc"}, "traceparent") == "abc"
    assert read_header({}, "traceparent") is None
    assert read_header({"traceparent": None}, "traceparent") is None


def test_id_widths_and_randomness():
    assert re.fullmatch(r"[\da-f]{32}", new_trace_id())
    assert re.fullmatch(r"[\da-f]{16}", new_span_id())
    assert new_trace_id() != new_trace_id()


if __name__ == "__main__":
    for name, fn in sorted(globals().items()):
        if name.startswith("test_") and callable(fn):
            fn()
            print(f"ok  {name}")
    print("all tracing codec tests passed")
