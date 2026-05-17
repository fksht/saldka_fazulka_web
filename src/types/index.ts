export type PriceType = 'fixed' | 'from' | 'on_request';

export type Category = 'Torty' | 'Mini dezerty' | 'Sladké boxy' | 'Cupcakes' | 'Sezónna ponuka' | 'Na mieru';

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
  tags: string[];
  available: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'new' | 'contacted' | 'confirmed' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number | null;
  priceType: PriceType;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  eventType?: string;
  servings?: number;
  preferredFlavor?: string;
  inspirationUrl?: string;
  note?: string;
  items: OrderItem[];
  estimatedTotal: number;
  status: OrderStatus;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  category: string;
  featured: boolean;
  createdAt: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  imageUrl: string;
  signature: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  instagram: string;
  facebook: string;
  location: string;
  orderNote: string;
}

export interface OrderDraft {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  pickupDate: string;
  eventType?: string;
  servings?: number;
  preferredFlavor?: string;
  inspirationUrl?: string;
  note?: string;
  items: OrderItem[];
  estimatedTotal: number;
}

export type ProductFormValues = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export type GalleryImageDraft = Omit<GalleryImage, 'id' | 'createdAt'>;
