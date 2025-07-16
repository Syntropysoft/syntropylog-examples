"use strict";
/**
 * @file CachedApiService.ts
 * @description Una clase genérica que extiende ApiService para añadir una capa de caché
 * con Redis, implementando el patrón "Cache-Aside". El caché es opcional.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedApiService = void 0;
// Asumimos que estos tipos son exportados desde tu librería 'syntropylog'
const syntropylog_1 = require("syntropylog");
/**
 * @class CachedApiService
 * @description Proporciona una API de cliente REST simple y fuertemente tipada,
 * con una capa de caché Redis integrada y opcional.
 */
class CachedApiService {
    httpClient;
    // El cliente de Redis ahora es opcional.
    redisClient = null;
    options;
    logger = syntropylog_1.syntropyLog.getLogger('ApiService');
    /**
     * @constructor
     * @param {string} httpInstanceName - El nombre de la instancia HTTP configurada.
     * @param {ApiServiceOptions} [options] - Las opciones de configuración para el caché (opcionales).
     */
    constructor(httpInstanceName, options = {}) {
        this.httpClient = syntropylog_1.syntropyLog.getHttp(httpInstanceName);
        if (!this.httpClient) {
            throw new Error(`Instancia HTTP no encontrada: "${httpInstanceName}"`);
        }
        // Intenta obtener el cliente de Redis solo si se especifica un nombre de instancia.
        if (options.redisInstanceName) {
            try {
                // getRedis returns RedisConnectionManager which has the required methods
                const redisManager = syntropylog_1.syntropyLog.getRedis(options.redisInstanceName);
                this.redisClient = {
                    get: async (key) => redisManager.get(key),
                    set: async (key, value, ttl) => redisManager.set(key, value, ttl),
                    del: async (key) => redisManager.del(key),
                };
                this.logger.info(`Servicio API usando caché con instancia Redis: "${options.redisInstanceName}"`);
            }
            catch (error) {
                // Si getRedis lanza un error (ej. la instancia no existe), lo loggeamos pero no rompemos la aplicación.
                this.logger.warn(`No se pudo inicializar el caché Redis para la instancia "${options.redisInstanceName}". El servicio operará sin caché.`, { error });
                this.redisClient = null;
            }
        }
        else {
            this.logger.info('No se proveyó instancia de Redis. El servicio operará sin caché.');
        }
        this.options = {
            cacheKeyPrefix: options.cacheKeyPrefix ?? 'api-cache',
            defaultCacheTTLSeconds: options.defaultCacheTTLSeconds ?? 3600, // 1 hora por defecto
        };
    }
    /**
     * Genera una clave de caché única para una petición.
     * @private
     */
    generateCacheKey(url, queryParams) {
        const sortedParams = queryParams
            ? `?${new URLSearchParams(queryParams).toString()}`
            : '';
        return `${this.options.cacheKeyPrefix}:${url}${sortedParams}`;
    }
    /**
     * Realiza una petición GET, con lógica de caché opcional.
     */
    async get(url, options = {}) {
        // El caché se usa solo si el cliente de Redis existe y no está deshabilitado en las opciones.
        const useCache = !!this.redisClient && !options.caching?.disabled;
        const cacheKey = this.generateCacheKey(url, options.queryParams);
        if (useCache) {
            try {
                const cachedData = await this.redisClient.get(cacheKey);
                if (cachedData) {
                    return JSON.parse(cachedData);
                }
            }
            catch (error) {
                this.logger.error('Error al leer desde Redis. Se procederá a la API.', {
                    key: cacheKey,
                    error,
                });
            }
        }
        const request = {
            method: 'GET',
            url,
            headers: options.headers ?? {},
            queryParams: options.queryParams,
        };
        const response = await this.httpClient.request(request);
        const apiData = response.data;
        if (useCache) {
            try {
                const ttl = options.caching?.ttlSeconds ?? this.options.defaultCacheTTLSeconds;
                await this.redisClient.set(cacheKey, JSON.stringify(apiData), ttl);
            }
            catch (error) {
                this.logger.error('Error al escribir en Redis.', {
                    key: cacheKey,
                    error,
                });
            }
        }
        return apiData;
    }
    /**
     * Realiza una petición POST e invalida la caché si está habilitada.
     */
    async post(url, body, options = {}) {
        const request = {
            method: 'POST',
            url,
            body,
            headers: options.headers ?? {},
        };
        const response = await this.httpClient.request(request);
        if (this.redisClient) {
            const keyToInvalidate = this.generateCacheKey(url);
            try {
                await this.redisClient.del(keyToInvalidate);
            }
            catch (error) {
                this.logger.error('Error al invalidar caché en POST.', {
                    key: keyToInvalidate,
                    error,
                });
            }
        }
        return response.data;
    }
    /**
     * Realiza una petición PUT e invalida la caché si está habilitada.
     */
    async put(url, body, options = {}) {
        const request = {
            method: 'PUT',
            url,
            body,
            headers: options.headers ?? {},
        };
        const response = await this.httpClient.request(request);
        if (this.redisClient) {
            const cacheKey = this.generateCacheKey(url, options.queryParams);
            try {
                await this.redisClient.del(cacheKey);
            }
            catch (error) {
                this.logger.error('Error al invalidar caché en PUT.', {
                    key: cacheKey,
                    error,
                });
            }
        }
        return response.data;
    }
    /**
     * Realiza una petición DELETE e invalida la caché si está habilitada.
     */
    async delete(url, options = {}) {
        const request = {
            method: 'DELETE',
            url,
            headers: options.headers ?? {},
        };
        const response = await this.httpClient.request(request);
        if (this.redisClient) {
            const cacheKey = this.generateCacheKey(url, options.queryParams);
            try {
                await this.redisClient.del(cacheKey);
            }
            catch (error) {
                this.logger.error('Error al invalidar caché en DELETE.', {
                    key: cacheKey,
                    error,
                });
            }
        }
        return response.data;
    }
}
exports.CachedApiService = CachedApiService;
//# sourceMappingURL=ApiService.js.map