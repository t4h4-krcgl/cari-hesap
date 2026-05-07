/**
 * Debt Service
 * Business logic ve veri validasyonu
 * N-tier mimari kuralı: Tüm business logic burada
 */

const debtRepository = require('./debtRepository');
const paymentRepository = require('../payment/paymentRepository');
const cariModel = require('../cari/cariModel');

/**
 * Tüm borçları getir (filtreleme ile)
 */
const getAllDebts = async (filters = {}) => {
    try {
        return await debtRepository.getAllDebts(filters);
    } catch (error) {
        throw error;
    }
};

/**
 * Borcu ID ile getir (ilgili ödemeleri de getir)
 */
const getDebtWithPayments = async (debtId) => {
    try {
        const debt = await debtRepository.getDebtById(debtId);
        if (!debt) throw new Error('Borç bulunamadı');

        const payments = await paymentRepository.getPaymentsByDebtId(debtId);

        return {
            ...debt,
            payments,
            payment_count: payments.length,
            total_paid: payments.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0)
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Yeni borç oluştur
 */
const createDebt = async (debtData) => {
    try {
        const { cari_id, amount, due_date, description } = debtData;

        // Validasyon
        if (!cari_id || !amount || !due_date) {
            throw new Error('Gerekli alanlar eksik: cari_id, amount, due_date');
        }

        if (amount <= 0) {
            throw new Error('Borç tutarı 0\'dan büyük olmalıdır');
        }

        // Cari kontrolü
        const cari = await cariModel.getCariById(cari_id);
        if (!cari) throw new Error('Cari bulunamadı');

        const newDebt = await debtRepository.createDebt(debtData);

        // Cari'nin toplam borç tutarını güncelle
        await updateCariTotalDebt(cari_id);

        return newDebt;
    } catch (error) {
        throw error;
    }
};

/**
 * Borcu güncelle
 */
const updateDebt = async (debtId, debtData) => {
    try {
        const debt = await debtRepository.getDebtById(debtId);
        if (!debt) throw new Error('Borç bulunamadı');

        const updatedDebt = await debtRepository.updateDebt(debtId, debtData);

        // Cari'nin toplam borç tutarını güncelle
        await updateCariTotalDebt(debt.cari_id);

        return updatedDebt;
    } catch (error) {
        throw error;
    }
};

/**
 * Borcu sil (Soft delete)
 */
const deleteDebt = async (debtId) => {
    try {
        const debt = await debtRepository.getDebtById(debtId);
        if (!debt) throw new Error('Borç bulunamadı');

        await debtRepository.deleteDebt(debtId);

        // Cari'nin toplam borç tutarını güncelle
        await updateCariTotalDebt(debt.cari_id);

        return { message: 'Borç başarıyla silindi' };
    } catch (error) {
        throw error;
    }
};

/**
 * Cari'nin toplam borç tutarını güncelle
 */
const updateCariTotalDebt = async (cariId) => {
    try {
        const totalRemaining = await debtRepository.getCariTotalRemainingAmount(cariId);
        // updateCariBorc V2 total_remaining_amount'ı günceller
        await cariModel.updateCariBorc(cariId, totalRemaining);
    } catch (error) {
        console.error('Cari toplam borç güncellemesi başarısız:', error.message);
        // Bu hatayı göz ardı et, işlem devam etsin
    }
};

/**
 * Vade geçmiş borçları getir ve OVERDUE status'una güncelle
 */
const checkAndUpdateOverdueDebts = async () => {
    try {
        const overdebts = await debtRepository.getOverdueDebts();

        for (const debt of overdebts) {
            if (debt.status !== 'OVERDUE') {
                await debtRepository.updateDebtStatus(debt.id, 'OVERDUE');
            }
        }

        console.log(`✓ ${overdebts.length} borç OVERDUE olarak işaretlendi`);
        return overdebts;
    } catch (error) {
        console.error('Overdue borçlar güncellenemedi:', error.message);
        throw error;
    }
};

module.exports = {
    getAllDebts,
    getDebtWithPayments,
    createDebt,
    updateDebt,
    deleteDebt,
    checkAndUpdateOverdueDebts,
    updateCariTotalDebt
};
