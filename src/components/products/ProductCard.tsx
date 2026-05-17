import { Info, ShoppingBasket } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';

type ProductCardProps = {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
};

const ProductCard = ({ product, onSelect, onAddToCart }: ProductCardProps) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-cream-300 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <button
      type="button"
      className="relative block aspect-[4/3] overflow-hidden text-left"
      onClick={() => onSelect(product)}
    >
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {product.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cocoa-700 shadow-sm backdrop-blur"
          >
            {tag}
          </span>
        ))}
      </div>
      {!product.available && (
        <div className="absolute inset-0 flex items-center justify-center bg-cocoa-950/55">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-bold text-cocoa-900">Momentálne nedostupné</span>
        </div>
      )}
    </button>

    <div className="flex flex-1 flex-col p-5">
      <div className="mb-2 flex items-start justify-between gap-4">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">{product.category}</p>
        <p className="shrink-0 text-sm font-bold text-cocoa-900">{formatPrice(product.price, product.priceType)}</p>
      </div>
      <h3 className="text-xl font-bold text-cocoa-950">{product.name}</h3>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-cocoa-600">{product.description}</p>

      <div className="mt-5 flex gap-2">
        <button
          type="button"
          onClick={() => onAddToCart(product)}
          disabled={!product.available}
          className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-cocoa-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cocoa-900 disabled:pointer-events-none disabled:bg-cream-300 disabled:text-cocoa-400"
        >
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
          Pridať do dopytu
        </button>
        <button
          type="button"
          onClick={() => onSelect(product)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream-300 text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
          title="Zobraziť detail"
        >
          <span className="sr-only">Zobraziť detail produktu {product.name}</span>
          <Info className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  </article>
);

export default ProductCard;
