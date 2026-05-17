import { AboutContent, Category, ContactInfo, GalleryImage, Product } from '../types';

const timestamp = '2026-05-17T12:00:00.000Z';

export const CATEGORIES: Category[] = [
  'Torty',
  'Mini dezerty',
  'Sladké boxy',
  'Cupcakes',
  'Sezónna ponuka',
  'Na mieru',
];

export const ABOUT_CONTENT: AboutContent = {
  eyebrow: 'Príbeh Sladkej fazuľky',
  title: 'Domáce pečenie, ktoré má byť krásne aj poctivé.',
  imageUrl:
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1200&auto=format&fit=crop',
  signature: 'Zuzka',
  paragraphs: [
    'Ahojte, volám sa Zuzka a pečenie je pre mňa spôsob, ako z obyčajného dňa spraviť malú oslavu. Každú tortu skladám tak, aby dávala zmysel chuťou, vzhľadom aj príležitosťou.',
    'Sladká fazuľka je domáca cukrárska dielňa pre torty, sladké boxy a dezerty na objednávku. Používam poctivé suroviny, sezónne ovocie a krémy, ktoré sú jemné, stabilné a nie zbytočne presladené.',
    'Najradšej pripravujem veci na mieru: narodeniny, krstiny, svadobné ochutnávky, firemné pohostenia aj malé darčekové boxy. Stačí poslať predstavu a spolu doladíme veľkosť, príchuť, dekor a termín.',
  ],
};

export const CONTACT_INFO: ContactInfo = {
  email: 'info@sladkafazulka.sk',
  phone: '+421 900 000 000',
  instagram: '@sladkafazulka',
  facebook: 'Sladká fazuľka',
  location: 'Pezinok a okolie, vyzdvihnutie po dohode',
  orderNote: 'Objednávky prijímam ideálne niekoľko dní vopred. Pri väčších tortách a sviatkoch odporúčam rezervovať termín skôr.',
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-cokoladova-torta',
    name: 'Čokoládová torta',
    slug: 'cokoladova-torta',
    description:
      'Bohatá kakaová torta s jemným mascarpone krémom, čokoládovou ganache a dekorom podľa príležitosti.',
    category: 'Torty',
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=1200&auto=format&fit=crop',
    ],
    price: 35,
    priceType: 'from',
    tags: ['narodeniny', 'čokoláda', 'na objednávku'],
    available: true,
    featured: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-ovocna-torta',
    name: 'Ovocná torta',
    slug: 'ovocna-torta',
    description:
      'Svieža torta s ľahkým krémom a ovocím podľa sezóny. Výborne sa hodí na rodinné oslavy aj letné posedenia.',
    category: 'Torty',
    imageUrl:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&auto=format&fit=crop',
    galleryImages: [
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?q=80&w=1200&auto=format&fit=crop',
    ],
    price: 38,
    priceType: 'from',
    tags: ['sezónne ovocie', 'ľahký krém'],
    available: true,
    featured: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-sladky-box',
    name: 'Sladký box',
    slug: 'sladky-box',
    description:
      'Darčekový mix domácich sladkostí: mini tartaletky, brownies, laskonky, cookies a sezónne dobroty.',
    category: 'Sladké boxy',
    imageUrl:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1200&auto=format&fit=crop',
    price: 18,
    priceType: 'from',
    tags: ['darček', 'mix dezertov', 'pohostenie'],
    available: true,
    featured: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-cupcakes',
    name: 'Cupcakes',
    slug: 'cupcakes',
    description:
      'Nadýchané cupcakes s krémom, ovocím alebo tematickou dekoráciou. Minimálny odber podľa dohody.',
    category: 'Cupcakes',
    imageUrl:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=1200&auto=format&fit=crop',
    price: 2.5,
    priceType: 'fixed',
    tags: ['oslavy', 'mini porcie'],
    available: true,
    featured: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-mini-dezerty',
    name: 'Mini dezerty na oslavu',
    slug: 'mini-dezerty-na-oslavu',
    description:
      'Elegantné malé dezerty na stôl: tartaletky, cheesecake poháriky, brownies kúsky a krémové mini poháre.',
    category: 'Mini dezerty',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
    price: 1.9,
    priceType: 'from',
    tags: ['candy bar', 'oslavy', 'na mieru'],
    available: true,
    featured: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-makronky',
    name: 'Makrónky',
    slug: 'makronky',
    description:
      'Jemné makrónky v pastelových farbách s príchuťami podľa sezóny. Vhodné do boxov aj ako doplnok candy baru.',
    category: 'Mini dezerty',
    imageUrl:
      'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1200&auto=format&fit=crop',
    price: 1.4,
    priceType: 'fixed',
    tags: ['pastelové', 'darček'],
    available: true,
    featured: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-sezonna-ponuka',
    name: 'Sezónny dezertný výber',
    slug: 'sezonny-dezertny-vyber',
    description:
      'Limitovaná ponuka podľa obdobia: jahodové dezerty, vianočné krabičky, veľkonočné koláčiky alebo jesenné príchute.',
    category: 'Sezónna ponuka',
    imageUrl:
      'https://images.unsplash.com/photo-1547414368-ac947d00b91d?q=80&w=1200&auto=format&fit=crop',
    price: 16,
    priceType: 'from',
    tags: ['limitované', 'sezónne'],
    available: true,
    featured: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  {
    id: 'prod-torta-na-mieru',
    name: 'Torta na mieru',
    slug: 'torta-na-mieru',
    description:
      'Originálna torta podľa témy, počtu porcií a vašej predstavy. Cenu potvrdíme až po doladení detailov.',
    category: 'Na mieru',
    imageUrl:
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=1200&auto=format&fit=crop',
    price: null,
    priceType: 'on_request',
    tags: ['individuálna cena', 'téma oslavy'],
    available: true,
    featured: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  },
];

export const MOCK_GALLERY: GalleryImage[] = [
  {
    id: 'gal-cokoladova-torta',
    imageUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1200&auto=format&fit=crop',
    caption: 'Čokoládová torta s ganache',
    category: 'Torty',
    featured: true,
    createdAt: timestamp,
  },
  {
    id: 'gal-ovocna-torta',
    imageUrl:
      'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=1200&auto=format&fit=crop',
    caption: 'Svieža ovocná torta',
    category: 'Torty',
    featured: true,
    createdAt: timestamp,
  },
  {
    id: 'gal-cupcakes',
    imageUrl:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?q=80&w=1200&auto=format&fit=crop',
    caption: 'Cupcakes s krémovým zdobením',
    category: 'Cupcakes',
    featured: true,
    createdAt: timestamp,
  },
  {
    id: 'gal-makronky',
    imageUrl:
      'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=1200&auto=format&fit=crop',
    caption: 'Pastelové makrónky',
    category: 'Mini dezerty',
    featured: false,
    createdAt: timestamp,
  },
  {
    id: 'gal-dezerty',
    imageUrl:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
    caption: 'Mini dezerty na candy bar',
    category: 'Mini dezerty',
    featured: true,
    createdAt: timestamp,
  },
  {
    id: 'gal-box',
    imageUrl:
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=1200&auto=format&fit=crop',
    caption: 'Darčekový sladký box',
    category: 'Sladké boxy',
    featured: false,
    createdAt: timestamp,
  },
  {
    id: 'gal-sezona',
    imageUrl:
      'https://images.unsplash.com/photo-1547414368-ac947d00b91d?q=80&w=1200&auto=format&fit=crop',
    caption: 'Sezónne koláčiky',
    category: 'Sezónna ponuka',
    featured: false,
    createdAt: timestamp,
  },
  {
    id: 'gal-custom',
    imageUrl:
      'https://images.unsplash.com/photo-1535141192574-5d4897c12636?q=80&w=1200&auto=format&fit=crop',
    caption: 'Torta na mieru pre oslavu',
    category: 'Na mieru',
    featured: true,
    createdAt: timestamp,
  },
];
