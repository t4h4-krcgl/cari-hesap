/**
 * İşlem Controller
 * HTTP isteklerini işle ve İşlem Model'i kullan
 * Borç ve ödeme işlemleri yönetimi + filtreleme
 */

const islemModel = require('./islemModel');
const cariModel = require('../cari/cariModel');
const { logAction } = require('../../middleware/loggingMiddleware');
const { AppError, asyncHandler } = require('../../middleware/errorHandler');
const { calculateNetDebt, convertAmount } = require('../../utils/currencyConverter');

/**
 * Cariye ait tüm işlemleri getir
 */
const getIslemByCariId = asyncHandler(async (req, res) => {
  const { cariId } = req.params;

  if (!cariId || isNaN(cariId)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  // Cari var mı kontrol et
  const cari = await cariModel.getCariById(cariId);
  if (!cari) {
    throw new AppError(`Cari ID: ${cariId} bulunamadı`, 404);
  }

  const islemler = await islemModel.getIslemByCariId(cariId);

  res.status(200).json({
    success: true,
    message: 'İşlemler başarıyla getirildi',
    cari_ad: cari.ad,
    count: islemler.length,
    data: islemler,
    timestamp: new Date().toISOString()
  });
});

/**
 * Cariye ait borç özeti getir (birim bazında)
 */
const getBorcOzeti = asyncHandler(async (req, res) => {
  const { cariId } = req.params;

  if (!cariId || isNaN(cariId)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  // Cari var mı kontrol et
  const cari = await cariModel.getCariById(cariId);
  if (!cari) {
    throw new AppError(`Cari ID: ${cariId} bulunamadı`, 404);
  }

  const borcSummary = await islemModel.calculateBorcWithStats(cariId);

  // Net borç hesapla
  let netBorcTL = 0;
  borcSummary.forEach((item) => {
    const rate = item.birim === 'TL' ? 1 : item.birim === 'USD' ? 34.5 : 2500;
    netBorcTL += (item.toplam_borc - item.toplam_odeme) * rate;
  });

  res.status(200).json({
    success: true,
    message: 'Borç özeti başarıyla hesaplandı',
    cari: {
      id: cari.id,
      ad: cari.ad,
      kredi_limiti: cari.kredi_limiti
    },
    borc_ozeti: borcSummary,
    net_borc_tl: Math.round(netBorcTL * 100) / 100,
    timestamp: new Date().toISOString()
  });
});

/**
 * Yeni işlem (borç veya ödeme) oluştur
 */
const createIslem = asyncHandler(async (req, res) => {
  const { cariId } = req.params;
  const { type, miktar, birim, aciklama } = req.body;

  // Parametreleri kontrol et
  if (!cariId || isNaN(cariId)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  if (!type || !['borc', 'odeme'].includes(type)) {
    throw new AppError('İşlem türü "borc" veya "odeme" olmalıdır', 400);
  }

  if (!miktar || isNaN(miktar) || miktar <= 0) {
    throw new AppError('Geçerli bir miktar gereklidir (0dan büyük)', 400);
  }

  if (!birim || !islemModel.VALID_CURRENCIES.includes(birim)) {
    throw new AppError(
      `Geçerli birim gereklidir: ${islemModel.VALID_CURRENCIES.join(', ')}`,
      400
    );
  }

  // Cari var mı kontrol et
  const cari = await cariModel.getCariById(cariId);
  if (!cari) {
    throw new AppError(`Cari ID: ${cariId} bulunamadı`, 404);
  }

  // İşlem oluştur
  const newIslem = await islemModel.createIslem({
    cari_id: cariId,
    type,
    miktar,
    birim,
    aciklama
  });

  // Loglama
  await logAction(
    req.user?.userId || null,
    'islem',
    'CREATE',
    'islem',
    newIslem.id,
    null,
    newIslem,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: `${type === 'borc' ? 'Borç' : 'Ödeme'} işlemi başarıyla oluşturuldu`,
    data: newIslem,
    timestamp: new Date().toISOString()
  });
});

/**
 * İşlemi güncelle
 */
const updateIslem = asyncHandler(async (req, res) => {
  const { islemId } = req.params;
  const { type, miktar, birim, aciklama } = req.body;

  if (!islemId || isNaN(islemId)) {
    throw new AppError('Geçerli bir İşlem ID gereklidir', 400);
  }

  // İşlem var mı kontrol et
  const existingIslem = await islemModel.getIslemById(islemId);
  if (!existingIslem) {
    throw new AppError(`İşlem ID: ${islemId} bulunamadı`, 404);
  }

  // Güncellenecek verileri hazırla
  const updateData = {
    type: type || existingIslem.type,
    miktar: miktar || existingIslem.miktar,
    birim: birim || existingIslem.birim,
    aciklama: aciklama || existingIslem.aciklama
  };

  const updatedIslem = await islemModel.updateIslem(islemId, updateData);

  // Loglama
  await logAction(
    req.user?.userId || null,
    'islem',
    'UPDATE',
    'islem',
    islemId,
    existingIslem,
    updatedIslem,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'İşlem başarıyla güncellendi',
    data: updatedIslem,
    timestamp: new Date().toISOString()
  });
});

/**
 * İşlemi soft delete (sil)
 */
const deleteIslem = asyncHandler(async (req, res) => {
  const { islemId } = req.params;

  if (!islemId || isNaN(islemId)) {
    throw new AppError('Geçerli bir İşlem ID gereklidir', 400);
  }

  const deletedIslem = await islemModel.deleteIslem(islemId);
  if (!deletedIslem) {
    throw new AppError(`İşlem ID: ${islemId} bulunamadı`, 404);
  }

  // Loglama
  await logAction(
    req.user?.userId || null,
    'islem',
    'DELETE',
    'islem',
    islemId,
    deletedIslem,
    null,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'İşlem başarıyla silindi (soft delete)',
    data: deletedIslem,
    timestamp: new Date().toISOString()
  });
});

/**
 * Silinmiş işlemi geri al (restore)
 */
const restoreIslem = asyncHandler(async (req, res) => {
  const { islemId } = req.params;

  if (!islemId || isNaN(islemId)) {
    throw new AppError('Geçerli bir İşlem ID gereklidir', 400);
  }

  const restoredIslem = await islemModel.restoreIslem(islemId);

  // Loglama
  await logAction(
    req.user?.userId || null,
    'islem',
    'RESTORE',
    'islem',
    islemId,
    null,
    restoredIslem,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'İşlem başarıyla geri alındı',
    data: restoredIslem,
    timestamp: new Date().toISOString()
  });
});

/**
 * Filtrelenmiş işlemler getir
 * Query params: type, birim, startDate, endDate, page, limit
 */
const getFilteredIslem = asyncHandler(async (req, res) => {
  const { cariId } = req.params;
  const { type, birim, startDate, endDate, page = 1, limit = 20 } = req.query;

  if (!cariId || isNaN(cariId)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  // Cari var mı kontrol et
  const cari = await cariModel.getCariById(cariId);
  if (!cari) {
    throw new AppError(`Cari ID: ${cariId} bulunamadı`, 404);
  }

  const filters = {
    cariId: parseInt(cariId)
  };

  if (type) filters.type = type;
  if (birim) filters.birim = birim;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const result = await islemModel.getIslemWithFilter(filters, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    message: 'Filtrelenmiş işlemler başarıyla getirildi',
    cari_ad: cari.ad,
    ...result,
    timestamp: new Date().toISOString()
  });
});

/**
 * Tüm işlemleri listele (sayfalama ile)
 */
const listAllIslem = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (page < 1 || limit < 1) {
    throw new AppError('Sayfa ve limit pozitif sayı olmalıdır', 400);
  }

  const result = await islemModel.getAllIslem(page, limit);

  res.status(200).json({
    success: true,
    message: 'İşlemler başarıyla getirildi',
    ...result,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  getIslemByCariId,
  getBorcOzeti,
  createIslem,
  updateIslem,
  deleteIslem,
  restoreIslem,
  getFilteredIslem,
  listAllIslem
};
