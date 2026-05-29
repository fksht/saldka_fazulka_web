export type PriceType = 'fixed' | 'from' | 'on_request' | 'individual';

export type Category =
  | 'Tartaletky'
  | 'Poháriky'
  | 'Rezy'
  | 'Mini cheesecake'
  | 'Špeciálne zákusky'
  | 'Fazuľkové brownie'
  | 'Fazuľkové špeciality'
  | 'Dezertné torty'
  | 'Torty na mieru'
  | 'Candy bar'
  | 'Svadobné výslužky'
  | 'Ochutnávkový box';

export type CreamGroup = 'svieze' | 'sladke' | 'orieskove' | 'kavove' | 'rastlinne';

export interface Allergen {
  id: number;
  name: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: Category;
  imageUrl: string;
  galleryImages?: string[];
  price: number | null;
  priceType: PriceType;
  unitLabel?: string;
  allergens: number[];
  tags: string[];
  variants?: string[];
  variantLabel?: string;
  vegan?: boolean;
  minimumOrderQuantity?: number;
  available: boolean;
  featured: boolean;
  sourcePage?: number;
  needsReview?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CakeBase {
  id: string;
  name: string;
  description: string;
  variants?: string[];
  tags: string[];
}

export interface CakeCream {
  id: string;
  group: CreamGroup;
  name: string;
  tags?: string[];
}

export interface CakeSize {
  id: string;
  name: string;
  diameter: string;
  portions: string;
  priceFrom: number;
  priceType: PriceType;
}

export interface CandyBarPackageItem {
  label: string;
  pieces: string;
}

export interface CandyBarPackage {
  id: string;
  name: string;
  guestCount: string;
  totalPieces: number;
  dessertTypeCount: number;
  composition: CandyBarPackageItem[];
  price: number;
  imageUrl?: string;
  hidden?: boolean;
  updatedAt?: string;
}

export interface WeddingBox {
  id: string;
  name: string;
  pieces: number;
  suitableFor: string;
  price: number;
  imageUrl?: string;
}

export interface TastingBox {
  id: string;
  title: string;
  description: string;
  price: number | null;
  priceType: PriceType;
  notes: string[];
}

export interface CakeConfiguration {
  baseId: string;
  baseName: string;
  baseVariant?: string;
  creamIds: string[];
  creamNames: string[];
  sizeId: string;
  sizeName: string;
  sizePortions: string;
  sizePriceFrom: number;
  extras?: string[];
  inspirationUrl?: string;
  inspirationImage?: string;
  note?: string;
}

export type OrderItemKind = 'product' | 'package' | 'box' | 'custom-cake' | 'tasting';

export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface TastingDetails {
  selections?: string[];
  selectionLabel?: string;
  preferredDate?: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  minimumOrderQuantity?: number;
  unitPrice: number | null;
  priceType: PriceType;
  kind: OrderItemKind;
  unitLabel?: string;
  note?: string;
  cakeConfiguration?: CakeConfiguration;
  imageUrl?: string;
  variant?: string;
  variantLabel?: string;
  tastingDetails?: TastingDetails;
}

export type PickupMode = 'pickup-kosice' | 'delivery-agreed';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate?: string;
  pickupMode?: PickupMode;
  eventType?: string;
  servings?: number;
  preferredFlavor?: string;
  inspirationUrl?: string;
  inspirationImage?: string;
  note?: string;
  items: OrderItem[];
  estimatedTotal: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderDraft {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate?: string;
  pickupMode?: PickupMode;
  eventType?: string;
  servings?: number;
  preferredFlavor?: string;
  inspirationUrl?: string;
  inspirationImage?: string;
  note?: string;
  items: OrderItem[];
  estimatedTotal: number;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
  featured: boolean;
  hidden?: boolean;
  createdAt: string;
}

export interface AboutReason {
  title: string;
  text: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  intro: string;
  reasons: AboutReason[];
  legend: { title: string; paragraphs: string[] };
  fazulkyUsp: { title: string; bullets: string[] };
  imageUrl: string;
  signature: string;
}

export interface ContactInfo {
  email: string;
  emailNeedsReview: boolean;
  phone: string;
  location: string;
  orderNote: string;
  instagram: string;
  facebook: string;
}

export type ProductFormValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export type CandyBarPackageFormValues = Omit<CandyBarPackage, 'id' | 'updatedAt'>;

export type GalleryImageDraft = Omit<GalleryImage, 'id' | 'createdAt'>;
