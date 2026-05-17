import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { ImagePlus, Save, X } from 'lucide-react';
import { CATEGORIES } from '../../services/mockData';
import { PriceType, Product, ProductFormValues } from '../../types';
import { slugify } from '../../services/dataService';
import { Button } from '../ui/Button';

type AdminProductFormProps = {
  product?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
};

const emptyValues: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  category: 'Torty',
  imageUrl: '',
  galleryImages: [],
  price: null,
  priceType: 'from',
  tags: [],
  available: true,
  featured: false,
};

const inputClass =
  'w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const AdminProductForm = ({ product, onSubmit, onCancel }: AdminProductFormProps) => {
  const [values, setValues] = useState<ProductFormValues>(product ?? emptyValues);
  const [tagsInput, setTagsInput] = useState(product?.tags.join(', ') ?? '');
  const [isSaving, setIsSaving] = useState(false);

  const previewUrl = useMemo(() => values.imageUrl || product?.imageUrl || '', [product?.imageUrl, values.imageUrl]);

  const updateField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      updateField('imageUrl', String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    const cleanTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    await onSubmit({
      ...values,
      slug: values.slug || slugify(values.name),
      price: values.priceType === 'on_request' ? null : values.price,
      tags: cleanTags,
    });

    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-cream-300 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">
            {product ? 'Upraviť produkt' : 'Nový produkt'}
          </p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-cocoa-950">
            {product ? product.name : 'Pridať produkt do ponuky'}
          </h2>
        </div>
        <button type="button" className="rounded-full p-2 text-cocoa-500 hover:bg-cream-100 hover:text-cocoa-900" onClick={onCancel}>
          <span className="sr-only">Zavrieť formulár</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-lg border border-cream-300 bg-cream-100">
            {previewUrl ? (
              <img src={previewUrl} alt="Náhľad produktu" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-cocoa-400">
                <ImagePlus className="h-10 w-10" aria-hidden="true" />
                <span className="text-sm font-semibold">Náhľad obrázka</span>
              </div>
            )}
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Nahrať obrázok</span>
            <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-cocoa-600 file:mr-4 file:rounded-full file:border-0 file:bg-cocoa-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-cocoa-900" />
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Alebo URL obrázka</span>
            <input value={values.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} className={inputClass} placeholder="https://..." />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Názov</span>
            <input
              required
              value={values.name}
              onChange={(event) => {
                updateField('name', event.target.value);
                if (!product) updateField('slug', slugify(event.target.value));
              }}
              className={inputClass}
              placeholder="Napr. Jahodová torta"
            />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Slug</span>
            <input value={values.slug} onChange={(event) => updateField('slug', event.target.value)} className={inputClass} />
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Kategória</span>
            <select value={values.category} onChange={(event) => updateField('category', event.target.value as ProductFormValues['category'])} className={inputClass}>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Typ ceny</span>
            <select value={values.priceType} onChange={(event) => updateField('priceType', event.target.value as PriceType)} className={inputClass}>
              <option value="fixed">Fixná cena</option>
              <option value="from">Cena od</option>
              <option value="on_request">Cena po dohode</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Cena v EUR</span>
            <input
              type="number"
              step="0.1"
              min="0"
              disabled={values.priceType === 'on_request'}
              value={values.price ?? ''}
              onChange={(event) => updateField('price', event.target.value ? Number(event.target.value) : null)}
              className={inputClass}
              placeholder="35"
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Popis</span>
            <textarea
              required
              rows={4}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={inputClass}
              placeholder="Krátky opis produktu..."
            />
          </label>

          <label className="sm:col-span-2">
            <span className="mb-1 block text-sm font-semibold text-cocoa-700">Tagy oddelené čiarkou</span>
            <input value={tagsInput} onChange={(event) => setTagsInput(event.target.value)} className={inputClass} placeholder="narodeniny, bez lepku možnosť" />
          </label>

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700">
              <input type="checkbox" checked={values.available} onChange={(event) => updateField('available', event.target.checked)} className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200" />
              Dostupné v ponuke
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700">
              <input type="checkbox" checked={values.featured} onChange={(event) => updateField('featured', event.target.checked)} className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200" />
              Odporúčané na úvode
            </label>
          </div>
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Zrušiť
        </Button>
        <Button type="submit" disabled={isSaving}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {isSaving ? 'Ukladám...' : 'Uložiť produkt'}
        </Button>
      </div>
    </form>
  );
};

export default AdminProductForm;
