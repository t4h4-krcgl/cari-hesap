/**
 * Security Middleware
 * Helmet: HTTP headers kütüphanesi
 * Express Rate Limit: Rate limiting
 * Centralized Error Handling: Global hata yönetimi
 */

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Helmet - HTTP headers güvenliği
 */
const helmetMiddleware = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:']
        }
    },
    hsts: {
        maxAge: 31536000, // 1 yıl
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    }
});

/**
 * Global Rate Limiter
 * 100 request per 15 minutes
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100,
    message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyiniz.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Health check endpoint'ini skip et
        return req.path === '/health';
    }
});

/**
 * Strict Rate Limiter - Kritik endpoint'ler için
 * 5 request per 15 minutes (Auth, Payment vb.)
 */
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyiniz.',
    standardHeaders: true,
    legacyHeaders: false
});

/**
 * Login Rate Limiter - Login endpoint'i için
 * 5 request per 1 hour
 */
const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 5,
    message: 'Çok fazla giriş denemesi. Hesabınız 1 saat için bloke edildi.',
    skipSuccessfulRequests: true, // Başarılı girişleri saymaz
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    helmetMiddleware,
    globalLimiter,
    strictLimiter,
    loginLimiter
};
