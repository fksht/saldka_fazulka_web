import { useEffect, useMemo, useState } from 'react';
import { Info, Loader2, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductGroup from '../components/products/ProductGroup';
import ProductModal from '../components/products/ProductModal';
import QuantityPickerModal from '../components/products/QuantityPickerModal';
import GoldDivider from '../components/ui/GoldDivider';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { useSeo } from '../hooks/useSeo';
import { dataService } from '../services/dataService';
import { ALLERGENS, ALLERGEN_DISCLAIMER, CATEGORY_ORDER } from '../data/sladkaFazulkaCatalog';
import { Category, Product, SelectedOption } from '../types';
import { productNeedsPicker } from '../utils/productOptions';

const MENU_CATEGORIES: Array<{
  category: Category;
  eyebrow: string;
  title: string;
  description?: string;
  note?: string;
}> = [
  {
    category: 'Tartaletky',
    eyebrow: 'Mini zákusky',
    title: 'Tartaletky ⌀ 4,5 cm',
    description: 'Krehké maslové korpusy s krémovými náplňami. 2,20 € / ks.',
    note: 'Minimálny odber z jednej príchute: 10 ks.',
  },
  {
    category: 'Poháriky',
    eyebrow: 'Mini zákusky',
    title: 'Poháriky',
    description: 'Vrstvené dezerty v skle — krémové, ovocné, čokoládové. 2,20 € / ks.',
    note: 'Minimálny odber z jednej príchute: 10 ks.',
  },
  {
    category: 'Rezy',
    eyebrow: 'Mini zákusky',
    title: 'Rezy',
    description: 'Klasické a krémové rezy v menších kockách. 2,00 € / ks.',
    note: 'Minimálny odber z jedného druhu: 20 ks.',
  },
  {
    category: 'Mini cheesecake',
    eyebrow: 'Mini zákusky',
    title: 'Mini cheesecake',
    description: 'Krehký korpus a jemný cheesecake krém v miniatúrnej forme. 1,80 € / ks.',
    note: 'Minimálny odber z jednej príchute: 10 ks.',
  },
  {
    category: 'Špeciálne zákusky',
    eyebrow: 'Mini zákusky',
    title: 'Špeciálne zákusky',
    description: 'Sezónne pochúťky s ručným dekorom. 2,20 – 2,40 € / ks.',
    note: 'Minimálny odber z jednej príchute: 10 ks.',
  },
  {
    category: 'Fazuľkové brownie',
    eyebrow: 'Špeciality „Fazuľky"',
    title: 'Fazuľkové brownie kocky',
    description: 'Bezlepkové brownie z červenej fazule. Bez múky, bez mlieka. 1,80 € / ks.',
    note: 'Bez lepku a mlieka v receptúre; vyrába sa v dielni, kde sa pracuje aj s alergénmi.',
  },
  {
    category: 'Fazuľkové špeciality',
    eyebrow: 'Špeciality „Fazuľky"',
    title: 'Fazuľkové špeciality',
    description: 'Originálne fazuľkové dezerty, ktoré inde nenájdete. 2,00 – 2,50 € / ks.',
    note: 'Minimálny odber z jednej príchute: 10 ks.',
  },
  {
    category: 'Dezertné torty',
    eyebrow: 'Dezertné torty',
    title: 'Dezertné torty, cheesecake a travel cake',
    description: 'Celé torty pre menšie oslavy alebo ako sladký dar. Cena je za celú tortu / uvedený počet porcií.',
  },
];

const Menu = () => {
  useSeo('/ponuka');
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const data = await dataService.getAvailableProducts();
      setProducts(data);
      setLoading(false);
    };

    void fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  const handleAddToCart = (product: Product) => {
    if (productNeedsPicker(product)) {
      setPickerProduct(product);
      return;
    }
    addProduct(product);
    setToastMessage(`${product.name} je pridané do dopytu.`);
  };

  const handlePickerConfirm = (product: Product, quantity: number, selectedOptions?: SelectedOption[]) => {
    addProduct(product, quantity, selectedOptions);
    const optionsSuffix = selectedOptions?.length ? ` — ${selectedOptions.map((o) => o.value).join(', ')}` : '';
    setToastMessage(`${product.name}${optionsSuffix} (${quantity} ks) je pridané do dopytu.`);
  };

  return (
    <div className="bg-cream-50">
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-16 sm:py-20">
        <div className="watercolor-wash absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Cenník zákuskov a tort"
            title="Prehľadná ponuka, jednoduché rozhodovanie"
            scriptEyebrow="S dôrazom na chuť a detail"
            description="Mini zákusky pre candy bary, fazuľkové špeciality bez lepku, dezertné torty a torty na mieru. Pri výbere vám rada poradím."
            withDivider
          />

          <div className="mx-auto mt-10 flex max-w-3xl flex-col items-center gap-3 sm:flex-row">
            <label className="relative block w-full">
              <span className="sr-only">Hľadať v ponuke</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Hľadať podľa názvu, príchute alebo tagu…"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-cream-200 bg-cream-50 py-3 pl-12 pr-4 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
            </label>
            <button
              type="button"
              onClick={() => setLegendOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold-200 bg-cream-50 px-5 py-2.5 text-sm font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <Info className="h-4 w-4 text-gold-700" aria-hidden="true" />
              Legenda alergénov
            </button>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl space-y-20 px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
              <p className="font-medium text-cocoa-500">Pripravujem ponuku…</p>
            </div>
          ) : (
            <>
              {MENU_CATEGORIES.map((group) => {
                const items = filteredProducts.filter((p) => p.category === group.category);
                return (
                  <ProductGroup
                    key={group.category}
                    eyebrow={group.eyebrow}
                    title={group.title}
                    description={group.description}
                    note={group.note}
                    products={items}
                    onSelect={setSelectedProduct}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}

              {filteredProducts.length === 0 && (
                <div className="rounded-3xl border border-dashed border-cream-300 bg-white p-12 text-center">
                  <p className="font-display text-2xl font-semibold text-cocoa-900">Nič sa nenašlo</p>
                  <p className="mt-2 text-cocoa-600">Skúste iné kľúčové slovo alebo si pozrite celú ponuku.</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-cocoa-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-cocoa-900"
                  >
                    Zobraziť celú ponuku
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {!loading && filteredProducts.some((p) => !CATEGORY_ORDER.includes(p.category)) && (
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-sm text-cocoa-500">Ďalšie produkty zo systému admina sú dostupné na špecifických podstránkach.</p>
          </div>
        </section>
      )}

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />

      <QuantityPickerModal
        product={pickerProduct}
        onClose={() => setPickerProduct(null)}
        onConfirm={handlePickerConfirm}
      />

      {/* allergen legend modal */}
      {legendOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-cocoa-950/70 p-3 sm:p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setLegendOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="watercolor-wash relative flex-none border-b border-cream-200 px-5 py-4 sm:px-7 sm:py-5">
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-gold-700">Zoznam alergénov</p>
                  <h3 className="mt-1.5 font-display text-xl font-semibold text-cocoa-950 sm:text-2xl">Smernica 1169/2011 EÚ</h3>
                  <div className="mt-2">
                    <GoldDivider align="left" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setLegendOpen(false)}
                  className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100"
                >
                  <span className="sr-only">Zavrieť</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto px-5 py-4 sm:px-7 sm:py-5">
              <ul className="grid auto-rows-fr gap-1.5 sm:grid-cols-2">
                {ALLERGENS.map((allergen) => (
                  <li
                    key={allergen.id}
                    className="flex h-full items-start gap-2 rounded-lg bg-cream-50 px-2.5 py-2"
                  >
                    <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
                      {allergen.id}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight text-cocoa-900">{allergen.name}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-cocoa-500">{allergen.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-lg border border-gold-200 bg-gold-100/40 p-3 text-[11px] leading-5 text-cocoa-700">
                {ALLERGEN_DISCLAIMER}
              </p>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          actionLabel="Prejsť na dopyt"
          onAction={() => navigate('/objednavka')}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};

export default Menu;
