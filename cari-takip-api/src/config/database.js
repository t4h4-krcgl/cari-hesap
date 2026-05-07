/**
 * Veritabanı Konfigürasyonu
 * MySQL bağlantı ayarları ve pool yönetimi
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL bağlantı havuzu (connection pool) oluştur
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'cari_user',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'cari_takip_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true // return DECIMAL as numbers instead of strings
});

// Basit bağlantı kontrolü
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✓ MySQL veritabanına başarıyla bağlandı');
    conn.release();
  } catch (err) {
    console.error('✗ MySQL bağlantı hatası:', err.message);
  }
});

/**
 * Veritabanı tabloları oluştur
 * User, Cari, İşlem ve Logs tablolarının schema'sını hazırla (MySQL uyumlu)
 */
const initializeDatabase = async () => {
  try {
    // User (Kullanıcı) tablosu - İlk oluşturulacak
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS user (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kullanici_adi VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        sifre VARCHAR(255) NOT NULL,
        ad_soyad VARCHAR(100),
        rol ENUM('admin', 'user') DEFAULT 'user',
        durum VARCHAR(20) DEFAULT 'aktif',
        son_giris_tarihi TIMESTAMP DEFAULT NULL,
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL
      ) ENGINE=InnoDB;
    `);

    // Cari (Müşteri) tablosu - Soft delete desteği ekle
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cari (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ad VARCHAR(100) NOT NULL,
        email VARCHAR(100),
        telefon VARCHAR(20),
        adres VARCHAR(255),
        kredi_limiti DECIMAL(12, 2) DEFAULT 0,
        gecerli_borc DECIMAL(12, 2) DEFAULT 0,
        durum VARCHAR(20) DEFAULT 'aktif',
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_deleted (deleted_at)
      ) ENGINE=InnoDB;
    `);

    // İslem (Borç/Ödeme) tablosu - Soft delete desteği ekle
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS islem (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cari_id INT NOT NULL,
        type ENUM('borc','odeme') NOT NULL,
        miktar DECIMAL(12, 2) NOT NULL,
        birim ENUM('TL','USD','Altin') NOT NULL,
        aciklama VARCHAR(255),
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (cari_id) REFERENCES cari(id) ON DELETE CASCADE,
        INDEX idx_deleted (deleted_at),
        INDEX idx_tarih (olusturulma_tarihi)
      ) ENGINE=InnoDB;
    `);

    // Log (İşlem Geçmişi) tablosu
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        module VARCHAR(50) NOT NULL,
        action VARCHAR(50) NOT NULL,
        table_name VARCHAR(50),
        record_id INT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(50),
        user_agent VARCHAR(255),
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL,
        INDEX idx_module_action (module, action),
        INDEX idx_tarih (olusturulma_tarihi)
      ) ENGINE=InnoDB;
    `);

    console.log('✓ Tüm veritabanı tabloları başarıyla oluşturuldu veya zaten mevcut');
  } catch (error) {
    console.error('✗ Veritabanı tablolarını oluştururken hata:', error.message);
    process.exit(1);
  }
};

// Veritabanı sorgusu çalıştır
const query = async (text, params) => {
  const start = Date.now();
  try {
    const [rows] = await pool.execute(text, params);
    const duration = Date.now() - start;
    let rowCount = 0;
    let insertId = null;

    if (Array.isArray(rows)) {
      rowCount = rows.length;
    } else if (rows && typeof rows.affectedRows === 'number') {
      rowCount = rows.affectedRows;
      insertId = rows.insertId || null;
    }

    console.log('✓ Sorgu başarıyla çalıştırıldı:', { text, duration, rowCount, insertId });
    return { rows, rowCount, insertId };
  } catch (error) {
    console.error('✗ Sorgu Hatası:', { text, error: error.message });
    throw error;
  }
};

module.exports = {
  pool,
  query,
  initializeDatabase
};
