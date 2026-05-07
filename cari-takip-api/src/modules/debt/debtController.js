/**
 * Debt Controller
 * HTTP request/response işlemleri
 * N-tier mimari kuralı: Sadece request/response burada
 */

const debtService = require('./debtService');

/**
 * Tüm borçları getir
 * GET /debts?cari_id=1&status=PENDING&startDate=2024-01-01&endDate=2024-12-31
 */
const getAllDebts = async (req, res, next) => {
    try {
        const filters = {
            cari_id: req.query.cari_id,
            status: req.query.status,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const debts = await debtService.getAllDebts(filters);

        res.status(200).json({
            success: true,
            count: debts.length,
            data: debts
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Borcu ID ile getir (ilgili ödemeleri de getir)
 * GET /debts/:id
 */
const getDebtById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const debt = await debtService.getDebtWithPayments(id);

        res.status(200).json({
            success: true,
            data: debt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Yeni borç oluştur
 * POST /debts
 * Body: {
 *   cari_id: int,
 *   amount: decimal,
 *   due_date: date (YYYY-MM-DD),
 *   description: string (optional)
 * }
 */
const createDebt = async (req, res, next) => {
    try {
        const { cari_id, amount, due_date, description } = req.body;

        const newDebt = await debtService.createDebt({
            cari_id,
            amount,
            due_date,
            description
        });

        res.status(201).json({
            success: true,
            message: 'Borç başarıyla oluşturuldu',
            data: newDebt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Borcu güncelle
 * PUT /debts/:id
 * Body: {
 *   amount: decimal,
 *   due_date: date,
 *   description: string
 * }
 */
const updateDebt = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount, due_date, description } = req.body;

        const updatedDebt = await debtService.updateDebt(id, {
            amount,
            due_date,
            description
        });

        res.status(200).json({
            success: true,
            message: 'Borç başarıyla güncellendi',
            data: updatedDebt
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Borcu sil
 * DELETE /debts/:id
 */
const deleteDebt = async (req, res, next) => {
    try {
        const { id } = req.params;

        await debtService.deleteDebt(id);

        res.status(200).json({
            success: true,
            message: 'Borç başarıyla silindi'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllDebts,
    getDebtById,
    createDebt,
    updateDebt,
    deleteDebt
};
