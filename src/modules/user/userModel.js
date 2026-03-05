/**
 * User Model
 * Veritabanı işlemleri için User tablosu ile iletişim kurar
 */

const { pool } = require('../../config/database');
const bcrypt = require('bcryptjs');

/**
 * Yeni kullanıcı oluştur
 * @param {Object} userData - Kullanıcı verileri
 * @returns {Object} Oluşturulan kullanıcı
 */
const createUser = async (userData) => {
  const { kullanici_adi, email, sifre, ad_soyad, rol = 'user' } = userData;

  // Şifreyi hash'le
  const hashedPassword = await bcrypt.hash(sifre, 10);

  try {
    const query = `
      INSERT INTO user (kullanici_adi, email, sifre, ad_soyad, rol, durum)
      VALUES (?, ?, ?, ?, ?, 'aktif')
    `;

    const [result] = await pool.execute(query, [
      kullanici_adi,
      email,
      hashedPassword,
      ad_soyad || null,
      rol
    ]);

    return {
      id: result.insertId,
      kullanici_adi,
      email,
      ad_soyad: ad_soyad || null,
      rol,
      durum: 'aktif'
    };
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('kullanici_adi')) {
        throw new Error('Bu kullanıcı adı zaten kayıtlıdır');
      } else if (error.message.includes('email')) {
        throw new Error('Bu email zaten kayıtlıdır');
      }
    }
    throw error;
  }
};

/**
 * Tüm kullanıcıları getir
 * @returns {Array} Kullanıcı listesi
 */
const getAllUsers = async () => {
  try {
    const query = `
      SELECT id, kullanici_adi, email, ad_soyad, rol, durum, son_giris_tarihi, olusturulma_tarihi
      FROM user
      WHERE deleted_at IS NULL
      ORDER BY olusturulma_tarihi DESC
    `;

    const [users] = await pool.execute(query);
    return users;
  } catch (error) {
    throw error;
  }
};

/**
 * Kullanıcıyı ID'ye göre getir
 * @param {number} id - Kullanıcı ID
 * @returns {Object} Kullanıcı verileri
 */
const getUserById = async (id) => {
  try {
    const query = `
      SELECT id, kullanici_adi, email, ad_soyad, rol, durum, son_giris_tarihi, olusturulma_tarihi
      FROM user
      WHERE id = ? AND deleted_at IS NULL
    `;

    const [users] = await pool.execute(query, [id]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Kullanıcıyı kullanıcı adına göre getir
 * @param {string} username - Kullanıcı adı
 * @returns {Object} Kullanıcı verileri (şifreyi içerir)
 */
const getUserByUsername = async (username) => {
  try {
    const query = `
      SELECT id, kullanici_adi, email, sifre, ad_soyad, rol, durum, son_giris_tarihi
      FROM user
      WHERE kullanici_adi = ? AND deleted_at IS NULL
    `;

    const [users] = await pool.execute(query, [username]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Kullanıcıyı email'e göre getir
 * @param {string} email - Email adresi
 * @returns {Object} Kullanıcı verileri
 */
const getUserByEmail = async (email) => {
  try {
    const query = `
      SELECT id, kullanici_adi, email, ad_soyad, rol, durum, son_giris_tarihi, olusturulma_tarihi
      FROM user
      WHERE email = ? AND deleted_at IS NULL
    `;

    const [users] = await pool.execute(query, [email]);
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    throw error;
  }
};

/**
 * Şifreyi doğrula
 * @param {string} plainPassword - Düz şifre
 * @param {string} hashedPassword - Hash'lenmiş şifre
 * @returns {boolean} Doğrulama sonucu
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Kullanıcıyı güncelle
 * @param {number} id - Kullanıcı ID
 * @param {Object} updateData - Güncellenecek verileri
 * @returns {Object} Güncellenmiş kullanıcı
 */
const updateUser = async (id, updateData) => {
  const allowedFields = ['ad_soyad', 'email', 'rol', 'durum'];
  const updates = {};

  for (const key of allowedFields) {
    if (updateData[key] !== undefined) {
      updates[key] = updateData[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('Güncellenecek alan bulunamadı');
  }

  const setClauses = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = [...Object.values(updates), id];

  try {
    const query = `
      UPDATE user
      SET ${setClauses}, guncellenme_tarihi = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;

    const [result] = await pool.execute(query, values);

    if (result.affectedRows === 0) {
      throw new Error('Kullanıcı bulunamadı');
    }

    return getUserById(id);
  } catch (error) {
    throw error;
  }
};

/**
 * Şifreyi değiştir
 * @param {number} id - Kullanıcı ID
 * @param {string} newPassword - Yeni şиферe
 * @returns {boolean} Başarılı mı
 */
const changePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const query = `
      UPDATE user
      SET sifre = ?, guncellenme_tarihi = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;

    const [result] = await pool.execute(query, [hashedPassword, id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Son giriş zamanını güncelle
 * @param {number} id - Kullanıcı ID
 * @returns {boolean} Başarılı mı
 */
const updateLastLogin = async (id) => {
  try {
    const query = `
      UPDATE user
      SET son_giris_tarihi = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Kullanıcıyı soft delete (silme işareti)
 * @param {number} id - Kullanıcı ID
 * @returns {boolean} Başarılı mı
 */
const deleteUser = async (id) => {
  try {
    const query = `
      UPDATE user
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ? AND deleted_at IS NULL
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

/**
 * Silinmiş kullanıcıyı geri al (restore)
 * @param {number} id - Kullanıcı ID
 * @returns {boolean} Başarılı mı
 */
const restoreUser = async (id) => {
  try {
    const query = `
      UPDATE user
      SET deleted_at = NULL
      WHERE id = ? AND deleted_at IS NOT NULL
    `;

    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  verifyPassword,
  updateUser,
  changePassword,
  updateLastLogin,
  deleteUser,
  restoreUser
};
