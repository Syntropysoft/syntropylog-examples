> 🇬🇧 English | [🇪🇸 Español](README-es.md)

# Example 19: Retention policy registry

Attach compliance/retention rules to audit logs **by name**, declared once,
instead of repeating a rules object at every call site.

- `defineRetentionPolicies({...})` — declare the registry; preserves literal types
  so policy names are autocompletable and typo-checkable.
- `retentionPolicies` in `init()` — register them.
- `log.withRetention('NAME')` — registry lookup; binds the policy as `retention`.
- `log.withRetention({ ... })` — inline rules (freeform, no registry).
- An unknown name throws **`RetentionPolicyNotFoundError`**, listing valid names.

`withRetention` has a distinct role from `withMeta`: registry lookup vs. freeform
metadata. It is **not** deprecated.

## What this example shows

1. A registered policy resolved by name (the `retention` field appears in output).
2. Inline rules with no registry.
3. An unknown name caught as `RetentionPolicyNotFoundError`.

## Run

```bash
npm install
npm run dev
```

## Expected output (abridged)

```text
1) Registered policy by name (see the `retention` field):
{"level":"info","message":"ledger.entry.created","service":"ledger",...,"retention":{"standard":"SOX","years":7,"immutable":true},"entryId":"TX-1001","amount":4200}

3) Unknown policy name throws:
   caught RetentionPolicyNotFoundError → ...TYPO_POLICY... (registered: SOX_AUDIT_TRAIL, GDPR_ARTICLE_30)
```
