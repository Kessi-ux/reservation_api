/**
 * Format a number as Nigerian Naira currency
 */
export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Display currency with custom formatting
 */
export function displayPrice(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const formatted = formatNaira(numAmount)
  return formatted.replace('₦', '₦ ')
}
