import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GoldDivider from '../components/ui/GoldDivider';
import WeddingBoxCard from '../components/vysluzky/WeddingBoxCard';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { SECTION_IMAGES, WEDDING_BOXES, WEDDING_BOX_NOTE } from '../data/sladkaFazulkaCatalog';
import { WeddingBox } from '../types';

const Vysluzky = () => {
  const navigate = useNavigate();
  const { addWeddingBox } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleRequest = (box: WeddingBox) => {
    addWeddingBox(box);
    setToastMessage(`${box.name} je pridaná do dopytu.`);
  };

  return (
    <div className="bg-cream-50">
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-16 sm:py-20">
        <div className="watercolor-wash absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Svadobné výslužky Deluxe</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-cocoa-950 sm:text-5xl lg:text-6xl">
              Sladká bodka za vaším veľkým dňom
            </h1>
            <div className="mt-5">
              <GoldDivider align="left" />
            </div>
            <p className="mt-5 font-script text-2xl text-rose-700">Výber prémiových mini zákuskov.</p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-cocoa-700">
              Vyvážená kombinácia chutí, textúr a farieb — vyberám tak, aby krabička pôsobila ako mini darček. Hosťom zostane sladká spomienka aj na druhý deň.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-rose-100/40 blur-3xl" aria-hidden="true" />
            <img
              src={SECTION_IMAGES.vysluzky}
              alt="Trojposchodová torta s ružami a candy bar zostava"
              className="mx-auto w-full max-w-sm rounded-3xl shadow-xl ring-1 ring-cream-200 lg:max-w-none"
            />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Tri veľkosti"
            title="Pre 1, 2 alebo 3 – 4 osoby"
            description="Mix presne dohodneme po výbere termínu — záleží na dostupnosti dezertov v daný deň."
            withDivider
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {WEDDING_BOXES.map((box) => (
              <WeddingBoxCard key={box.id} box={box} onRequest={handleRequest} />
            ))}
          </div>
          <p className="mt-10 rounded-2xl border border-dashed border-gold-200 bg-gold-100/30 p-5 text-sm leading-7 text-cocoa-700">
            <strong className="text-cocoa-900">Dôležité:</strong> {WEDDING_BOX_NOTE}
          </p>
        </div>
      </section>

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

export default Vysluzky;
