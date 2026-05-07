/**
 * Payment Router
 * Ödeme yönetimi API endpoint'leri
 */

const express = require('express');
const router = express.Router();
const paymentController = require('./paymentController');
const { authenticate } = require('../../middleware/authMiddleware');

// Tüm endpoint'ler authentication gerektir
router.use(authenticate);

/**
 * GET /payments?debtId=1
 * Borç için tüm ödemeleri getir
 */
router.get('/', async (req, res, next) => {
    const { debtId } = req.query;
    if (!debtId) {
        return res.status(400).json({
            success: false,
            message: 'debtId parametresi gerekli'
        });
    }

    req.params.debtId = debtId;
    paymentController.getPaymentsByDebtId(req, res, next);
});

/**
 * POST /payments
 * Yeni ödeme ekle (Partial payment)
 */
router.post('/', paymentController.addPayment);

/**
 * PUT /payments/:id
 * Ödemeyi güncelle
 */
router.put('/:id', paymentController.updatePayment);

/**
 * DELETE /payments/:id
 * Ödemeyi sil
 */
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
