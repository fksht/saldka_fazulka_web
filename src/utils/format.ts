import { PriceType } from '../types';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('sk-SK', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);

export const formatPrice = (price: number | null, priceType: PriceType, unitLabel?: string) => {
  if (priceType === 'individual') return 'individuálne';
  if (priceType === 'on_request' || price === null) return 'cena po dohode';
  const formatted = formatCurrency(price);
  const withUnit = unitLabel ? `${formatted} / ${unitLabel}` : formatted;
  if (priceType === 'from') return `od ${withUnit}`;
  return withUnit;
};

export const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat('sk-SK', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
    : 'po dohode';
