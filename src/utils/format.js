export const formatCurrency = (amount, currency = 'VND') => {
  if (currency === 'USD') {
    const usd = amount / 25000;
    return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  if (currency === 'EUR') {
    const eur = amount / 27000;
    return '€' + eur.toLocaleString('en-IE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  if (currency === 'JPY') {
    const jpy = amount / 160;
    return '¥' + jpy.toLocaleString('ja-JP', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return amount.toLocaleString('vi-VN') + ' đ';
};
