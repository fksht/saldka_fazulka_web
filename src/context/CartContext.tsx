import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { CakeConfiguration, CandyBarPackage, OrderItem, Product, TastingBox, TastingDetails, WeddingBox } from '../types';
import { CANDY_BAR_PACKAGES, PRODUCTS, SECTION_IMAGES, WEDDING_BOXES } from '../data/sladkaFazulkaCatalog';
import { getOrderPricingSummary } from '../utils/orderPricing';

type CartContextValue = {
  items: OrderItem[];
  total: number;
  hasCustomPricing: boolean;
  itemCount: number;
  addProduct: (product: Product, quantity?: number, variant?: string) => void;
  addPackage: (pkg: CandyBarPackage) => void;
  addWeddingBox: (box: WeddingBox) => void;
  addTastingBox: (tasting: TastingBox, details?: TastingDetails) => void;
  addCustomCake: (config: CakeConfiguration) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = 'sladka-fazulka.cart.v2';

const CartContext = createContext<CartContextValue | undefined>(undefined);

const hydrateImageUrl = (item: OrderItem): OrderItem => {
  if (item.imageUrl) return item;
  if (item.kind === 'product') {
    const baseProductId = item.productId.split('::')[0];
    const product = PRODUCTS.find((p) => p.id === baseProductId);
    if (product?.imageUrl) return { ...item, imageUrl: product.imageUrl };
  }
  if (item.kind === 'package') {
    const pkg = CANDY_BAR_PACKAGES.find((p) => `pkg-${p.id}` === item.productId);
    return { ...item, imageUrl: pkg?.imageUrl ?? SECTION_IMAGES.candyBar };
  }
  if (item.kind === 'box') {
    const box = WEDDING_BOXES.find((b) => `box-${b.id}` === item.productId);
    return { ...item, imageUrl: box?.imageUrl ?? SECTION_IMAGES.vysluzky };
  }
  if (item.kind === 'tasting') {
    return { ...item, imageUrl: SECTION_IMAGES.ochutnavka };
  }
  if (item.kind === 'custom-cake') {
    return { ...item, imageUrl: item.cakeConfiguration?.inspirationImage ?? SECTION_IMAGES.cake3tier };
  }
  return item;
};

const readInitialCart = (): OrderItem[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as OrderItem[];
    return parsed.map(hydrateImageUrl);
  } catch {
    return [];
  }
};

const persistCart = (items: OrderItem[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const createCustomCakeId = () => `custom-cake-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<OrderItem[]>(readInitialCart);

  const commit = useCallback((updater: (current: OrderItem[]) => OrderItem[]) => {
    setItems((current) => {
      const next = updater(current);
      persistCart(next);
      return next;
    });
  }, []);

  const addProduct = useCallback(
    (product: Product, quantity?: number, variant?: string) => {
      const min = product.minimumOrderQuantity ?? 1;
      const requested = quantity && quantity > 0 ? quantity : min;
      const lineId = variant ? `${product.id}::${variant}` : product.id;
      commit((current) => {
        const existing = current.find((item) => item.productId === lineId);
        if (existing) {
          return current.map((item) =>
            item.productId === lineId ? { ...item, quantity: item.quantity + requested } : item,
          );
        }

        return [
          ...current,
          {
            productId: lineId,
            productName: product.name,
            quantity: Math.max(min, requested),
            minimumOrderQuantity: product.minimumOrderQuantity,
            unitPrice: product.price,
            priceType: product.priceType,
            kind: 'product',
            unitLabel: product.unitLabel,
            imageUrl: product.imageUrl,
            variant,
            variantLabel: variant ? product.variantLabel : undefined,
          },
        ];
      });
    },
    [commit],
  );

  const addPackage = useCallback(
    (pkg: CandyBarPackage) => {
      commit((current) => {
        const id = `pkg-${pkg.id}`;
        const existing = current.find((item) => item.productId === id);
        if (existing) {
          return current.map((item) => (item.productId === id ? { ...item, quantity: item.quantity + 1 } : item));
        }
        return [
          ...current,
          {
            productId: id,
            productName: `${pkg.name} — ${pkg.guestCount}`,
            quantity: 1,
            unitPrice: pkg.price,
            priceType: 'fixed',
            kind: 'package',
            unitLabel: 'balíček',
            imageUrl: pkg.imageUrl ?? SECTION_IMAGES.candyBar,
          },
        ];
      });
    },
    [commit],
  );

  const addWeddingBox = useCallback(
    (box: WeddingBox) => {
      commit((current) => {
        const id = `box-${box.id}`;
        const existing = current.find((item) => item.productId === id);
        if (existing) {
          return current.map((item) => (item.productId === id ? { ...item, quantity: item.quantity + 1 } : item));
        }
        return [
          ...current,
          {
            productId: id,
            productName: `${box.name} — mix ${box.pieces} ks`,
            quantity: 1,
            unitPrice: box.price,
            priceType: 'fixed',
            kind: 'box',
            unitLabel: 'krabička',
            imageUrl: box.imageUrl ?? SECTION_IMAGES.vysluzky,
          },
        ];
      });
    },
    [commit],
  );

  const addTastingBox = useCallback(
    (tasting: TastingBox, details?: TastingDetails) => {
      commit((current) => {
        const id = `tasting-${tasting.id}`;
        if (current.some((item) => item.productId === id)) {
          if (!details) return current;
          return current.map((item) =>
            item.productId === id ? { ...item, tastingDetails: details } : item,
          );
        }
        return [
          ...current,
          {
            productId: id,
            productName: tasting.title,
            quantity: 1,
            unitPrice: tasting.price,
            priceType: tasting.priceType,
            kind: 'tasting',
            unitLabel: tasting.id === 'tasting-torta' ? 'tortička' : undefined,
            imageUrl: SECTION_IMAGES.ochutnavka,
            tastingDetails: details,
          },
        ];
      });
    },
    [commit],
  );

  const addCustomCake = useCallback(
    (config: CakeConfiguration) => {
      // The bigger "individual" size has no list price — it's by agreement.
      const isIndividual = config.sizeId === 'size-individualna';
      commit((current) => [
        ...current,
        {
          productId: createCustomCakeId(),
          productName: `Torta na mieru — ${config.sizeName}`,
          quantity: 1,
          unitPrice: isIndividual ? null : config.sizePriceFrom,
          priceType: isIndividual ? 'individual' : 'from',
          kind: 'custom-cake',
          cakeConfiguration: config,
          unitLabel: 'torta',
          imageUrl: config.inspirationImage ?? SECTION_IMAGES.cake3tier,
        },
      ]);
    },
    [commit],
  );

  const removeItem = useCallback(
    (productId: string) => {
      commit((current) => current.filter((item) => item.productId !== productId));
    },
    [commit],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      commit((current) =>
        current.map((item) => {
          if (item.productId !== productId) return item;
          const minimumQuantity = item.minimumOrderQuantity ?? 1;
          return { ...item, quantity: Math.max(minimumQuantity, quantity) };
        }),
      );
    },
    [commit],
  );

  const updateNote = useCallback(
    (productId: string, note: string) => {
      commit((current) =>
        current.map((item) => (item.productId === productId ? { ...item, note } : item)),
      );
    },
    [commit],
  );

  const clearCart = useCallback(() => {
    commit(() => []);
  }, [commit]);

  const value = useMemo<CartContextValue>(() => {
    const pricing = getOrderPricingSummary(items);

    return {
      items,
      total: pricing.estimatedTotal,
      hasCustomPricing: pricing.hasCustomPricing,
      itemCount: pricing.itemCount,
      addProduct,
      addPackage,
      addWeddingBox,
      addTastingBox,
      addCustomCake,
      removeItem,
      updateQuantity,
      updateNote,
      clearCart,
    };
  }, [addCustomCake, addPackage, addProduct, addTastingBox, addWeddingBox, clearCart, items, removeItem, updateNote, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart musí byť použitý v CartProvider');
  return context;
};
