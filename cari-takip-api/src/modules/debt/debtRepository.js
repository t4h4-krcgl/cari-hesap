/**
 * Debt Repository
 * Veritabanı işlemleri (Data access layer)
 * N-tier mimari kuralı: Sadece SQL queries burada
 */

const { pool } = require('../../config/database');

/**
 * Tüm aktif borçları getir
 */
const getAllDebts = async (filters = {}) => {
    try {
        let query = `
      SELECT 
        d.id,
        d.cari_id,
        d.amount,
        d.remaining_amount,
        d.due_date,
        d.status,
        d.description,
        d.created_at,
        d.updated_at,
        c.ad as cari_adi,
        c.email as cari_email,
        c.telefon as cari_telefon
      FROM debts d
      LEFT JOIN cari c ON d.cari_id = c.id
      WHERE d.deleted_at IS NULL
    `;

        const params = [];

        // Filtreler
        if (filters.cari_id) {
            query += ` AND d.cari_id = ?`;
            params.push(filters.cari_id);
        }

        if (filters.status) {
            query += ` AND d.status = ?`;
            params.push(filters.status);
        }

        if (filters.startDate) {
            query += ` AND d.due_date >= ?`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ` AND d.due_date <= ?`;
            params.push(filters.endDate);
        }

        query += ` ORDER BY d.due_date ASC`;

        const [debts] = await pool.execute(query, params);
        return debts;
    } catch (error) {
        throw new Error(`Borçlar getirilemedi: ${error.message}`);
    }
};

/**
 * ID'ye göre borcu getir
 */
const getDebtById = async (id) => {
    try {
        const [debts] = await pool.execute(
            `SELECT 
        d.*,
        c.ad as cari_adi,
        c.email as cari_email
      FROM debts d
      LEFT JOIN cari c ON d.cari_id = c.id
      WHERE d.id = ? AND d.deleted_at IS NULL`,
            [id]
        );

        return debts.length > 0 ? debts[0] : null;
    } catch (error) {
        throw new Error(`Borç getirilemedi: ${error.message}`);
    }
};

/**
 * Yeni borç oluştur
 */
const createDebt = async (debtData) => {
    const { cari_id, amount, due_date, description } = debtData;

    try {
        const [result] = await pool.execute(
            `INSERT INTO debts (cari_id, amount, remaining_amount, due_date, status, description)
       VALUES (?, ?, ?, ?, 'PENDING', ?)`,
            [cari_id, amount, amount, due_date, description || null]
        );

        return await getDebtById(result.insertId);
    } catch (error) {
        throw new Error(`Borç oluşturulamadı: ${error.message}`);
    }
};

/**
 * Borcu güncelle
 */
const updateDebt = async (id, debtData) => {
    const { amount, due_date, description } = debtData;

    try {
        const debt = await getDebtById(id);
        if (!debt) throw new Error('Borç bulunamadı');

        const [result] = await pool.execute(
            `UPDATE debts 
       SET amount = ?, due_date = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
            [amount, due_date, description || null, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Borç güncellenemedi');
        }

        return await getDebtById(id);
    } catch (error) {
        throw new Error(`Borç güncellenemedi: ${error.message}`);
    }
};

/**
 * Borç durumunu güncelle
 */
const updateDebtStatus = async (id, status) => {
    try {
        const [result] = await pool.execute(
            `UPDATE debts 
       SET status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
            [status, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Borç bulunamadı');
        }

        return await getDebtById(id);
    } catch (error) {
        throw new Error(`Borç durumu güncellenemedi: ${error.message}`);
    }
};

/**
 * remaining_amount güncelledikten sonra status kontrolü yap
 */
const updateRemainingAmount = async (id, remainingAmount) => {
    try {
        const debt = await getDebtById(id);
        if (!debt) throw new Error('Borç bulunamadı');

        // remaining_amount 0 veya daha küçükse PAID yap
        const newStatus = remainingAmount <= 0 ? 'PAID' : 'PENDING';

        const [result] = await pool.execute(
            `UPDATE debts 
       SET remaining_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
            [Math.max(0, remainingAmount), newStatus, id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Borç güncellenemedi');
        }

        return await getDebtById(id);
    } catch (error) {
        throw new Error(`Borç tutarı güncellenemedi: ${error.message}`);
    }
};

/**
 * Soft delete - borcu işaretle
 */
const deleteDebt = async (id) => {
    try {
        const debt = await getDebtById(id);
        if (!debt) throw new Error('Borç bulunamadı');

        await pool.execute(
            `UPDATE debts SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?`,
            [id]
        );

        return debt;
    } catch (error) {
        throw new Error(`Borç silinemedi: ${error.message}`);
    }
};

/**
 * Vade geçmiş (overdue) borçları getir
 */
const getOverdueDebts = async () => {
    try {
        const [debts] = await pool.execute(`
      SELECT 
        d.*,
        c.ad as cari_adi,
        c.email as cari_email
      FROM debts d
      LEFT JOIN cari c ON d.cari_id = c.id
      WHERE d.due_date < CURDATE() 
        AND d.remaining_amount > 0
        AND d.deleted_at IS NULL
        AND d.status IN ('PENDING', 'OVERDUE')
      ORDER BY d.due_date ASC
    `);

        return debts;
    } catch (error) {
        throw new Error(`Vade geçmiş borçlar getirilemedi: ${error.message}`);
    }
};

/**
 * Cari'nin toplam kalan borç tutarını getir
 */
const getCariTotalRemainingAmount = async (cariId) => {
    try {
        const [result] = await pool.execute(
            `SELECT SUM(remaining_amount) as total 
       FROM debts 
       WHERE cari_id = ? AND deleted_at IS NULL AND status != 'PAID'`,
            [cariId]
        );

        return result[0]?.total || 0;
    } catch (error) {
        throw new Error(`Cari toplam borç hesaplanamadı: ${error.message}`);
    }
};

module.exports = {
    getAllDebts,
    getDebtById,
    createDebt,
    updateDebt,
    updateDebtStatus,
    updateRemainingAmount,
    deleteDebt,
    getOverdueDebts,
    getCariTotalRemainingAmount
};
