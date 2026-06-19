> [🇬🇧 English](README.md) | 🇪🇸 Español

# Ejemplo 20: `getStats()` — auto-observabilidad

`syntropyLog.getStats()` devuelve un snapshot agregado de la instancia, para que
puedas monitorear el logger mismo (y exponerlo en un endpoint de health/métricas).

```ts
{
  state,              // estado del ciclo de vida, ej. 'READY'
  initializedAt,      // epoch ms, o null antes de init()
  uptimeMs,
  nativeAddonActive,  // true cuando el addon Rust está en uso
  failures: {
    log,                    // una llamada de log falló (serialización o transporte)
    transport,              // un transporte rechazó (en log / flush / shutdown)
    serializationFallback,  // el pipeline nativo cedió al pipeline JS
    masking,                // el masking falló (ej. timeout de regex)
    step,                   // fallas de pasos del pipeline, por nombre de paso
  }
}
```

Los contadores se construyen envolviendo de forma transparente tus hooks
(`onLogFailure`, `onTransportError`, `onSerializationFallback`,
`masking.onMaskingError`, `onStepError`) — **tus callbacks siguen ejecutándose
igual**; `getStats()` solo los cuenta además.

## Qué muestra este ejemplo

- Un snapshot sano justo después de `init()` (todos los contadores en cero, `state: 'READY'`).
- Un transporte que rechaza tres logs marcados a propósito, y luego un snapshot
  donde `failures.log` es `3` (los demás contadores quedan en `0` hasta que se
  dispare su propio camino).

## Ejecutar

```bash
npm install
npm run dev
```
