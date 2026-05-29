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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

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

class DataService {
  private productRepository = new LocalStorageRepository<Product>(PRODUCT_STORAGE_KEY, MOCK_PRODUCTS);
  private orderRepository = new LocalStorageRepository<Order>(ORDER_STORAGE_KEY, []);
  private galleryRepository = new LocalStorageRepository<GalleryImage>(GALLERY_STORAGE_KEY, MOCK_GALLERY);
  private candyBarPackageRepository = new LocalStorageRepository<CandyBarPackage>(
    CANDY_BAR_PACKAGE_STORAGE_KEY,
    MOCK_CANDY_BAR_PACKAGES,
  );

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
    if (order.items.length === 0) throw new Error('Objednávka neobsahuje žiadne položky');

    const orders = this.orderRepository.read();
    const createdAt = new Date().toISOString();
    const pricing = getOrderPricingSummary(order.items);
    const newOrder: Order = {
      ...order,
      estimatedTotal: pricing.estimatedTotal,
      id: `SF-${new Date().getFullYear()}-${String(orders.length + 1).padStart(4, '0')}`,
      status: 'new',
      createdAt,
    };

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

    orders[index] = { ...orders[index], status };
    this.orderRepository.write(orders);
    await wait();
    return orders[index];
  }

  async getCandyBarPackages(): Promise<CandyBarPackage[]> {
    await wait();
    return this.candyBarPackageRepository.read();
  }

  async updateCandyBarPackage(id: string, updates: Partial<CandyBarPackageFormValues> & { hidden?: boolean }): Promise<CandyBarPackage> {
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

export const dataService = new DataService();
