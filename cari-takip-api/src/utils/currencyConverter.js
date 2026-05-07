/**
 * Döviz Birim Dönüşümü Utility
 * TL, USD ve Altın arasında dönüşüm yapan fonksiyonlar
 * 
 * NOT: Gerçek uygulamada, bu kur değerlerini API'den (örneğin TCMB)
 * dinamik olarak almanız gerekir.
 */

/**
 * Kur değerleri (base: TL)
 * Not: Bu değerler örnek amaçlıdır. Gerçek uygulamada API'den çekilmelidir.
 */
const EXCHANGE_RATES = {
  TL: 1,
  USD: 34.5, // 1 USD = 34.5 TL (örnek)
  Altin: 2500 // 1 gram altın = 2500 TL (örnek)
};

/**
 * Tüm kur bilgisini getir
 */
const getExchangeRates = () => {
  return EXCHANGE_RATES;
};

/**
 * Bir miktarı bir birimden diğerine dönüştür
 * @param {number} amount - Dönüştürülecek miktar
 * @param {string} fromCurrency - Kaynak birim (TL, USD, Altin)
 * @param {string} toCurrency - Hedef birim (TL, USD, Altin)
 * @returns {number} Dönüştürülen miktar
 */
const convertAmount = (amount, fromCurrency, toCurrency) => {
  // Giriş validasyonu
  if (!amount || isNaN(amount)) {
    throw new Error('Geçerli bir miktar gereklidir');
  }

  if (!EXCHANGE_RATES[fromCurrency]) {
    throw new Error(`Geçersiz kaynak birim: ${fromCurrency}`);
  }

  if (!EXCHANGE_RATES[toCurrency]) {
    throw new Error(`Geçersiz hedef birim: ${toCurrency}`);
  }

  if (fromCurrency === toCurrency) {
    return amount;
  }

  // TL'ye çevir, sonra hedef birime çevir
  const amountInTL = amount * EXCHANGE_RATES[fromCurrency];
  const convertedAmount = amountInTL / EXCHANGE_RATES[toCurrency];

  return Math.round(convertedAmount * 100) / 100; // 2 ondalık basamak
};

/**
 * Birden fazla miktarı topla (hepsi aynı birimde olmalı)
 * @param {Array} amounts - Miktar dizisi [{amount: 100, currency: 'TL'}, ...]
 * @param {string} targetCurrency - Hedef birim
 * @returns {number} Toplam miktar
 */
const sumAmounts = (amounts, targetCurrency = 'TL') => {
  if (!Array.isArray(amounts) || amounts.length === 0) {
    return 0;
  }

  let total = 0;
  amounts.forEach((item) => {
    const converted = convertAmount(item.amount, item.currency, targetCurrency);
    total += converted;
  });

  return Math.round(total * 100) / 100; // 2 ondalık basamak
};

/**
 * Borçları hesapla (tüm birimler için)
 * @param {Array} transactions - İşlem dizisi
 * @returns {Object} Birim bazında toplam borçlar
 */
const calculateTotalDebt = (transactions) => {
  const debts = {
    TL: 0,
    USD: 0,
    Altin: 0
  };

  transactions.forEach((transaction) => {
    if (transaction.type === 'borc') {
      debts[transaction.birim] += parseFloat(transaction.miktar);
    }
  });

  // Ondalık basamakları düzelt
  Object.keys(debts).forEach((key) => {
    debts[key] = Math.round(debts[key] * 100) / 100;
  });

  return debts;
};

/**
 * Ödemeleri hesapla (tüm birimler için)
 * @param {Array} transactions - İşlem dizisi
 * @returns {Object} Birim bazında toplam ödemeler
 */
const calculateTotalPayment = (transactions) => {
  const payments = {
    TL: 0,
    USD: 0,
    Altin: 0
  };

  transactions.forEach((transaction) => {
    if (transaction.type === 'odeme') {
      payments[transaction.birim] += parseFloat(transaction.miktar);
    }
  });

  // Ondalık basamakları düzelt
  Object.keys(payments).forEach((key) => {
    payments[key] = Math.round(payments[key] * 100) / 100;
  });

  return payments;
};

/**
 * Net borç hesapla (borç - ödeme, TL bazında)
 * @param {Array} transactions - İşlem dizisi
 * @returns {number} Net borç (TL cinsinden)
 */
const calculateNetDebt = (transactions) => {
  const debts = calculateTotalDebt(transactions);
  const payments = calculateTotalPayment(transactions);

  const debtInTL = sumAmounts(
    Object.keys(debts).map((curr) => ({ amount: debts[curr], currency: curr })),
    'TL'
  );

  const paymentInTL = sumAmounts(
    Object.keys(payments).map((curr) => ({ amount: payments[curr], currency: curr })),
    'TL'
  );

  const netDebt = debtInTL - paymentInTL;
  return Math.round(netDebt * 100) / 100;
};

module.exports = {
  EXCHANGE_RATES,
  getExchangeRates,
  convertAmount,
  sumAmounts,
  calculateTotalDebt,
  calculateTotalPayment,
  calculateNetDebt
};
