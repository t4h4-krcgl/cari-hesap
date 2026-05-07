/**
 * Specialized Components
 * Complex reusable components for layout and navigation
 */

import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Notification } from '../types';
import { Spinner } from './UI';

/**
 * Header/Navigation Component
 */
export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          CariTakip
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <span className="text-sm">👤</span>
            <span>{user?.kullanici_adi || 'Kullanıcı'}</span>
            <span className="text-xl">▼</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-40">
              <div className="p-4 border-b">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.ad_soyad}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
                <p className="text-xs text-blue-600 mt-1">
                  ({user?.rol === 'admin' ? 'Yönetici' : 'Kullanıcı'})
                </p>
              </div>
              <Link
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
              >
                Çıkış
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/**
 * Sidebar Navigation Component
 */
export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = React.useState(true);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: '📊' },
    { href: '/customers', label: 'Müşteriler', icon: '👥' },
    { href: '/transactions', label: 'İşlemler', icon: '📋' },
    ...(user?.rol === 'admin'
      ? [{ href: '/admin', label: 'Yönetim', icon: '⚙️' }]
      : []),
  ];

  return (
    <aside
      className={`bg-gray-900 text-white transition-all ${
        expanded ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        {expanded && <h2 className="text-xl font-bold">Menu</h2>}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          {expanded ? '←' : '→'}
        </button>
      </div>

      <nav className="mt-8">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="block px-4 py-3 hover:bg-gray-800 transition-colors flex items-center gap-3"
          >
            <span className="text-xl">{item.icon}</span>
            {expanded && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

/**
 * Notification Container Component
 * Displays notifications in a stack
 */
export const NotificationContainer: React.FC<{
  notifications: Notification[];
  onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${typeStyles[notification.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] animate-in`}
        >
          <span className="text-lg">{icons[notification.type]}</span>
          <span className="flex-1">{notification.message}</span>
          <button
            onClick={() => onRemove(notification.id)}
            className="opacity-70 hover:opacity-100"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Protected Route Component
 * Redirects to login if not authenticated
 */
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (requiredRole && user?.rol !== requiredRole) {
      navigate('/unauthorized', { replace: true });
    }
  }, [isAuthenticated, user, requiredRole, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Loading Screen Component
 * Full-screen loading indicator
 */
export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 font-semibold">Yükleniyor...</p>
      </div>
    </div>
  );
};

/**
 * Pagination Component
 */
interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  const pages: (number | string)[] = [];

  // Show first page
  pages.push(1);

  // Show pages around current page
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
    if (i > 1 && !pages.includes(i)) pages.push(i);
  }

  // Show last page
  if (totalPages > 1 && !pages.includes(totalPages)) {
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-2 my-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        ← Önceki
      </button>

      {pages.map((p, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && typeof pages[idx - 1] === 'number' && typeof p === 'number' && pages[idx - 1] !== p - 1 && (
            <span className="text-gray-400">...</span>
          )}
          <button
            onClick={() => typeof p === 'number' && onPageChange(p)}
            className={`px-3 py-2 rounded border ${
              p === page
                ? 'bg-blue-500 text-white border-blue-500'
                : 'hover:bg-gray-100'
            } ${typeof p !== 'number' ? 'cursor-default' : ''}`}
            disabled={typeof p !== 'number'}
          >
            {p}
          </button>
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
      >
        Sonraki →
      </button>
    </div>
  );
};

/**
 * Search Bar Component
 */
interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Ara...',
}) => {
  const [value, setValue] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch(newValue);
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        className="px-4 py-2 border border-gray-300 rounded-lg pl-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
    </div>
  );
};

/**
 * Data Table Component
 */
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

export const DataTable = React.forwardRef<
  HTMLTableElement,
  DataTableProps<any>
>(({ data, columns, isLoading, onRowClick, actions }, ref) => {
  if (isLoading) {
    return <Spinner />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Veri bulunamadı
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table ref={ref} className="w-full border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-semibold text-gray-700"
              >
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 py-3 font-semibold text-gray-700">İşlemler</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(row)}
              className={`border-b hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] || '-')}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

DataTable.displayName = 'DataTable';
