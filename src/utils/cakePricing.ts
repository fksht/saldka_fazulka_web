import { CakeBuilderOption, CakeBuilderSize } from '../types';

/** Sum the surcharges of a set of selected building-block options. */
export const sumOptionDeltas = (options: Array<CakeBuilderOption | undefined>): number =>
  options.reduce((sum, option) => sum + (option?.priceDelta ?? 0), 0);

/**
 * Total cake price = chosen size base price + all selected surcharges.
 * Returns null when the size is priced individually (by agreement).
 */
export const computeCakeTotal = (
  size: CakeBuilderSize | undefined,
  selected: Array<CakeBuilderOption | undefined>,
): number | null => {
  if (!size || size.priceType === 'individual') return null;
  return size.price + sumOptionDeltas(selected);
};
