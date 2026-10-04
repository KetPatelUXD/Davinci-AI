/** Locale-aware formatting helpers. Default locale is en-US. */
export interface NumberFormatOptions {
  locale?: string;
  decimals?: number;
  currency?: string;
  signDisplay?: Intl.NumberFormatOptions['signDisplay'];
  compact?: boolean;
}

export function formatNumber(value: number, { locale = 'en-US', decimals = 2, currency, signDisplay, compact }: NumberFormatOptions = {}): string {
  return new Intl.NumberFormat(locale, {
    style: currency ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: compact ? 0 : decimals,
    maximumFractionDigits: compact ? 1 : decimals,
    notation: compact ? 'compact' : 'standard',
    signDisplay,
  }).format(value);
}

/** "+1.42%" / "−0.86%" – uses a true minus sign. */
export function formatPercent(value: number, { locale = 'en-US', decimals = 2, signed = true }: { locale?: string; decimals?: number; signed?: boolean } = {}): string {
  const s = new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: decimals, maximumFractionDigits: decimals, signDisplay: signed ? 'exceptZero' : 'auto' }).format(value / 100);
  return s.replace('-', '−');
}

export function formatSigned(value: number, decimals = 2, locale = 'en-US'): string {
  return formatNumber(value, { locale, decimals, signDisplay: 'exceptZero' }).replace('-', '−');
}
