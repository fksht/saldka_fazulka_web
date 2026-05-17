import { X, ShoppingBasket, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';

type ProductModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
};

const ProductModal = ({ product, onClose, onAddToCart }: ProductModalProps) => {
  if (!product) return null;

  const gallery = product.galleryImages?.length ? product.galleryImages : [product.imageUrl];

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-cocoa-950/70 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="grid grid-cols-2 gap-2 bg-cream-100 p-2">
            <img src={gallery[0]} alt={product.name} className="col-span-2 aspect-[4/3] w-full rounded-md object-cover" />
            {gallery.slice(1, 3).map((imageUrl) => (
              <img key={imageUrl} src={imageUrl} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
            ))}
          </div>

          <div className="relative p-6 sm:p-8">
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
              onClick={onClose}
            >
              <span className="sr-only">Zavrieť detail produktu</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">{product.category}</p>
            <h3 className="mt-3 pr-10 font-serif text-3xl font-bold text-cocoa-950">{product.name}</h3>
            <p className="mt-3 text-2xl font-bold text-cocoa-800">{formatPrice(product.price, product.priceType)}</p>
            <p className="mt-5 text-base leading-7 text-cocoa-600">{product.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-sage-50 px-3 py-1 text-xs font-bold text-sage-700">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-cream-300 bg-cream-50 p-4 text-sm leading-6 text-cocoa-600">
              Pri tortách na mieru a väčších objednávkach je cena orientačná. Finálnu cenu, termín a dekor potvrdíme po dohode.
            </div>

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
