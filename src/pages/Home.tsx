import { useEffect, useState } from 'react';
import {
  ArrowRight,
  CalendarHeart,
  CheckCircle2,
  Heart,
  Leaf,
  MessageCircle,
  ShoppingBasket,
  Sparkles,
  Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import QuantityPickerModal from '../components/products/QuantityPickerModal';
import { ButtonLink } from '../components/ui/Button';
import GoldDivider from '../components/ui/GoldDivider';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { useSeo } from '../hooks/useSeo';
import { CONTACT_INFO } from '../services/mockData';
import { dataService } from '../services/dataService';
import { SECTION_IMAGES } from '../data/sladkaFazulkaCatalog';
import { Product } from '../types';

const trustPills = [
  { title: 'Ručná výroba', text: 'V menších množstvách, s dôrazom na chuť a detail.', icon: Heart },
  { title: 'Individuálny prístup', text: 'Každú objednávku riešim osobne, podľa vašej príležitosti.', icon: Users },
  { title: 'Candy bary s prehľadom', text: 'Hotové balíčky pre 20 – 150 hostí, kompletný servis v Košiciach.', icon: Sparkles },
  { title: 'Vegan & bezlepkové', text: 'Fazuľkové brownie a alternatívy pre špeciálne požiadavky.', icon: Leaf },
];

const steps = [
  { title: 'Vyberiete si dobrotu', text: 'Z ponuky, candy baru, výslužiek alebo cez konfigurátor torty na mieru.', icon: ShoppingBasket },
  { title: 'Odošlete nezáväzný dopyt', text: 'Pridáte termín, počet hostí, alergie a poznámku k dekoru.', icon: MessageCircle },
  { title: 'Spolu doladím detaily', text: 'Potvrdíme dekor, cenu, presný čas a vyzdvihnutie.', icon: CheckCircle2 },
  { title: 'Sladkosti budú pripravené', text: 'Čerstvo upečené, krásne aranžované, presne na váš deň.', icon: CalendarHeart },
];

const faqs = [
  {
    question: 'Ako dlho vopred mám objednať?',
    answer:
      'Pri menších zákuskoch ideálne aspoň 5 – 7 dní vopred. Pri tortách na mieru, svadbách a candy baroch sa ozvite s 4 – 8-týždňovým predstihom, najmä počas svadobnej sezóny — vďaka tomu vám viem podržať termín a všetko v pokoji pripraviť.',
  },
  {
    question: 'Ako prebieha potvrdenie objednávky?',
    answer:
      'Po odoslaní formulára vám príde rekapitulácia na email. Objednávku potvrdím až po vzájomnej dohode — väčšinou krátkou správou alebo telefonátom. Vďaka tomu si overíme dostupnosť termínu, dekor a finálnu cenu.',
  },
  {
    question: 'Robíte alternatívy pre alergikov?',
    answer:
      'Áno. V ponuke sú fazuľkové brownie kocky a špeciality bez lepku a bez mlieka v receptúre, pri tortách viem pripraviť aj vegan krém. Všetko však vzniká v dielni, kde sa pracuje aj s alergénmi, preto detaily napíšte do poznámky a výber spolu overíme.',
  },
  {
    question: 'Aký je servis pri candy bare?',
    answer:
      'V Košiciach je 60 € za kompletný servis: doprava, aranžovanie, zapožičanie podnosov a vyzdvihnutie na druhý deň. Záloha za podnosy je 50 € (vratná). Mimo Košíc je doprava dohodou podľa vzdialenosti.',
  },
  {
    question: 'Dá sa platiť online?',
    answer:
      'Zatiaľ nie. Cez web posielate nezáväzný dopyt — finálna cena a spôsob platby sa dohadujú osobne po potvrdení termínu. Tak máme istotu, že všetko sedí, a vy nič neplatíte vopred naslepo.',
  },
];

const Home = () => {
  useSeo('/');
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await dataService.getFeaturedProducts();
      setFeaturedProducts(products);
    };

    void fetchProducts();
  }, []);

  const needsPicker = (product: Product) =>
    (product.minimumOrderQuantity ?? 1) > 1 || (product.variants?.length ?? 0) >= 2;

  const handleAddToCart = (product: Product) => {
    if (needsPicker(product)) {
      setPickerProduct(product);
      return;
    }
    addProduct(product);
    setToastMessage(`${product.name} je pridané do dopytu.`);
  };

  const handlePickerConfirm = (product: Product, quantity: number, variant?: string) => {
    addProduct(product, quantity, variant);
    const variantSuffix = variant ? ` — ${variant}` : '';
    setToastMessage(`${product.name}${variantSuffix} (${quantity} ks) je pridané do dopytu.`);
  };

  return (
    <div className="bg-cream-50">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="watercolor-wash absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-200 bg-cream-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Domáca cukrárska dielňa · Košice
            </p>
            <h1 className="font-display text-[2.75rem] font-semibold leading-[1.02] text-cocoa-950 sm:text-6xl lg:text-7xl">
              Sladká fazuľka
            </h1>
            <div className="mt-4">
              <GoldDivider align="left" />
            </div>
            <p className="mt-4 font-script text-3xl leading-tight text-gold-600 sm:text-4xl">
              Candy bary, zákusky a torty na mieru
            </p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cocoa-700">
              Na svadby, oslavy a výnimočné príležitosti — s dôrazom na chuť a detail. Ručná výroba, originálne fazuľkové recepty a osobný prístup ku každej objednávke.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/ponuka">
                Pozrieť ponuku
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/objednavka" variant="secondary">
                Odoslať nezáväznú objednávku
              </ButtonLink>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-rose-100/40 blur-3xl" aria-hidden="true" />
            <picture>
              <source srcSet={SECTION_IMAGES.heroWebp} type="image/webp" />
              <img
                src={SECTION_IMAGES.hero}
                alt="Svadobný candy bar so zákuskami, mini dezertami a dvojposchodovou tortou"
                width={900}
                height={1200}
                fetchPriority="high"
                decoding="async"
                className="mx-auto w-full max-w-md rounded-3xl object-cover shadow-xl ring-1 ring-cream-200 lg:max-w-none"
              />
            </picture>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="border-y border-cream-200 bg-cream-100/60 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustPills.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="rounded-2xl bg-white p-3 text-rose-600 shadow-sm ring-1 ring-cream-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-semibold text-cocoa-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-cocoa-600">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeader
              align="left"
              eyebrow="Odporúčané"
              title="Ochutnajte ručne pripravované špeciality"
              description="Malý výber z ponuky — od mini zákuskov cez torty až po bezlepkové fazuľkové brownie. Prehľadná ponuka = jednoduché rozhodovanie."
            />
            <ButtonLink to="/ponuka" variant="secondary">
              Celá ponuka
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onSelect={setSelectedProduct} />
            ))}
          </div>
        </div>
      </section>

      {/* CAKE + CANDY BAR TEASER */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24">
        <div className="watercolor-wash absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="group relative overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 p-8 transition hover:border-gold-200 hover:shadow-lg sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Torty na mieru</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-cocoa-950 sm:text-4xl">
              Vyskladajte si tortu krok za krokom
            </h2>
            <p className="mt-4 leading-7 text-cocoa-700">
              Vyberte korpus (vrátane bezlepkového z červenej fazule), kombináciu krémov a veľkosť od 4 do 40 porcií. Cena „od" sa potvrdzuje po doladení dekoru.
            </p>
            <ButtonLink to="/torty-na-mieru" className="mt-7">
              Otvoriť konfigurátor
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </article>
          <article className="group relative overflow-hidden rounded-3xl border border-cream-200 bg-cream-50 p-8 transition hover:border-gold-200 hover:shadow-lg sm:p-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Candy bar balíčky</p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-cocoa-950 sm:text-4xl">
              Sladký servis na mieru
            </h2>
            <p className="mt-3 font-script text-2xl text-rose-700">Pre 20 – 150 hostí.</p>
            <p className="mt-4 leading-7 text-cocoa-700">
              7 hotových balíčkov od Mini (200 €) až po Exclusive Plus (1 300 €). V Košiciach 60 € za kompletné aranžovanie, dopravu a podnosy.
            </p>
            <ButtonLink to="/candy-bar" className="mt-7">
              Pozrieť balíčky
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </article>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Ako to funguje"
            title="Jednoduchý dopyt bez online platby"
            scriptEyebrow="Sladký servis na mieru"
            description="Stránka je nezáväzný objednávkový systém — finálne potvrdenie ostáva osobné a bezpečné."
            withDivider
          />

          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="relative rounded-2xl border border-cream-200 bg-white p-6 transition hover:border-rose-200 hover:shadow-md">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cocoa-800 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-700">Krok {index + 1}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold text-cocoa-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cocoa-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="Časté otázky" title="Pred odoslaním objednávky" withDivider />
          <div className="mt-10 divide-y divide-cream-200 overflow-hidden rounded-2xl border border-cream-200 bg-cream-50">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-6 transition hover:bg-white/70">
                <summary className="cursor-pointer list-none font-display text-lg font-semibold text-cocoa-950 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-xl text-rose-600 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-cocoa-700">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section className="py-16">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 rounded-3xl border border-cream-200 bg-cream-50 px-6 py-10 sm:px-10 md:flex-row md:items-center lg:mx-auto">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold-700">Kontakt</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-cocoa-950">
              Najlepšie je rezervovať termín vopred
            </h2>
            <p className="mt-3 max-w-2xl leading-7 text-cocoa-600">{CONTACT_INFO.orderNote}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/kontakt" variant="secondary">
              Kontakty
            </ButtonLink>
            <ButtonLink to="/objednavka">
              Poslať dopyt
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />

      <QuantityPickerModal
        product={pickerProduct}
        onClose={() => setPickerProduct(null)}
        onConfirm={handlePickerConfirm}
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

export default Home;
