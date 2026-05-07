/**
 * Payment Repository
 * Veritabanı işlemleri (Data access layer)
 * N-tier mimari kuralı: Sadece SQL queries burada
 */

const { pool } = require('../../config/database');

/**
 * Belirli bir borç için tüm ödemeleri getir
 */
const getPaymentsByDebtId = async (debtId) => {
    try {
        const [payments] = await pool.execute(
            `SELECT * FROM payments 
       WHERE debt_id = ? 
       ORDER BY payment_date DESC`,
            [debtId]
        );

        return payments;
    } catch (error) {
        throw new Error(`Ödemeler getirilemedi: ${error.message}`);
    }
};

/**
 * Ödeme ID'sine göre getir
 */
const getPaymentById = async (id) => {
    try {
        const [payments] = await pool.execute(
            'SELECT * FROM payments WHERE id = ?',
            [id]
        );

        return payments.length > 0 ? payments[0] : null;
    } catch (error) {
        throw new Error(`Ödeme getirilemedi: ${error.message}`);
    }
};

/**
 * Yeni ödeme oluştur
 * Business logic'te overpayment kontrolü yapılacak
 */
const createPayment = async (paymentData) => {
    const { debt_id, amount_paid, payment_date, payment_method, reference_no, notes } = paymentData;

    try {
        const [result] = await pool.execute(
            `INSERT INTO payments (debt_id, amount_paid, payment_date, payment_method, reference_no, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [debt_id, amount_paid, payment_date, payment_method || null, reference_no || null, notes || null]
        );

        return await getPaymentById(result.insertId);
    } catch (error) {
        throw new Error(`Ödeme oluşturulamadı: ${error.message}`);
    }
};

/**
 * Ödemeyi güncelle
 */
const updatePayment = async (id, paymentData) => {
    const { amount_paid, payment_date, payment_method, reference_no, notes } = paymentData;

    try {
        const [result] = await pool.execute(
            `UPDATE payments 
       SET amount_paid = ?, payment_date = ?, payment_method = ?, 
           reference_no = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
            [amount_paid, payment_date, payment_method || null, reference_no || null, notes || null, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Ödeme bulunamadı');
        }

        return await getPaymentById(id);
    } catch (error) {
        throw new Error(`Ödeme güncellenemedi: ${error.message}`);
    }
};

/**
 * Ödemeyi sil
 */
const deletePayment = async (id) => {
    try {
        const [result] = await pool.execute(
            'DELETE FROM payments WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Ödeme bulunamadı');
        }

        return { message: 'Ödeme başarıyla silindi' };
    } catch (error) {
        throw new Error(`Ödeme silinemedi: ${error.message}`);
    }
};

/**
 * Borç için toplam ödenen tutarı getir
 */
const getTotalPaidByDebtId = async (debtId) => {
    try {
        const [result] = await pool.execute(
            `SELECT SUM(amount_paid) as total FROM payments WHERE debt_id = ?`,
            [debtId]
        );

        return result[0]?.total || 0;
    } catch (error) {
        throw new Error(`Toplam ödeme hesaplanamadı: ${error.message}`);
    }
};

/**
 * Cari'nin tüm ödemelerini getir
 */
const getPaymentsByCarıId = async (cariId) => {
    try {
        const [payments] = await pool.execute(
            `SELECT p.* FROM payments p
       INNER JOIN debts d ON p.debt_id = d.id
       WHERE d.cari_id = ?
       ORDER BY p.payment_date DESC`,
            [cariId]
        );

        return payments;
    } catch (error) {
        throw new Error(`Cari ödemeleri getirilemedi: ${error.message}`);
    }
};

module.exports = {
    getPaymentsByDebtId,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getTotalPaidByDebtId,
    getPaymentsByCarıId
};
