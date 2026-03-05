/**
 * JWT Authentication Middleware
 * Token doğrulama ve rol kontrol işlemleri
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * JWT token oluştur
 * @param {number} userId - Kullanıcı ID
 * @param {string} rol - Kullanıcı rolü
 * @returns {string} JWT token
 */
const generateToken = (userId, rol) => {
  return jwt.sign({ userId, rol }, JWT_SECRET, {
    expiresIn: JWT_EXPIRE
  });
};

/**
 * JWT token doğrula ve payload'ı döndür
 * @param {string} token - JWT token
 * @returns {Object} Token payload'ı
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError('Geçersiz veya süresi dolmuş token', 401);
  }
};

/**
 * Token kontrolü middleware
 * Authorization header'dan token alır ve doğrular
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token bulunamadı. Authorization header gereklidir', 401);
    }

    const token = authHeader.slice(7); // "Bearer " kısmını kaldır
    const decoded = verifyToken(token);

    // İsteğe kullanıcı bilgisini ekle
    req.user = decoded;
    next();
  } catch (error) {
    console.error('✗ Kimlik doğrulama hatası:', error.message);
    const statusCode = error.statusCode || 401;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Kimlik doğrulama başarısız',
      statusCode: statusCode,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Rol kontrol middleware
 * Yalnızca belirtilen rollere sahip kullanıcıların erişmesine izin ver
 * @param {Array} allowedRoles - İzin verilen roller
 * @returns {Function} Middleware fonksiyonu
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    // Önce authentication middleware çalışmış olmalı
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Kimlik doğrulama gereklidir',
        statusCode: 401,
        timestamp: new Date().toISOString()
      });
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        message: `Bu işlem için yetkiniz yok. Gerekli rol: ${allowedRoles.join(', ')}`,
        statusCode: 403,
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Refresh token ile yeni access token oluştur
 * @param {string} refreshToken - Refresh token
 * @returns {string} Yeni access token
 */
const refreshAccessToken = (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    return generateToken(decoded.userId, decoded.rol);
  } catch (error) {
    throw new AppError('Geçersiz refresh token', 401);
  }
};

/**
 * Token decode et (doğrulama olmaksızın - debug amaçlı)
 * @param {string} token - JWT token
 * @returns {Object} Token payload'ı
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  refreshAccessToken,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRE
};
