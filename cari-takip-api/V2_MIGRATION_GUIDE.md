# Cari Takip API V2 Migration Guide

## 🚀 Güncelleme Adımları

### 1. Dependencies Yükle

```bash
npm install
```

**Yeni Paketler:**
- `helmet` - HTTP headers güvenliği
- `express-rate-limit` - Rate limiting
- `node-cron` - Cron job yönetimi

### 2. Database Migration Çalıştır

```bash
# Local development
npm run migrate

# Production (Docker)
docker-compose exec api npm run migrate
```

**Oluşturulan Tablolar:**
- `debts` - Borç yönetimi
- `payments` - Ödeme yönetimi
- `notifications` - Overdue bildirimleri (optional)

**Cari Tablosu Güncellemesi:**
- `total_remaining_amount` kolonu eklendi (eğer yoksa)

### 3. Çevresel Değişkenler Güncelle

`.env` dosyasına ekle:
```env
# Zaten var, kontrol et
DB_HOST=localhost
DB_PORT=3306
DB_USER=cari_user
DB_PASSWORD=1234
DB_NAME=cari_takip_db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3001
```

### 4. Sunucuyu Başlat

```bash
# Development
npm run dev

# Production
npm start

# Docker
docker-compose up -d
```

### 5. Kontrol Et

```bash
# API sağlık durumunu kontrol et
curl http://localhost:3000/api/health

# Yanıt:
{
  "success": true,
  "message": "Cari Takip API'si çalışıyor",
  "version": "2.0.0",
  "env": "development"
}
```

---

## 📊 Veri Taşıma (İslemlerden Borçlara)

Opsiyonel: Mevcut işlemleri borç tablosuna taşı

```javascript
// Manual script (optional)
const { pool } = require('./src/config/database');

const migrateExistingDebts = async () => {
  try {
    // İslem tablosundan borc type'ındakileri borçlara taşı
    await pool.execute(`
      INSERT INTO debts (cari_id, amount, remaining_amount, due_date, status, description, created_at)
      SELECT 
        cari_id,
        miktar as amount,
        miktar as remaining_amount,
        DATE_ADD(olusturulma_tarihi, INTERVAL 30 DAY) as due_date,
        'PENDING' as status,
        aciklama,
        olusturulma_tarihi
      FROM islem
      WHERE type = 'borc' AND deleted_at IS NULL
    `);

    console.log('✓ Borçlar başarıyla taşındı');
  } catch (error) {
    console.error('Taşıma hatası:', error);
  }
};
```

---

## 🔄 API Değişiklikleri

### V1 → V2 Karşılaştırma

| Feature | V1 | V2 |
|---------|-----|-----|
| Borç Yönetimi | Özel script gerekli | `/api/debts` endpoint |
| Kısmi Ödeme | Desteklenmiyor | `/api/payments` endpoint |
| Ödeme Tracking | Manuel | `remaining_amount` otomatik |
| Vade Geçmiş | Manual check | Cron job otomatik |
| Security | CORS only | Helmet + Rate-Limit |
| Containerization | Yok | Docker ready |

---

## ⚠️ Breaking Changes

**NONE** - Tam backward compatible!

✓ Mevcut endpoint'ler korundu
✓ İslem tablosu değişmedi
✓ Cari tablosu ek kolon aldı
✓ Yeni tablolar eklendi

---

## 🧪 Test API Endpoint'leri

### 1. Borç Oluştur

```bash
curl -X POST http://localhost:3000/api/debts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cari_id": 1,
    "amount": 5000,
    "due_date": "2024-12-31",
    "description": "Malzeme teslimatı"
  }'
```

### 2. Borç Listele

```bash
curl -X GET "http://localhost:3000/api/debts?status=PENDING" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Ödeme Ekle

```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "debt_id": 1,
    "amount_paid": 1500,
    "payment_date": "2024-05-07",
    "payment_method": "Banka Transferi"
  }'
```

### 4. Borç Ödemelerini Listele

```bash
curl -X GET "http://localhost:3000/api/payments?debtId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐳 Docker Migration

### Build
```bash
docker-compose build
```

### Start
```bash
docker-compose up -d
```

### Run Migration
```bash
docker-compose exec api npm run migrate
```

### View Logs
```bash
docker-compose logs -f api
```

### Stop
```bash
docker-compose down
```

---

## 🔍 Troubleshooting

### Migration hatası: "debts table already exists"

Sorun değil, tablolar zaten mevcut.

### "Ödeme tutarı kalan borçtan fazla" hatası

Overpayment protection çalışıyor. Kalan tutarı kontrol et:

```bash
curl -X GET http://localhost:3000/api/debts/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cron job çalışmıyor

Logs'ta kontrol et:

```bash
npm run dev
# Output'ta "Overdue Debts Cron Job başarıyla başlatıldı" görmeli
```

### Rate limit hatası

```json
{
  "status": 429,
  "message": "Çok fazla istek gönderdiniz"
}
```

15 dakika bekle veya `/health` endpoint'i test et (limitten muaf).

---

## 📝 Best Practices

1. **JWT Token:** Her request'te gönder
2. **Error Handling:** Response'taki `success` flag'ını kontrol et
3. **remaining_amount:** Borç ödeme takibi için kullan
4. **Status Values:** PENDING, PAID, OVERDUE
5. **Soft Delete:** deleted_at NULL değilse silinmiş demektir

---

## 📞 Support

API Dokumentasyon: `API_V2_DOCUMENTATION.md`
Health Check: `GET /api/health`
Version: `2.0.0`

---

## ✅ Verification Checklist

- [ ] npm install tamamlandı
- [ ] npm run migrate başarılı
- [ ] npm run dev başlattı
- [ ] GET /api/health 200 döndü
- [ ] Token ile débts endpoint test edildi
- [ ] Payment endpoint test edildi
- [ ] Docker build başarılı
- [ ] docker-compose up -d başarılı
