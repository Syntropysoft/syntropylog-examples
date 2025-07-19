// =================================================================
//  ApiService.ts - Fluent API for HTTP requests
//  RESPONSIBILITY: Provide a fluent interface for HTTP requests
//  with automatic SyntropyLog integration
// =================================================================

interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

interface ApiServiceConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

export class ApiService {
  private adapter: object;
  private config: ApiServiceConfig;

  constructor(adapter: object) {
    this.adapter = adapter;
    this.config = {
      baseUrl: '',
      timeout: 5000,
      retries: 3
    };
  }

  // ✅ Fluent API - Configuration
  baseUrl(url: string): ApiService {
    this.config.baseUrl = url;
    return this;
  }

  timeout(ms: number): ApiService {
    this.config.timeout = ms;
    return this;
  }

  retries(count: number): ApiService {
    this.config.retries = count;
    return this;
  }

  // ✅ HTTP Methods - Stateless
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>('GET', path, options);
  }

  post<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>('POST', path, { ...options, body });
  }

  put<T>(path: string, body: any, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>('PUT', path, { ...options, body });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.makeRequest<T>('DELETE', path, options);
  }

  // ✅ Private method that handles all async/await
  private async makeRequest<T>(
    method: string, 
    path: string, 
    options?: RequestOptions & { body?: any }
  ): Promise<T> {
    const url = `${this.config.baseUrl}${path}`;
    
    // ✅ Use SyntropyLog adapter
    // ✅ Automatic correlation
    // ✅ Automatic logging
    // ✅ Automatic error handling
    
    // For now return a mock
    // TODO: Integrate with real adapter
    return Promise.resolve({ 
      success: true, 
      method, 
      url, 
      timestamp: new Date().toISOString() 
    } as T);
  }
}

// ✅ Factory function
export const createApiService = (adapter: object) => new ApiService(adapter); 