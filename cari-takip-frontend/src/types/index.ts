/**
 * Global TypeScript Type Definitions
 * Defines all interfaces used throughout the application
 */

// User & Authentication Types
export interface User {
  id: number;
  kullanici_adi: string;
  email: string;
  ad_soyad: string;
  rol: 'admin' | 'user';
  durum: string;
  son_giris_tarihi: string | null;
  olusturulma_tarihi: string;
  guncellenme_tarihi: string;
}

export interface LoginRequest {
  kullanici_adi: string;
  sifre: string;
}

export interface RegisterRequest {
  kullanici_adi: string;
  email: string;
  sifre: string;
  sifre_confirm: string;
  ad_soyad: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  statusCode: number;
  timestamp: string;
}

// Customer (Cari) Types
export interface Cari {
  id: number;
  ad: string;
  email: string | null;
  telefon: string | null;
  adres: string | null;
  kredi_limiti: number;
  gecerli_borc: number;
  durum: string;
  olusturulma_tarihi: string;
  guncellenme_tarihi: string;
  deleted_at: string | null;
}

export interface CreateCariRequest {
  ad: string;
  email?: string;
  telefon?: string;
  adres?: string;
  kredi_limiti?: number;
}

export interface UpdateCariRequest extends Partial<CreateCariRequest> {
  durum?: string;
}

// Transaction (İşlem) Types
export interface Islem {
  id: number;
  cari_id: number;
  type: 'borc' | 'odeme';
  miktar: number;
  birim: 'TL' | 'USD' | 'Altin';
  aciklama: string | null;
  olusturulma_tarihi: string;
  guncellenme_tarihi: string;
  deleted_at: string | null;
}

export interface CreateIslemRequest {
  type: 'borc' | 'odeme';
  miktar: number;
  birim: 'TL' | 'USD' | 'Altin';
  aciklama?: string;
}

export interface UpdateIslemRequest extends Partial<CreateIslemRequest> {}

// Transaction Filter Type
export interface IslemFilter {
  startDate?: string;
  endDate?: string;
  birim?: 'TL' | 'USD' | 'Altin';
  type?: 'borc' | 'odeme';
}

// Dashboard Statistics Types
export interface DashboardStats {
  totalCari: number;
  totalBorc: {
    TL: number;
    USD: number;
    Altin: number;
  };
  totalOdeme: {
    TL: number;
    USD: number;
    Altin: number;
  };
  recentIslemler: Islem[];
  topCarilar: Cari[];
}

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  statusCode: number;
  timestamp: string;
}

// Pagination Type
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

// Notification Type
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

// Loading State Type
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
