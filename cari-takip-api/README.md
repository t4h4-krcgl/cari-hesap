📊 Cari Takip API'si
Node.js ve Express.js tabanlı, modüler mimari (Modular Monolith) yaklaşımıyla geliştirilmiş profesyonel bir Cari Takip Sistemi API'sidir. İşletmelerin müşteri dengelerini, borç ve ödeme süreçlerini farklı para birimleri üzerinden yönetmesini sağlar.

🚀 Öne Çıkan Özellikler
📦 Modüler Mimari: Low Coupling prensibiyle tasarlanmış, bakımı kolay klasör yapısı.

💰 Çoklu Birim Desteği: İşlemleri TL, USD ve ALTIN cinsinden takip edebilme.

🧮 Dinamik Borç Özeti: Birim bazında otomatikleştirilmiş bakiye hesaplamaları.

🛡️ Güvenli Veri Yapısı: MySQL Transaction mantığına uygun, ilişkisel veritabanı tasarımı.

🔌 RESTful Standartları: Tahmin edilebilir URL yapıları ve tutarlı HTTP statü kodları.

⚠️ Merkezi Hata Yönetimi: Tüm hatalar için standartlaştırılmış JSON yanıtları.

🏗️ Proje Mimarisi
Proje, her modülün kendi iş mantığını taşıdığı bağımsız klasör yapısına sahiptir:

Plaintext
src/
├── config/             # MySQL veritabanı konfigürasyonu
├── modules/
│   ├── cari/           # Müşteri yönetimi (Model, Controller, Router)
│   └── islem/          # Borç/Ödeme hareketleri (Model, Controller, Router)
├── middleware/         # Global error handler ve validasyonlar
└── app.js              # Express uygulama çekirdeği

🛠️ Kurulum ve Çalıştırma
Gereksinimler
Node.js (v14+)

MySQL Server (v5.7 veya v8.0)

Adımlar
Bağımlılıkları Yükleyin:

Bash
npm install
Ortam Değişkenlerini Yapılandırın:
.env.example dosyasını .env olarak kopyalayın ve MySQL bilgilerinizi girin.

Bash
cp .env.example .env
Veritabanı Hazırlığı:
MySQL üzerinde cari_takip_db isminde bir veritabanı oluşturun. Uygulama ilk çalıştığında tabloları otomatik olarak oluşturmaya çalışacaktır. Manuel oluşturmak isterseniz src/config/schema.sql (varsa) dosyasını kullanabilirsiniz.

Uygulamayı Başlatın:

Bash
# Geliştirme modu (Nodemon ile)
npm run dev

# Prodüksiyon modu
npm start


📚 API Dokümantasyonu👤 Cari YönetimiMetodEndpointAçıklamaGET/api/cariTüm kayıtlı carileri listeler.
POST/api/cariYeni bir müşteri hesabı oluşturur.
GET/api/cari/:idBelirli bir carinin detaylarını getirir.PUT/api/cari/:idCari bilgilerini günceller
.DELETE/api/cari/:idCari kaydını ve ilgili tüm işlemleri siler.
💸 İşlem HareketleriMetodEndpointAçıklamaPOST/api/islem/cari/:cariId
Belirli bir cariye borç veya ödeme ekler.GET/api/islem/cari/:cariIdMüşterinin tüm geçmiş hareketlerini listeler.GET/api/islem/borc-ozeti/:cariIdKritik: Birim bazında (TL/USD/Altın) toplam bakiye özeti.DELETE/api/islem/:islemIdYanlış girilen bir işlemi iptal eder.

💡 Örnek Yanıt Formatı (Borç Özeti)
GET /api/islem/borc-ozeti/1 isteği sonucu dönen veri yapısı:

JSON
{
  "success": true,
  "borc_ozeti": [
    { "birim": "TL", "toplam_borc": "15000.00", "toplam_odeme": "5000.00" },
    { "birim": "USD", "toplam_borc": "2000.00", "toplam_odeme": "0.00" }
  ]
}
🛡️ Veritabanı Tasarımı
Proje, MySQL üzerinde InnoDB motorunu kullanarak veri tutarlılığını sağlar. islem tablosu, cari_id üzerinden cari tablosuna ON DELETE CASCADE kuralı ile bağlıdır.

📝 Lisans
Bu proje MIT Lisansı altında lisanslanmıştır.

PAU Computer Engineering projesidir. Geliştirmeler için PR göndermekten çekinmeyin! 🚀
