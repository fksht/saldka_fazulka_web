import { Product, ProductOptionGroup, SelectedOption } from '../types';

type OptionSource = Pick<Product, 'optionGroups' | 'variants' | 'variantLabel'>;

/**
 * Normalize a product's option groups. Supports the legacy single-variant
 * fields (`variants` / `variantLabel`) so old data keeps working without a
 * migration. Empty groups (no choices) are dropped.
 */
export const getProductOptionGroups = (product: OptionSource): ProductOptionGroup[] => {
  if (product.optionGroups && product.optionGroups.length > 0) {
    return product.optionGroups.filter((group) => group.choices.length > 0);
  }
  if (product.variants && product.variants.length > 0) {
    return [
      {
        label: product.variantLabel || 'Variant',
        choices: product.variants.map((name) => ({ name })),
      },
    ];
  }
  return [];
};

/** Option groups the customer actually has to choose between (2+ choices). */
export const getSelectableOptionGroups = (product: OptionSource): ProductOptionGroup[] =>
  getProductOptionGroups(product).filter((group) => group.choices.length >= 2);

/** Whether opening the quantity/options picker is necessary for this product. */
export const productNeedsPicker = (product: Product): boolean =>
  (product.minimumOrderQuantity ?? 1) > 1 || getSelectableOptionGroups(product).length > 0;

/** Base unit price plus the deltas of every selected option. */
export const getEffectiveUnitPrice = (
  basePrice: number | null,
  selectedOptions?: SelectedOption[],
): number | null => {
  if (basePrice === null) return null;
  const delta = (selectedOptions ?? []).reduce((sum, option) => sum + (option.priceDelta ?? 0), 0);
  return basePrice + delta;
};

/** Compact "Label: Value" summary used for the order email and legacy displays. */
export const formatSelectedOptions = (selectedOptions?: SelectedOption[]): string =>
  (selectedOptions ?? []).map((option) => `${option.label}: ${option.value}`).join(', ');

/** Short "+0,30 €" / "−0,20 €" label for a price delta, or '' when zero/absent. */
export const formatPriceDelta = (delta?: number): string => {
  if (!delta) return '';
  const sign = delta > 0 ? '+' : '−';
  const abs = Math.abs(delta).toFixed(2).replace('.', ',');
  return `${sign}${abs} €`;
};
