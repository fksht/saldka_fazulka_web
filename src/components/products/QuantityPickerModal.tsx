import { Minus, Plus, ShoppingBasket, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Product, SelectedOption } from '../../types';
import { formatPrice } from '../../utils/format';
import { isCustomPriceType } from '../../utils/orderPricing';
import { formatPriceDelta, getEffectiveUnitPrice, getProductOptionGroups } from '../../utils/productOptions';
import { Button } from '../ui/Button';

type QuantityPickerModalProps = {
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product, quantity: number, selectedOptions?: SelectedOption[]) => void;
};

const STEP_OPTIONS = [10, 20, 50];
const MAX_QUANTITY = 999;

const QuantityPickerModal = ({ product, onClose, onConfirm }: QuantityPickerModalProps) => {
  const min = product?.minimumOrderQuantity ?? 1;
  const optionGroups = useMemo(() => (product ? getProductOptionGroups(product) : []), [product]);
  const [quantity, setQuantity] = useState<number>(min);
  const [inputValue, setInputValue] = useState<string>(String(min));
  // One selected choice index per option group.
  const [selectedIndices, setSelectedIndices] = useState<number[]>(() => optionGroups.map(() => 0));

  useEffect(() => {
    if (!product) return;
    const start = product.minimumOrderQuantity ?? 1;
    setQuantity(start);
    setInputValue(String(start));
    setSelectedIndices(getProductOptionGroups(product).map(() => 0));
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [product, onClose]);

  const selectedOptions = useMemo<SelectedOption[]>(
    () =>
      optionGroups.map((group, groupIndex) => {
        const choice = group.choices[selectedIndices[groupIndex] ?? 0] ?? group.choices[0];
        return { label: group.label, value: choice.name, priceDelta: choice.priceDelta };
      }),
    [optionGroups, selectedIndices],
  );

  if (!product) return null;

  const commitQuantity = (next: number) => {
    const clamped = Math.min(MAX_QUANTITY, Math.max(min, Math.floor(next)));
    setQuantity(clamped);
    setInputValue(String(clamped));
  };

  const handleInputChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '').slice(0, 3);
    setInputValue(digits);
    const parsed = Number(digits);
    if (Number.isFinite(parsed) && parsed > 0) {
      setQuantity(Math.min(MAX_QUANTITY, parsed));
    }
  };

  const handleInputBlur = () => {
    commitQuantity(quantity);
  };

  const effectiveUnitPrice = getEffectiveUnitPrice(product.price, selectedOptions);
  const isPerPiece = product.unitLabel === 'ks' && typeof effectiveUnitPrice === 'number';
  const subtotal = isPerPiece ? (effectiveUnitPrice as number) * quantity : null;
  const belowMin = quantity < min;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-cocoa-950/70 p-3 sm:p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="watercolor-wash relative flex items-start justify-between gap-3 border-b border-cream-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-700">Pridať do dopytu</p>
            <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-cocoa-950 sm:text-xl">
              {product.name}
            </h3>
            <p className="mt-1 text-xs text-cocoa-500">
              {formatPrice(product.price, product.priceType, product.unitLabel)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100"
          >
            <span className="sr-only">Zavrieť</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 py-5">
          {optionGroups.map((group, groupIndex) => (
            <div key={group.label + groupIndex} className="mb-5">
              <p className="text-sm font-semibold text-cocoa-700">{group.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.choices.map((choice, choiceIndex) => {
                  const isSelected = (selectedIndices[groupIndex] ?? 0) === choiceIndex;
                  const deltaLabel = formatPriceDelta(choice.priceDelta);
                  return (
                    <button
                      key={choice.name + choiceIndex}
                      type="button"
                      onClick={() =>
                        setSelectedIndices((current) => {
                          const next = [...current];
                          next[groupIndex] = choiceIndex;
                          return next;
                        })
                      }
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? 'border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100'
                          : 'border-cream-300 bg-cream-50 text-cocoa-700 hover:border-rose-300 hover:bg-rose-50'
                      }`}
                    >
                      {choice.name}
                      {deltaLabel && <span className="ml-1 text-xs font-bold text-gold-700">{deltaLabel}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-sm font-semibold text-cocoa-700">Koľko kusov chcete?</p>
          <p className="mt-1 text-xs text-cocoa-500">
            Minimálny odber z jednej príchute: <strong>{min} ks</strong>. Max {MAX_QUANTITY} ks.
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => commitQuantity(quantity - 1)}
              disabled={quantity <= min}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream-300 text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Znížiť o 1"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={inputValue}
              onChange={(event) => handleInputChange(event.target.value)}
              onBlur={handleInputBlur}
              onFocus={(event) => event.target.select()}
              className="h-12 w-full rounded-2xl border border-cream-300 bg-cream-50 text-center font-display text-2xl font-semibold text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              aria-label="Počet kusov"
            />
            <button
              type="button"
              onClick={() => commitQuantity(quantity + 1)}
              disabled={quantity >= MAX_QUANTITY}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream-300 text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
              aria-label="Zvýšiť o 1"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {STEP_OPTIONS.map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => commitQuantity(quantity + step)}
                disabled={quantity >= MAX_QUANTITY}
                className="rounded-full border border-gold-200 bg-cream-50 px-3 py-1.5 text-xs font-bold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
              >
                +{step}
              </button>
            ))}
            <button
              type="button"
              onClick={() => commitQuantity(min)}
              className="ml-auto rounded-full px-3 py-1.5 text-xs font-semibold text-cocoa-500 transition hover:text-cocoa-800"
            >
              Reset
            </button>
          </div>

          {subtotal !== null && (
            <div className="mt-5 rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-cocoa-600">{isCustomPriceType(product.priceType) ? 'Orientačná suma' : 'Spolu'}</span>
                <span className="font-display text-lg font-semibold text-cocoa-900">
                  {isCustomPriceType(product.priceType) ? 'od ' : ''}
                  {subtotal.toFixed(2).replace('.', ',')} €
                </span>
              </div>
            </div>
          )}

          {belowMin && (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              Minimálny odber je {min} ks — počet bude pri pridaní upravený.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-cream-200 bg-cream-50/60 px-5 py-4 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Zrušiť
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm(product, Math.max(min, quantity), selectedOptions.length > 0 ? selectedOptions : undefined);
              onClose();
            }}
            className="flex-1"
          >
            <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
            Pridať {Math.max(min, quantity)} ks
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuantityPickerModal;
