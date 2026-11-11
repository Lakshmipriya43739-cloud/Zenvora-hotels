// Display helpers for Zenvora.
// Prices are formatted in Indian Rupees (₹) using the standard Indian numbering system.

/**
 * Formats a numeric price into Indian Rupees (₹).
 * Uses Indian numbering format: e.g. 17822 -> "₹17,822" and 125000 -> "₹1,25,000".
 */
export function formatPrice(price) {
  if (price === null || price === undefined || price === '') return '—';
  const value = Number(price);
  if (Number.isNaN(value) || value < 0) return '—';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

export function formatCoord(value) {
  const n = Number(value);
  return Number.isNaN(n) ? '—' : n.toFixed(4);
}

export function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
