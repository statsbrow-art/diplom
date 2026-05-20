export function formatDateTime(iso: string, lang: string) {
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function formatPrice(value: number | string | null | undefined, lang: string) {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
    style: 'currency',
    currency: 'BYN',
    maximumFractionDigits: 0,
  }).format(num);
}
