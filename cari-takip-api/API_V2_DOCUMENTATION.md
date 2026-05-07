## Cari Takip API V2 - Yeni Endpoint'ler Dokumentasyonu

### 🎯 V2 Yeni Features

#### 1. **Partial Payment System** (Kısmi Ödeme Sistemi)
- **remaining_amount**: Her borç için ödenmemiş tutar takip edilir
- **Overpayment Protection**: Ödeme tutarı kalan borçtan fazla olamaz
- **Automatic Status Update**: remaining_amount = 0 → PAID status

#### 2. **Debt Management API** (Borç Yönetimi)

##### List All Debts (Tüm Borçları Listele)
```
GET /api/debts
Query Parameters:
  - cari_id: int (optional) - Müşteri ID'ye göre filtrele
  - status: string (optional) - PENDING, PAID, OVERDUE
  - startDate: date (optional) - YYYY-MM-DD
  - endDate: date (optional) - YYYY-MM-DD

Response:
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "cari_id": 1,
      "cari_adi": "Firma A",
      "amount": 5000.00,
      "remaining_amount": 2000.00,
      "due_date": "2024-12-31",
      "status": "PENDING",
      "description": "Malzeme teslimatı",
      "created_at": "2024-05-01T10:00:00Z",
      "updated_at": "2024-05-07T15:30:00Z"
    }
  ]
}
```

##### Get Debt By ID (Borcu Getir)
```
GET /api/debts/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "cari_id": 1,
    "cari_adi": "Firma A",
    "amount": 5000.00,
    "remaining_amount": 2000.00,
    "due_date": "2024-12-31",
    "status": "PENDING",
    "payments": [
      {
        "id": 1,
        "debt_id": 1,
        "amount_paid": 3000.00,
        "payment_date": "2024-05-05",
        "payment_method": "Banka Transferi",
        "reference_no": "REF-001",
        "created_at": "2024-05-05T10:00:00Z"
      }
    ],
    "payment_count": 1,
    "total_paid": 3000.00
  }
}
```

##### Create New Debt (Yeni Borç Oluştur)
```
POST /api/debts
Content-Type: application/json

Body:
{
  "cari_id": 1,
  "amount": 5000.00,
  "due_date": "2024-12-31",
  "description": "Malzeme teslimatı"
}

Response:
{
  "success": true,
  "message": "Borç başarıyla oluşturuldu",
  "data": {
    "id": 1,
    "cari_id": 1,
    "amount": 5000.00,
    "remaining_amount": 5000.00,
    "due_date": "2024-12-31",
    "status": "PENDING"
  }
}
```

##### Update Debt (Borcu Güncelle)
```
PUT /api/debts/:id
Content-Type: application/json

Body:
{
  "amount": 5500.00,
  "due_date": "2025-01-15",
  "description": "Güncellenmiş malzeme teslimatı"
}

Response:
{
  "success": true,
  "message": "Borç başarıyla güncellendi",
  "data": { ... }
}
```

##### Delete Debt (Borcu Sil)
```
DELETE /api/debts/:id

Response:
{
  "success": true,
  "message": "Borç başarıyla silindi"
}
```

---

#### 3. **Payment Management API** (Ödeme Yönetimi)

##### Get Payments for Debt (Borç Ödemelerini Listele)
```
GET /api/payments?debtId=1

Response:
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "debt_id": 1,
      "amount_paid": 1500.00,
      "payment_date": "2024-05-05",
      "payment_method": "Banka Transferi",
      "reference_no": "REF-001",
      "notes": "Kısmi ödeme",
      "created_at": "2024-05-05T10:00:00Z"
    },
    {
      "id": 2,
      "debt_id": 1,
      "amount_paid": 3500.00,
      "payment_date": "2024-05-07",
      "payment_method": "Çek",
      "reference_no": "CHK-001",
      "created_at": "2024-05-07T14:30:00Z"
    }
  ]
}
```

##### Add Payment (Ödeme Ekle) ⚠️ CRITICAL
```
POST /api/payments
Content-Type: application/json

Body:
{
  "debt_id": 1,
  "amount_paid": 1500.00,
  "payment_date": "2024-05-05",
  "payment_method": "Banka Transferi",
  "reference_no": "REF-001",
  "notes": "Kısmi ödeme"
}

Response:
{
  "success": true,
  "message": "Ödeme başarıyla eklendi",
  "data": {
    "payment": {
      "id": 3,
      "debt_id": 1,
      "amount_paid": 1500.00,
      "payment_date": "2024-05-05"
    },
    "debt": {
      "id": 1,
      "amount": 5000.00,
      "remaining_amount": 3500.00,
      "status": "PENDING"
    }
  }
}
```

**⚠️ Business Rules:**
- `amount_paid` > `remaining_amount` → Error (Overpayment yasak)
- `remaining_amount` - `amount_paid` = 0 → Status = "PAID"
- `remaining_amount` < 0 → Never (kontrol edilir)

##### Update Payment (Ödemeyi Güncelle)
```
PUT /api/payments/:id
Content-Type: application/json

Body:
{
  "amount_paid": 2000.00,
  "payment_date": "2024-05-06",
  "payment_method": "Çek",
  "reference_no": "CHK-002",
  "notes": "Düzeltilmiş ödeme"
}

Response:
{
  "success": true,
  "message": "Ödeme başarıyla güncellendi",
  "data": {
    "payment": { ... },
    "debt": { ... }
  }
}
```

##### Delete Payment (Ödemeyi Sil)
```
DELETE /api/payments/:id

Response:
{
  "success": true,
  "message": "Ödeme başarıyla silindi",
  "data": {
    "debt": {
      "id": 1,
      "remaining_amount": 2000.00,
      "status": "PENDING"
    }
  }
}
```

---

#### 4. **Cron Job - Overdue Debts Checker**

**Çalışma Zamanı:** Her gün 00:00

**Kontrol Kuralları:**
- `due_date` < today
- `remaining_amount` > 0
- Status = PENDING veya OVERDUE

**Sonuç:**
- Status → "OVERDUE" güncellenir
- Console log kaydedilir
- Optional: Notifications tablosuna log eklenir

**Örnek Log:**
```
⏰ [2024-05-07T00:00:00Z] Overdue debts kontrolü başladı...
✓ 3 borç OVERDUE olarak işaretlendi
  - Cari: Firma A | Borç: 5000 | Vade: 2024-04-30
  - Cari: Firma B | Borç: 2500 | Vade: 2024-05-01
  - Cari: Firma C | Borç: 1000 | Vade: 2024-05-05
✅ [2024-05-07T00:00:00Z] Overdue debts kontrolü tamamlandı
```

---

#### 5. **Security Features**

##### Helmet - HTTP Headers
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer Policy

##### Rate Limiting
- **Global:** 100 requests / 15 minutes
- **Strict:** 5 requests / 15 minutes (Payment, Debt endpoints)
- **Login:** 5 requests / 1 hour (skipSuccessfulRequests: true)

##### Centralized Error Handling
```json
{
  "success": false,
  "error": "Ödeme tutarı kalan borçtan fazla olamaz",
  "details": "Ödeme tutarı (2000) kalan borçtan (1500) fazla olamaz"
}
```

---

### 🐳 Docker Setup

#### Build & Run
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f api
docker-compose logs -f mysql

# Stop services
docker-compose down

# Clean up volumes
docker-compose down -v
```

#### Environment Variables (docker-compose)
```env
DB_USER=cari_user
DB_PASSWORD=1234
DB_NAME=cari_takip_db
DB_ROOT_PASSWORD=root123
JWT_SECRET=your-secret-key
CORS_ORIGIN=*
NODE_ENV=production
```

---

### 📊 Database Schema V2

#### Debts Table
```sql
CREATE TABLE debts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cari_id INT NOT NULL,
  amount DECIMAL(12, 2),          -- Toplam borç tutarı
  remaining_amount DECIMAL(12, 2), -- Kalan ödenmemiş tutar (CRITICAL)
  due_date DATE,
  status ENUM('PENDING', 'PAID', 'OVERDUE'),
  description VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (cari_id) REFERENCES cari(id)
);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  debt_id INT NOT NULL,
  amount_paid DECIMAL(12, 2),
  payment_date DATE,
  payment_method VARCHAR(50),
  reference_no VARCHAR(100),
  notes VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (debt_id) REFERENCES debts(id)
);
```

#### Notifications Table (Optional)
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  debt_id INT,
  message VARCHAR(500),
  is_read BOOLEAN DEFAULT 0,
  created_at TIMESTAMP,
  FOREIGN KEY (debt_id) REFERENCES debts(id)
);
```

---

### ✅ Backward Compatibility

✓ V1 API endpoint'leri değiştirilmedi
✓ İslem tablosu korundu
✓ Cari tablosu soft delete koruması devam etti
✓ Yalnızca migration ile yeni tablolar eklendi

---

### 📝 Migration Çalıştırma

```bash
# Local
npm run migrate

# Docker
docker-compose exec api npm run migrate
```

---

### 🔑 Authentication

Tüm V2 endpoint'leri `Authorization: Bearer <token>` gerektirir.

```bash
# Header örneği
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 📚 Aditional Resources

- API Health Check: `GET /api/health`
- Version: V2.0.0
- Documentation: Bu dosya
