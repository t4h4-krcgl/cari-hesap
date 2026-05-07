/**
 * Utility Functions
 * Common helper functions for formatting, validation, and other operations
 */

/**
 * Format number as currency
 */
export const formatCurrency = (
  value: number,
  currency: string = 'TL',
  locale: string = 'tr-TR'
): string => {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${formatter.format(value)} ${currency}`;
};

/**
 * Format date to readable format
 */
export const formatDate = (
  dateString: string,
  locale: string = 'tr-TR'
): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

/**
 * Format date and time
 */
export const formatDateTime = (
  dateString: string,
  locale: string = 'tr-TR'
): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    yıl: 31536000,
    ay: 2592000,
    hafta: 604800,
    gün: 86400,
    saat: 3600,
    dakika: 60,
  };

  for (const [key, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `${interval} ${key} önce`;
    }
  }

  return 'Şu anda';
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (basic)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[0-9\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push('Şifre en az 6 karakter olmalıdır');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre küçük harf içermelidir');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre büyük harf içermelidir');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre sayı içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate array of numbers for pagination
 */
export const getPaginationArray = (
  currentPage: number,
  totalPages: number,
  visiblePages: number = 5
): (number | string)[] => {
  const pages: (number | string)[] = [];

  if (totalPages <= visiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    const start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const end = Math.min(totalPages, start + visiblePages - 1);

    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
  }

  return pages;
};

/**
 * Truncate string to max length
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Convert kebab-case or snake_case to Title Case
 */
export const toTitleCase = (text: string): string => {
  return text
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Get status color based on status value
 */
export const getStatusColor = (
  status: string
): 'green' | 'red' | 'yellow' | 'blue' => {
  switch (status?.toLowerCase()) {
    case 'aktif':
    case 'aktive':
    case 'success':
      return 'green';
    case 'deaktif':
    case 'inactive':
    case 'error':
      return 'red';
    case 'warning':
    case 'pending':
      return 'yellow';
    default:
      return 'blue';
  }
};

/**
 * Get transaction type label and color
 */
export const getTransactionTypeInfo = (
  type: 'borc' | 'odeme'
): { label: string; color: string } => {
  return type === 'borc'
    ? { label: 'Borç', color: 'red' }
    : { label: 'Ödeme', color: 'green' };
};

/**
 * Get currency symbol
 */
export const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    TL: '₺',
    USD: '$',
    Altin: 'oz',
    EUR: '€',
  };
  return symbols[currency] || currency;
};

/**
 * Export data to CSV
 */
export const exportToCSV = (
  data: any[],
  filename: string = 'export.csv'
): void => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value}"`
            : value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
