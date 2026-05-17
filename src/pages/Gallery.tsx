import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import GalleryGrid from '../components/gallery/GalleryGrid';
import CategoryFilter from '../components/products/CategoryFilter';
import SectionHeader from '../components/ui/SectionHeader';
import { CATEGORIES } from '../services/mockData';
import { dataService } from '../services/dataService';
import { Category, GalleryImage } from '../types';

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'Všetko'>('Všetko');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      const data = await dataService.getGalleryImages();
      setImages(data);
      setLoading(false);
    };

    void fetchImages();
  }, []);

  const filteredImages = useMemo(
    () => images.filter((image) => selectedCategory === 'Všetko' || image.category === selectedCategory),
    [images, selectedCategory],
  );

  return (
    <div className="bg-cream-50">
      <section className="border-b border-cream-300 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Galéria"
            title="Inšpirácie z predchádzajúcich objednávok"
            description="Fotky sú pripravené tak, aby ich bolo možné jednoducho vymeniť za reálne výtvory Sladkej fazuľky."
          />
          <div className="mt-8">
            <CategoryFilter categories={CATEGORIES} selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
            </div>
          ) : (
            <GalleryGrid images={filteredImages} />
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
