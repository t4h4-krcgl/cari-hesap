const express = require('express');
const islemController = require('./islemController');
const { validateIslem } = require('./islemValidator');
const { authenticate, authorize } = require('../../middleware/authMiddleware');

const router = express.Router();

// Not: Controller'daki fonksiyon isimleri burada tam karşılık bulmalı
router.get('/', authenticate, islemController.listAllIslem);
router.get('/borc-ozeti/:cariId', authenticate, islemController.getBorcOzeti);
router.get('/cari/:cariId/filter', authenticate, islemController.getFilteredIslem);
router.get('/cari/:cariId', authenticate, islemController.getIslemByCariId);

// POST ve PUT işlemlerinde validateIslem ekledik
router.post('/cari/:cariId', authenticate, validateIslem, islemController.createIslem);
router.put('/:islemId', authenticate, validateIslem, islemController.updateIslem);

router.delete('/:islemId', authenticate, islemController.deleteIslem);
router.post('/:islemId/restore', authenticate, authorize(['admin']), islemController.restoreIslem);

module.exports = router;