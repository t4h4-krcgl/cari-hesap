/**
 * V2 Migration Script
 * Debts ve Payments tabloları ekle (Backward compatible)
 * Çalıştırma: npm run migrate
 */

const { pool } = require('../config/database');
require('dotenv').config();

const migrate = async () => {
    try {
        console.log('🔄 Migration başlıyor...\n');

        // 1. Debts tablosu oluştur
        console.log('📝 Debts tablosu oluşturuluyor...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS debts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cari_id INT NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        remaining_amount DECIMAL(12, 2) NOT NULL,
        due_date DATE NOT NULL,
        status ENUM('PENDING', 'PAID', 'OVERDUE') DEFAULT 'PENDING',
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL DEFAULT NULL,
        FOREIGN KEY (cari_id) REFERENCES cari(id) ON DELETE CASCADE,
        INDEX idx_cari (cari_id),
        INDEX idx_status (status),
        INDEX idx_due_date (due_date),
        INDEX idx_deleted (deleted_at)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Debts tablosu oluşturuldu\n');

        // 2. Payments tablosu oluştur
        console.log('📝 Payments tablosu oluşturuluyor...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        debt_id INT NOT NULL,
        amount_paid DECIMAL(12, 2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_method VARCHAR(50),
        reference_no VARCHAR(100),
        notes VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
        INDEX idx_debt (debt_id),
        INDEX idx_payment_date (payment_date)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Payments tablosu oluşturuldu\n');

        // 3. Notifications tablosu oluştur (optional)
        console.log('📝 Notifications tablosu oluşturuluyor...');
        await pool.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        debt_id INT,
        message VARCHAR(500) NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE CASCADE,
        INDEX idx_read (is_read),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB;
    `);
        console.log('✓ Notifications tablosu oluşturuldu\n');

        // 4. Cari tablosuna remaining_amount kolonunu ekle (eğer yoksa)
        console.log('📝 Cari tablosu kontrol ediliyor...');
        try {
            // Kolonun varlığını kontrol et
            const [columns] = await pool.execute(
                `SHOW COLUMNS FROM cari WHERE Field = 'total_remaining_amount'`
            );

            if (columns.length === 0) {
                await pool.execute(`
          ALTER TABLE cari 
          ADD COLUMN total_remaining_amount DECIMAL(12, 2) DEFAULT 0
        `);
                console.log('✓ total_remaining_amount kolonu eklendi\n');
            } else {
                console.log('✓ total_remaining_amount kolonu zaten mevcut\n');
            }
        } catch (error) {
            console.log('ℹ️ Cari tablosu check hatası (devam ediliyor):', error.message, '\n');
        }

        console.log('✅ Migration başarıyla tamamlandı!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration hatası:', error.message);
        process.exit(1);
    }
};

migrate();
