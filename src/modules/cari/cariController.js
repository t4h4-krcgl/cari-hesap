/**
 * Cari Controller
 * Müşteri/Cari işlemlerini yönet (CRUD + soft delete)
 */

const cariModel = require('./cariModel');
const { logAction } = require('../../middleware/loggingMiddleware');
const { AppError, asyncHandler } = require('../../middleware/errorHandler');

/**
 * Tüm aktif cariler listesini getir
 */
const listCari = asyncHandler(async (req, res) => {
  const cariler = await cariModel.getAllCari();

  res.status(200).json({
    success: true,
    message: 'Tüm cariler başarıyla getirildi',
    count: cariler.length,
    data: cariler,
    timestamp: new Date().toISOString()
  });
});

/**
 * Tek cariyi ID'ye göre getir
 */
const getCari = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ID geçerliliğini kontrol et
  if (!id || isNaN(id)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  const cari = await cariModel.getCariById(id);
  if (!cari) {
    throw new AppError(`Cari ID: ${id} bulunamadı`, 404);
  }

  res.status(200).json({
    success: true,
    message: 'Cari başarıyla getirildi',
    data: cari,
    timestamp: new Date().toISOString()
  });
});

/**
 * Yeni cari oluştur
 */
const createCari = asyncHandler(async (req, res) => {
  const { ad, email, telefon, adres, kredi_limiti } = req.body;

  // Gerekli alanları kontrol et
  if (!ad || ad.trim() === '') {
    throw new AppError('Cari adı gereklidir', 400);
  }

  const newCari = await cariModel.createCari({
    ad,
    email,
    telefon,
    adres,
    kredi_limiti
  });

  // Loglama
  await logAction(
    req.user?.userId || null,
    'cari',
    'CREATE',
    'cari',
    newCari.id,
    null,
    newCari,
    req.ip,
    req.get('user-agent')
  );

  res.status(201).json({
    success: true,
    message: 'Yeni cari başarıyla oluşturuldu',
    data: newCari,
    timestamp: new Date().toISOString()
  });
});

/**
 * Cariyi güncelle
 */
const updateCari = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { ad, email, telefon, adres, kredi_limiti, durum } = req.body;

  // ID geçerliliğini kontrol et
  if (!id || isNaN(id)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  // Cari var mı kontrol et
  const existingCari = await cariModel.getCariById(id);
  if (!existingCari) {
    throw new AppError(`Cari ID: ${id} bulunamadı`, 404);
  }

  // Güncellenecek verileri hazırla
  const updateData = {
    ad: ad || existingCari.ad,
    email: email || existingCari.email,
    telefon: telefon || existingCari.telefon,
    adres: adres || existingCari.adres,
    kredi_limiti: kredi_limiti !== undefined ? kredi_limiti : existingCari.kredi_limiti,
    durum: durum || existingCari.durum
  };

  const updatedCari = await cariModel.updateCari(id, updateData);

  // Loglama
  await logAction(
    req.user?.userId || null,
    'cari',
    'UPDATE',
    'cari',
    id,
    existingCari,
    updatedCari,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Cari başarıyla güncellendi',
    data: updatedCari,
    timestamp: new Date().toISOString()
  });
});

/**
 * Cariyi soft delete (sil)
 */
const deleteCari = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // ID geçerliliğini kontrol et
  if (!id || isNaN(id)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  const deletedCari = await cariModel.deleteCari(id);
  if (!deletedCari) {
    throw new AppError(`Cari ID: ${id} bulunamadı`, 404);
  }

  // Loglama
  await logAction(
    req.user?.userId || null,
    'cari',
    'DELETE',
    'cari',
    id,
    deletedCari,
    null,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Cari başarıyla silindi (soft delete)',
    data: deletedCari,
    timestamp: new Date().toISOString()
  });
});

/**
 * Silinmiş cariyi geri al (restore)
 */
const restoreCari = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    throw new AppError('Geçerli bir Cari ID gereklidir', 400);
  }

  const restoredCari = await cariModel.restoreCari(id);

  // Loglama
  await logAction(
    req.user?.userId || null,
    'cari',
    'RESTORE',
    'cari',
    id,
    null,
    restoredCari,
    req.ip,
    req.get('user-agent')
  );

  res.status(200).json({
    success: true,
    message: 'Cari başarıyla geri alındı',
    data: restoredCari,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  listCari,
  getCari,
  createCari,
  updateCari,
  deleteCari,
  restoreCari
};
