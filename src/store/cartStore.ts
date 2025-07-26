import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../utils/axios';

interface CartItem {
  productId: string;
  quantity: number;
  franchiseId: string;
}

interface CartStore {
  addToCart: (item: CartItem) => Promise<void>;
  // Other existing cart store methods
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      addToCart: async (item: CartItem) => {
        try {
          const response = await axios.post('/cart/add', item);
          // Handle successful cart addition
          return response.data;
        } catch (error) {
          console.error('Failed to add to cart', error);
          throw error;
        }
      },
      // Other existing cart store methods
    }),
    {
      name: 'cart-storage',
      // Additional persist configuration
    }
  )
);