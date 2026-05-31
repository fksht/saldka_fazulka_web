import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Edit2, Eye, EyeOff, ImagePlus, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import { dataService } from '../../services/dataService';
import { uploadImage } from '../../services/storage';
import { GALLERY_CATEGORIES } from '../../data/sladkaFazulkaCatalog';
import { GalleryImage, GalleryImageDraft } from '../../types';
import { Button } from '../ui/Button';

const initialDraft: GalleryImageDraft = {
  imageUrl: '',
  caption: '',
  category: GALLERY_CATEGORIES[1] ?? GALLERY_CATEGORIES[0],
  featured: false,
  hidden: false,
};

const inputClass =
  'w-full rounded-lg border border-cream-300 bg-white px-4 py-3 text-cocoa-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100';

const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [draft, setDraft] = useState<GalleryImageDraft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchImages = async () => {
    setLoading(true);
    const data = await dataService.getGalleryImages();
    setImages(data);
    setLoading(false);
  };

  useEffect(() => {
    void fetchImages();
  }, []);

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await uploadImage(file, 'gallery');
      setDraft((current) => ({ ...current, imageUrl: url }));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Nahranie obrázka zlyhalo.');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(initialDraft);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    if (editingId) {
      await dataService.updateGalleryImage(editingId, draft);
    } else {
      await dataService.addGalleryImage(draft);
    }
    setEditingId(null);
    setDraft(initialDraft);
    await fetchImages();
    setIsSaving(false);
  };

  const startEdit = (image: GalleryImage) => {
    setEditingId(image.id);
    setDraft({
      imageUrl: image.imageUrl,
      caption: image.caption,
      category: image.category,
      featured: image.featured,
      hidden: image.hidden ?? false,
    });
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleVisibility = async (image: GalleryImage) => {
    await dataService.updateGalleryImage(image.id, { hidden: !image.hidden });
    await fetchImages();
  };

  const deleteImage = async (image: GalleryImage) => {
    if (!window.confirm(`Zmazať obrázok "${image.caption}"?`)) return;
    if (editingId === image.id) cancelEdit();
    await dataService.deleteGalleryImage(image.id);
    await fetchImages();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-3xl font-bold text-cocoa-950">Galéria</h2>
        <p className="mt-1 text-sm text-cocoa-500">Pridávajte, upravujte a skrývajte fotky tort, boxov a dezertov.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`rounded-lg border bg-white p-5 shadow-sm sm:p-7 ${editingId ? 'border-rose-300 ring-2 ring-rose-100' : 'border-cream-300'}`}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-700">
            {editingId ? 'Upraviť fotku' : 'Pridať fotku'}
          </p>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 rounded-full border border-cream-300 px-3 py-1.5 text-xs font-semibold text-cocoa-700 transition hover:border-rose-300 hover:bg-rose-50"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Zrušiť úpravu
            </button>
          )}
        </div>

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
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">
                {editingId ? 'Nahrať novú fotku (voliteľné)' : 'Nahrať fotku'}
              </span>
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                onChange={handleImageUpload}
                className="block w-full text-sm text-cocoa-600 file:mr-4 file:rounded-full file:border-0 file:bg-cocoa-800 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-cocoa-900 disabled:opacity-50"
              />
              {isUploading && <span className="mt-1 block text-xs font-semibold text-cocoa-500">Nahrávam obrázok…</span>}
              {uploadError && <span className="mt-1 block text-xs font-semibold text-red-600">{uploadError}</span>}
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">URL obrázka</span>
              <input
                required
                value={draft.imageUrl}
                onChange={(event) => setDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                className={inputClass}
                placeholder="https://..."
              />
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Kategória</span>
              <select
                value={draft.category}
                onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                className={inputClass}
              >
                {GALLERY_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="mb-1 block text-sm font-semibold text-cocoa-700">Popis fotky</span>
              <input
                required
                value={draft.caption}
                onChange={(event) => setDraft((current) => ({ ...current, caption: event.target.value }))}
                className={inputClass}
                placeholder="Narodeninová torta"
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))}
                className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200"
              />
              Odporúčané v galérii
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-cream-300 bg-cream-50 px-4 py-2 text-sm font-semibold text-cocoa-700">
              <input
                type="checkbox"
                checked={draft.hidden ?? false}
                onChange={(event) => setDraft((current) => ({ ...current, hidden: event.target.checked }))}
                className="h-4 w-4 rounded border-cream-300 text-rose-600 focus:ring-rose-200"
              />
              Skryť z verejnej galérie
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="submit" disabled={isSaving}>
            {editingId ? <Save className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
            {isSaving ? 'Ukladám…' : editingId ? 'Uložiť zmeny' : 'Pridať fotku'}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
        </div>
      ) : images.length === 0 ? (
        <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center">
          <p className="font-semibold text-cocoa-700">Zatiaľ nie sú pridané žiadne fotografie.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => {
            const isEditing = editingId === image.id;
            return (
              <figure
                key={image.id}
                className={`relative overflow-hidden rounded-lg border bg-white shadow-sm transition ${
                  isEditing ? 'border-rose-400 ring-2 ring-rose-100' : 'border-cream-300'
                } ${image.hidden ? 'opacity-70' : ''}`}
              >
                <div className="relative">
                  <img
                    src={image.imageUrl}
                    alt={image.caption}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  {image.hidden && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cocoa-900/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      <EyeOff className="h-3 w-3" aria-hidden="true" />
                      Skryté
                    </span>
                  )}
                  {image.featured && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-500/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                      Odporúčané
                    </span>
                  )}
                </div>
                <figcaption className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-bold text-cocoa-900">{image.caption}</p>
                    <p className="text-sm text-cocoa-500">{image.category}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(image)}
                      title="Upraviť"
                      className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
                    >
                      <span className="sr-only">Upraviť obrázok</span>
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(image)}
                      title={image.hidden ? 'Zobraziť na webe' : 'Skryť z webu'}
                      className="rounded-full p-2 text-cocoa-500 transition hover:bg-cream-100 hover:text-cocoa-900"
                    >
                      <span className="sr-only">{image.hidden ? 'Zobraziť' : 'Skryť'}</span>
                      {image.hidden ? <Eye className="h-4 w-4" aria-hidden="true" /> : <EyeOff className="h-4 w-4" aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteImage(image)}
                      title="Zmazať"
                      className="rounded-full p-2 text-cocoa-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <span className="sr-only">Zmazať obrázok</span>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
