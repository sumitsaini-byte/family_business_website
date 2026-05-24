import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'furnish-and-co-cart';
const CART_DATES_STORAGE_KEY = 'furnish-and-co-booking-dates';

const readStoredCart = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read cart from storage:', error);
    return [];
  }
};

const readStoredBookingDates = () => {
  if (typeof window === 'undefined') {
    return { startDate: '', endDate: '' };
  }

  try {
    const raw = window.localStorage.getItem(CART_DATES_STORAGE_KEY);
    if (!raw) {
      return { startDate: '', endDate: '' };
    }

    const parsed = JSON.parse(raw);
    return {
      startDate: typeof parsed?.startDate === 'string' ? parsed.startDate : '',
      endDate: typeof parsed?.endDate === 'string' ? parsed.endDate : ''
    };
  } catch (error) {
    console.error('Failed to read booking dates from storage:', error);
    return { startDate: '', endDate: '' };
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(readStoredCart);
  const [bookingDates, setBookingDates] = useState(readStoredBookingDates);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    window.localStorage.setItem(CART_DATES_STORAGE_KEY, JSON.stringify(bookingDates));
  }, [bookingDates]);

  const addToCart = (product) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.productId === product.productId);
      const normalizedQuantity = Math.max(1, Number(product.quantity) || 1);
      const maxQuantity = Number(product.maxQuantity);

      if (existingItem) {
        return currentItems.map((item) =>
          item.productId === product.productId
            ? {
                ...item,
                quantity: Number.isFinite(maxQuantity)
                  ? Math.min(item.quantity + normalizedQuantity, maxQuantity)
                  : item.quantity + normalizedQuantity
              }
            : item
        );
      }

      return [...currentItems, {
        ...product,
        quantity: Number.isFinite(maxQuantity)
          ? Math.min(normalizedQuantity, maxQuantity)
          : normalizedQuantity
      }];
    });
  };

  const updateQuantity = (productId, nextQuantity) => {
    setItems((currentItems) =>
      currentItems.reduce((updatedItems, item) => {
        if (item.productId !== productId) {
          updatedItems.push(item);
          return updatedItems;
        }

        if (nextQuantity > 0) {
          updatedItems.push({ ...item, quantity: nextQuantity });
        }

        return updatedItems;
      }, [])
    );
  };

  const incrementQuantity = (productId) => {
    const targetItem = items.find((item) => item.productId === productId);
    if (targetItem) {
      updateQuantity(productId, targetItem.quantity + 1);
    }
  };

  const decrementQuantity = (productId) => {
    const targetItem = items.find((item) => item.productId === productId);
    if (targetItem) {
      updateQuantity(productId, targetItem.quantity - 1);
    }
  };

  const removeFromCart = (productId) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setBookingDates({ startDate: '', endDate: '' });
  };

  const updateBookingDates = (nextDates) => {
    setBookingDates({
      startDate: nextDates?.startDate || '',
      endDate: nextDates?.endDate || ''
    });
  };

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const uniqueItemsCount = useMemo(
    () => items.length,
    [items]
  );

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = {
    items,
    bookingDates,
    addToCart,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    clearCart,
    updateBookingDates,
    totalItems,
    uniqueItemsCount,
    totalPrice,
    hasSelectedDates: Boolean(bookingDates.startDate && bookingDates.endDate)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
