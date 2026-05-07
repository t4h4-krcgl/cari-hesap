const db = require('../../config/database');

class IslemService {
    // Yeni bir işlem (borç/ödeme) oluşturma mantığı
    static async createIslem(islemVerisi) {
        // Burada veritabanı sorgularını ve kontrollerini yapabilirsin
        const sql = 'INSERT INTO islem (cari_id, type, miktar, birim, aciklama) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [
            islemVerisi.cari_id, 
            islemVerisi.type, 
            islemVerisi.miktar, 
            islemVerisi.birim, 
            islemVerisi.aciklama
        ]);
        return result;
    }
}

module.exports = IslemService;