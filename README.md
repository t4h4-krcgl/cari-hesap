# 📊 Cari Takip Sistemi (Backend API)

İşletmelerin borç-alacak ilişkilerini, müşteri kayıtlarını ve finansal hareketlerini modernize etmek amacıyla geliştirilmiş, **N-Tier (Katmanlı) Mimari** prensiplerine dayalı profesyonel bir RESTful API çözümüdür.

---

### 🛠 Teknik Veri Sözlüğü

| Kategori | Kullanılan Teknolojiler / Araçlar |
| :--- | :--- |
| **Dil & Framework** | .NET 8.0 / ASP.NET Core Web API |
| **Veri Erişimi** | Entity Framework Core (Code-First) |
| **Veritabanı** | MSSQL / PostgreSQL |
| **Güvenlik** | JWT (JSON Web Token), Identity Framework |
| **Validasyon** | FluentValidation |
| **Dokümantasyon** | Swagger / OpenAPI |
| **Mimari** | N-Tier (Data Access, Business, Web API, Core) |

---

### 🏗 Mimari Yapı ve Prensipler

Proje, sürdürülebilirlik ve test edilebilirlik standartlarını karşılamak adına aşağıdaki modern yaklaşımlarla inşa edilmiştir:

* **SOLID Prensipleri:** Her sınıfın tek bir sorumluluğu olması ve bağımlılıkların `Dependency Injection` ile yönetilmesi.
* **Repository Pattern:** Veri erişim mantığının iş mantığından (Business Logic) tamamen soyutlanması.
* **Global Error Handling:** Tüm hataların bir middleware üzerinden yakalanarak standart hata modelleriyle döndürülmesi.
* **DTO (Data Transfer Object):** Veritabanı varlıklarının (Entities) güvenliğini korumak adına dış dünyaya sadece gerekli verilerin açılması.

---

### 🚀 Temel Özellikler

* ✅ **Cari Hesap Yönetimi:** Müşteri ve Tedarikçi bazlı tam CRUD desteği.
* ✅ **İşlem Takibi:** Borç/Alacak dekontlarının işlenmesi ve otomatik bakiye hesaplama.
* ✅ **Raporlama:** Dönemsel cari ekstre ve genel finansal durum çıktıları.
* ✅ **Yetkilendirme:** Rol tabanlı (Admin/User) erişim kısıtlamaları.

---

---

### 💻 Kurulum ve Çalıştırma

1.  **Veritabanı Yapılandırması:** `appsettings.json` dosyasındaki `ConnectionStrings` alanını kendi SQL sunucunuza göre düzenleyin.
2.  **Migration Uygulayın:**
    ```bash
    dotnet ef database update
    ```
3.  **Projeyi Çalıştırın:**
    ```bash
    dotnet run --project WebAPI
    ```

---

### 📈 Planlanan Geliştirmeler (Roadmap)

- [ ] Unit Test kapsamının (xUnit) %80 üzerine çıkarılması.
- [ ] Dockerize edilerek `docker-compose` desteği eklenmesi.
- [ ] Loglama mekanizmasına Serilog (Elasticsearch/File) entegrasyonu.
- [ ] Dashboard için temel bir Frontend (React/Angular) entegrasyonu.

---

**Geliştirici:** [Taha Karacagil](https://github.com/t4h4-krcgl)  
**Eğitim:** Pamukkale Üniversitesi - Bilgisayar Mühendisliği


   
