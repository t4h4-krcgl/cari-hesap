/**
 * Main App Component
 * Sets up routing, authentication, and notifications
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useNotification } from './hooks/useCommon';
import { NotificationContainer } from './components/Layout';
import { LoadingScreen } from './components/Layout';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import TransactionsPage from './pages/TransactionsPage';

/**
 * Protected Route Wrapper
 * Redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * App Router Component
 * Inner component that uses auth context
 */
const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { notifications, removeNotification } = useNotification();
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Check authentication on mount
  React.useEffect(() => {
    setIsInitializing(false);
  }, []);

  if (isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        {!isAuthenticated && (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}

        {/* Protected Routes */}
        {isAuthenticated && (
          <>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <TransactionsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>

      {/* Global Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </>
  );
};

/**
 * Main App Component
 */
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </Router>
  );
};

export default App;
