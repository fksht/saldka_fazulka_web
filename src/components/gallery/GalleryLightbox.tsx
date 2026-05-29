import { useEffect } from 'react';
import { X } from 'lucide-react';
import { GalleryImage } from '../../types';

type GalleryLightboxProps = {
  image: GalleryImage | null;
  onClose: () => void;
};

const GalleryLightbox = ({ image, onClose }: GalleryLightboxProps) => {
  useEffect(() => {
    if (!image) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-cocoa-950/85 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="relative max-h-full max-w-5xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute -right-2 -top-12 rounded-full bg-white/90 p-2 text-cocoa-900 transition hover:bg-white"
        >
          <span className="sr-only">Zavrieť</span>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <img src={image.imageUrl} alt={image.caption} className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl" />
        <p className="mt-3 text-center text-sm font-semibold text-cream-100">{image.caption}</p>
      </div>
    </div>
  );
};

export default GalleryLightbox;
