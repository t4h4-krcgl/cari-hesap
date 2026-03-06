const IslemService = require('./islemService');
const { AppError, asyncHandler } = require('../../middleware/errorHandler');
const { validationResult } = require('express-validator');

// 1. Tüm işlemleri listele
exports.listAllIslem = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await IslemService.listAll(page, limit);
    res.status(200).json({ success: true, ...result });
});

// 2. Borç özeti getir - Hatalı parantez ve çift 'async' düzeltildi
exports.getBorcOzeti = asyncHandler(async (req, res) => {
    const { cariId } = req.params;
    const result = await IslemService.getBorcSummary(cariId);
    res.status(200).json({ success: true, ...result });
});

// 3. Filtrelenmiş işlemler
exports.getFilteredIslem = asyncHandler(async (req, res) => {
    const { cariId } = req.params;
    const result = await IslemService.getFiltered({ ...req.query, cariId });
    res.status(200).json({ success: true, ...result });
});

// 4. Cariye ait tüm işlemler
exports.getIslemByCariId = asyncHandler(async (req, res) => {
    const { cariId } = req.params;
    const data = await IslemService.getIslemlerByCari(cariId);
    res.status(200).json({ success: true, data });
});

// 5. Yeni işlem oluştur
exports.createIslem = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new AppError(errors.array()[0].msg, 400);

    const data = await IslemService.createIslem({ ...req.body, cari_id: req.params.cariId });
    res.status(201).json({ success: true, message: 'İşlem oluşturuldu', data });
});

// 6. Güncelle
exports.updateIslem = asyncHandler(async (req, res) => {
    const data = await IslemService.update(req.params.islemId, req.body);
    res.status(200).json({ success: true, message: 'Güncellendi', data });
});

// 7. Sil
exports.deleteIslem = asyncHandler(async (req, res) => {
    const data = await IslemService.delete(req.params.islemId);
    res.status(200).json({ success: true, message: 'Silindi', data });
});

// 8. Geri Al
exports.restoreIslem = asyncHandler(async (req, res) => {
    const data = await IslemService.restore(req.params.islemId);
    res.status(200).json({ success: true, message: 'Geri alındı', data });
});