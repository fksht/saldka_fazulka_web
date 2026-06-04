import { Product, ProductOptionGroup, SelectedOption } from '../types';

type OptionSource = Pick<Product, 'optionGroups' | 'variants' | 'variantLabel'>;

// Dietary badges that double as orderable versions of a product.
const DIETARY_VERSION_LABELS: Array<{ field: 'vegan' | 'withoutMilk' | 'lactoseFree' | 'glutenFree'; label: string }> = [
  { field: 'vegan', label: 'Vegánska' },
  { field: 'withoutMilk', label: 'Bez mlieka' },
  { field: 'lactoseFree', label: 'Bez laktózy' },
  { field: 'glutenFree', label: 'Bezlepková' },
];

/**
 * Normalize a product's manually-configured option groups. Supports the legacy
 * single-variant fields (`variants` / `variantLabel`) so old data keeps working
 * without a migration. Empty groups (no choices) are dropped.
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

/**
 * Auto-generated "Verzia" group from the product's dietary badges, so marking a
 * product e.g. vegan automatically lets customers pick the version — no manual
 * option group needed. Returns null if it would add nothing new.
 */
export const getDietaryVersionGroup = (
  product: Pick<Product, 'vegan' | 'withoutMilk' | 'lactoseFree' | 'glutenFree'>,
  existingGroups: ProductOptionGroup[] = [],
): ProductOptionGroup | null => {
  const existing = new Set(
    existingGroups.flatMap((group) => group.choices.map((choice) => choice.name.toLowerCase())),
  );
  const versions = DIETARY_VERSION_LABELS.filter((v) => product[v.field] && !existing.has(v.label.toLowerCase())).map(
    (v) => v.label,
  );
  if (versions.length === 0) return null;
  return { label: 'Verzia', choices: [{ name: 'Klasická' }, ...versions.map((name) => ({ name }))] };
};

/**
 * All option groups shown to the customer: the auto dietary-version group (from
 * badges) followed by the manually configured groups.
 */
export const getCustomerOptionGroups = (product: Product): ProductOptionGroup[] => {
  const manual = getProductOptionGroups(product);
  const versionGroup = getDietaryVersionGroup(product, manual);
  return versionGroup ? [versionGroup, ...manual] : manual;
};

/** Option groups the customer actually has to choose between (2+ choices). */
export const getSelectableOptionGroups = (product: Product): ProductOptionGroup[] =>
  getCustomerOptionGroups(product).filter((group) => group.choices.length >= 2);

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
