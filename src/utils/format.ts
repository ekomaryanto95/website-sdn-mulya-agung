export function formatTanggalIndonesia(dateStr: string): string {
  if (!dateStr) return '-';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
}

export function formatAngka(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num);
}

export function buildWhatsappUrl(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalized}${query}`;
}
