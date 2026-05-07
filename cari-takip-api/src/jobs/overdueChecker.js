/**
 * Cron Job: Overdue Debts Checker
 * Her gün 00:00'da çalışır
 * Due date < today && remaining_amount > 0 → OVERDUE işareti yap
 */

const cron = require('node-cron');
const debtService = require('../modules/debt/debtService');

/**
 * Cron job'ı başlat
 * Zaman formatı: "saat dakika gün ay haftanın günü"
 * "0 0 * * *" = Her gün saat 00:00
 */
const startOverdueChecker = () => {
    console.log('🔔 Overdue Debts Cron Job başlatılıyor...');

    // Her gün 00:00'da çalış
    const job = cron.schedule('0 0 * * *', async () => {
        console.log(`\n⏰ [${new Date().toISOString()}] Overdue debts kontrolü başladı...`);

        try {
            const overdebts = await debtService.checkAndUpdateOverdueDebts();

            if (overdebts.length > 0) {
                console.log(`✓ ${overdebts.length} borç OVERDUE olarak işaretlendi`);

                // Optional: Notifications tablosuna log ekle
                overdebts.forEach(debt => {
                    console.log(
                        `  - Cari: ${debt.cari_adi} | Borç: ${debt.amount} | Vade: ${debt.due_date}`
                    );
                });
            } else {
                console.log('✓ Vade geçmiş borç yok');
            }
        } catch (error) {
            console.error('❌ Overdue debts kontrolü hatası:', error.message);
        }

        console.log(`✅ [${new Date().toISOString()}] Overdue debts kontrolü tamamlandı\n`);
    });

    console.log('✅ Overdue Debts Cron Job başarıyla başlatıldı (Her gün 00:00)');

    return job;
};

module.exports = { startOverdueChecker };
