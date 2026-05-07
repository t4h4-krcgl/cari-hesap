/**
 * API Service
 * Configures Axios instance and provides API request functions
 * All requests go to http://localhost:3000
 */

import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, Cari, Islem, User, DashboardStats } from '../types';

// Create Axios instance with base URL pointing to the backend
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add request interceptor to attach JWT token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * API Service Object
 * Contains all API endpoints organized by module
 */
export const apiService = {
  /**
   * USER & AUTHENTICATION ENDPOINTS
   */
  user: {
    // Register new user
    register: async (data: any): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await apiClient.post('/user/register', data);
      return response.data;
    },

    // Login user
    login: async (data: any): Promise<ApiResponse<{ user: User; token: string }>> => {
      const response = await apiClient.post('/user/login', data);
      return response.data;
    },

    // Get current user profile
    getProfile: async (): Promise<ApiResponse<User>> => {
      const response = await apiClient.get('/user/profile');
      return response.data;
    },

    // Logout user
    logout: async (): Promise<ApiResponse> => {
      const response = await apiClient.post('/user/logout', {});
      return response.data;
    },
  },

  /**
   * CUSTOMER (CARİ) ENDPOINTS
   */
  cari: {
    // Get all customers
    list: async (): Promise<ApiResponse<Cari[]>> => {
      const response = await apiClient.get('/cari');
      return response.data;
    },

    // Get single customer
    getById: async (id: number): Promise<ApiResponse<Cari>> => {
      const response = await apiClient.get(`/cari/${id}`);
      return response.data;
    },

    // Create new customer
    create: async (data: any): Promise<ApiResponse<Cari>> => {
      const response = await apiClient.post('/cari', data);
      return response.data;
    },

    // Update existing customer
    update: async (id: number, data: any): Promise<ApiResponse<Cari>> => {
      const response = await apiClient.put(`/cari/${id}`, data);
      return response.data;
    },

    // Soft delete customer
    delete: async (id: number): Promise<ApiResponse> => {
      const response = await apiClient.delete(`/cari/${id}`);
      return response.data;
    },

    // Restore deleted customer (Admin only)
    restore: async (id: number): Promise<ApiResponse<Cari>> => {
      const response = await apiClient.post(`/cari/${id}/restore`, {});
      return response.data;
    },
  },

  /**
   * TRANSACTION (İŞLEM) ENDPOINTS
   */
  islem: {
    // Get all transactions
    list: async (): Promise<ApiResponse<Islem[]>> => {
      const response = await apiClient.get('/islem');
      return response.data;
    },

    // Get transactions for a specific customer
    byCari: async (cariId: number): Promise<ApiResponse<Islem[]>> => {
      const response = await apiClient.get(`/islem/cari/${cariId}`);
      return response.data;
    },

    // Get filtered transactions for a customer
    filterByCari: async (
      cariId: number,
      params: any
    ): Promise<ApiResponse<Islem[]>> => {
      const response = await apiClient.get(`/islem/cari/${cariId}/filter`, {
        params,
      });
      return response.data;
    },

    // Get debt summary for a customer
    borc_ozeti: async (cariId: number): Promise<ApiResponse<any>> => {
      const response = await apiClient.get(`/islem/borc-ozeti/${cariId}`);
      return response.data;
    },

    // Create new transaction
    create: async (cariId: number, data: any): Promise<ApiResponse<Islem>> => {
      const response = await apiClient.post(`/islem/cari/${cariId}`, data);
      return response.data;
    },

    // Update transaction
    update: async (islemId: number, data: any): Promise<ApiResponse<Islem>> => {
      const response = await apiClient.put(`/islem/${islemId}`, data);
      return response.data;
    },

    // Soft delete transaction
    delete: async (islemId: number): Promise<ApiResponse> => {
      const response = await apiClient.delete(`/islem/${islemId}`);
      return response.data;
    },

    // Restore deleted transaction
    restore: async (islemId: number): Promise<ApiResponse<Islem>> => {
      const response = await apiClient.post(`/islem/${islemId}/restore`, {});
      return response.data;
    },
  },

  /**
   * DASHBOARD ENDPOINTS
   */
  dashboard: {
    // Get main dashboard statistics
    getStats: async (): Promise<ApiResponse<DashboardStats>> => {
      const response = await apiClient.get('/dashboard');
      return response.data;
    },

    // Get debt summary statistics
    getDebtSummary: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/dashboard/debt-summary');
      return response.data;
    },

    // Get customer statistics
    getCariStats: async (): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/dashboard/cari-statistics');
      return response.data;
    },

    // Get statistics for date range
    getDateRangeStats: async (params: any): Promise<ApiResponse<any>> => {
      const response = await apiClient.get('/dashboard/date-range', {
        params,
      });
      return response.data;
    },

    // Get top customers
    getTopCari: async (): Promise<ApiResponse<Cari[]>> => {
      const response = await apiClient.get('/dashboard/top-customers');
      return response.data;
    },
  },

  /**
   * HEALTH CHECK
   */
  health: {
    check: async (): Promise<ApiResponse> => {
      const response = await apiClient.get('/health');
      return response.data;
    },
  },
};

export default apiClient;
