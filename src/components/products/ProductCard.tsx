import { Info, ShoppingBasket } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import AllergenBadges from './AllergenBadges';
import VeganBadge from './VeganBadge';

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

// Only short, label-style tags belong as overlays on the image. Long
// sentence-style tags (used as feature highlights) would cover the photo,
// so they are shown only in the product detail modal.
const MAX_OVERLAY_TAG_LENGTH = 18;

const ProductCard = ({ product, onSelect, onAddToCart }: ProductCardProps) => {
  const overlayTags = product.tags.filter((tag) => tag.length <= MAX_OVERLAY_TAG_LENGTH).slice(0, 2);

  return (
  <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-cream-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-rose-200 hover:shadow-xl">
    <button
      type="button"
      className="relative block aspect-square w-full overflow-hidden bg-gradient-to-br from-cream-50 via-white to-rose-50/40 text-left"
      onClick={() => onSelect(product)}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full items-center justify-center font-script text-3xl text-cocoa-300">
          Sladká fazuľka
        </div>
      )}
      {overlayTags.length > 0 && (
        <div className="absolute left-3 top-3 flex max-w-[70%] flex-wrap gap-1.5">
          {overlayTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cocoa-700 shadow-sm backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {product.vegan && (
        <div className="pointer-events-none absolute right-3 top-3">
          <VeganBadge size={52} />
        </div>
      )}
      {!product.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-cocoa-950/55">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-cocoa-900">Momentálne nedostupné</span>
        </div>
      )}
    </button>

    <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-700">{product.category}</p>
      <h3 className="mt-2 font-display text-xl font-semibold leading-tight text-cocoa-950">{product.name}</h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-cocoa-600">{product.description}</p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-dashed border-cream-200 pt-4">
        <p className="font-display text-[1.6rem] font-semibold leading-none text-cocoa-900">
          {formatPrice(product.price, product.priceType, product.unitLabel)}
        </p>
        {product.minimumOrderQuantity ? (
          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700">
            min. {product.minimumOrderQuantity} ks
          </span>
        ) : null}
      </div>

      <div className="mt-3">
        <AllergenBadges allergens={product.allergens} />
      </div>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!product.available}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-cocoa-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cocoa-900 disabled:pointer-events-none disabled:bg-cream-200 disabled:text-cocoa-400"
        >
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
          Pridať do dopytu
        </button>
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream-200 text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
          title="Zobraziť detail"
        >
          <span className="sr-only">Zobraziť detail produktu {product.name}</span>
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </article>
  );
};

export default ProductCard;
