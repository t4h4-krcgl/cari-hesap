/**
 * Soft Delete Helper
 * Soft delete işlemleri için yardımcı fonksiyonlar
 */

/**
 * Kayıt silmeyi kontrol et (soft delete)
 * @param {Object} pool - Veritabanı bağlantısı
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID
 * @returns {Object} Sonuç
 */
const deleteRecord = async (pool, tableName, recordId) => {
  try {
    const query = `
      UPDATE ${tableName}
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;

    const [result] = await pool.execute(query, [recordId]);

    return {
      success: result.affectedRows > 0,
      affected: result.affectedRows
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Silinmiş kaydı geri al (restore)
 * @param {Object} pool - Veritabanı bağlantısı
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID
 * @returns {Object} Sonuç
 */
const restoreRecord = async (pool, tableName, recordId) => {
  try {
    const query = `
      UPDATE ${tableName}
      SET deleted_at = NULL
      WHERE id = ? AND deleted_at IS NOT NULL
    `;

    const [result] = await pool.execute(query, [recordId]);

    return {
      success: result.affectedRows > 0,
      affected: result.affectedRows
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Silinmiş kaydı kalıcı olarak sil
 * @param {Object} pool - Veritabanı bağlantısı
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID
 * @returns {Object} Sonuç
 */
const permanentlyDeleteRecord = async (pool, tableName, recordId) => {
  try {
    const query = `DELETE FROM ${tableName} WHERE id = ? AND deleted_at IS NOT NULL`;
    const [result] = await pool.execute(query, [recordId]);

    return {
      success: result.affectedRows > 0,
      affected: result.affectedRows
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Aktif kayıtları getir (deleted_at IS NULL)
 * @param {Object} pool - Veritabanı bağlantısı
 * @param {string} tableName - Tablo adı
 * @returns {Array} Aktif kayıtlar
 */
const getActiveRecords = async (pool, tableName) => {
  try {
    const query = `SELECT * FROM ${tableName} WHERE deleted_at IS NULL ORDER BY olusturulma_tarihi DESC`;
    const [records] = await pool.execute(query);
    return records;
  } catch (error) {
    throw error;
  }
};

/**
 * Silinmiş kayıtları getir (deleted_at IS NOT NULL)
 * @param {Object} pool - Veritabanı bağlantısı
 * @param {string} tableName - Tablo adı
 * @returns {Array} Silinmiş kayıtlar
 */
const getDeletedRecords = async (pool, tableName) => {
  try {
    const query = `SELECT * FROM ${tableName} WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC`;
    const [records] = await pool.execute(query);
    return records;
  } catch (error) {
    throw error;
  }
};

/**
 * ID'ye göre aktif kayıt getir
 * @param {Object} pool - Veritabanı bağlantısı
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID
 * @returns {Object} Kayıt verileri
 */
const getActiveRecordById = async (pool, tableName, recordId) => {
  try {
    const query = `SELECT * FROM ${tableName} WHERE id = ? AND deleted_at IS NULL`;
    const [records] = await pool.execute(query, [recordId]);
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  deleteRecord,
  restoreRecord,
  permanentlyDeleteRecord,
  getActiveRecords,
  getDeletedRecords,
  getActiveRecordById
};
