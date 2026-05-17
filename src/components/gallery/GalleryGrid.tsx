import { GalleryImage } from '../../types';

type GalleryGridProps = {
  images: GalleryImage[];
};

const GalleryGrid = ({ images }: GalleryGridProps) => {
  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-cream-400 bg-white p-12 text-center text-cocoa-500">
        Galéria je zatiaľ prázdna.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {images.map((image, index) => (
        <figure
          key={image.id}
          className={`group relative overflow-hidden rounded-lg bg-cream-100 shadow-sm ${
            index % 7 === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
          }`}
        >
          <img
            src={image.imageUrl}
            alt={image.caption}
            className="aspect-square h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-cocoa-950/85 to-transparent p-4 text-white opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-100">{image.category}</p>
            <p className="mt-1 font-semibold">{image.caption}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
};

export default GalleryGrid;
