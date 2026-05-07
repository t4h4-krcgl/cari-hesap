/**
 * Dashboard Router
 * İstatistik endpoints'lerini tanımla
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboardController');
const { authenticate } = require('../../middleware/authMiddleware');

/**
 * Tüm dashboard endpoints'leri authentication gerektiriyor
 */

// GET /api/dashboard - Ana dashboard istatistikleri
router.get('/', authenticate, dashboardController.getDashboard);

// GET /api/dashboard/debt-summary - Borç özeti
router.get('/debt-summary', authenticate, dashboardController.getDebtSummary);

// GET /api/dashboard/cari-statistics - Müşteri istatistikleri
router.get('/cari-statistics', authenticate, dashboardController.getCariStatistics);

// GET /api/dashboard/date-range - Tarih aralığına göre istatistikler
router.get('/date-range', authenticate, dashboardController.getStatisticsByDateRange);

// GET /api/dashboard/top-customers - En fazla işlemi olan müşteriler
router.get('/top-customers', authenticate, dashboardController.getTopCustomers);

module.exports = router;
