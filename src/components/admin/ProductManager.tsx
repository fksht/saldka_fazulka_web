import { useEffect, useState } from 'react';
import { Check, Edit2, EyeOff, Loader2, Plus, Trash2, X } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Product, ProductFormValues } from '../../types';
import { formatPrice } from '../../utils/format';
import { Button } from '../ui/Button';
import AdminProductForm from './AdminProductForm';

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const data = await dataService.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchProducts();
  }, []);

  const closeForm = () => {
    setEditingProduct(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (values: ProductFormValues) => {
    if (editingProduct) {
      await dataService.updateProduct(editingProduct.id, values);
    } else {
      await dataService.addProduct(values);
    }

    closeForm();
    await fetchProducts();
  };

  const toggleAvailability = async (product: Product) => {
    await dataService.updateProduct(product.id, { available: !product.available });
    await fetchProducts();
  };

  const deleteProduct = async (product: Product) => {
    const message = product.sourcePage
      ? `Produkt "${product.name}" je zo základnej ponuky. Namiesto zmazania sa skryje z webu. Pokračovať?`
      : `Naozaj chcete zmazať produkt "${product.name}"?`;
    if (!window.confirm(message)) return;
    await dataService.deleteProduct(product.id);
    await fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
      </div>
    );
  }

  if (isFormOpen) {
    return <AdminProductForm product={editingProduct ?? undefined} onSubmit={handleSubmit} onCancel={closeForm} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-serif text-3xl font-bold text-cocoa-950">Produkty</h2>
          <p className="mt-1 text-sm text-cocoa-500">Pridávajte, upravujte a skrývajte položky v ponuke.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditingProduct(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Pridať produkt
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center">
          <p className="font-semibold text-cocoa-700">Zatiaľ nie sú pridané žiadne produkty.</p>
          <Button
            type="button"
            className="mt-5"
            onClick={() => {
              setEditingProduct(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Pridať prvý produkt
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-cream-300 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="bg-cream-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Produkt</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Kategória</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Cena</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Stav</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-cocoa-400">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-cream-50/70">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover" />
                        <div>
                          <p className="font-bold text-cocoa-950">{product.name}</p>
                          <p className="text-xs text-cocoa-500">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-cocoa-600">{product.category}</td>
                    <td className="px-5 py-4 text-sm font-bold text-cocoa-900">{formatPrice(product.price, product.priceType, product.unitLabel)}</td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(product)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                          product.available ? 'bg-sage-50 text-sage-700' : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {product.available ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <X className="h-3.5 w-3.5" aria-hidden="true" />}
                        {product.available ? 'Dostupné' : 'Skryté'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
                          onClick={() => {
                            setEditingProduct(product);
                            setIsFormOpen(true);
                          }}
                          title="Upraviť"
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
                          onClick={() => toggleAvailability(product)}
                          title="Skryť alebo zobraziť"
                        >
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="rounded-full p-2 text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                          onClick={() => deleteProduct(product)}
                          title={product.sourcePage ? 'Skryť z ponuky' : 'Zmazať'}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
