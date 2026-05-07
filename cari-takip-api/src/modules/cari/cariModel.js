/**
 * Cari Model
 * Müşteri/Cari veritabanı işlemleri (Soft delete desteği)
 */

const { pool } = require('../../config/database');

/**
 * Tüm aktif cariler listesini getir
 */
const getAllCari = async () => {
  try {
    const [cariler] = await pool.execute(
      'SELECT * FROM cari WHERE deleted_at IS NULL ORDER BY olusturulma_tarihi DESC'
    );
    return cariler;
  } catch (error) {
    throw new Error(`Cariler getirilemedi: ${error.message}`);
  }
};

/**
 * ID'ye göre cariyi getir
 */
const getCariById = async (id) => {
  try {
    const [cariler] = await pool.execute(
      'SELECT * FROM cari WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return cariler.length > 0 ? cariler[0] : null;
  } catch (error) {
    throw new Error(`Cari ID: ${id} getirilemedi: ${error.message}`);
  }
};

/**
 * Yeni cari oluştur
 */
const createCari = async (cariData) => {
  const { ad, email, telefon, adres, kredi_limiti } = cariData;

  try {
    const [result] = await pool.execute(
      `INSERT INTO cari (ad, email, telefon, adres, kredi_limiti, durum)
       VALUES (?, ?, ?, ?, ?, 'aktif')`,
      [ad, email, telefon, adres, kredi_limiti || 0]
    );

    return await getCariById(result.insertId);
  } catch (error) {
    throw new Error(`Yeni cari oluşturulamadı: ${error.message}`);
  }
};

/**
 * Cariyi güncelle
 */
const updateCari = async (id, cariData) => {
  const { ad, email, telefon, adres, kredi_limiti, durum } = cariData;

  try {
    const [result] = await pool.execute(
      `UPDATE cari 
       SET ad = ?, email = ?, telefon = ?, adres = ?, 
           kredi_limiti = ?, durum = ?, guncellenme_tarihi = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      [ad, email, telefon, adres, kredi_limiti, durum, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Cari bulunamadı');
    }

    return await getCariById(id);
  } catch (error) {
    throw new Error(`Cari güncellenemedi: ${error.message}`);
  }
};

/**
 * Cariyi soft delete (işaretleme)
 */
const deleteCari = async (id) => {
  try {
    const cari = await getCariById(id);
    if (!cari) {
      throw new Error('Cari bulunamadı');
    }

    await pool.execute(
      'UPDATE cari SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    return cari;
  } catch (error) {
    throw new Error(`Cari silinemedi: ${error.message}`);
  }
};

/**
 * Silinmiş cariyi geri al (restore)
 */
const restoreCari = async (id) => {
  try {
    const [result] = await pool.execute(
      'UPDATE cari SET deleted_at = NULL WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Silinmiş cari bulunamadı');
    }

    return await getCariById(id);
  } catch (error) {
    throw new Error(`Cari geri alınamadı: ${error.message}`);
  }
};

/**
 * Cari borç durumunu güncelle
 */
const updateCariBorc = async (id, borc_miktari) => {
  try {
    const [result] = await pool.execute(
      `UPDATE cari 
       SET gecerli_borc = ?, guncellenme_tarihi = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      [borc_miktari, id]
    );

    if (result.affectedRows === 0) {
      throw new Error('Cari bulunamadı');
    }

    return await getCariById(id);
  } catch (error) {
    throw new Error(`Cari borç güncellenemedi: ${error.message}`);
  }
};

module.exports = {
  getAllCari,
  getCariById,
  createCari,
  updateCari,
  deleteCari,
  restoreCari,
  updateCariBorc
};
