/**
 * Debt Router
 * Borç yönetimi API endpoint'leri
 */

const express = require('express');
const router = express.Router();
const debtController = require('./debtController');
const { authenticate } = require('../../middleware/authMiddleware');

// Tüm endpoint'ler authentication gerektir
router.use(authenticate);

/**
 * GET /debts
 * Tüm borçları getir (filtreleme ile)
 */
router.get('/', debtController.getAllDebts);

/**
 * GET /debts/:id
 * Borcu ID ile getir
 */
router.get('/:id', debtController.getDebtById);

/**
 * POST /debts
 * Yeni borç oluştur
 */
router.post('/', debtController.createDebt);

/**
 * PUT /debts/:id
 * Borcu güncelle
 */
router.put('/:id', debtController.updateDebt);

/**
 * DELETE /debts/:id
 * Borcu sil
 */
router.delete('/:id', debtController.deleteDebt);

module.exports = router;
