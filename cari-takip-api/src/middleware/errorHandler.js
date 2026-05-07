/**
 * Error Handler Middleware
 * Tüm hataları yakalay ve konsisten bir cevap formatı döndür
 */

/**
 * Özel Hata Sınıfı
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  const errorLog = {
    message: err.message,
    statusCode: err.statusCode || 500,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    timestamp: new Date().toISOString()
  };

  // Stack trace'i sadece development'da göster
  if (process.env.NODE_ENV === 'development') {
    errorLog.stack = err.stack;
  }

  console.error('✗ API Hatası:', errorLog);

  const statusCode = err.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Sunucu hatası oluştu',
    statusCode: statusCode,
    ...(isDevelopment && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Aradığınız endpoint bulunamadı: ${req.method} ${req.originalUrl}`,
    statusCode: 404,
    timestamp: new Date().toISOString()
  });
};

/**
 * Async errorları yakala ve error handler'a geç
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler
};
