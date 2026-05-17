import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { OrderItem, Product } from '../types';

type CartContextValue = {
  items: OrderItem[];
  total: number;
  hasCustomPricing: boolean;
  itemCount: number;
  addProduct: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNote: (productId: string, note: string) => void;
  clearCart: () => void;
};

const STORAGE_KEY = 'sladka-fazulka.cart.v1';

const CartContext = createContext<CartContextValue | undefined>(undefined);

const readInitialCart = (): OrderItem[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as OrderItem[]) : [];
  } catch {
    return [];
  }
};

const persistCart = (items: OrderItem[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

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
    (product: Product) => {
      commit((current) => {
        const existing = current.find((item) => item.productId === product.id);
        if (existing) {
          return current.map((item) =>
            item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }

        return [
          ...current,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.price,
            priceType: product.priceType,
          },
        ];
      });
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
        current.map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item,
        ),
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
    const total = items.reduce((sum, item) => sum + (item.unitPrice ?? 0) * item.quantity, 0);

    return {
      items,
      total,
      hasCustomPricing: items.some((item) => item.priceType === 'on_request'),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      addProduct,
      removeItem,
      updateQuantity,
      updateNote,
      clearCart,
    };
  }, [addProduct, clearCart, items, removeItem, updateNote, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart musí byť použitý v CartProvider');
  return context;
};
