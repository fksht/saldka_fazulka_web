import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, Heart } from 'lucide-react';
import GoldDivider from '../components/ui/GoldDivider';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import TastingBoxModal from '../components/order/TastingBoxModal';
import { Button, ButtonLink } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { useSeo } from '../hooks/useSeo';
import { SECTION_IMAGES, TASTING_BOXES } from '../data/sladkaFazulkaCatalog';
import { TastingBox, TastingDetails } from '../types';
import { formatPrice } from '../utils/format';

const Ochutnavka = () => {
  useSeo('/ochutnavkovy-box');
  const navigate = useNavigate();
  const { addTastingBox } = useCart();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pickerTasting, setPickerTasting] = useState<TastingBox | null>(null);

  const handleRequest = (tasting: TastingBox) => {
    setPickerTasting(tasting);
  };

  const handleConfirm = (tasting: TastingBox, details: TastingDetails) => {
    addTastingBox(tasting, details);
    setToastMessage(`${tasting.title} je v dopyte.`);
  };

  return (
    <div className="bg-cream-50">
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-16 sm:py-20">
        <div className="watercolor-wash absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Ochutnávkový box</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-cocoa-950 sm:text-5xl lg:text-6xl">
              Ochutnajte. Rozhodnite sa. Zamilujte sa.
            </h1>
            <div className="mt-5">
              <GoldDivider align="left" />
            </div>
            <p className="mt-5 max-w-xl text-lg leading-8 text-cocoa-700">
              Ochutnávka vám pomôže vybrať dezerty, ktoré budú srdcom vášho menu. Termíny dohadujem osobne, podľa dostupnosti pred svadobnou sezónou.
            </p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-rose-100/40 blur-3xl" aria-hidden="true" />
            <img
              src={SECTION_IMAGES.ochutnavka}
              alt="Bento tortička s perlovou dekoráciou"
              className="mx-auto w-full max-w-sm rounded-3xl shadow-xl ring-1 ring-cream-200 lg:max-w-none"
            />
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Dva spôsoby ochutnávky"
            title="Zákusky alebo bento tortička"
            description="Cena ochutnávky bude odpočítaná z konečnej ceny svadobnej objednávky."
            withDivider
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {TASTING_BOXES.map((tasting) => (
              <article
                key={tasting.id}
                className="flex h-full flex-col rounded-[1.4rem] border border-cream-200 bg-white p-7 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                  <Heart className="h-5 w-5 fill-rose-400 text-rose-500" aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-semibold leading-tight text-cocoa-950">{tasting.title}</h3>
                <p className="mt-2 text-sm leading-6 text-cocoa-600">{tasting.description}</p>
                <div className="mt-4 border-t border-dashed border-cream-200 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gold-700">Cena</p>
                  <p className="mt-1 font-display text-3xl font-semibold text-cocoa-950">
                    {formatPrice(tasting.price, tasting.priceType)}
                  </p>
                </div>
                <ul className="mt-4 flex-1 space-y-2 text-xs leading-5 text-cocoa-500">
                  {tasting.notes.map((note) => (
                    <li key={note}>· {note}</li>
                  ))}
                </ul>
                <Button type="button" onClick={() => handleRequest(tasting)} className="mt-6">
                  <ShoppingBasket className="h-4 w-4" aria-hidden="true" />
                  Dopytovať ochutnávku
                </Button>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-3xl border border-gold-200 bg-cream-50 p-7 sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Plánujete svadbu?</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-cocoa-950 sm:text-3xl">
              Ochutnávka uľahčí výber zákuskov pre candy bar aj tortu
            </h3>
            <p className="mt-3 max-w-2xl leading-7 text-cocoa-600">
              Ak si chcete byť istí každým detailom, otvorte konfigurátor torty alebo si pozrite candy bar balíčky — výslednú kombináciu doladím pri ochutnávke.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink to="/torty-na-mieru" variant="secondary">Konfigurátor torty</ButtonLink>
              <ButtonLink to="/candy-bar" variant="secondary">Candy bar balíčky</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <TastingBoxModal
        tasting={pickerTasting}
        onClose={() => setPickerTasting(null)}
        onConfirm={handleConfirm}
      />

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

export default Ochutnavka;
