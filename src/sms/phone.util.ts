/** Normalize MSISDN for SMS gateways (Nigeria requires 234 country code). */
export function normalizeSmsPhone(phone: string): string {
  const trimmed = phone?.trim() ?? '';
  if (!trimmed) {
    return trimmed;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return trimmed;
  }

  if (digits.startsWith('234') && digits.length >= 13) {
    return digits;
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }

  // Local NG mobile without leading 0 (e.g. 8137048054)
  if (digits.length === 10) {
    return `234${digits}`;
  }

  return digits;
}
