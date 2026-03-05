/**
 * Sunucu Başlatma Dosyası
 * Express uygulamasını başlat ve dinle
 */

require('dotenv').config();
const app = require('./src/app');
const { pool, initializeDatabase } = require('./src/config/database');

// Sunucu konfigürasyonu
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

/**
 * Sunucuyu başlat
 */
const startServer = async () => {
  try {
    // Veritabanı tablolarını oluştur
    await initializeDatabase();

    // Express sunucusunu başlat
    const server = app.listen(PORT, HOST, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════╗');
      console.log('║   🚀 Cari Takip API\'si Başarıyla Başlatıldı   ║');
      console.log('╚════════════════════════════════════════════════╝');
      console.log('');
      console.log(`📍 Host: http://${HOST}:${PORT}`);
      console.log(`🔗 API Health: http://${HOST}:${PORT}/api/health`);
      console.log('');
      console.log('📚 Available Endpoints:');
      console.log('   • GET  /api/health              - API durumu kontrol');
      console.log('   • GET  /api/cari                - Tüm cariler');
      console.log('   • GET  /api/cari/:id            - Güngel cari');
      console.log('   • POST /api/cari                - Yeni cari oluştur');
      console.log('   • PUT  /api/cari/:id            - Cari güncelle');
      console.log('   • DELETE /api/cari/:id          - Cari sil');
      console.log('');
      console.log('   • GET  /api/islem               - Tüm işlemler');
      console.log('   • GET  /api/islem/cari/:cariId  - Cariye ait işlemler');
      console.log('   • GET  /api/islem/borc-ozeti/:cariId - Borç özeti');
      console.log('   • POST /api/islem/cari/:cariId  - Yeni işlem oluştur');
      console.log('   • PUT  /api/islem/:islemId      - İşlem güncelle');
      console.log('   • DELETE /api/islem/:islemId    - İşlem sil');
      console.log('');
      console.log('✓ Desteklenen Birimler: TL, USD, Altın');
      console.log('');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\n⚠️  SIGTERM sinyali alındı. Sunucu kapatılıyor...');
      server.close(() => {
        console.log('✓ Sunucu kapatıldı');
        pool.end(() => {
          console.log('✓ Veritabanı bağlantısı kapatıldı');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', () => {
      console.log('\n⚠️  SIGINT sinyali alındı. Sunucu kapatılıyor...');
      server.close(() => {
        console.log('✓ Sunucu kapatıldı');
        pool.end(() => {
          console.log('✓ Veritabanı bağlantısı kapatıldı');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('✗ Sunucu başlatılırken hata oluştu:', error.message);
    process.exit(1);
  }
};

// Sunucuyu başlat
startServer();
