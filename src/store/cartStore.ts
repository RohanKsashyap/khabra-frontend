import { create } from 'zustand';
import axiosInstance from '../utils/axios';
import { Product } from '../types';

interface CartItem {
  _id: string;
  product: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  fetchCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  totalItems: 0,

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.get('/cart');
      const items = response.data.items || [];
      set({ 
        items,
        totalItems: items.reduce((total: number, item: CartItem) => total + item.quantity, 0),
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch cart', isLoading: false });
    }
  },

  addToCart: async (product: Product, quantity = 1) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.post('/cart/add', {
        productId: product._id,
        quantity
      });
      const items = response.data.items || [];
      set({ 
        items,
        totalItems: items.reduce((total: number, item: CartItem) => total + item.quantity, 0),
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to add item to cart', isLoading: false });
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.delete(`/cart/remove/${productId}`);
      const items = response.data.items || [];
      set({ 
        items,
        totalItems: items.reduce((total: number, item: CartItem) => total + item.quantity, 0),
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to remove item from cart', isLoading: false });
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    try {
      set({ isLoading: true, error: null });
      const response = await axiosInstance.put('/cart/update', {
        productId,
        quantity
      });
      const items = response.data.items || [];
      set({ 
        items,
        totalItems: items.reduce((total: number, item: CartItem) => total + item.quantity, 0),
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to update cart', isLoading: false });
    }
  },

  clearCart: async () => {
    try {
      set({ isLoading: true, error: null });
      await axiosInstance.delete('/cart/clear');
      set({ items: [], totalItems: 0, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to clear cart', isLoading: false });
    }
  },

  getTotalAmount: () => {
    const { items } = get();
    return items.reduce((total, item) => {
      return total + (item.productPrice * item.quantity);
    }, 0);
  }
}));