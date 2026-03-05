/**
 * Logging Middleware
 * CRUD işlemlerini ve API isteklerini loglayan middleware
 */

const { pool } = require('../config/database');

/**
 * İşlem logla
 * @param {number} userId - Kullanıcı ID
 * @param {string} module - Modül adı (cari, islem, user)
 * @param {string} action - İşlem tipi (CREATE, READ, UPDATE, DELETE)
 * @param {string} tableName - Tablo adı
 * @param {number} recordId - Kayıt ID
 * @param {Object} oldValues - Eski değerler (UPDATE/DELETE için)
 * @param {Object} newValues - Yeni değerler (CREATE/UPDATE için)
 * @param {string} ipAddress - İstemci IP adresi
 * @param {string} userAgent - İstemci User-Agent
 */
const logAction = async (
  userId,
  module,
  action,
  tableName,
  recordId,
  oldValues = null,
  newValues = null,
  ipAddress = '',
  userAgent = ''
) => {
  try {
    const query = `
      INSERT INTO logs (
        user_id,
        module,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      userId || null,
      module,
      action,
      tableName,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      ipAddress,
      userAgent
    ];

    await pool.execute(query, params);
    console.log(`✓ Log kaydedildi: ${module}.${action} (ID: ${recordId})`);
  } catch (error) {
    console.error('✗ Log kaydedilirken hata:', error.message);
    // Hata fırlatma - logging başarısızlığı işlemi engellememeli
  }
};

/**
 * Logging middleware
 * İstek ve cevap bilgilerini kaydeder
 */
const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    };

    // Loglama seviyesine göre farklı renkler (console'da)
    const statusCode = res.statusCode;
    const statusSymbol =
      statusCode >= 500
        ? '✗'
        : statusCode >= 400
          ? '⚠'
          : statusCode >= 300
            ? '→'
            : '✓';

    console.log(
      `${statusSymbol} [${logData.status}] ${logData.method} ${logData.path} (${logData.duration})`
    );
  });

  next();
};

/**
 * Tüm logları getir (filtreleme seçeneği ile)
 * @param {Object} filter - Filtreleme parametreleri
 * @returns {Array} Log kayıtları
 */
const getLogs = async (filter = {}) => {
  try {
    let query = 'SELECT * FROM logs WHERE 1=1';
    const params = [];

    if (filter.module) {
      query += ' AND module = ?';
      params.push(filter.module);
    }

    if (filter.action) {
      query += ' AND action = ?';
      params.push(filter.action);
    }

    if (filter.userId) {
      query += ' AND user_id = ?';
      params.push(filter.userId);
    }

    if (filter.startDate) {
      query += ' AND olusturulma_tarihi >= ?';
      params.push(filter.startDate);
    }

    if (filter.endDate) {
      query += ' AND olusturulma_tarihi <= ?';
      params.push(filter.endDate);
    }

    query += ' ORDER BY olusturulma_tarihi DESC LIMIT ?';
    params.push(filter.limit || 100);

    const [logs] = await pool.execute(query, params);
    return logs;
  } catch (error) {
    console.error('✗ Logları getirirken hata:', error.message);
    throw error;
  }
};

/**
 * Silinmiş kayıtları çıkar (soft delete için yardımcı)
 * @param {string} tableName - Tablo adı
 * @returns {number} Silinen kayıt sayısı
 */
const cleanupDeletedRecords = async (tableName) => {
  try {
    const retentionDays = 90; // 90 gün
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const query = `
      DELETE FROM ${tableName}
      WHERE deleted_at IS NOT NULL AND deleted_at < ?
    `;

    const [result] = await pool.execute(query, [cutoffDate]);
    console.log(
      `✓ ${tableName} tablosundan ${result.affectedRows} eski silinmiş kayıt temizlendi`
    );

    return result.affectedRows;
  } catch (error) {
    console.error('✗ Kayıtları temizlerken hata:', error.message);
    throw error;
  }
};

module.exports = {
  logAction,
  loggingMiddleware,
  getLogs,
  cleanupDeletedRecords
};
