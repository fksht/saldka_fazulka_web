import { useEffect, useState } from 'react';
import { ArrowRight, CalendarHeart, CheckCircle2, Heart, MessageCircle, ShoppingBasket, Sparkles, Wheat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import ProductModal from '../components/products/ProductModal';
import { ButtonLink } from '../components/ui/Button';
import SectionHeader from '../components/ui/SectionHeader';
import Toast from '../components/ui/Toast';
import { useCart } from '../context/CartContext';
import { CONTACT_INFO } from '../services/mockData';
import { dataService } from '../services/dataService';
import { Product } from '../types';

const heroImage =
  'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=1800&auto=format&fit=crop';

const process = [
  { title: 'Vyberiete si dobrotu', text: 'Z ponuky, galérie alebo podľa vlastnej predstavy.', icon: ShoppingBasket },
  { title: 'Pošlete dopyt', text: 'Pridáte termín, počet porcií, príchuť a poznámku.', icon: MessageCircle },
  { title: 'Doladíme detaily', text: 'Spolu potvrdíme dekor, cenu, čas a vyzdvihnutie.', icon: CheckCircle2 },
  { title: 'Sladkosť bude pripravená', text: 'Čerstvo upečená, zabalená a pripravená na oslavu.', icon: CalendarHeart },
];

const faqs = [
  {
    question: 'Ako dlho vopred treba objednať?',
    answer: 'Menšie dezerty ideálne aspoň 3 až 5 dní vopred. Torty na mieru a sviatočné termíny odporúčam riešiť 1 až 3 týždne dopredu.',
  },
  {
    question: 'Robíte torty na mieru?',
    answer: 'Áno. Stačí poslať tému, počet porcií, obľúbené chute a prípadne odkaz na inšpiráciu. Návrh a cenu doladíme spolu.',
  },
  {
    question: 'Je cena konečná?',
    answer: 'Pri položkách s cenou od ide o orientačnú sumu. Finálna cena závisí od veľkosti, dekoru, príchutí a náročnosti.',
  },
  {
    question: 'Dá sa objednávka doručiť?',
    answer: 'Primárne funguje vyzdvihnutie po dohode. Doručenie v okolí je možné individuálne podľa termínu a veľkosti objednávky.',
  },
  {
    question: 'Ako prebieha platba?',
    answer: 'V MVP ide o nezáväzný dopyt bez online platby. Platba a potvrdenie objednávky prebehnú po vzájomnej dohode.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { addProduct } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await dataService.getFeaturedProducts();
      setFeaturedProducts(products);
    };

    void fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addProduct(product);
    setToastMessage(`${product.name} je pridané do dopytu.`);
  };

  return (
    <div className="bg-cream-50">
      <section className="relative min-h-[86vh] overflow-hidden">
        <img src={heroImage} alt="Domáce torty a sladké dobroty" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-cocoa-950/86 via-cocoa-900/54 to-cocoa-900/10" />
        <div className="relative mx-auto flex min-h-[86vh] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/14 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              domáca cukrárska dielňa
            </p>
            <h1 className="font-serif text-5xl font-bold leading-[1.02] sm:text-6xl lg:text-7xl">
              Sladká fazuľka
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-cream-100 sm:text-2xl">
              Domáce torty a sladké dobroty pečené s láskou pre oslavy, darčeky a chvíle, ktoré majú chutiť výnimočne.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/ponuka" className="bg-rose-500 hover:bg-rose-600">
                Pozrieť ponuku
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </ButtonLink>
              <ButtonLink to="/objednavka" variant="secondary" className="border-white/35 bg-white/95">
                Objednať sladkosť
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-cream-300 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { title: 'Ručná práca', text: 'Každá objednávka vzniká poctivo a v malých dávkach.', icon: Heart },
            { title: 'Čerstvé suroviny', text: 'Maslo, čokoláda, ovocie a krémy bez zbytočných skratiek.', icon: Wheat },
            { title: 'Na mieru', text: 'Torty, boxy a dezerty vieme prispôsobiť príležitosti.', icon: Sparkles },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-4">
                <div className="rounded-lg bg-rose-50 p-3 text-rose-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="font-bold text-cocoa-950">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-cocoa-600">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeader
              align="left"
              eyebrow="Odporúčané"
              title="Najčastejšie objednávané dobroty"
              description="Malý výber na rýchly štart. Všetko sa dá prispôsobiť podľa termínu, počtu porcií a príchute."
            />
            <ButtonLink to="/ponuka" variant="secondary">
              Celá ponuka
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </div>

          <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} onSelect={setSelectedProduct} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Ako to funguje"
            title="Jednoduchý dopyt bez online platby"
            description="Stránka je pripravená ako objednávkový systém, ale finálne potvrdenie ostáva osobné a bezpečné."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {process.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="relative">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cocoa-800 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">Krok {index + 1}</p>
                  <h3 className="mt-2 text-lg font-bold text-cocoa-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-cocoa-600">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <SectionHeader
            align="left"
            eyebrow="Na mieru"
            title="Máte predstavu torty, ktorá nie je v ponuke?"
            description="Pošlite typ udalosti, počet porcií, obľúbenú príchuť a odkaz na inšpiráciu. Torta na mieru je vždy nacenená individuálne."
          >
            <ButtonLink to="/objednavka">
              Poslať predstavu
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          </SectionHeader>

          <div className="grid gap-4 sm:grid-cols-2">
            {['narodeninové torty', 'sladké boxy', 'mini dezerty na candy bar', 'cupcakes a sezónne dobroty'].map((item) => (
              <div key={item} className="rounded-lg border border-cream-300 bg-white p-5">
                <CheckCircle2 className="mb-4 h-5 w-5 text-sage-600" aria-hidden="true" />
                <p className="font-bold text-cocoa-950">{item}</p>
                <p className="mt-2 text-sm leading-6 text-cocoa-600">Cena, veľkosť a dekor sa doladia podľa termínu a predstavy.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cocoa-900 py-16 text-white sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-200">Referencie</p>
            <h2 className="mt-3 font-serif text-3xl font-bold sm:text-4xl">Sladká bodka, ktorú si hostia zapamätajú.</h2>
          </div>
          <blockquote className="text-xl leading-9 text-cream-100">
            „Torta bola krásna, jemná a presne podľa predstavy. Oceňujem komunikáciu, odporúčanie príchutí aj to, že nebola presladená.“
            <footer className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-rose-200">placeholder referencia</footer>
          </blockquote>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeader eyebrow="FAQ" title="Časté otázky pred objednávkou" />
          <div className="mt-9 divide-y divide-cream-300 rounded-lg border border-cream-300 bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer list-none font-bold text-cocoa-950 marker:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {faq.question}
                    <span className="text-rose-600 transition group-open:rotate-45">+</span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-6 text-cocoa-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rose-600">Kontakt</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-cocoa-950">Termín najlepšie rezervovať vopred.</h2>
            <p className="mt-2 max-w-2xl text-cocoa-600">{CONTACT_INFO.orderNote}</p>
          </div>
          <ButtonLink to="/kontakt" variant="secondary">
            Kontakty
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </ButtonLink>
        </div>
      </section>

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} />

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
