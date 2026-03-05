# 📊 Cari Takip API'si

Node.js ve Express kullanarak geliştirilmiş, modüler mimariye sahip bir **Cari Takip Sistemi** API'sidir. Müşteri ve işlem yönetimini kolaylaştırır.

## ✨ Özellikler

- ✅ **Cari Yönetimi** - Müşteri ekleme, güncelleme, silme
- ✅ **İşlem Takibi** - Borç ve ödeme işlemleri
- ✅ **Çoklu Birim Desteği** - TL, USD, Altın
- ✅ **Borç Hesaplama** - Birim bazında borç özetleri
- ✅ **Modüler Yapı** - Low Coupling prensibi ile tasarlandı
- ✅ **MySQL** - Güncellenmiş veritabanı desteği
- ✅ **RESTful API** - Standart HTTP metodları
- ✅ **Error Handling** - Konsistent hata yönetimi

## 🏗️ Proje Yapısı

```
cari-takip-api/
├── src/
│   ├── config/
│   │   └── database.js           # PostgreSQL bağlantısı
│   ├── modules/
│   │   ├── cari/
│   │   │   ├── cariModel.js      # Cari veri işlemleri
│   │   │   ├── cariController.js # HTTP handle işlemleri
│   │   │   └── cariRouter.js     # Cari routeler
│   │   └── islem/
│   │       ├── islemModel.js     # İşlem veri işlemleri
│   │       ├── islemController.js# HTTP handle işlemleri
│   │       └── islemRouter.js    # İşlem routeler
│   ├── middleware/
│   │   └── errorHandler.js       # Hata yönetimi
│   └── app.js                    # Express uygulaması
├── server.js                     # Sunucu başlatma
├── package.json                  # Bağımlılıklar
├── .env.example                  # Örnek ortam değişkenleri
└── README.md                     # Bu dosya
```

## 🚀 Başlangıç

### Gereksinimler

- Node.js (≥14.0.0)
- MySQL (≥5.7 / 8.0)
- npm veya yarn

### Kurulum

1. **Projeyi klonla veya dizine gir:**
```bash
cd cari-takip-api
```

2. **Bağımlılıkları yükle:**
```bash
npm install
```

3. **Ortam değişkenlerini ayarla:**
```bash
cp .env.example .env
```

`.env` dosyasını editleyerek MySQL bağlantı bilgilerini güncelleyin:

```env
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cari_takip_db
PORT=3000
```

4. **MySQL veritabanını oluştur ve schema hazırlığı:**

```sql
CREATE DATABASE cari_takip_db;
USE cari_takip_db;

-- aşağıdaki sorgular uygulama ilk çalıştırıldığında da otomatik çalışır

CREATE TABLE IF NOT EXISTS cari (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telefon VARCHAR(20),
  adres VARCHAR(255),
  kredi_limiti DECIMAL(12,2) DEFAULT 0,
  gecerli_borc DECIMAL(12,2) DEFAULT 0,
  durum VARCHAR(20) DEFAULT 'aktif',
  olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS islem (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cari_id INT NOT NULL,
  type ENUM('borc','odeme') NOT NULL,
  miktar DECIMAL(12,2) NOT NULL,
  birim ENUM('TL','USD','Altin') NOT NULL,
  aciklama VARCHAR(255),
  olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cari_id) REFERENCES cari(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```


5. **Sunucuyu başlat:**
```bash
npm start
```

Geliştirme modunda çalıştırmak için:
```bash
npm run dev
```

API şu adreste çalışacak: `http://localhost:3000`

## 📚 API Endpoints

### 💚 Health Check

```bash
GET /api/health
```

API'nin çalışıp çalışmadığını kontrol et.

**Response:**
```json
{
  "success": true,
  "message": "Cari Takip API'si çalışıyor",
  "timestamp": "2026-03-05T10:30:00.000Z",
  "version": "1.0.0"
}
```

---

## 👥 Cari (Müşteri) Endpoints

### Tüm Cariler Listele
```bash
GET /api/cari
```

### Tek Cariyi Getir
```bash
GET /api/cari/:id
```

### Yeni Cari Oluştur
```bash
POST /api/cari
```

**Request Body:**
```json
{
  "ad": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "telefon": "+90 555 123 45 67",
  "adres": "İstanbul, Türkiye",
  "kredi_limiti": 50000
}
```

### Cari Güncelle
```bash
PUT /api/cari/:id
```

**Request Body:**
```json
{
  "ad": "Ahmet Yılmaz",
  "kredi_limiti": 75000,
  "durum": "aktif"
}
```

### Cari Sil
```bash
DELETE /api/cari/:id
```

---

## 💰 İşlem (Borç/Ödeme) Endpoints

### Tüm İşlemleri Listele
```bash
GET /api/islem?page=1&limit=10
```

Query Parametreleri:
- `page` - Sayfa numarası (default: 1)
- `limit` - Sayfa başına kayıt sayısı (default: 10)

### Cariye Ait İşlemleri Getir
```bash
GET /api/islem/cari/:cariId
```

### Cariye Ait Borç Özeti
```bash
GET /api/islem/borc-ozeti/:cariId
```

**Response:**
```json
{
  "success": true,
  "message": "Borç özeti başarıyla hesaplandı",
  "cari": {
    "id": 1,
    "ad": "Ahmet Yılmaz",
    "kredi_limiti": 50000
  },
  "borc_ozeti": [
    {
      "birim": "TL",
      "toplam_borc": "15000.00",
      "toplam_odeme": "5000.00"
    },
    {
      "birim": "USD",
      "toplam_borc": "2000.00",
      "toplam_odeme": "500.00"
    }
  ]
}
```

### Yeni İşlem Oluştur
```bash
POST /api/islem/cari/:cariId
```

**Request Body:**
```json
{
  "type": "borc",
  "miktar": 15000,
  "birim": "TL",
  "aciklama": "Ürün satışı"
}
```

**Desteklenen Birimler:**
- `TL` - Türk Lirası
- `USD` - Amerikan Doları
- `Altin` - Altın

**İşlem Türleri:**
- `borc` - Müşteri borcu
- `odeme` - Müşteri ödeme

### İşlem Güncelle
```bash
PUT /api/islem/:islemId
```

**Request Body:**
```json
{
  "type": "odeme",
  "miktar": 5000,
  "birim": "TL",
  "aciklama": "Kısmi ödeme"
}
```

### İşlem Sil
```bash
DELETE /api/islem/:islemId
```

---

## 📝 Örnek Kullanım Senaryosu

### 1. Yeni bir müşteri (cari) ekle:
```bash
POST /api/cari
{
  "ad": "Mehmet Öz",
  "email": "mehmet@example.com",
  "kredi_limiti": 100000
}
```

**Response:**
```json
{
  "id": 1,
  "ad": "Mehmet Öz",
  "email": "mehmet@example.com",
  "kredi_limiti": 100000,
  "gecerli_borc": 0,
  "durum": "aktif",
  "olusturulma_tarihi": "2026-03-05T10:30:00.000Z"
}
```

### 2. Müştery için borç ekle:
```bash
POST /api/islem/cari/1
{
  "type": "borc",
  "miktar": 50000,
  "birim": "TL",
  "aciklama": "Malzeme tedariki"
}
```

### 3. Ödeme kaydı ekle:
```bash
POST /api/islem/cari/1
{
  "type": "odeme",
  "miktar": 20000,
  "birim": "TL",
  "aciklama": "Kısmi ödeme"
}
```

### 4. Müşterinin borç durumunu kontrol et:
```bash
GET /api/islem/borc-ozeti/1
```

---

## 🔐 Low Coupling Mimarisi

Bu proje aşağıdaki prensipler ile tasarlanmıştır:

1. **Ayrılmış Modüller** - Her modülün (Cari, İşlem) kendi Model, Controller, Router dosyaları
2. **Tek Sorumluluk** - Her dosya tek bir işin sorumluluğunu taşır
3. **Minimal Bağımlılık** - Modüller arasında minimum bağımlılık
4. **Kolay Genişletilebilirlik** - Yeni modüller kolayca eklenebilir

## 🛡️ Hata Yönetimi

API konsistent hata mesajları döndürür:

```json
{
  "success": false,
  "message": "Hata açıklaması"
}
```

**Yaygın HTTP Status Kodları:**
- `200` - OK (Başarılı)
- `201` - Created (Oluşturuld)
- `400` - Bad Request (Yanlış istek)
- `404` - Not Found (Bulunamadı)
- `500` - Server Error (Sunucu hatası)

## 📋 Veritabanı Schema

### CARI Tablosu
```sql
CREATE TABLE cari (
  id SERIAL PRIMARY KEY,
  ad VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  telefon VARCHAR(20),
  adres VARCHAR(255),
  kredi_limiti DECIMAL(12, 2) DEFAULT 0,
  gecerli_borc DECIMAL(12, 2) DEFAULT 0,
  durum VARCHAR(20) DEFAULT 'aktif',
  olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### İŞLEM Tablosu
```sql
CREATE TABLE islem (
  id SERIAL PRIMARY KEY,
  cari_id INTEGER NOT NULL REFERENCES cari(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('borc', 'odeme')),
  miktar DECIMAL(12, 2) NOT NULL,
  birim VARCHAR(10) NOT NULL CHECK (birim IN ('TL', 'USD', 'Altin')),
  aciklama VARCHAR(255),
  olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  guncellenme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔍 Debugging ve Logging

API, tüm istekleri ve hataları terminalinde loglar:

```
📍 2026-03-05T10:30:00.000Z - GET /api/cari
✓ Sorgu başarıyla çalıştırıldı: { text: 'SELECT * FROM cari...', duration: 45, rows: 5 }
```

## 🎯 Geliştirme İpuçları

1. **Yeni Modül Ekleme:**
   - `src/modules/yeni_modul/` dizini oluştur
   - Model, Controller, Router dosyalarını ekle
   - `src/app.js`'de router'ı kaydet

2. **Özel Middleware Ekleme:**
   - `src/middleware/` dizinine yeni dosya ekle
   - `src/app.js`'de middleware'i kullan

3. **Validation Ekleme:**
   - Controller'da istek parametrelerini kontrol et
   - Hata durumunda uygun HTTP status kodu döndür

## 📞 İletişim ve Destek

Sorularınız veya önerileriniz için bize ulaşın.

## 📄 Lisans

MIT Lisansı

---

**Keyifli kodlamanız dileriz! 🚀**
