> [🇬🇧 English](README.md) | 🇪🇸 Español

# Ejemplo 19: Registro de políticas de retención

Adjuntá reglas de compliance/retención a los logs de auditoría **por nombre**,
declaradas una vez, en vez de repetir un objeto de reglas en cada call site.

- `defineRetentionPolicies({...})` — declara el registro; preserva los tipos
  literales, así los nombres de política son autocompletables y verificables.
- `retentionPolicies` en `init()` — los registra.
- `log.withRetention('NOMBRE')` — lookup en el registro; bindea la política como `retention`.
- `log.withRetention({ ... })` — reglas inline (freeform, sin registro).
- Un nombre desconocido lanza **`RetentionPolicyNotFoundError`**, listando los válidos.

`withRetention` tiene un rol distinto de `withMeta`: lookup en registro vs. metadata
freeform. **No** está deprecado.

## Qué muestra este ejemplo

1. Una política registrada resuelta por nombre (el campo `retention` aparece en la salida).
2. Reglas inline sin registro.
3. Un nombre desconocido capturado como `RetentionPolicyNotFoundError`.

## Ejecutar

```bash
npm install
npm run dev
```

## Salida esperada (resumida)

```text
1) Política registrada por nombre (ver el campo `retention`):
{"level":"info","message":"ledger.entry.created ...","retention":{"standard":"SOX","years":7,"immutable":true},...}

3) Un nombre de política desconocido lanza:
   caught RetentionPolicyNotFoundError → ...TYPO_POLICY... (registered: SOX_AUDIT_TRAIL, GDPR_ARTICLE_30)
```
