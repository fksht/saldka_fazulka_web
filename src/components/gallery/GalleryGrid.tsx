import { GalleryImage } from '../../types';

type GalleryGridProps = {
  images: GalleryImage[];
  onOpen?: (image: GalleryImage) => void;
};

const GalleryGrid = ({ images, onOpen }: GalleryGridProps) => {
  if (images.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-cream-300 bg-white p-12 text-center">
        <p className="font-display text-2xl font-semibold text-cocoa-900">Pre vybraný filter zatiaľ nie sú fotografie</p>
        <p className="mt-2 text-sm text-cocoa-500">Skúste inú kategóriu alebo si pozrite všetko.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <button
          key={image.id}
          type="button"
          onClick={() => onOpen?.(image)}
          className={`group relative block overflow-hidden rounded-[1.4rem] bg-cream-100 shadow-sm ring-1 ring-cream-200 transition hover:-translate-y-0.5 hover:shadow-xl ${
            index % 5 === 0 ? 'lg:col-span-2 lg:row-span-2' : ''
          }`}
        >
          <img
            src={image.imageUrl}
            alt={image.caption}
            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa-950/90 via-cocoa-950/30 to-transparent p-5 text-left text-white">
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-rose-100">{image.category}</span>
            <span className="mt-1 block font-display text-lg font-semibold">{image.caption}</span>
          </span>
        </button>
      ))}
    </div>
  );
};

export default GalleryGrid;
