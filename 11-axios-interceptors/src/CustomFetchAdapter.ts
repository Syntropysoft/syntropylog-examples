import { IHttpClientAdapter, AdapterHttpRequest, AdapterHttpResponse } from 'syntropylog';

/**
 * Custom HTTP Adapter for the native fetch API
 * 
 * This adapter demonstrates how to create a custom adapter that works with
 * the built-in fetch API, showing SyntropyLog's framework-agnostic design.
 */
export class CustomFetchAdapter implements IHttpClientAdapter {
  /**
   * Execute an HTTP request using the native fetch API
   * 
   * @param request - The generic HTTP request to execute
   * @returns Promise resolving to the normalized response
   */
  async request<T>(request: AdapterHttpRequest): Promise<AdapterHttpResponse<T>> {
    const { method, url, headers = {}, body, queryParams } = request;

    // Validate URL
    if (!url || typeof url !== 'string') {
      throw new Error('Network error: Invalid URL provided');
    }

    // Build full URL with query parameters
    let fullUrl = url;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const urlObj = new URL(url);
      Object.entries(queryParams).forEach(([key, value]) => {
        urlObj.searchParams.append(key, String(value));
      });
      fullUrl = urlObj.toString();
    }

    // Convert headers to fetch format (string only)
    const fetchHeaders: Record<string, string> = {};
    Object.entries(headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        fetchHeaders[key] = value.join(', ');
      } else {
        fetchHeaders[key] = String(value);
      }
    });

    // Create fetch options
    const fetchOptions: RequestInit = {
      method,
      headers: fetchHeaders,
    };

    // Add body if present
    if (body !== undefined) {
      if (typeof body === 'string') {
        fetchOptions.body = body;
      } else {
        fetchOptions.body = JSON.stringify(body);
        // Add Content-Type header if not present
        if (!fetchHeaders['Content-Type']) {
          fetchHeaders['Content-Type'] = 'application/json';
        }
      }
    }

    try {
      // Make the request
      const response = await fetch(fullUrl, fetchOptions);

      // Parse response data
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json() as T;
      } else {
        data = (await response.text()) as T;
      }

      // Convert headers to standard format
      const responseHeaders: Record<string, string | number | string[]> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Transform the response to generic format
      const genericResponse: AdapterHttpResponse<T> = {
        statusCode: response.status,
        headers: responseHeaders,
        data,
      };

      return genericResponse;

    } catch (error) {
      // Handle fetch-specific errors
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      
      // Handle other errors
      throw new Error(`Fetch request failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Helper method to create a GET request
   */
  async get<T>(url: string, headers?: Record<string, string | number | string[]>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      headers: headers || {},
    });
  }

  /**
   * Helper method to create a POST request
   */
  async post<T>(url: string, data?: unknown, headers?: Record<string, string | number | string[]>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      headers: headers || {},
      body: data,
    });
  }

  /**
   * Helper method to create a PUT request
   */
  async put<T>(url: string, data?: unknown, headers?: Record<string, string | number | string[]>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      headers: headers || {},
      body: data,
    });
  }

  /**
   * Helper method to create a DELETE request
   */
  async delete<T>(url: string, headers?: Record<string, string | number | string[]>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      headers: headers || {},
    });
  }

  /**
   * Helper method to create a PATCH request
   */
  async patch<T>(url: string, data?: unknown, headers?: Record<string, string | number | string[]>): Promise<AdapterHttpResponse<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      headers: headers || {},
      body: data,
    });
  }
} 