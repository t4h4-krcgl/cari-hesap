/**
 * Payment Controller
 * HTTP request/response işlemleri
 * N-tier mimari kuralı: Sadece request/response burada
 */

const paymentService = require('./paymentService');

/**
 * Borç için tüm ödemeleri getir
 * GET /debts/:debtId/payments
 */
const getPaymentsByDebtId = async (req, res, next) => {
    try {
        const { debtId } = req.params;

        const payments = await paymentService.getPaymentsByDebtId(debtId);

        res.status(200).json({
            success: true,
            count: payments.length,
            data: payments
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Ödeme ekle (Partial payment)
 * POST /payments
 * Body: {
 *   debt_id: int,
 *   amount_paid: decimal,
 *   payment_date: date (YYYY-MM-DD),
 *   payment_method: string (optional),
 *   reference_no: string (optional),
 *   notes: string (optional)
 * }
 */
const addPayment = async (req, res, next) => {
    try {
        const { debt_id, amount_paid, payment_date, payment_method, reference_no, notes } = req.body;

        const result = await paymentService.addPayment({
            debt_id,
            amount_paid,
            payment_date,
            payment_method,
            reference_no,
            notes
        });

        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                payment: result.payment,
                debt: result.debt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Ödemeyi güncelle
 * PUT /payments/:id
 * Body: {
 *   amount_paid: decimal,
 *   payment_date: date,
 *   payment_method: string,
 *   reference_no: string,
 *   notes: string
 * }
 */
const updatePayment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount_paid, payment_date, payment_method, reference_no, notes } = req.body;

        const result = await paymentService.updatePayment(id, {
            amount_paid,
            payment_date,
            payment_method,
            reference_no,
            notes
        });

        res.status(200).json({
            success: true,
            message: 'Ödeme başarıyla güncellendi',
            data: {
                payment: result.payment,
                debt: result.debt
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Ödemeyi sil
 * DELETE /payments/:id
 */
const deletePayment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await paymentService.deletePayment(id);

        res.status(200).json({
            success: true,
            message: result.message,
            data: {
                debt: result.debt
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPaymentsByDebtId,
    addPayment,
    updatePayment,
    deletePayment
};
