import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from '../utils/axios';

// Cart item as expected by CartPage
export interface CartItem {
  _id?: string;
  product: string; // product ID
  productName: string;
  productImage: string;
  productPrice: number;
  quantity: number;
  franchiseId?: string; // Make optional
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (item: { productId: string; quantity: number; franchiseId?: string }) => Promise<void>; // Make franchiseId optional
  // Other existing cart store methods
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await axios.get('/cart');
          // Response: { success: true, data: { items: [...] } } or { success: true, data: cart }
          const data = response.data?.data;
          const items = (data?.items || data?.cart?.items || []).map((item: any) => ({
            _id: item._id,
            product: item.product?._id || item.productId || item.product,
            productName: item.product?.name || '',
            productImage: item.product?.image || '',
            productPrice: item.product?.price || 0,
            quantity: item.quantity,
            franchiseId: item.franchise?._id || item.franchise || '',
          }));
          set({ items });
        } catch (error) {
          set({ items: [] });
          console.error('Failed to fetch cart', error);
        } finally {
          set({ isLoading: false });
        }
      },
      addToCart: async (item) => {
        try {
          const response = await axios.post('/cart/add', item);
          // Optionally, refetch cart after adding
          await get().fetchCart();
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