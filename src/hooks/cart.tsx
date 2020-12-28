import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const productsLoaded = await AsyncStorage.getItem('GoStack:products');

      if (productsLoaded) {
        setProducts(JSON.parse(productsLoaded));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const objProduct: Product = product;
      const foundProductIndex = products.findIndex(
        value => value.id === product.id,
      );

      objProduct.quantity =
        !objProduct.quantity || objProduct.quantity <= 0
          ? 1
          : objProduct.quantity;

      if (foundProductIndex === -1) products.push(objProduct);
      else products[foundProductIndex].quantity += 1;

      setProducts(products);

      await AsyncStorage.multiSet([
        ['@GoStack:products', JSON.stringify(products)],
      ]);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const foundProductIndex = products.findIndex(value => value.id === id);

      products[foundProductIndex].quantity += 1;

      setProducts(products);

      await AsyncStorage.multiSet([
        ['@GoStack:products', JSON.stringify(products)],
      ]);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const foundProductIndex = products.findIndex(value => value.id === id);

      products[foundProductIndex].quantity -= 1;

      setProducts(products);

      await AsyncStorage.multiSet([
        ['@GoStack:products', JSON.stringify(products)],
      ]);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
