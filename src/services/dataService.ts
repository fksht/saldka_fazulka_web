import {
  CandyBarPackage,
  CandyBarPackageFormValues,
  GalleryImage,
  GalleryImageDraft,
  Order,
  OrderDraft,
  OrderStatus,
  Product,
  ProductFormValues,
} from '../types';
import { MOCK_CANDY_BAR_PACKAGES, MOCK_GALLERY, MOCK_PRODUCTS } from './mockData';
import { getOrderPricingSummary } from '../utils/orderPricing';
import { normalizeAssetUrl } from '../data/sladkaFazulkaCatalog';
import { supabase } from './supabaseClient';

// Self-heal image paths read from the backend so a stale base prefix can't
// break rendering (see normalizeAssetUrl).
const normalizeProductAssets = (product: Product): Product => ({
  ...product,
  imageUrl: normalizeAssetUrl(product.imageUrl),
  galleryImages: product.galleryImages?.map((url) => normalizeAssetUrl(url)),
});

const normalizeGalleryAssets = (image: GalleryImage): GalleryImage => ({
  ...image,
  imageUrl: normalizeAssetUrl(image.imageUrl),
});

const normalizePackageAssets = (pkg: CandyBarPackage): CandyBarPackage => ({
  ...pkg,
  imageUrl: normalizeAssetUrl(pkg.imageUrl),
});

const PRODUCT_STORAGE_KEY = 'sladka-fazulka.products.v1';
const ORDER_STORAGE_KEY = 'sladka-fazulka.orders.v1';
const GALLERY_STORAGE_KEY = 'sladka-fazulka.gallery.v1';
const CANDY_BAR_PACKAGE_STORAGE_KEY = 'sladka-fazulka.candy-bar-packages.v1';

const wait = (ms = 180) => new Promise((resolve) => window.setTimeout(resolve, ms));

const createId = (prefix: string) => `${prefix}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Stamp deliveredAt when an order moves to "delivered" (starts the 7-day
// auto-delete timer); clear it when it moves to any other status.
const withDeliveredAt = (order: Order, status: OrderStatus): Order => ({
  ...order,
  status,
  deliveredAt: status === 'delivered' ? order.deliveredAt ?? new Date().toISOString() : undefined,
});

const buildOrder = (order: OrderDraft, id: string): Order => {
  if (order.items.length === 0) throw new Error('Objednávka neobsahuje žiadne položky');
  const pricing = getOrderPricingSummary(order.items);
  return {
    ...order,
    estimatedTotal: pricing.estimatedTotal,
    id,
    status: 'new',
    createdAt: new Date().toISOString(),
  };
};

/**
 * Public data API. Two implementations exist behind it: a localStorage demo
 * (browser-only) and a Supabase backend (shared database). The rest of the app
 * only ever talks to this interface.
 */
export interface DataApi {
  readonly backend: 'supabase' | 'local';
  /** True when the Supabase database has no products yet (i.e. needs seeding). */
  needsSeeding(): Promise<boolean>;
  /** Push the bundled catalog (products, gallery, packages) into the backend. */
  seedCatalog(): Promise<void>;

  getProducts(): Promise<Product[]>;
  getAvailableProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  addProduct(product: ProductFormValues): Promise<Product>;
  updateProduct(id: string, updates: Partial<ProductFormValues>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  createOrder(order: OrderDraft): Promise<Order>;
  getOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
  deleteOrder(id: string): Promise<void>;

  getCandyBarPackages(): Promise<CandyBarPackage[]>;
  updateCandyBarPackage(
    id: string,
    updates: Partial<CandyBarPackageFormValues> & { hidden?: boolean },
  ): Promise<CandyBarPackage>;
  addCandyBarPackage(values: CandyBarPackageFormValues): Promise<CandyBarPackage>;
  deleteCandyBarPackage(id: string): Promise<void>;

  getGalleryImages(): Promise<GalleryImage[]>;
  addGalleryImage(image: GalleryImageDraft): Promise<GalleryImage>;
  updateGalleryImage(id: string, updates: Partial<GalleryImageDraft>): Promise<GalleryImage>;
  deleteGalleryImage(id: string): Promise<void>;
}

// ============================================================
// localStorage implementation (browser-only demo / fallback)
// ============================================================

class LocalStorageRepository<T> {
  constructor(
    private readonly key: string,
    private readonly fallback: T[],
  ) {}

  read(): T[] {
    try {
      const stored = window.localStorage.getItem(this.key);
      if (!stored) {
        this.write(this.fallback);
        return [...this.fallback];
      }

      return JSON.parse(stored) as T[];
    } catch {
      return [...this.fallback];
    }
  }

  write(items: T[]) {
    window.localStorage.setItem(this.key, JSON.stringify(items));
  }
}

class LocalDataService implements DataApi {
  readonly backend = 'local' as const;

  private productRepository = new LocalStorageRepository<Product>(PRODUCT_STORAGE_KEY, MOCK_PRODUCTS);
  private orderRepository = new LocalStorageRepository<Order>(ORDER_STORAGE_KEY, []);
  private galleryRepository = new LocalStorageRepository<GalleryImage>(GALLERY_STORAGE_KEY, MOCK_GALLERY);
  private candyBarPackageRepository = new LocalStorageRepository<CandyBarPackage>(
    CANDY_BAR_PACKAGE_STORAGE_KEY,
    MOCK_CANDY_BAR_PACKAGES,
  );

  // Demo storage is pre-seeded from the catalog, so these are no-ops.
  async needsSeeding(): Promise<boolean> {
    return false;
  }

  async seedCatalog(): Promise<void> {}

  async getProducts(): Promise<Product[]> {
    await wait();
    return this.productRepository.read();
  }

  async getAvailableProducts(): Promise<Product[]> {
    const products = await this.getProducts();
    return products.filter((product) => product.available);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    const products = await this.getAvailableProducts();
    return products.filter((product) => product.featured).slice(0, 4);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const products = await this.getProducts();
    return products.find((product) => product.slug === slug);
  }

  async addProduct(product: ProductFormValues): Promise<Product> {
    const now = new Date().toISOString();
    const products = this.productRepository.read();
    const slug = product.slug || slugify(product.name);
    const newProduct: Product = {
      ...product,
      id: createId('prod'),
      slug,
      createdAt: now,
      updatedAt: now,
    };

    this.productRepository.write([newProduct, ...products]);
    await wait();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<ProductFormValues>): Promise<Product> {
    const products = this.productRepository.read();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) throw new Error('Produkt sa nenašiel');

    const updatedProduct: Product = {
      ...products[index],
      ...updates,
      slug: updates.slug || (updates.name ? slugify(updates.name) : products[index].slug),
      updatedAt: new Date().toISOString(),
    };

    products[index] = updatedProduct;
    this.productRepository.write(products);
    await wait();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const products = this.productRepository.read();
    const index = products.findIndex((product) => product.id === id);
    if (index === -1) throw new Error('Produkt sa nenašiel');

    if (products[index].sourcePage) {
      products[index] = { ...products[index], available: false, updatedAt: new Date().toISOString() };
      this.productRepository.write(products);
      await wait();
      return;
    }

    products.splice(index, 1);
    this.productRepository.write(products);
    await wait();
  }

  async createOrder(order: OrderDraft): Promise<Order> {
    const orders = this.orderRepository.read();
    const newOrder = buildOrder(order, `SF-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`);
    this.orderRepository.write([newOrder, ...orders]);
    await wait();
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    await wait();
    return this.orderRepository.read();
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const orders = this.orderRepository.read();
    const index = orders.findIndex((order) => order.id === id);
    if (index === -1) throw new Error('Objednávka sa nenašla');

    orders[index] = withDeliveredAt(orders[index], status);
    this.orderRepository.write(orders);
    await wait();
    return orders[index];
  }

  async deleteOrder(id: string): Promise<void> {
    const orders = this.orderRepository.read().filter((order) => order.id !== id);
    this.orderRepository.write(orders);
    await wait();
  }

  async getCandyBarPackages(): Promise<CandyBarPackage[]> {
    await wait();
    return this.candyBarPackageRepository.read();
  }

  async updateCandyBarPackage(
    id: string,
    updates: Partial<CandyBarPackageFormValues> & { hidden?: boolean },
  ): Promise<CandyBarPackage> {
    const packages = this.candyBarPackageRepository.read();
    const index = packages.findIndex((pkg) => pkg.id === id);
    if (index === -1) throw new Error('Balíček sa nenašiel');

    const updatedPackage: CandyBarPackage = {
      ...packages[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    packages[index] = updatedPackage;
    this.candyBarPackageRepository.write(packages);
    await wait();
    return updatedPackage;
  }

  async addCandyBarPackage(values: CandyBarPackageFormValues): Promise<CandyBarPackage> {
    const packages = this.candyBarPackageRepository.read();
    const newPackage: CandyBarPackage = {
      ...values,
      id: createId('pkg'),
      updatedAt: new Date().toISOString(),
    };
    this.candyBarPackageRepository.write([...packages, newPackage]);
    await wait();
    return newPackage;
  }

  async deleteCandyBarPackage(id: string): Promise<void> {
    const packages = this.candyBarPackageRepository.read().filter((pkg) => pkg.id !== id);
    this.candyBarPackageRepository.write(packages);
    await wait();
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    await wait();
    return this.galleryRepository.read();
  }

  async addGalleryImage(image: GalleryImageDraft): Promise<GalleryImage> {
    const images = this.galleryRepository.read();
    const newImage: GalleryImage = {
      ...image,
      id: createId('gal'),
      createdAt: new Date().toISOString(),
    };

    this.galleryRepository.write([newImage, ...images]);
    await wait();
    return newImage;
  }

  async updateGalleryImage(id: string, updates: Partial<GalleryImageDraft>): Promise<GalleryImage> {
    const images = this.galleryRepository.read();
    const index = images.findIndex((image) => image.id === id);
    if (index === -1) throw new Error('Obrázok sa nenašiel');

    images[index] = { ...images[index], ...updates };
    this.galleryRepository.write(images);
    await wait();
    return images[index];
  }

  async deleteGalleryImage(id: string): Promise<void> {
    const images = this.galleryRepository.read().filter((image) => image.id !== id);
    this.galleryRepository.write(images);
    await wait();
  }
}

// ============================================================
// Supabase implementation (shared database)
// ============================================================

type SupabaseDb = NonNullable<typeof supabase>;

class SupabaseDataService implements DataApi {
  readonly backend = 'supabase' as const;

  constructor(private readonly db: SupabaseDb) {}

  private fail(message: string, error: { message: string } | null): never {
    throw new Error(error ? `${message}: ${error.message}` : message);
  }

  private async nextPosition(table: 'products' | 'gallery_images' | 'candy_bar_packages'): Promise<number> {
    const { data } = await this.db
      .from(table)
      .select('position')
      .order('position', { ascending: false, nullsFirst: false })
      .limit(1);
    const top = (data?.[0] as { position: number | null } | undefined)?.position;
    return (top ?? 0) + 1;
  }

  async needsSeeding(): Promise<boolean> {
    const { count, error } = await this.db.from('products').select('*', { count: 'exact', head: true });
    if (error) return false;
    return (count ?? 0) === 0;
  }

  async seedCatalog(): Promise<void> {
    const [pr, gr, cr] = await Promise.all([
      this.db.from('products').upsert(
        MOCK_PRODUCTS.map((p, i) => ({
          id: p.id,
          slug: p.slug,
          available: p.available,
          featured: p.featured,
          data: p,
          position: i,
        })),
      ),
      this.db.from('gallery_images').upsert(
        MOCK_GALLERY.map((g, i) => ({ id: g.id, hidden: g.hidden ?? false, featured: g.featured, data: g, position: i })),
      ),
      this.db.from('candy_bar_packages').upsert(
        MOCK_CANDY_BAR_PACKAGES.map((c, i) => ({ id: c.id, hidden: c.hidden ?? false, data: c, position: i })),
      ),
    ]);
    if (pr.error) this.fail('Import produktov zlyhal', pr.error);
    if (gr.error) this.fail('Import galérie zlyhal', gr.error);
    if (cr.error) this.fail('Import balíčkov zlyhal', cr.error);
  }

  async getProducts(): Promise<Product[]> {
    const { data, error } = await this.db
      .from('products')
      .select('data')
      .order('position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) this.fail('Načítanie produktov zlyhalo', error);
    return (data ?? []).map((row) => normalizeProductAssets((row as { data: Product }).data));
  }

  async getAvailableProducts(): Promise<Product[]> {
    return (await this.getProducts()).filter((product) => product.available);
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return (await this.getAvailableProducts()).filter((product) => product.featured).slice(0, 4);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const { data, error } = await this.db.from('products').select('data').eq('slug', slug).limit(1);
    if (error) this.fail('Načítanie produktu zlyhalo', error);
    const product = (data?.[0] as { data: Product } | undefined)?.data;
    return product ? normalizeProductAssets(product) : undefined;
  }

  private async productById(id: string): Promise<Product | undefined> {
    const { data } = await this.db.from('products').select('data').eq('id', id).limit(1);
    const product = (data?.[0] as { data: Product } | undefined)?.data;
    return product ? normalizeProductAssets(product) : undefined;
  }

  async addProduct(product: ProductFormValues): Promise<Product> {
    const now = new Date().toISOString();
    const slug = product.slug || slugify(product.name);
    const newProduct: Product = { ...product, id: createId('prod'), slug, createdAt: now, updatedAt: now };
    const position = await this.nextPosition('products');
    const { error } = await this.db.from('products').insert({
      id: newProduct.id,
      slug,
      available: newProduct.available,
      featured: newProduct.featured,
      data: newProduct,
      position,
    });
    if (error) this.fail('Produkt sa nepodarilo pridať', error);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<ProductFormValues>): Promise<Product> {
    const existing = await this.productById(id);
    if (!existing) throw new Error('Produkt sa nenašiel');

    const updatedProduct: Product = {
      ...existing,
      ...updates,
      slug: updates.slug || (updates.name ? slugify(updates.name) : existing.slug),
      updatedAt: new Date().toISOString(),
    };
    const { error } = await this.db
      .from('products')
      .update({
        slug: updatedProduct.slug,
        available: updatedProduct.available,
        featured: updatedProduct.featured,
        data: updatedProduct,
        updated_at: updatedProduct.updatedAt,
      })
      .eq('id', id);
    if (error) this.fail('Produkt sa nepodarilo upraviť', error);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    const existing = await this.productById(id);
    if (!existing) throw new Error('Produkt sa nenašiel');

    // Catalog products (sourcePage) are hidden rather than removed.
    if (existing.sourcePage) {
      const now = new Date().toISOString();
      const { error } = await this.db
        .from('products')
        .update({ available: false, data: { ...existing, available: false, updatedAt: now }, updated_at: now })
        .eq('id', id);
      if (error) this.fail('Produkt sa nepodarilo skryť', error);
      return;
    }

    const { error } = await this.db.from('products').delete().eq('id', id);
    if (error) this.fail('Produkt sa nepodarilo odstrániť', error);
  }

  async createOrder(order: OrderDraft): Promise<Order> {
    const unique = (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2))
      .replace(/-/g, '')
      .slice(0, 6)
      .toUpperCase();
    const newOrder = buildOrder(order, `SF-${new Date().getFullYear()}-${unique}`);
    // No .select() — anonymous customers are not allowed to read orders back.
    const { error } = await this.db.from('orders').insert({ id: newOrder.id, status: newOrder.status, data: newOrder });
    if (error) this.fail('Objednávku sa nepodarilo odoslať', error);
    return newOrder;
  }

  async getOrders(): Promise<Order[]> {
    const { data, error } = await this.db.from('orders').select('data').order('created_at', { ascending: false });
    if (error) this.fail('Načítanie objednávok zlyhalo', error);
    return (data ?? []).map((row) => (row as { data: Order }).data);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data } = await this.db.from('orders').select('data').eq('id', id).limit(1);
    const existing = (data?.[0] as { data: Order } | undefined)?.data;
    if (!existing) throw new Error('Objednávka sa nenašla');

    const updated = withDeliveredAt(existing, status);
    const { error } = await this.db.from('orders').update({ status, data: updated }).eq('id', id);
    if (error) this.fail('Stav objednávky sa nepodarilo zmeniť', error);
    return updated;
  }

  async deleteOrder(id: string): Promise<void> {
    const { error } = await this.db.from('orders').delete().eq('id', id);
    if (error) this.fail('Objednávku sa nepodarilo odstrániť', error);
  }

  async getCandyBarPackages(): Promise<CandyBarPackage[]> {
    const { data, error } = await this.db
      .from('candy_bar_packages')
      .select('data')
      .order('position', { ascending: true, nullsFirst: false });
    if (error) this.fail('Načítanie balíčkov zlyhalo', error);
    return (data ?? []).map((row) => normalizePackageAssets((row as { data: CandyBarPackage }).data));
  }

  async updateCandyBarPackage(
    id: string,
    updates: Partial<CandyBarPackageFormValues> & { hidden?: boolean },
  ): Promise<CandyBarPackage> {
    const { data } = await this.db.from('candy_bar_packages').select('data').eq('id', id).limit(1);
    const existing = (data?.[0] as { data: CandyBarPackage } | undefined)?.data;
    if (!existing) throw new Error('Balíček sa nenašiel');

    const updated: CandyBarPackage = { ...existing, ...updates, updatedAt: new Date().toISOString() };
    const { error } = await this.db
      .from('candy_bar_packages')
      .update({ hidden: updated.hidden ?? false, data: updated })
      .eq('id', id);
    if (error) this.fail('Balíček sa nepodarilo upraviť', error);
    return updated;
  }

  async addCandyBarPackage(values: CandyBarPackageFormValues): Promise<CandyBarPackage> {
    const newPackage: CandyBarPackage = { ...values, id: createId('pkg'), updatedAt: new Date().toISOString() };
    const position = await this.nextPosition('candy_bar_packages');
    const { error } = await this.db
      .from('candy_bar_packages')
      .insert({ id: newPackage.id, hidden: newPackage.hidden ?? false, data: newPackage, position });
    if (error) this.fail('Balíček sa nepodarilo pridať', error);
    return newPackage;
  }

  async deleteCandyBarPackage(id: string): Promise<void> {
    const { error } = await this.db.from('candy_bar_packages').delete().eq('id', id);
    if (error) this.fail('Balíček sa nepodarilo odstrániť', error);
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    const { data, error } = await this.db
      .from('gallery_images')
      .select('data')
      .order('position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) this.fail('Načítanie galérie zlyhalo', error);
    return (data ?? []).map((row) => normalizeGalleryAssets((row as { data: GalleryImage }).data));
  }

  async addGalleryImage(image: GalleryImageDraft): Promise<GalleryImage> {
    const newImage: GalleryImage = { ...image, id: createId('gal'), createdAt: new Date().toISOString() };
    const position = await this.nextPosition('gallery_images');
    const { error } = await this.db.from('gallery_images').insert({
      id: newImage.id,
      hidden: newImage.hidden ?? false,
      featured: newImage.featured,
      data: newImage,
      position,
    });
    if (error) this.fail('Obrázok sa nepodarilo pridať', error);
    return newImage;
  }

  async updateGalleryImage(id: string, updates: Partial<GalleryImageDraft>): Promise<GalleryImage> {
    const { data } = await this.db.from('gallery_images').select('data').eq('id', id).limit(1);
    const existing = (data?.[0] as { data: GalleryImage } | undefined)?.data;
    if (!existing) throw new Error('Obrázok sa nenašiel');

    const updated: GalleryImage = { ...existing, ...updates };
    const { error } = await this.db
      .from('gallery_images')
      .update({ hidden: updated.hidden ?? false, featured: updated.featured, data: updated })
      .eq('id', id);
    if (error) this.fail('Obrázok sa nepodarilo upraviť', error);
    return updated;
  }

  async deleteGalleryImage(id: string): Promise<void> {
    const { error } = await this.db.from('gallery_images').delete().eq('id', id);
    if (error) this.fail('Obrázok sa nepodarilo odstrániť', error);
  }
}

export const dataService: DataApi = supabase ? new SupabaseDataService(supabase) : new LocalDataService();

export const isSupabaseBackend = dataService.backend === 'supabase';
