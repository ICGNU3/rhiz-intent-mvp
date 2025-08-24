// API utility functions
import { logger } from '../logger';
import { AppError, handleError, formatErrorResponse } from '../errors';
import { API_CONFIG, HTTP_STATUS } from '../constants';

interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
  };
  timestamp: string;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS,
      ...requestOptions
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...requestOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new AppError(
          `HTTP ${response.status}: ${response.statusText}`,
          'API_ERROR',
          response.status
        );
      }

      const data = await response.json();
      
      logger.api(endpoint, requestOptions.method || 'GET', response.status, undefined, {
        url,
        method: requestOptions.method || 'GET',
      });

      return { data, timestamp: new Date().toISOString() };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new AppError('Request timeout', 'TIMEOUT_ERROR', HTTP_STATUS.SERVICE_UNAVAILABLE);
        }
        throw new AppError(error.message, 'NETWORK_ERROR', HTTP_STATUS.BAD_GATEWAY);
      }

      throw new AppError('Unknown error occurred', 'UNKNOWN_ERROR', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Utility functions for common API operations
export async function fetchWithRetry<T>(
  url: string,
  options: RequestOptions = {},
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await apiClient.get<T>(url, options);
      return response.data!;
    } catch (error) {
      if (i === retries - 1) throw error;
      
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new AppError('Max retries exceeded', 'RETRY_ERROR', HTTP_STATUS.SERVICE_UNAVAILABLE);
}

export function createApiErrorHandler(context: string) {
  return (error: unknown): never => {
    const appError = handleError(error, context);
    logger.error(`API error in ${context}`, appError, { component: 'api', context });
    throw appError;
  };
}

export function validateApiResponse<T>(response: any, schema?: any): T {
  if (!response) {
    throw new AppError('Empty response received', 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST);
  }

  if (schema) {
    try {
      return schema.parse(response);
    } catch (error) {
      throw new AppError('Invalid response format', 'VALIDATION_ERROR', HTTP_STATUS.BAD_REQUEST);
    }
  }

  return response as T;
}
