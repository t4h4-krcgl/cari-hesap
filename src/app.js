/**
 * Express Uygulaması Ana Dosyası
 * Middleware'i konfigüre et ve route'ları kaydet
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Middleware importları
const {
  errorHandler,
  notFoundHandler,
  asyncHandler
} = require('./middleware/errorHandler');
const { loggingMiddleware } = require('./middleware/loggingMiddleware');
const { authenticate, authorize } = require('./middleware/authMiddleware');

// Database ve initialization
const { initializeDatabase } = require('./config/database');

// Modül routerlarını al
const cariRouter = require('./modules/cari/cariRouter');
const islemRouter = require('./modules/islem/islemRouter');
const userRouter = require('./modules/user/userRouter');
const dashboardRouter = require('./modules/dashboard/dashboardRouter');

// Express uygulamasını oluştur
const app = express();

// ============ GLOBAL MIDDLEWARE'LER ============

// CORS desteğini etkinleştir
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);

// JSON body parser
app.use(express.json({ limit: '10mb' }));

// URL-encoded body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(loggingMiddleware);

// ============ HEALTH CHECK ============

/**
 * GET /api/health
 * API durumu kontrol endpoinsti (authentication gerektirmiyor)
 */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Cari Takip API\'si çalışıyor',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

// ============ PUBLIC ROUTES (Authentication gerektirmeyen) ============

/**
 * Kullanıcı Authentication Endpoints
 */
app.use('/api/user', userRouter);

// ============ PROTECTED ROUTES (Authentication gerektiren) ============

/**
 * Cari Yönetimi
 * GET /api/cari - Tüm müşterileri listele
 * GET /api/cari/:id - Tek müşteriy i getir
 * POST /api/cari - Yeni müşteri oluştur
 * PUT /api/cari/:id - Müşteri güncelle
 * DELETE /api/cari/:id - Müşteri sil (soft delete)
 * POST /api/cari/:id/restore - Müşteri geri al
 */
app.use('/api/cari', cariRouter);

/**
 * İşlem Yönetimi (Borç/Ödeme)
 * GET /api/islem - Tüm işlemleri listele
 * GET /api/islem/cari/:cariId - Müşteriye ait işlemleri getir
 * GET /api/islem/cari/:cariId/filter - Filtrelenmiş işlemler
 * GET /api/islem/borc-ozeti/:cariId - Borç özeti
 * POST /api/islem/cari/:cariId - Yeni işlem oluştur
 * PUT /api/islem/:islemId - İşlem güncelle
 * DELETE /api/islem/:islemId - İşlem sil (soft delete)
 * POST /api/islem/:islemId/restore - İşlem geri al
 */
app.use('/api/islem', islemRouter);

/**
 * Dashboard ve İstatistikler
 * GET /api/dashboard - Ana dashboard istatistikleri
 * GET /api/dashboard/debt-summary - Borç özeti
 * GET /api/dashboard/cari-statistics - Müşteri istatistikleri
 * GET /api/dashboard/date-range - Tarih aralığına göre istatistikler
 * GET /api/dashboard/top-customers - En fazla işlemi olan müşteriler
 */
app.use('/api/dashboard', dashboardRouter);

// ============ 404 HANDLER ============

/**
 * Not found handler - yukarıda tanımlanmayan route'lar
 */
app.use(notFoundHandler);

// ============ ERROR HANDLER ============

/**
 * Global error handler - tüm hataları yakala ve işle
 * Bu middleware en son tanımlanmalıdır
 */
app.use(errorHandler);

// ============ SERVER BAŞLATMA ============

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Veritabanı tablolarını oluştur/kontrol et
    await initializeDatabase();

    // Sunucuyu başlat
    app.listen(PORT, () => {
      console.log(`\n✓ Sunucu başarıyla başlatıldı: http://localhost:${PORT}`);
      console.log(`✓ API Dokümantasyonu: http://localhost:${PORT}/api/health`);
      console.log(`✓ Ortam: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('✗ Sunucu başlatırken hata:', error.message);
    process.exit(1);
  }
};

// Sadece doğrudan çalıştırıldığında başlat (test sırasında değil)
if (require.main === module) {
  startServer();
}

module.exports = app;

/**
 * Cari modülü routes
 * Base URL: /api/cari
 */
app.use('/api/cari', cariRouter);

/**
 * İşlem modülü routes
 * Base URL: /api/islem
 */
app.use('/api/islem', islemRouter);

// ============ ERROR HANDLING ============

// 404 Not Found handler
app.use(notFoundHandler);

// Genel error handler
app.use(errorHandler);

module.exports = app;
