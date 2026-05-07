/**
 * Payment Service
 * Business logic: Partial payment, overpayment control
 * N-tier mimari kuralı: Tüm business logic burada
 */

const paymentRepository = require('./paymentRepository');
const debtRepository = require('../debt/debtRepository');

/**
 * Borç için tüm ödemeleri getir
 */
const getPaymentsByDebtId = async (debtId) => {
    try {
        const debt = await debtRepository.getDebtById(debtId);
        if (!debt) throw new Error('Borç bulunamadı');

        return await paymentRepository.getPaymentsByDebtId(debtId);
    } catch (error) {
        throw error;
    }
};

/**
 * Ödeme ekle (CRITICAL BUSINESS LOGIC)
 * Rules:
 * 1. remaining_amount >= payment_amount (overpayment yasak)
 * 2. Ödeme eklendikten sonra remaining_amount güncelle
 * 3. remaining_amount == 0 → status = PAID
 */
const addPayment = async (paymentData) => {
    try {
        const { debt_id, amount_paid, payment_date, payment_method, reference_no, notes } = paymentData;

        // Validasyon
        if (!debt_id || !amount_paid || !payment_date) {
            throw new Error('Gerekli alanlar eksik: debt_id, amount_paid, payment_date');
        }

        if (amount_paid <= 0) {
            throw new Error('Ödeme tutarı 0\'dan büyük olmalıdır');
        }

        // Borç kontrolü
        const debt = await debtRepository.getDebtById(debt_id);
        if (!debt) throw new Error('Borç bulunamadı');

        if (debt.status === 'PAID') {
            throw new Error('Bu borç zaten ödendi');
        }

        // ⚠️ CRITICAL: Overpayment kontrolü
        if (amount_paid > debt.remaining_amount) {
            throw new Error(
                `Ödeme tutarı (${amount_paid}) kalan borçtan (${debt.remaining_amount}) fazla olamaz`
            );
        }

        // Ödemeyi oluştur
        const payment = await paymentRepository.createPayment({
            debt_id,
            amount_paid,
            payment_date,
            payment_method,
            reference_no,
            notes
        });

        // Yeni remaining_amount hesapla
        const newRemainingAmount = debt.remaining_amount - amount_paid;

        // remaining_amount'ı güncelle (status otomatik kontrol edilecek)
        const updatedDebt = await debtRepository.updateRemainingAmount(debt_id, newRemainingAmount);

        return {
            payment,
            debt: updatedDebt,
            message: updatedDebt.status === 'PAID'
                ? 'Ödeme başarıyla eklendi, borç tamamen ödendi'
                : 'Ödeme başarıyla eklendi'
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Ödemeyi güncelle (ve remaining_amount'ı yeniden hesapla)
 */
const updatePayment = async (paymentId, paymentData) => {
    try {
        const oldPayment = await paymentRepository.getPaymentById(paymentId);
        if (!oldPayment) throw new Error('Ödeme bulunamadı');

        const debt = await debtRepository.getDebtById(oldPayment.debt_id);
        if (!debt) throw new Error('Borç bulunamadı');

        // Yeni tutarı kontrol et
        const { amount_paid } = paymentData;
        if (amount_paid <= 0) {
            throw new Error('Ödeme tutarı 0\'dan büyük olmalıdır');
        }

        // Fark hesapla
        const difference = amount_paid - oldPayment.amount_paid;

        // Overpayment kontrolü
        if (debt.remaining_amount - difference < 0) {
            throw new Error(
                `Yeni ödeme tutarı (${amount_paid}) kalan borçtan (${debt.remaining_amount + oldPayment.amount_paid}) fazla olamaz`
            );
        }

        // Ödemeyi güncelle
        const updatedPayment = await paymentRepository.updatePayment(paymentId, paymentData);

        // remaining_amount'ı yeniden hesapla
        const totalPaid = await paymentRepository.getTotalPaidByDebtId(debt.id);
        const newRemainingAmount = debt.amount - totalPaid;

        const updatedDebt = await debtRepository.updateRemainingAmount(debt.id, newRemainingAmount);

        return {
            payment: updatedPayment,
            debt: updatedDebt
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Ödemeyi sil (ve remaining_amount'ı yeniden hesapla)
 */
const deletePayment = async (paymentId) => {
    try {
        const payment = await paymentRepository.getPaymentById(paymentId);
        if (!payment) throw new Error('Ödeme bulunamadı');

        const debt = await debtRepository.getDebtById(payment.debt_id);
        if (!debt) throw new Error('Borç bulunamadı');

        // Ödemeyi sil
        await paymentRepository.deletePayment(paymentId);

        // remaining_amount'ı yeniden hesapla
        const totalPaid = await paymentRepository.getTotalPaidByDebtId(debt.id);
        const newRemainingAmount = debt.amount - totalPaid;

        const updatedDebt = await debtRepository.updateRemainingAmount(debt.id, newRemainingAmount);

        return {
            message: 'Ödeme başarıyla silindi',
            debt: updatedDebt
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getPaymentsByDebtId,
    addPayment,
    updatePayment,
    deletePayment
};
