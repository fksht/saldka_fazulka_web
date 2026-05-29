import { OrderItem, PriceType } from '../types';
import { formatCurrency } from './format';

export interface OrderPricingSummary {
  estimatedTotal: number;
  hasCustomPricing: boolean;
  itemCount: number;
}

export const isCustomPriceType = (priceType: PriceType) =>
  priceType === 'from' || priceType === 'individual' || priceType === 'on_request';

export const getLineTotal = (item: OrderItem) => (item.unitPrice === null ? 0 : item.unitPrice * item.quantity);

export const getOrderPricingSummary = (items: OrderItem[] | undefined | null): OrderPricingSummary => {
  const list = items ?? [];
  return {
    estimatedTotal: list.reduce((sum, item) => sum + getLineTotal(item), 0),
    hasCustomPricing: list.some((item) => isCustomPriceType(item.priceType)),
    itemCount: list.length,
  };
};

export const formatOrderItemUnitPrice = (item: OrderItem) => {
  if (item.unitPrice === null) return item.priceType === 'individual' ? 'individuálne' : 'Cena bude potvrdená po dohode';
  const prefix = item.priceType === 'from' ? 'od ' : '';
  const unit = item.unitLabel ? ` / ${item.unitLabel}` : '';
  return `${prefix}${formatCurrency(item.unitPrice)}${unit}`;
};

export const formatOrderItemLinePrice = (item: OrderItem) => {
  if (item.unitPrice === null) return item.priceType === 'individual' ? 'individuálne' : 'po dohode';
  return `${item.priceType === 'from' ? 'od ' : ''}${formatCurrency(getLineTotal(item))}`;
};

export const formatOrderEstimatedTotal = ({
  estimatedTotal,
  hasCustomPricing,
}: Pick<OrderPricingSummary, 'estimatedTotal' | 'hasCustomPricing'>) => {
  if (estimatedTotal <= 0) return 'Cena po dohode';
  return `${hasCustomPricing ? 'od ' : ''}${formatCurrency(estimatedTotal)}`;
};
