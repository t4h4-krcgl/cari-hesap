const { body } = require('express-validator');

exports.validateIslem = [
    body('miktar').isDecimal({ decimal_digits: '2' }).withMessage('Miktar geçerli bir sayı olmalı (örn: 100.50)'),
    body('type').isIn(['borc', 'odeme']).withMessage('Tür sadece borc veya odeme olabilir'),
    body('birim').isIn(['TL', 'USD', 'Altin']).withMessage('Geçersiz para birimi'),
    body('cari_id').isInt().withMessage('Geçerli bir Cari ID seçilmeli')
];