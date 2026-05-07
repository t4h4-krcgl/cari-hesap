/**
 * Login Page
 * User authentication form with JWT token handling
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components/UI';
import { useNotification } from '../hooks/useCommon';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();
  const { addNotification } = useNotification();

  const [credentials, setCredentials] = useState({
    kullanici_adi: '',
    sifre: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!credentials.kullanici_adi.trim()) {
      errors.kullanici_adi = 'Kullanıcı adı gereklidir';
    }
    if (!credentials.sifre) {
      errors.sifre = 'Şifre gereklidir';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await login(credentials);
      addNotification('Giriş başarılı! Yönlendiriliyorsunuz...', 'success');
      setTimeout(() => navigate('/'), 500);
    } catch (err) {
      addNotification('Giriş başarısız. Lütfen kimlik bilgilerinizi kontrol edin.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">CariTakip</h1>
          <p className="text-blue-100">Cari Yönetim Sistemi</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Giriş Yapın
          </h2>

          {/* Error Alert */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={clearError}
            />
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Kullanıcı Adı"
              type="text"
              name="kullanici_adi"
              placeholder="kullanici_adi"
              value={credentials.kullanici_adi}
              onChange={handleChange}
              error={validationErrors.kullanici_adi}
            />

            <Input
              label="Şifre"
              type="password"
              name="sifre"
              placeholder="••••••"
              value={credentials.sifre}
              onChange={handleChange}
              error={validationErrors.sifre}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              isLoading={isLoading}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş'}
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-gray-600">
            <p>
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-blue-500 font-semibold hover:underline">
                Kayıt olun
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-semibold mb-2">Demo Hesapları:</p>
            <p>Admin: admin / 123456</p>
            <p>User: user / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
