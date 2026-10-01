import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    pricing: { subtotal: 0, discount: 0, finalTotal: 0 },
    coupon: null,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (payload) => {
    setLoading(true);
    try {
      const res = await api.post('/cart/items', payload);
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      throw err;
    }
  };

  const applyCoupon = async (code) => {
    try {
      const res = await api.post('/cart/apply-coupon', { code });
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const removeCoupon = async () => {
    try {
      const res = await api.delete('/cart/remove-coupon');
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      throw err;
    }
  };

  const clearCartState = () => {
    setCart({
      items: [],
      itemCount: 0,
      pricing: { subtotal: 0, discount: 0, finalTotal: 0 },
      coupon: null,
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.itemCount || 0,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        refreshCart: fetchCart,
        clearCartState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
