import type { AdapterHttpRequest, AdapterHttpResponse } from 'syntropylog';

/**
 * Custom Fetch Adapter - Example of Custom Adapter Implementation
 * 
 * This adapter demonstrates how to create a custom adapter for SyntropyLog.
 * It wraps the native `fetch` API to show how SyntropyLog can work with
 * any HTTP client, including built-in browser APIs.
 * 
 * This is an educational example showing:
 * 1. How to implement the adapter interface
 * 2. How to handle different HTTP methods
 * 3. How to transform between generic and specific formats
 * 4. How to handle errors and responses
 * 5. How to work with native browser APIs
 */

export class CustomFetchAdapter {
  private fetchInstance: typeof fetch;

  constructor(fetchInstance: typeof fetch = fetch) {
    this.fetchInstance = fetchInstance;
  }

  /**
   * Execute an HTTP request using the fetch API
   * 
   * @param request - The generic HTTP request to execute
   * @returns Promise<AdapterHttpResponse<T>> - The response in generic format
   */
  async request<T>(request: AdapterHttpRequest): Promise<AdapterHttpResponse<T>> {
    try {
      // Transform the generic request to fetch-specific format
      const fetchOptions: RequestInit = {
        method: request.method,
        headers: request.headers as Record<string, string>,
        body: request.body ? JSON.stringify(request.body) : undefined,
      };

      // Handle query parameters for fetch
      let url = request.url;
      if (request.queryParams) {
        const urlObj = new URL(url, 'http://localhost'); // Base URL for URL constructor
        Object.entries(request.queryParams).forEach(([key, value]) => {
          urlObj.searchParams.append(key, String(value));
        });
        url = urlObj.pathname + urlObj.search;
      }

      // Execute the fetch request
      const response = await this.fetchInstance(url, fetchOptions);

      // Get response body
      let data: T;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as T;
      }

      // Transform the response to generic format
      const genericResponse: AdapterHttpResponse<T> = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        config: {
          url: request.url,
          method: request.method,
          headers: request.headers,
        },
      };

      return genericResponse;

    } catch (error) {
      // Handle fetch-specific errors
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw new Error(`Fetch request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Helper method to create a GET request
   */
  async get<T>(url: string, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      headers,
    });
  }

  /**
   * Helper method to create a POST request
   */
  async post<T>(url: string, data?: any, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      body: data,
      headers,
    });
  }

  /**
   * Helper method to create a PUT request
   */
  async put<T>(url: string, data?: any, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      body: data,
      headers,
    });
  }

  /**
   * Helper method to create a DELETE request
   */
  async delete<T>(url: string, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      headers,
    });
  }

  /**
   * Helper method to create a PATCH request
   */
  async patch<T>(url: string, data?: any, headers?: Record<string, string>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      body: data,
      headers,
    });
  }
} 