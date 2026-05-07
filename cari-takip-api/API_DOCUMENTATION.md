# Cari Takip API - Kapsamlı Belgelendirme

> Profesyonel MySQL + Express.js tabanlı müşteri ve işlem yönetimi API'si
> **Versiyon: 2.0.0** | JWT Auth | Soft Delete | Transaction Filtering | Dashboard Stats

## İçindekiler
- [Özellikler](#özellikler)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Birim Dönüşümü](#birim-dönüşümü)
- [Hatalar](#hatalar)

---

## Özellikler

✅ **JWT Tabanlı Kimlik Doğrulama** - Güvenli token-based auth
✅ **Soft Delete** - Silinen kayıtları geri alma özelliği
✅ **İşlem Filtreleme** - Tarih, birim, tür bazında filtreleme
✅ **Dashboard İstatistikleri** - Gerçek zamanlı borç/ödeme analizi
✅ **Birim Dönüşümü** - TL ↔ USD ↔ Altın otomatik dönüşümü
✅ **Loglama Sistemi** - Tüm CRUD işlemlerinin kaydı
✅ **Rol Bazlı Erişim** - Admin ve User rolleri
✅ **Konsisten JSON Response** - Standart error handling

---

## Hızlı Başlangıç

### 1. Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Environment değişkenlerini ayarla
cp .env.example .env
# .env dosyasını düzenle: DB_PASSWORD, JWT_SECRET vb.
```

### 2. Veritabanı Kurulumu

MySQL root kullanıcısı ile bağlanın:

```sql
-- Veritabanı ve kullanıcı oluştur
CREATE DATABASE cari_takip_db;
CREATE USER 'cari_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON cari_takip_db.* TO 'cari_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Sunucuyu Başlat

```bash
npm start          # Production
npm run dev        # Development (nodemon ile)
```

Sunucu `http://localhost:3000` adresinde çalışacak.

---

## API Endpoints

### 📊 Health Check

```http
GET /api/health
```

**Cevap:**
```json
{
  "success": true,
  "message": "Cari Takip API'si çalışıyor",
  "timestamp": "2024-03-05T10:30:00.000Z",
  "version": "2.0.0"
}
```

---

## 👤 Kullanıcı Yönetimi (Authentication)

### Kayıt (Register)

```http
POST /api/user/register
Content-Type: application/json

{
  "kullanici_adi": "ahmet_kaya",
  "email": "ahmet@example.com",
  "sifre": "123456",
  "sifre_confirm": "123456",
  "ad_soyad": "Ahmet Kaya"
}
```

**Cevap (201 Created):**
```json
{
  "success": true,
  "message": "Kullanıcı başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "kullanici_adi": "ahmet_kaya",
    "email": "ahmet@example.com",
    "ad_soyad": "Ahmet Kaya"
  }
}
```

### Giriş (Login)

```http
POST /api/user/login
Content-Type: application/json

{
  "kullanici_adi": "ahmet_kaya",
  "sifre": "123456"
}
```

**Cevap (200 OK):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "kullanici_adi": "ahmet_kaya",
      "email": "ahmet@example.com",
      "rol": "user"
    }
  }
}
```

### Profilini Getir

```http
GET /api/user/profile
Authorization: Bearer {TOKEN}
```

### Profili Güncelle

```http
PUT /api/user/profile
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "ad_soyad": "Ahmet Kaya Yeni",
  "email": "yeni_email@example.com"
}
```

### Şifreyi Değiştir

```http
POST /api/user/change-password
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "eski_sifre": "123456",
  "yeni_sifre": "654321",
  "yeni_sifre_confirm": "654321"
}
```

### Logout

```http
POST /api/user/logout
Authorization: Bearer {TOKEN}
```

---

## 🏢 Müşteri Yönetimi (Cari)

### Tüm Müşterileri Listele

```http
GET /api/cari
Authorization: Bearer {TOKEN}
```

**Cevap:**
```json
{
  "success": true,
  "message": "Tüm cariler başarıyla getirildi",
  "count": 5,
  "data": [
    {
      "id": 1,
      "ad": "ABC Şirketi",
      "email": "info@abc.com",
      "telefon": "0212123456",
      "adres": "İstanbul",
      "kredi_limiti": 100000,
      "gecerli_borc": 25000,
      "durum": "aktif"
    }
  ]
}
```

### Tek Müşteri Getir

```http
GET /api/cari/1
Authorization: Bearer {TOKEN}
```

### Yeni Müşteri Oluştur

```http
POST /api/cari
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "ad": "XYZ Ticareti Ltd.",
  "email": "xyz@example.com",
  "telefon": "0216543210",
  "adres": "Ankara",
  "kredi_limiti": 50000
}
```

### Müşteri Güncelle

```http
PUT /api/cari/1
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "ad": "XYZ Ticareti Updated",
  "kredi_limiti": 75000,
  "durum": "pasif"
}
```

### Müşteri Sil (Soft Delete)

```http
DELETE /api/cari/1
Authorization: Bearer {TOKEN}
```

### Silinmiş Müşteri Geri Al (Restore) - Admin Only

```http
POST /api/cari/1/restore
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 📝 İşlem Yönetimi (Borç/Ödeme)

### Tüm İşlemleri Listele

```http
GET /api/islem?page=1&limit=20
Authorization: Bearer {TOKEN}
```

### Müşteriye Ait İşlemleri Getir

```http
GET /api/islem/cari/1
Authorization: Bearer {TOKEN}
```

### Borç Özeti Getir (Birim Bazında)

```http
GET /api/islem/borc-ozeti/1
Authorization: Bearer {TOKEN}
```

**Cevap:**
```json
{
  "success": true,
  "message": "Borç özeti başarıyla hesaplandı",
  "cari": {
    "id": 1,
    "ad": "ABC Şirketi",
    "kredi_limiti": 100000
  },
  "borc_ozeti": [
    {
      "birim": "TL",
      "islem_sayisi": 5,
      "toplam_borc": 50000,
      "toplam_odeme": 25000
    },
    {
      "birim": "USD",
      "islem_sayisi": 2,
      "toplam_borc": 10000,
      "toplam_odeme": 5000
    }
  ],
  "net_borc_tl": 460000
}
```

### Yeni İşlem Oluştur (Borç/Ödeme)

```http
POST /api/islem/cari/1
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "type": "borc",
  "miktar": 50000,
  "birim": "TL",
  "aciklama": "Ürün satın alımı"
}
```

Geçerli değerler:
- `type`: `"borc"` veya `"odeme"`
- `birim`: `"TL"`, `"USD"` veya `"Altin"`

### Filtrelenmiş İşlemler Getir

```http
GET /api/islem/cari/1/filter?type=borc&birim=TL&startDate=2024-01-01&endDate=2024-03-05&page=1&limit=10
Authorization: Bearer {TOKEN}
```

Query parametreleri:
- `type` - Filtrelemek istediğiniz tür (`borc` veya `odeme`)
- `birim` - Birim (`TL`, `USD`, `Altin`)
- `startDate` - Başlangıç tarihi (YYYY-MM-DD)
- `endDate` - Bitiş tarihi (YYYY-MM-DD)
- `page` - Sayfa numarası
- `limit` - Sayfa başına kayıt sayısı

**Cevap:**
```json
{
  "success": true,
  "message": "Filtrelenmiş işlemler başarıyla getirildi",
  "data": [...],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

### İşlem Güncelle

```http
PUT /api/islem/1
Authorization: Bearer {TOKEN}
Content-Type: application/json

{
  "type": "borc",
  "miktar": 75000,
  "birim": "TL",
  "aciklama": "Güncellenmiş açıklama"
}
```

### İşlem Sil (Soft Delete)

```http
DELETE /api/islem/1
Authorization: Bearer {TOKEN}
```

### Silinmiş İşlem Geri Al (Restore) - Admin Only

```http
POST /api/islem/1/restore
Authorization: Bearer {ADMIN_TOKEN}
```

---

## 📊 Dashboard ve İstatistikler

### Ana Dashboard

```http
GET /api/dashboard
Authorization: Bearer {TOKEN}
```

**Cevap:**
```json
{
  "success": true,
  "message": "Dashboard istatistikleri başarıyla getirildi",
  "data": {
    "ozet": {
      "toplam_cari": 10,
      "toplam_islem": 50,
      "toplam_borc_tl": 500000,
      "toplam_odeme_tl": 300000,
      "net_borc_tl": 200000
    },
    "islem_detaylari": {
      "borc": {"TL": 500000, "USD": 10000, "Altin": 50},
      "odeme": {"TL": 300000, "USD": 5000, "Altin": 25}
    },
    "en_fazla_borcu_olan": {...},
    "son_30_gun": [...]
  }
}
```

### Borç Özeti

```http
GET /api/dashboard/debt-summary
Authorization: Bearer {TOKEN}
```

### Müşteri İstatistikleri

```http
GET /api/dashboard/cari-statistics
Authorization: Bearer {TOKEN}
```

### Tarih Aralığına Göre İstatistik

```http
GET /api/dashboard/date-range?startDate=2024-01-01&endDate=2024-03-05
Authorization: Bearer {TOKEN}
```

### En Fazla İşlemi Olan Müşteriler

```http
GET /api/dashboard/top-customers?limit=10
Authorization: Bearer {TOKEN}
```

---

## 🔐 Authentication

### Token Nasıl Alınır?

1. **Login endpoint'ine POST isteği gönderin**

```http
POST /api/user/login
Content-Type: application/json

{
  "kullanici_adi": "ahmet_kaya",
  "sifre": "123456"
}
```

2. **Response'dan token kopyalayın**

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### Token Nasıl Kullanılır?

Korumalı endpoint'lerde `Authorization` header'ına ekleyin:

```http
GET /api/cari
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

### Token Süresi

- **Varsayılan:** 7 gün
- **.env'de değiştirilebilir:** `JWT_EXPIRE=7d`
- **Format:** `1d`, `7d`, `30d`, `3h`, `30m` vb.

---

## 💱 Birim Dönüşümü

API otomatik olarak borç hesaplamalarında dönüşüm yapar.

### Kur Değerleri (Base: TL)

```
1 TL = 1 TL
1 USD = 34.5 TL (örnek)
1 Gram Altın = 2500 TL (örnek)
```

> **Not:** Gerçek uygulamada bu kurlar dinamik API'lerden çekilmesi gerekir. 
> Dosya: `src/utils/currencyConverter.js`

### Örnek: Farklı Birimlerle İşlem

```json
{
  "type": "borc",
  "miktar": 1000,
  "birim": "USD",
  "aciklama": "Dış ticaret faturası"
}
```

Dashboard'daki net borç hesaplaması otomatik olarak TL'ye dönüştürülür:
- Borç: 1000 USD × 34.5 = 34,500 TL

---

## ⚠️ Hatalar

### Standart Error Response

```json
{
  "success": false,
  "message": "Hata açıklaması",
  "statusCode": 400,
  "timestamp": "2024-03-05T10:30:00.000Z"
}
```

### HTTP Status Kodları

| Kod | Anlam |
|-----|-------|
| 200 | Başarılı GET/PUT/DELETE |
| 201 | Başarılı POST (oluşturuldu) |
| 400 | Geçersiz request parametreleri |
| 401 | Token geçersiz/süresi dolmuş |
| 403 | Yetkilendirme hatası (Admin gerekli) |
| 404 | Kayıt bulunamadı |
| 500 | Sunucu hatası |

### Sık Karşılaşılan Hatalar

**401 Unauthorized**
```json
{
  "success": false,
  "message": "Token bulunamadı. Authorization header gereklidir",
  "statusCode": 401
}
```

**403 Forbidden**
```json
{
  "success": false,
  "message": "Bu işlem için yetkiniz yok. Gerekli rol: admin",
  "statusCode": 403
}
```

**404 Not Found**
```json
{
  "success": false,
  "message": "Cari ID: 999 bulunamadı",
  "statusCode": 404
}
```

---

## 📋 Veri Modelleri

### User (Kullanıcı)

```sql
{
  "id": 1,
  "kullanici_adi": "ahmet_kaya",
  "email": "ahmet@example.com",
  "ad_soyad": "Ahmet Kaya",
  "rol": "user" | "admin",
  "durum": "aktif" | "pasif",
  "son_giris_tarihi": "2024-03-05T10:30:00.000Z",
  "olusturulma_tarihi": "2024-02-01T08:00:00.000Z",
  "guncellenme_tarihi": "2024-03-05T10:30:00.000Z"
}
```

### Cari (Müşteri)

```sql
{
  "id": 1,
  "ad": "ABC Şirketi",
  "email": "info@abc.com",
  "telefon": "0212123456",
  "adres": "İstanbul",
  "kredi_limiti": 100000.00,
  "gecerli_borc": 25000.00,
  "durum": "aktif" | "pasif",
  "olusturulma_tarihi": "2024-02-01T08:00:00.000Z",
  "guncellenme_tarihi": "2024-03-05T10:30:00.000Z",
  "deleted_at": null
}
```

### İşlem

```sql
{
  "id": 1,
  "cari_id": 1,
  "type": "borc" | "odeme",
  "miktar": 50000.00,
  "birim": "TL" | "USD" | "Altin",
  "aciklama": "Ürün satın alımı",
  "olusturulma_tarihi": "2024-03-01T12:00:00.000Z",
  "guncellenme_tarihi": "2024-03-05T10:30:00.000Z",
  "deleted_at": null
}
```

---

## 📚 Postman Collection

Postman ile test etmek için:

1. Postman'i açın
2. **File** → **Import**
3. Aşağıdaki collection'ı import edin:

```json
{
  "info": {
    "name": "Cari Takip API",
    "version": "2.0.0"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/user/register",
        "body": {
          "kullanici_adi": "test_user",
          "email": "test@example.com",
          "sifre": "123456",
          "sifre_confirm": "123456"
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/api/user/login",
        "body": {
          "kullanici_adi": "test_user",
          "sifre": "123456"
        }
      }
    }
  ]
}
```

---

## 🔧 Konfigürasyon

### Environment Variables (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=cari_user
DB_PASSWORD=1234
DB_NAME=cari_takip_db

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=*
```

---

## 📦 Proje Yapısı

```
src/
├── app.js                 # Express uygulaması
├── config/
│   └── database.js       # MySQL bağlantı ve tablo init
├── middleware/
│   ├── authMiddleware.js # JWT authentication
│   ├── errorHandler.js   # Error handling
│   └── loggingMiddleware.js # Logging
├── modules/
│   ├── user/
│   │   ├── userModel.js
│   │   ├── userController.js
│   │   └── userRouter.js
│   ├── cari/
│   │   ├── cariModel.js
│   │   ├── cariController.js
│   │   └── cariRouter.js
│   ├── islem/
│   │   ├── islemModel.js
│   │   ├── islemController.js
│   │   └── islemRouter.js
│   └── dashboard/
│       ├── dashboardController.js
│       └── dashboardRouter.js
└── utils/
    ├── currencyConverter.js  # Birim dönüşümü
    └── softDeleteHelper.js    # Soft delete yardımcıları
```

---

## 🐛 Troubleshooting

### "MySQL bağlantısı başarısız"
- MySQL servisi çalışıyor mu kontrol edin
- DB_HOST, DB_USER, DB_PASSWORD kontrol edin
- `mysql -u root -p` ile manuel test edin

### "Token süresi dolmuş"
- Login yeniden yapın
- JWT_EXPIRE değerini kontrol edin

### CORS hatası
- CORS_ORIGIN'i frontend URL'sine ayarlayın
- Development'ta `CORS_ORIGIN=*` kullanabilirsiniz

---

## 📞 Destek

- **Email:** support@caritakip.com
- **GitHub:** https://github.com/yourusername/cari-takip-api
- **Issues:** GitHub Issues kullanın

---

## 📄 Lisans

ISC License - Detaylar için LICENSE dosyasına bakın

---

**Son Güncelleme:** 05 Kasım 2024 | v2.0.0
