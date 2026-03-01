export const BUSINESS_TYPES = [
  { value: 'fnb', label: 'Food & Beverage', icon: '🍔', tips: 'Margin ideal: 50-70%' },
  { value: 'barbershop', label: 'Barbershop / Salon', icon: '💈', tips: 'Margin ideal: 60-80%' },
  { value: 'supplier', label: 'Supplier / Distributor', icon: '📦', tips: 'Margin ideal: 15-30%' },
  { value: 'photo', label: 'Jasa Foto / Video', icon: '📷', tips: 'Margin ideal: 40-70%' },
  { value: 'printing', label: 'Jasa Cetak / Printing', icon: '🖨️', tips: 'Margin ideal: 30-50%' },
  { value: 'laundry', label: 'Laundry', icon: '👕', tips: 'Margin ideal: 40-60%' },
  { value: 'retail', label: 'Toko Retail', icon: '🏪', tips: 'Margin ideal: 20-40%' },
  { value: 'cafe', label: 'Coffee Shop / Cafe', icon: '☕', tips: 'Margin ideal: 60-80%' },
  { value: 'online', label: 'Online Shop', icon: '🛒', tips: 'Margin ideal: 30-50%' },
  { value: 'jasa', label: 'Jasa Lainnya', icon: '🔧', tips: 'Margin ideal: 40-70%' },
  { value: 'other', label: 'Lainnya', icon: '📋', tips: 'Sesuaikan dengan industri' },
];

export const DEFAULT_COST_ITEMS = [
  { name: 'Sewa Tempat', amount: 0, category: 'fixed' },
  { name: 'Gaji Karyawan', amount: 0, category: 'fixed' },
  { name: 'Listrik & Air', amount: 0, category: 'variable' },
  { name: 'Internet & Telepon', amount: 0, category: 'fixed' },
  { name: 'Marketing / Iklan', amount: 0, category: 'variable' },
  { name: 'Transportasi / Logistik', amount: 0, category: 'variable' },
  { name: 'Perlengkapan', amount: 0, category: 'variable' },
  { name: 'Lain-lain', amount: 0, category: 'variable' },
];

export const SLIDE_TYPES = [
  'cover',
  'summary',
  'products',
  'costs',
  'revenue',
  'pnl',
  'cashflow',
  'roi',
  'cta',
];

export function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID').format(Math.round(amount));
}

export function formatPercent(value) {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return value.toFixed(1) + '%';
}

export function formatNumber(value) {
  if (value === undefined || value === null || isNaN(value)) return '0';
  return new Intl.NumberFormat('id-ID').format(Math.round(value));
}

export function getBusinessIcon(type) {
  const found = BUSINESS_TYPES.find(b => b.value === type);
  return found ? found.icon : '📋';
}

export function getBusinessLabel(type) {
  const found = BUSINESS_TYPES.find(b => b.value === type);
  return found ? found.label : 'Lainnya';
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
