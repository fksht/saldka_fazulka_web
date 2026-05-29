import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import ProductCard from './ProductCard';

type ProductGroupProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  note?: string;
  products: Product[];
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

const useVisibleCount = () => {
  const get = () => {
    if (typeof window === 'undefined') return 4;
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    if (w >= 640) return 2;
    return 1;
  };
  const [count, setCount] = useState(get);
  useEffect(() => {
    const handler = () => setCount(get());
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return count;
};

const ProductGroup = ({ title, eyebrow, description, note, products, onSelect, onAddToCart }: ProductGroupProps) => {
  const [start, setStart] = useState(0);
  const visibleCount = useVisibleCount();

  // Reset window when product list changes (e.g. search) so we don't point past the end.
  useEffect(() => {
    setStart(0);
  }, [products.length]);

  const total = products.length;
  const showCarousel = total > visibleCount;

  const visible = useMemo(() => {
    if (!showCarousel) return products;
    return Array.from({ length: visibleCount }, (_, offset) => products[(start + offset) % total]);
  }, [products, showCarousel, start, visibleCount, total]);

  const goPrev = () => setStart((s) => (s - 1 + total) % total);
  const goNext = () => setStart((s) => (s + 1) % total);

  if (!products.length) return null;

  return (
    <section className="space-y-7">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-3">
          {eyebrow && (
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">{eyebrow}</p>
          )}
          <h2 className="font-display text-3xl font-semibold leading-tight text-cocoa-950 sm:text-4xl">{title}</h2>
          <span className="block h-px w-16 bg-gradient-to-r from-gold-400 to-transparent" aria-hidden="true" />
          {description && <p className="max-w-3xl text-base leading-7 text-cocoa-600">{description}</p>}
          {note && (
            <p className="rounded-lg border border-dashed border-gold-200 bg-gold-100/40 px-4 py-2 text-sm font-semibold text-cocoa-700">
              {note}
            </p>
          )}
        </div>

        {showCarousel && (
          <div className="flex items-center gap-2" role="group" aria-label={`Listovanie v kategórii ${title}`}>
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 bg-white text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              aria-label="Predchádzajúci produkt"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <span className="min-w-[3.5rem] text-center text-xs font-bold uppercase tracking-[0.22em] text-cocoa-500">
              {start + 1} / {total}
            </span>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cream-200 bg-white text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              aria-label="Ďalší produkt"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </header>

      <div
        className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-live="polite"
      >
        {visible.map((product, i) => (
          <ProductCard
            key={`${product.id}-${start}-${i}`}
            product={product}
            onSelect={onSelect}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductGroup;
