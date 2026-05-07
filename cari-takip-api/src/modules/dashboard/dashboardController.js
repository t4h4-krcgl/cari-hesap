/**
 * Dashboard Controller
 * İstatistikler endpoint'leri sağla
 */

const { pool } = require('../../config/database');
const { asyncHandler, AppError } = require('../../middleware/errorHandler');
const { calculateNetDebt, convertAmount } = require('../../utils/currencyConverter');

/**
 * Genel dashboard istatistikleri
 */
const getDashboard = asyncHandler(async (req, res) => {
  try {
    // Toplam müşteri sayısı
    const [cariCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM cari WHERE deleted_at IS NULL
    `);

    // Aktif işlem sayısı
    const [islemCount] = await pool.execute(`
      SELECT COUNT(*) as count FROM islem WHERE deleted_at IS NULL
    `);

    // Toplam borç ve ödeme (birim bazında)
    const [transactions] = await pool.execute(`
      SELECT 
        type,
        birim,
        SUM(miktar) as total
      FROM islem
      WHERE deleted_at IS NULL
      GROUP BY type, birim
    `);

    // En fazla borçlu müşteri
    const [topDebtor] = await pool.execute(`
      SELECT 
        c.id,
        c.ad,
        c.gecerli_borc,
        COUNT(i.id) as islem_sayisi
      FROM cari c
      LEFT JOIN islem i ON c.id = i.cari_id AND i.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY c.gecerli_borc DESC
      LIMIT 1
    `);

    // Son 30 günün işlemler
    const [recentTransactions] = await pool.execute(`
      SELECT 
        DATE(olusturulma_tarihi) as tarih,
        type,
        COUNT(*) as sayisi,
        SUM(miktar) as toplam
      FROM islem
      WHERE deleted_at IS NULL 
        AND olusturulma_tarihi >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(olusturulma_tarihi), type
      ORDER BY tarih DESC
    `);

    // Borç/Ödeme oranı
    let debtAmount = 0;
    let paymentAmount = 0;

    transactions.forEach((trans) => {
      if (trans.type === 'borc') {
        debtAmount += parseFloat(trans.total) * getExchangeRate(trans.birim);
      } else {
        paymentAmount += parseFloat(trans.total) * getExchangeRate(trans.birim);
      }
    });

    res.status(200).json({
      success: true,
      message: 'Dashboard istatistikleri başarıyla getirildi',
      data: {
        ozet: {
          toplam_cari: cariCount[0].count,
          toplam_islem: islemCount[0].count,
          toplam_borc_tl: Math.round(debtAmount * 100) / 100,
          toplam_odeme_tl: Math.round(paymentAmount * 100) / 100,
          net_borc_tl: Math.round((debtAmount - paymentAmount) * 100) / 100
        },
        islem_detaylari: formatTransactionData(transactions),
        en_fazla_borcu_olan: topDebtor[0] || null,
        son_30_gun: recentTransactions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Birim bazında toplam borç/ödeme
 */
const getDebtSummary = asyncHandler(async (req, res) => {
  try {
    const [transactions] = await pool.execute(`
      SELECT 
        type,
        birim,
        SUM(miktar) as total,
        COUNT(*) as count
      FROM islem
      WHERE deleted_at IS NULL
      GROUP BY type, birim
      ORDER BY birim
    `);

    const summary = {
      borc: { TL: 0, USD: 0, Altin: 0 },
      odeme: { TL: 0, USD: 0, Altin: 0 },
      net: { TL: 0, USD: 0, Altin: 0 }
    };

    transactions.forEach((trans) => {
      summary[trans.type][trans.birim] = parseFloat(trans.total);
    });

    // Net hesapla
    Object.keys(summary.borc).forEach((currency) => {
      summary.net[currency] = summary.borc[currency] - summary.odeme[currency];
    });

    res.status(200).json({
      success: true,
      message: 'Borç özeti başarıyla getirildi',
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Müşteri bazında detaylı istatistikler
 */
const getCariStatistics = asyncHandler(async (req, res) => {
  try {
    const [cariler] = await pool.execute(`
      SELECT 
        c.id,
        c.ad,
        c.telefon,
        c.email,
        (SELECT COALESCE(SUM(CASE WHEN type='borc' THEN miktar ELSE 0 END),0)
         FROM islem i WHERE i.cari_id = c.id AND i.deleted_at IS NULL AND i.birim='TL') as borc_tl,
        (SELECT COALESCE(SUM(CASE WHEN type='odeme' THEN miktar ELSE 0 END),0)
         FROM islem i WHERE i.cari_id = c.id AND i.deleted_at IS NULL AND i.birim='TL') as odeme_tl,
        (SELECT COUNT(*) FROM islem i WHERE i.cari_id = c.id AND i.deleted_at IS NULL) as islem_sayisi,
        (SELECT MAX(olusturulma_tarihi) FROM islem i WHERE i.cari_id = c.id AND i.deleted_at IS NULL) as son_islem
      FROM cari c
      WHERE c.deleted_at IS NULL
      ORDER BY (borc_tl - odeme_tl) DESC
    `);

    const withNetDebt = cariler.map((c) => ({
      ...c,
      net_borc: Math.round((c.borc_tl - c.odeme_tl) * 100) / 100
    }));

    res.status(200).json({
      success: true,
      message: 'Müşteri istatistikleri başarıyla getirildi',
      count: withNetDebt.length,
      data: withNetDebt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Tarih aralığına göre istatistik
 */
const getStatisticsByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new AppError('Başlangıç ve bitiş tarihleri gereklidir', 400);
  }

  try {
    const [transactions] = await pool.execute(
      `
      SELECT 
        DATE(olusturulma_tarihi) as tarih,
        type,
        birim,
        COUNT(*) as sayisi,
        SUM(miktar) as toplam
      FROM islem
      WHERE deleted_at IS NULL 
        AND DATE(olusturulma_tarihi) BETWEEN ? AND ?
      GROUP BY DATE(olusturulma_tarihi), type, birim
      ORDER BY tarih DESC
    `,
      [startDate, endDate]
    );

    res.status(200).json({
      success: true,
      message: `${startDate} - ${endDate} tarihleri arasında istatistikler`,
      data: transactions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
});

/**
 * En fazla işlemi olan müşteriler
 */
const getTopCustomers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;

  try {
    const [topCustomers] = await pool.execute(
      `
      SELECT 
        c.id,
        c.ad,
        COUNT(i.id) as islem_sayisi,
        SUM(CASE WHEN i.type='borc' THEN i.miktar ELSE 0 END) as toplam_borc,
        SUM(CASE WHEN i.type='odeme' THEN i.miktar ELSE 0 END) as toplam_odeme
      FROM cari c
      LEFT JOIN islem i ON c.id = i.cari_id AND i.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY c.id
      ORDER BY islem_sayisi DESC
      LIMIT ?
    `,
      [limit]
    );

    res.status(200).json({
      success: true,
      message: `En fazla işlemi olan ilk ${limit} müşteri`,
      data: topCustomers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    throw error;
  }
});

/**
 * Helper: Birim-TL kur değeri
 */
function getExchangeRate(currency) {
  const rates = {
    TL: 1,
    USD: 34.5,
    Altin: 2500
  };
  return rates[currency] || 1;
}

/**
 * Helper: İşlem verilerini formatla
 */
function formatTransactionData(transactions) {
  const formatted = {
    borc: { TL: 0, USD: 0, Altin: 0 },
    odeme: { TL: 0, USD: 0, Altin: 0 }
  };

  transactions.forEach((trans) => {
    formatted[trans.type][trans.birim] = parseFloat(trans.total);
  });

  return formatted;
}

module.exports = {
  getDashboard,
  getDebtSummary,
  getCariStatistics,
  getStatisticsByDateRange,
  getTopCustomers
};
