# Integración HTTP: Axios y otros clientes

Para integrar SyntropyLog con clientes HTTP como **Axios**, la estrategia es usar los **mecanismos nativos del cliente** (según su documentación). En Axios eso son los **interceptores**; dentro de ellos inyectamos nuestro logger y el contexto de correlación.

## Axios: interceptores

Según la [documentación de Axios](https://axios-http.com/docs/interceptors), se usan:

- **Request interceptor** (`axios.interceptors.request.use`): para inyectar headers de correlación desde el context manager y, si se desea, registrar el request (método, URL, etc.) con el logger.
- **Response interceptor** (`axios.interceptors.response.use`): para registrar respuesta, duración y errores con el logger.

Así, el flujo queda:

1. Crear la instancia de Axios (o la que use tu proyecto).
2. Añadir los interceptores que:
   - lean el contexto actual (`syntropyLog.getContextManager()`) y añadan los headers configurados (p. ej. `X-Correlation-ID`, `x-trace-id`);
   - usen `syntropyLog.getLogger(...)` para registrar request/response o errores.
3. Pasar esa instancia ya instrumentada al adapter de SyntropyLog (p. ej. `AxiosAdapter`) en la configuración `http.instances[].adapter`.

Con esto, todo request que pase por esa instancia llevará correlación y logging sin tocar cada llamada a `axios.get/post/request` en el negocio.

## Esquema

```
[Tu código] → axios.get/post/request()
       → request interceptor: añade headers (correlationId, traceId), opcionalmente logger.info(request)
       → red
       → response interceptor: logger.info(response) o logger.error(error), duración, etc.
       → respuesta a tu código
```

## Otros clientes HTTP

- **fetch**: no tiene interceptores; la instrumentación se hace en el **adapter** (como en el ejemplo 11 CustomFetchAdapter): antes de llamar a `fetch()` se completan los headers con el context manager y se usa el logger donde corresponda.
- **got**, **node-fetch**, **ky**, etc.: usar sus equivalentes (hooks, wrappers, middleware) siguiendo su documentación, y dentro de esos puntos inyectar contexto (headers) y logger de SyntropyLog.

En resumen: **Axios → interceptores de Axios; otros clientes → el punto de extensión que cada uno ofrezca; en todos, dentro de ese punto metemos nuestro logger y contexto.**
