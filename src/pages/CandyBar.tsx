import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, MapPin, PackageCheck, Truck } from 'lucide-react';
import PackageCard from '../components/candybar/PackageCard';
import GoldDivider from '../components/ui/GoldDivider';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import { ButtonLink } from '../components/ui/Button';
import { useCart } from '../context/CartContext';
import { CANDY_BAR_INFO, SECTION_IMAGES } from '../data/sladkaFazulkaCatalog';
import { dataService } from '../services/dataService';
import { CandyBarPackage } from '../types';

const CandyBar = () => {
  const navigate = useNavigate();
  const { addPackage } = useCart();
  const [packages, setPackages] = useState<CandyBarPackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackages = async () => {
      setLoadingPackages(true);
      const data = await dataService.getCandyBarPackages();
      setPackages(data.filter((pkg) => !pkg.hidden));
      setLoadingPackages(false);
    };

    void fetchPackages();
  }, []);

  const handleRequest = (pkg: CandyBarPackage) => {
    addPackage(pkg);
    setToastMessage(`${pkg.name} je v dopyte.`);
  };

  return (
    <div className="bg-cream-50">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-cream-200 bg-white py-16 sm:py-20">
        <div className="watercolor-wash absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Candy bar</p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] text-cocoa-950 sm:text-5xl lg:text-6xl">
              Sladký servis na mieru
            </h1>
            <div className="mt-5">
              <GoldDivider align="left" />
            </div>
            <p className="mt-5 font-script text-2xl text-rose-700">Individuálny prístup pre 20 – 150 hostí.</p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-cocoa-700">{CANDY_BAR_INFO.intro}</p>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-rose-100/40 blur-3xl" aria-hidden="true" />
            <img
              src={SECTION_IMAGES.candyBar}
              alt="Aranžovaný svadobný candy bar"
              className="mx-auto w-full max-w-sm rounded-3xl shadow-xl ring-1 ring-cream-200 lg:max-w-none"
            />
          </div>
        </div>
      </section>

      {/* SERVICE */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Servis v Košiciach"
            title="Doprava, prenájom inventáru a aranžovanie"
            withDivider
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-cream-200 bg-white p-7 transition hover:border-rose-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
                <PackageCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-cocoa-950">Kompletný servis 60 €</h3>
              <p className="mt-2 text-sm leading-6 text-cocoa-600">V cene v rámci Košíc:</p>
              <ul className="mt-3 space-y-1.5 text-sm text-cocoa-700">
                {CANDY_BAR_INFO.setupIncludes.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </article>
            <article className="rounded-3xl border border-cream-200 bg-white p-7 transition hover:border-rose-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cream-100 text-cocoa-700">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-cocoa-950">Záloha za podnosy 50 €</h3>
              <p className="mt-2 text-sm leading-6 text-cocoa-600">{CANDY_BAR_INFO.trayNote}</p>
            </article>
            <article className="rounded-3xl border border-cream-200 bg-white p-7 transition hover:border-rose-200 hover:shadow-md">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-100 text-gold-700">
                <Truck className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-cocoa-950">Mimo Košíc</h3>
              <p className="mt-2 text-sm leading-6 text-cocoa-600">{CANDY_BAR_INFO.outsideKosice}</p>
            </article>
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Candy bar balíčky"
            title="Pre jednoduchší výber odporúčam balíček"
            scriptEyebrow="~ 5 ks zákuskov na osobu"
            description="Konkrétne zákusky vyberáme spolu — s ohľadom na hostí, charakter udalosti a vaše preferencie."
            withDivider
          />
          {loadingPackages ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-10 w-10 animate-spin text-rose-500" aria-hidden="true" />
            </div>
          ) : packages.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-cream-300 bg-cream-50 p-10 text-center">
              <p className="font-semibold text-cocoa-700">Balíčky sú dočasne nedostupné.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg, index) => (
                <PackageCard key={pkg.id} pkg={pkg} onRequest={handleRequest} highlight={index === 1} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-3xl border border-cream-200 bg-cream-50 px-6 py-10 sm:px-10 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-600">Vlastná zostava</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa-950">
              Chcete candy bar po kuse?
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-cocoa-600">
              Pridajte konkrétne zákusky priamo z cenníka — odporúčané množstvá doladíme spolu, aby vám nič nechýbalo a zároveň nezostalo priveľa.
            </p>
          </div>
          <ButtonLink to="/ponuka" variant="secondary">
            Otvoriť ponuku
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
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

export default CandyBar;
