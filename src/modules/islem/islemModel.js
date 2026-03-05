/**
 * İşlem Model
 * Borç/Ödeme işlem yönetimi (Soft delete + filtreleme desteği)
 * Desteklenen birimler: TL, USD, Altın
 */

const { pool } = require('../../config/database');

const VALID_CURRENCIES = ['TL', 'USD', 'Altin'];

/**
 * Verilen cari ID'nin tüm aktif işlemlerini getir
 */
const getIslemByCariId = async (cariId) => {
  try {
    const [islemler] = await pool.execute(
      `SELECT * FROM islem WHERE cari_id = ? AND deleted_at IS NULL ORDER BY olusturulma_tarihi DESC`,
      [cariId]
    );
    return islemler;
  } catch (error) {
    throw new Error(`İşlemler getirilemedi: ${error.message}`);
  }
};

/**
 * ID'ye göre tek işlemi getir
 */
const getIslemById = async (id) => {
  try {
    const [islemler] = await pool.execute(
      'SELECT * FROM islem WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return islemler.length > 0 ? islemler[0] : null;
  } catch (error) {
    throw new Error(`İşlem ID: ${id} getirilemedi: ${error.message}`);
  }
};

/**
 * Yeni işlem oluştur (borç veya ödeme)
 * type: 'borc' veya 'odeme'
 * birim: 'TL', 'USD' veya 'Altin'
 */
const createIslem = async (islemData) => {
  const { cari_id, type, miktar, birim, aciklama } = islemData;

  // Birim geçerliliğini kontrol et
  if (!VALID_CURRENCIES.includes(birim)) {
    throw new Error(`Geçersiz birim: ${birim}. Geçerli birimler: ${VALID_CURRENCIES.join(', ')}`);
  }

  // İşlem türünü kontrol et
  if (!['borc', 'odeme'].includes(type)) {
    throw new Error('İşlem türü "borc" veya "odeme" olmalıdır');
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO islem (cari_id, type, miktar, birim, aciklama)
       VALUES (?, ?, ?, ?, ?)`,
      [cari_id, type, miktar, birim, aciklama]
    );

    return await getIslemById(result.insertId);
  } catch (error) {
    throw new Error(`Yeni işlem oluşturulamadı: ${error.message}`);
  }
};

/**
 * İşlemi güncelle
 */
const updateIslem = async (id, islemData) => {
  const { type, miktar, birim, aciklama } = islemData;

  // Birim geçerliliğini kontrol et
  if (birim && !VALID_CURRENCIES.includes(birim)) {
    throw new Error(`Geçersiz birim: ${birim}. Geçerli birimler: ${VALID_CURRENCIES.join(', ')}`);
  }

  try {
    const [result] = await pool.execute(
      `UPDATE islem 
       SET type = ?, miktar = ?, birim = ?, aciklama = ?, guncellenme_tarihi = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      [type, miktar, birim, aciklama, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('İşlem bulunamadı');
    }

    return await getIslemById(id);
  } catch (error) {
    throw new Error(`İşlem güncellenemedi: ${error.message}`);
  }
};

/**
 * İşlemi soft delete (işaretleme)
 */
const deleteIslem = async (id) => {
  try {
    const islem = await getIslemById(id);
    if (!islem) {
      throw new Error('İşlem bulunamadı');
    }

    await pool.execute(
      'UPDATE islem SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return islem;
  } catch (error) {
    throw new Error(`İşlem silinemedi: ${error.message}`);
  }
};

/**
 * Silinmiş işlemi geri al (restore)
 */
const restoreIslem = async (id) => {
  try {
    const [result] = await pool.execute(
      'UPDATE islem SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Silinmiş işlem bulunamadı');
    }

    return await getIslemById(id);
  } catch (error) {
    throw new Error(`İşlem geri alınamadı: ${error.message}`);
  }
};

/**
 * Cari için toplam borç ve ödemeleri hesapla (birime göre)
 */
const calculateBorcToplam = async (cariId) => {
  try {
    const [results] = await pool.execute(
      `SELECT 
        birim,
        SUM(CASE WHEN type = 'borc' THEN miktar ELSE 0 END) as toplam_borc,
        SUM(CASE WHEN type = 'odeme' THEN miktar ELSE 0 END) as toplam_odeme
       FROM islem
       WHERE cari_id = ? AND deleted_at IS NULL
       GROUP BY birim`,
      [cariId]
    );
    return results;
  } catch (error) {
    throw new Error(`Borç hesaplanamadı: ${error.message}`);
  }
};

/**
 * İstatistikler ile borç hesapla
 */
const calculateBorcWithStats = async (cariId) => {
  try {
    const [results] = await pool.execute(
      `SELECT 
        birim,
        COUNT(*) as islem_sayisi,
        SUM(CASE WHEN type = 'borc' THEN miktar ELSE 0 END) as toplam_borc,
        SUM(CASE WHEN type = 'odeme' THEN miktar ELSE 0 END) as toplam_odeme
       FROM islem
       WHERE cari_id = ? AND deleted_at IS NULL
       GROUP BY birim`,
      [cariId]
    );
    return results;
  } catch (error) {
    throw new Error(`Borç istatistikleri hesaplanamadı: ${error.message}`);
  }
};

/**
 * Filtrelenmiş işlemler getir
 * Filtreleme seçenekleri: type, birim, startDate, endDate, cariId
 */
const getIslemWithFilter = async (filters = {}, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM islem WHERE deleted_at IS NULL';
  const params = [];

  if (filters.cariId) {
    query += ' AND cari_id = ?';
    params.push(filters.cariId);
  }

  if (filters.type && ['borc', 'odeme'].includes(filters.type)) {
    query += ' AND type = ?';
    params.push(filters.type);
  }

  if (filters.birim && VALID_CURRENCIES.includes(filters.birim)) {
    query += ' AND birim = ?';
    params.push(filters.birim);
  }

  if (filters.startDate) {
    query += ' AND DATE(olusturulma_tarihi) >= ?';
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    query += ' AND DATE(olusturulma_tarihi) <= ?';
    params.push(filters.endDate);
  }

  // Sayfa
  const countQuery = query.replace(/SELECT \*/, 'SELECT COUNT(*) as total');
  const [countResult] = await pool.execute(countQuery, params);
  const total = countResult[0].total;

  // Veri
  query += ' ORDER BY olusturulma_tarihi DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const [islemler] = await pool.execute(query, params);

  return {
    data: islemler,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Tüm işlemleri listele (sayfalama ile)
 */
const getAllIslem = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  try {
    const [islemler] = await pool.execute(
      `SELECT * FROM islem 
       WHERE deleted_at IS NULL
       ORDER BY olusturulma_tarihi DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM islem WHERE deleted_at IS NULL'
    );
    const total = countResult[0].total;

    return {
      data: islemler,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`İşlemler getirilemedi: ${error.message}`);
  }
};

module.exports = {
  getIslemByCariId,
  getIslemById,
  createIslem,
  updateIslem,
  deleteIslem,
  restoreIslem,
  calculateBorcToplam,
  calculateBorcWithStats,
  getIslemWithFilter,
  getAllIslem,
  VALID_CURRENCIES
};
