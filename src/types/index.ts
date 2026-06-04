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

export interface ProductOptionChoice {
  name: string;
  /** Added to the base unit price when this choice is selected (EUR, may be negative). */
  priceDelta?: number;
}

export interface ProductOptionGroup {
  /** Customer-facing name of the choice, e.g. "Variant", "Príchuť". */
  label: string;
  choices: ProductOptionChoice[];
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
  /** Multiple selectable option groups (variant, flavour, …), each with optional price changes. */
  optionGroups?: ProductOptionGroup[];
  /** @deprecated Legacy single-group fields, kept for backward compatibility. Use optionGroups. */
  variants?: string[];
  /** @deprecated See optionGroups. */
  variantLabel?: string;
  vegan?: boolean;
  /** Dietary badge: bez mlieka (milk-free). */
  withoutMilk?: boolean;
  /** Dietary badge: bez laktózy (lactose-free). */
  lactoseFree?: boolean;
  /** Dietary badge: bezlepkové (gluten-free). */
  glutenFree?: boolean;
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
  /** Chosen fillings ("Doplnky vnútri torty"). */
  fillingNames?: string[];
  fillingIds?: string[];
  /** Special/dietary versions (vegánska, bezlepková, bezlaktózová…). Also mirrored to `extras`. */
  dietaryNames?: string[];
  dietaryIds?: string[];
  /** Computed total (size base + all surcharges). Null = price by agreement. */
  totalPrice?: number | null;
  priceType?: PriceType;
  /** @deprecated Use dietaryNames. Kept for the order email + existing displays. */
  extras?: string[];
  inspirationUrl?: string;
  inspirationImage?: string;
  note?: string;
}

// === Admin-managed custom-cake builder configuration ===

export interface CakeBuilderSize {
  id: string;
  name: string;
  diameter?: string;
  portions: string;
  price: number;
  priceType: PriceType;
}

export interface CakeBuilderOption {
  id: string;
  name: string;
  description?: string;
  /** Free-text group label, used to group creams in the builder. */
  group?: string;
  /** Surcharge added to the cake total when selected (EUR). */
  priceDelta?: number;
}

export interface CakeBuilderConfig {
  sizes: CakeBuilderSize[];
  bases: CakeBuilderOption[];
  creams: CakeBuilderOption[];
  fillings: CakeBuilderOption[];
  dietary: CakeBuilderOption[];
  notes: string[];
}

export type OrderItemKind = 'product' | 'package' | 'box' | 'custom-cake' | 'tasting';

export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'delivered' | 'cancelled';

export interface TastingDetails {
  selections?: string[];
  selectionLabel?: string;
  /** Requested dietary versions (Vegánska, Bez mlieka, …). */
  versions?: string[];
  preferredDate?: string;
  note?: string;
}

export interface SelectedOption {
  label: string;
  value: string;
  priceDelta?: number;
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
  /** Selected option groups (variant, flavour, …) chosen by the customer. */
  selectedOptions?: SelectedOption[];
  /** @deprecated Combined display string of selected options, kept for the order email + legacy carts. */
  variant?: string;
  /** @deprecated See selectedOptions. */
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
  /** Set when the order is marked "delivered"; 7 days later it auto-deletes. */
  deliveredAt?: string;
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
