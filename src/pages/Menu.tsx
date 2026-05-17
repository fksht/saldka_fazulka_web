import { useEffect, useMemo, useState } from 'react';
import { Loader2, Search, ShoppingBasket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CategoryFilter from '../components/products/CategoryFilter';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../services/mockData';
import { dataService } from '../services/dataService';
import { Category, Product } from '../types';

const Menu = () => {
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Všetko'>('Všetko');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'Všetko' || product.category === selectedCategory;
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addProduct(product);
    setToastMessage(`${product.name} je pridané do dopytu.`);
  };

  return (
    <div className="bg-cream-50">
      <section className="border-b border-cream-300 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Ponuka"
            title="Sladkosti pre oslavy, návštevy aj malé radosti."
            description="Vyberte si z orientačnej ponuky alebo pošlite predstavu na mieru. Pri tortách a väčších objednávkach cenu doladíme osobne."
          />

          <div className="mx-auto mt-9 max-w-xl">
            <label className="relative block">
              <span className="sr-only">Hľadať v ponuke</span>
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-cocoa-400" aria-hidden="true" />
              <input
                type="search"
                placeholder="Hľadať podľa názvu, príchute alebo tagu..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-full border border-cream-300 bg-cream-50 py-3 pl-12 pr-4 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
              />
            </label>
          </div>

          <div className="mt-7">
            <CategoryFilter categories={CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
              <p className="font-medium text-cocoa-500">Pripravujem ponuku...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center">
              <p className="text-lg font-semibold text-cocoa-800">Nenašli sa žiadne produkty.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('Všetko');
                  setSearchQuery('');
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-cocoa-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-cocoa-900"
              >
                <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                Zobraziť celú ponuku
              </button>
            </div>
          )}
        </div>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />

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
