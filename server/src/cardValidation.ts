export function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidCardNumber(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export function parseExpiry(value: string): { month: number; year: number } | null {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(`20${match[2]}`);
  if (month < 1 || month > 12) return null;
  const expiresAt = new Date(year, month, 0, 23, 59, 59);
  return expiresAt > new Date() ? { month, year } : null;
}

export function cardBrand(value: string): string {
  const digits = digitsOnly(value);
  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Card';
}

export function cardLast4(value: string): string {
  return digitsOnly(value).slice(-4);
}
