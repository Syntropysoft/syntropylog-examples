/**
 * @file CachedApiService.ts
 * @description Una clase genérica que extiende ApiService para añadir una capa de caché
 * con Redis, implementando el patrón "Cache-Aside". El caché es opcional.
 */
/**
 * @interface RequestOptions
 * @description Opciones para las peticiones, incluyendo configuración de caché.
 */
export interface RequestOptions {
    headers?: Record<string, string>;
    queryParams?: Record<string, any>;
    caching?: {
        /** Deshabilita la lectura y escritura de caché para esta petición específica. */
        disabled?: boolean;
        /** TTL (Time-To-Live) en segundos para esta entrada de caché. Sobrescribe el default. */
        ttlSeconds?: number;
    };
}
/**
 * @interface ApiServiceOptions
 * @description Opciones para configurar el ApiService con caché.
 */
export interface ApiServiceOptions {
    /** El nombre de la instancia de Redis a usar para el caché. Si no se provee, el caché se deshabilita. */
    redisInstanceName?: string;
    /** Un prefijo para todas las claves de caché para evitar colisiones. */
    cacheKeyPrefix?: string;
    /** El tiempo de vida (TTL) por defecto en segundos para las entradas de caché. */
    defaultCacheTTLSeconds?: number;
}
/**
 * @class CachedApiService
 * @description Proporciona una API de cliente REST simple y fuertemente tipada,
 * con una capa de caché Redis integrada y opcional.
 */
export declare class CachedApiService {
    private httpClient;
    private redisClient;
    private options;
    private logger;
    /**
     * @constructor
     * @param {string} httpInstanceName - El nombre de la instancia HTTP configurada.
     * @param {ApiServiceOptions} [options] - Las opciones de configuración para el caché (opcionales).
     */
    constructor(httpInstanceName: string, options?: ApiServiceOptions);
    /**
     * Genera una clave de caché única para una petición.
     * @private
     */
    private generateCacheKey;
    /**
     * Realiza una petición GET, con lógica de caché opcional.
     */
    get<T>(url: string, options?: RequestOptions): Promise<T>;
    /**
     * Realiza una petición POST e invalida la caché si está habilitada.
     */
    post<T>(url: string, body: any, options?: RequestOptions): Promise<T>;
    /**
     * Realiza una petición PUT e invalida la caché si está habilitada.
     */
    put<T>(url: string, body: any, options?: RequestOptions): Promise<T>;
    /**
     * Realiza una petición DELETE e invalida la caché si está habilitada.
     */
    delete<T>(url: string, options?: RequestOptions): Promise<T>;
}
