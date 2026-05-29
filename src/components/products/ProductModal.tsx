import { ShoppingBasket, Sparkles, X } from 'lucide-react';
import { useEffect } from 'react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';
import AllergenBadges from './AllergenBadges';
import VeganBadge from './VeganBadge';

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
};

const ProductModal = ({ product, onClose, onAddToCart }: ProductModalProps) => {
  useEffect(() => {
    if (!product) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-cocoa-950/70 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-cream-50 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex items-center justify-center bg-cream-50 p-6">
            {product.vegan && (
              <div className="pointer-events-none absolute right-4 top-4 z-10">
                <VeganBadge size={64} />
              </div>
            )}
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="max-h-[420px] w-auto object-contain" />
            ) : (
              <div className="flex h-72 w-full items-center justify-center font-display text-3xl text-cocoa-300">
                Sladká fazuľka
              </div>
            )}
          </div>

          <div className="relative bg-white p-6 sm:p-8">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
              onClick={onClose}
            >
              <span className="sr-only">Zavrieť detail produktu</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">{product.category}</p>
            <h3 className="mt-3 pr-10 font-display text-3xl font-semibold text-cocoa-950">{product.name}</h3>
            <p className="mt-3 font-display text-2xl font-semibold text-cocoa-800">
              {formatPrice(product.price, product.priceType, product.unitLabel)}
            </p>
            <p className="mt-5 text-base leading-7 text-cocoa-600">{product.description}</p>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cocoa-500">Alergény</p>
              <div className="mt-2">
                <AllergenBadges allergens={product.allergens} size="md" />
              </div>
            </div>

            {product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-3 py-1 text-xs font-bold text-sage-700"
                  >
                    <Sparkles className="h-3 w-3" aria-hidden="true" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {product.minimumOrderQuantity ? (
              <p className="mt-6 rounded-lg border border-cream-200 bg-cream-50 p-4 text-sm leading-6 text-cocoa-600">
                Minimálny odber z jednej príchute: <strong>{product.minimumOrderQuantity} ks</strong>.
              </p>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                disabled={!product.available}
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1"
              >
                <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                Pridať do dopytu
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Pokračovať v ponuke
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
