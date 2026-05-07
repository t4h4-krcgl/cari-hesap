/**
 * Demo Users Seed
 * Frontend'deki örnek hesapları veritabanına ekler.
 * Mevcut kullanıcıları ezmez, sadece yoksa oluşturur.
 */

const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const DEMO_USERS = [
    {
        kullanici_adi: 'admin',
        email: 'admin@cari-takip.local',
        sifre: '123456',
        ad_soyad: 'Demo Admin',
        rol: 'admin'
    },
    {
        kullanici_adi: 'user',
        email: 'user@cari-takip.local',
        sifre: '123456',
        ad_soyad: 'Demo User',
        rol: 'user'
    }
];

const seedDemoUsers = async () => {
    for (const demoUser of DEMO_USERS) {
        const [existingUsers] = await pool.execute(
            'SELECT id FROM user WHERE kullanici_adi = ? OR email = ? LIMIT 1',
            [demoUser.kullanici_adi, demoUser.email]
        );

        if (existingUsers.length > 0) {
            console.log(`✓ Demo kullanıcı zaten mevcut: ${demoUser.kullanici_adi}`);
            continue;
        }

        const hashedPassword = await bcrypt.hash(demoUser.sifre, 10);

        await pool.execute(
            `INSERT INTO user (kullanici_adi, email, sifre, ad_soyad, rol, durum)
       VALUES (?, ?, ?, ?, ?, 'aktif')`,
            [
                demoUser.kullanici_adi,
                demoUser.email,
                hashedPassword,
                demoUser.ad_soyad,
                demoUser.rol
            ]
        );

        console.log(`✓ Demo kullanıcı oluşturuldu: ${demoUser.kullanici_adi}`);
    }
};

if (require.main === module) {
    seedDemoUsers()
        .then(() => {
            console.log('✅ Demo kullanıcı seed tamamlandı');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Demo kullanıcı seed hatası:', error.message);
            process.exit(1);
        });
}

module.exports = { seedDemoUsers };