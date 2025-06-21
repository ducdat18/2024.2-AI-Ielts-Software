import type { ApiError } from "@/types";
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { API_CONFIG } from "./configApi";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
      withCredentials: true, // ✅ Important for CORS with credentials
    });

    this.setupInterceptors();
    
    // Debug logging in development
    if (API_CONFIG.DEBUG) {
      console.log('🔧 ApiClient initialized with BASE_URL:', API_CONFIG.BASE_URL);
    }
  }

  private setupInterceptors() {
    // Request interceptor with debugging
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug logging
        if (API_CONFIG.DEBUG) {
          console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
            data: config.data,
            headers: config.headers,
          });
        }

        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor with debugging
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        if (API_CONFIG.DEBUG) {
          console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
            data: response.data,
          });
        }
        return response;
      },
      (error) => {
        // Debug error logging
        if (API_CONFIG.DEBUG) {
          console.error(`❌ ${error.response?.status || 'Network'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
            error: error.response?.data,
            message: error.message,
            code: error.code,
          });
        }

        // Handle specific CORS errors
        if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
          console.error('🚨 CORS/Network Error - Check backend CORS configuration');
        }

        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          console.warn('🚨 Unauthorized - clearing auth data');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
          
          // Only redirect if not already on auth page
          if (!window.location.pathname.startsWith('/auth/')) {
            window.location.href = '/auth/login';
          }
        }
        
        return Promise.reject(this.handleError(error));
      }
    );
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      return {
        code: error.response.status.toString(),
        message: error.response.data?.message || error.response.statusText || error.message,
        details: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received (CORS, Network, etc.)
      const isCorsError = error.message?.includes('CORS') || error.code === 'ERR_NETWORK';
      return {
        code: 'NETWORK_ERROR',
        message: isCorsError 
          ? 'CORS/Network error - Backend may not be running or CORS not configured properly'
          : 'Network error - please check your connection',
        details: error.request,
      };
    } else {
      // Something happened in setting up the request
      return {
        code: 'REQUEST_ERROR',
        message: error.message,
        details: error,
      };
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // ✅ Updated connection test - use health endpoint instead of swagger
  async testConnection(): Promise<boolean> {
    try {
      // Use the health endpoint instead of swagger for connection testing
      const response = await this.client.get('/health');
      if (API_CONFIG.DEBUG) {
        console.log('✅ Health check response:', response);
      }
      return true;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      return false;
    }
  }

  // Get current base URL
  getBaseURL(): string {
    return this.client.defaults.baseURL || '';
  }
}

export const apiClient = new ApiClient();

// ========================================
// UPDATED API CONNECTION TESTING
// ========================================

// Test API connection on startup in development
if (API_CONFIG.DEBUG) {
  setTimeout(async () => {
    console.log('🧪 Testing API connection...');
    
    try {
      const isConnected = await apiClient.testConnection();
      
      if (isConnected) {
        console.log('✅ API connection successful');
        console.log('📖 Swagger available at:', `${API_CONFIG.BASE_URL}/swagger/index.html`);
        console.log('❤️ Health endpoint working:', `${API_CONFIG.BASE_URL}/health`);
      } else {
        console.error('❌ API connection failed');
        console.error('🔍 Check if backend is running on:', API_CONFIG.BASE_URL);
        console.error('📖 Expected Swagger URL:', `${API_CONFIG.BASE_URL}/swagger/index.html`);
        console.error('❤️ Expected Health URL:', `${API_CONFIG.BASE_URL}/health`);
      }
    } catch (error) {
      console.error('❌ Connection test error:', error);
    }
  }, 1000);
}

// ========================================
// CORS DEBUGGING UTILITIES
// ========================================

// Manual CORS test function
export const testCors = async () => {
  try {
    console.log('🧪 Testing CORS...');
    
    // Test simple GET request
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for CORS
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS test successful:', data);
      return true;
    } else {
      console.error('❌ CORS test failed - Response not OK:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ CORS test failed - Network error:', error);
    return false;
  }
};

// Add to debug tools
if (API_CONFIG.DEBUG) {
  (window as any).__API_DEBUG__ = {
    client: apiClient,
    config: API_CONFIG,
    testConnection: () => apiClient.testConnection(),
    testCors,
    getBaseURL: () => apiClient.getBaseURL(),
  };
  
  console.log('🛠️ API Debug tools available at window.__API_DEBUG__');
  console.log('🧪 Test CORS manually: window.__API_DEBUG__.testCors()');
}