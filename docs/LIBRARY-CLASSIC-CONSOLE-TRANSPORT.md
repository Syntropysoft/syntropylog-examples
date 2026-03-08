# ClassicConsoleTransport: sin dependencia de chalk

A partir de la nueva versión, la librería **no requiere chalk**. `ClassicConsoleTransport` funciona con o sin chalk.

## Comportamiento

- **Con chalk instalado** (opcional): salida con colores (niveles, timestamps, etc.).
- **Sin chalk**: misma salida sin colores, sin errores.

Los ejemplos pueden usar `ClassicConsoleTransport` sin declarar chalk en `dependencies`.
