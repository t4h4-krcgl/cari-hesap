/**
 * İşlem Router
 * İşlem (Borç/Ödeme) modülü route tanımları
 * URL: /api/islem
 */

const express = require('express');
const islemController = require('./islemController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/islem
 * Tüm işlemleri listele (sayfalama ile)
 * Query parametreleri: page, limit
 */
router.get('/', authenticate, islemController.listAllIslem);

/**
 * GET /api/islem/borc-ozeti/:cariId
 * Cariye ait borç özeti (birim bazında)
 */
router.get('/borc-ozeti/:cariId', authenticate, islemController.getBorcOzeti);

/**
 * GET /api/islem/cari/:cariId/filter
 * Filtrelenmiş işlemler getir
 * Query parametreleri: type, birim, startDate, endDate, page, limit
 */
router.get('/cari/:cariId/filter', authenticate, islemController.getFilteredIslem);

/**
 * GET /api/islem/cari/:cariId
 * Cariye ait tüm işlemleri getir
 */
router.get('/cari/:cariId', authenticate, islemController.getIslemByCariId);

/**
 * POST /api/islem/cari/:cariId
 * Yeni işlem (borç veya ödeme) oluştur
 * Body: { type: 'borc|odeme', miktar, birim: 'TL|USD|Altin', aciklama }
 */
router.post('/cari/:cariId', authenticate, islemController.createIslem);

/**
 * PUT /api/islem/:islemId
 * İşlemi güncelle
 * Body: { type, miktar, birim, aciklama }
 */
router.put('/:islemId', authenticate, islemController.updateIslem);

/**
 * DELETE /api/islem/:islemId
 * İşlemi soft delete (sil)
 */
router.delete('/:islemId', authenticate, islemController.deleteIslem);

/**
 * POST /api/islem/:islemId/restore
 * Silinmiş işlemi geri al (restore)
 */
router.post('/:islemId/restore', authenticate, authorize(['admin']), islemController.restoreIslem);

module.exports = router;
