import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import GalleryLightbox from '../components/gallery/GalleryLightbox';
import SectionHeader from '../components/ui/SectionHeader';
import { dataService } from '../services/dataService';
import { useSeo } from '../hooks/useSeo';
import { GALLERY_CATEGORIES } from '../data/sladkaFazulkaCatalog';
import { GalleryImage } from '../types';

const Gallery = () => {
  useSeo('/galeria');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Všetko');
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const data = await dataService.getGalleryImages();
      setImages(data.filter((image) => !image.hidden));
      setLoading(false);
    };

    void fetchImages();
  }, []);

  const filteredImages = useMemo(
    () => images.filter((image) => selectedCategory === 'Všetko' || image.category === selectedCategory),
    [images, selectedCategory],
  );

  const categoryOptions = ['Všetko', ...GALLERY_CATEGORIES];

  return (
    <div className="bg-cream-50">
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-16 sm:py-20">
        <div className="watercolor-wash absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Fotogaléria"
            title="Malá ukážka mojej práce"
            description="Mini dezerty, torty na mieru, candy bary a momenty zo zákulisia. Klikom otvoríte fotku v plnom okne."
            withDivider
          />
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-cocoa-800 text-cream-50 shadow-sm'
                    : 'border border-cream-200 bg-white text-cocoa-600 hover:border-rose-300 hover:bg-rose-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
            </div>
          ) : (
            <GalleryGrid images={filteredImages} onOpen={setOpenImage} />
          )}
        </div>
      </section>

      <GalleryLightbox image={openImage} onClose={() => setOpenImage(null)} />
    </div>
  );
};

export default Gallery;
