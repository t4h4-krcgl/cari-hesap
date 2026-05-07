/**
 * User Router
 * Kullanıcı endpoints'lerini tanımla
 */

const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

/**
 * Kimlik doğrulama endpoints'leri (Herkes erişebilir)
 */

// POST /api/user/register - Yeni kullanıcı kayıt
router.post('/register', userController.register);

// POST /api/user/login - Kullanıcı giriş
router.post('/login', userController.login);

/**
 * Korumalı endpoints'ler (Oturum açmış kullanıcılar için)
 */

// GET /api/user/profile - Profili getir
router.get('/profile', authenticate, userController.getProfile);

// PUT /api/user/profile - Profili güncelle
router.put('/profile', authenticate, userController.updateProfile);

// POST /api/user/change-password - Şifreyi değiştir
router.post('/change-password', authenticate, userController.changePassword);

// POST /api/user/logout - Oturum kapat
router.post('/logout', authenticate, userController.logout);

/**
 * Admin-only endpoints'ler
 */

// GET /api/user/list - Tüm kullanıcıları listele (Admin)
router.get('/list', authenticate, authorize(['admin']), userController.listUsers);

module.exports = router;
