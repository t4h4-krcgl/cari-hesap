/**
 * Cari Router
 * Cari modülü route tanımları
 * URL: /api/cari
 */

const express = require('express');
const cariController = require('./cariController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/cari
 * Tüm aktif cariler listesini getir
 */
router.get('/', authenticate, cariController.listCari);

/**
 * GET /api/cari/:id
 * ID'ye göre tek cariyi getir
 */
router.get('/:id', authenticate, cariController.getCari);

/**
 * POST /api/cari
 * Yeni cari oluştur
 * Body: { ad, email, telefon, adres, kredi_limiti }
 */
router.post('/', authenticate, cariController.createCari);

/**
 * PUT /api/cari/:id
 * Cariyi güncelle
 * Body: { ad, email, telefon, adres, kredi_limiti, durum }
 */
router.put('/:id', authenticate, cariController.updateCari);

/**
 * DELETE /api/cari/:id
 * Cariyi soft delete (sil)
 */
router.delete('/:id', authenticate, cariController.deleteCari);

/**
 * POST /api/cari/:id/restore
 * Silinmiş cariyi geri al (restore)
 */
router.post('/:id/restore', authenticate, authorize(['admin']), cariController.restoreCari);

module.exports = router;
