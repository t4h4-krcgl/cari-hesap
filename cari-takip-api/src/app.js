/**
 * Express Uygulaması Ana Dosyası
 * Middleware'i konfigüre et ve route'ları kaydet
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { loggingMiddleware } = require('./middleware/loggingMiddleware');
const { authenticate } = require('./middleware/authMiddleware');
const { helmetMiddleware, globalLimiter } = require('./middleware/securityMiddleware');
const { initializeDatabase } = require('./config/database');
const { startOverdueChecker } = require('./jobs/overdueChecker');

const cariRouter = require('./modules/cari/cariRouter');
const islemRouter = require('./modules/islem/islemRouter');
const userRouter = require('./modules/user/userRouter');
const dashboardRouter = require('./modules/dashboard/dashboardRouter');
const debtRouter = require('./modules/debt/debtRouter');
const paymentRouter = require('./modules/payment/paymentRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmetMiddleware);
app.use(globalLimiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggingMiddleware);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cari Takip API'si çalışıyor",
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/user', userRouter);
app.use('/api/cari', authenticate, cariRouter);
app.use('/api/islem', authenticate, islemRouter);
app.use('/api/dashboard', authenticate, dashboardRouter);
app.use('/api/debts', authenticate, debtRouter);
app.use('/api/payments', authenticate, paymentRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  try {
    await initializeDatabase();
    startOverdueChecker();

    app.listen(PORT, () => {
      console.log(`\n✓ Sunucu başarıyla başlatıldı: http://localhost:${PORT}`);
      console.log(`✓ API Dokümantasyonu: http://localhost:${PORT}/api/health`);
      console.log(`✓ Ortam: ${process.env.NODE_ENV || 'development'}`);
      console.log('✓ V2 Features: Partial Payments, Overdue Checker, Security\n');
    });
  } catch (error) {
    console.error('✗ Sunucu başlatırken hata:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;
