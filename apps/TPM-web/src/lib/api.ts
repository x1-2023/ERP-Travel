/**
 * API Client Configuration
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Types
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    totalCount?: number;
    pageSize?: number;
    pageNumber?: number;
    totalPages?: number;
  };
}

// Use VITE_API_URL for real API, fallback to /api for MSW demo mode
const baseURL = import.meta.env.VITE_API_URL || '/api';

// Create instance
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors & refresh token
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Try refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (refreshToken) {
        try {
          const response = await axios.post<ApiResponse<{
            accessToken: string;
            refreshToken: string;
          }>>(`${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`, {
            refreshToken,
          });

          if (response.data.success && response.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            useAuthStore.getState().setTokens(accessToken, newRefreshToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return api(originalRequest);
          }
        } catch {
          // Refresh failed - logout
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
      } else {
        // No refresh token - logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    // Extract error message
    const message = error.response?.data?.error?.message
      || error.message
      || 'An unexpected error occurred';

    return Promise.reject(new Error(message));
  }
);

export default api;

// Export typed request methods
export const apiGet = <T>(url: string, params?: object) =>
  api.get<ApiResponse<T>>(url, { params }).then(res => res.data);

export const apiPost = <T>(url: string, data?: object) =>
  api.post<ApiResponse<T>>(url, data).then(res => res.data);

export const apiPatch = <T>(url: string, data?: object) =>
  api.patch<ApiResponse<T>>(url, data).then(res => res.data);

export const apiDelete = <T>(url: string) =>
  api.delete<ApiResponse<T>>(url).then(res => res.data);
