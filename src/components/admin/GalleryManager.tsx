import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { CATEGORIES } from '../../services/mockData';
import { dataService } from '../../services/dataService';
import { GalleryImage, GalleryImageDraft } from '../../types';
import { Button } from '../ui/Button';

const initialDraft: GalleryImageDraft = {
  imageUrl: '',
  caption: '',
  category: 'Torty',
  featured: false,
};

const inputClass =
  'w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [draft, setDraft] = useState<GalleryImageDraft>(initialDraft);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    const data = await dataService.getGalleryImages();
    setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchImages();
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDraft((current) => ({ ...current, imageUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    await dataService.addGalleryImage(draft);
    setDraft(initialDraft);
    await fetchImages();
    setIsSaving(false);
  };

  const deleteImage = async (image: GalleryImage) => {
    if (!window.confirm(`Zmazať obrázok "${image.caption}"?`)) return;
    await dataService.deleteGalleryImage(image.id);
    await fetchImages();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-cocoa-950">Galéria</h2>
        <p className="mt-1 text-sm text-cocoa-500">Pridajte fotky tort, boxov a dezertov do verejnej galérie.</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-lg border border-cream-300 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="aspect-[4/3] overflow-hidden rounded-lg border border-cream-300 bg-cream-100">
              {draft.imageUrl ? (
                <img src={draft.imageUrl} alt="Náhľad galérie" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-cocoa-400">
                  <ImagePlus className="h-10 w-10" aria-hidden="true" />
                  <span className="text-sm font-semibold">Náhľad fotky</span>
                </div>
              )}
            </div>
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Nahrať fotku</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-cocoa-600 file:mr-4 file:rounded-full file:border-0 file:bg-cocoa-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-cocoa-900" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">URL obrázka</span>
              <input required value={draft.imageUrl} onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))} className={inputClass} placeholder="https://..." />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Kategória</span>
              <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} className={inputClass}>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Popis fotky</span>
              <input required value={draft.caption} onChange={(event) => setDraft((current) => ({ ...current, caption: event.target.value }))} className={inputClass} placeholder="Narodeninová torta" />
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700 sm:col-span-2">
              <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200" />
              Odporúčané v galérii
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" disabled={isSaving}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {isSaving ? 'Pridávam...' : 'Pridať fotku'}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <figure key={image.id} className="overflow-hidden rounded-lg border border-cream-300 bg-white shadow-sm">
              <img src={image.imageUrl} alt={image.caption} className="aspect-[4/3] w-full object-cover" />
              <figcaption className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-bold text-cocoa-900">{image.caption}</p>
                  <p className="text-sm text-cocoa-500">{image.category}</p>
                </div>
                <button type="button" onClick={() => deleteImage(image)} className="rounded-full p-2 text-cocoa-500 hover:bg-red-50 hover:text-red-700">
                  <span className="sr-only">Zmazať obrázok</span>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
