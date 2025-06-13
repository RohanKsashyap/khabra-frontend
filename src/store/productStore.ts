import { create } from 'zustand';
import { Product } from '../types';
import { productAPI } from '../services/api';
import { toast } from 'react-hot-toast';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number | null;
  fetchProducts: (params?: { category?: string; search?: string; sort?: string }) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReview: (productId: string, rating: number, review: string) => Promise<void>;
}

const DEBOUNCE_TIME = 2000; // 2 seconds

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,

  fetchProducts: async (params) => {
    const now = Date.now();
    const lastFetch = get().lastFetchTime;
    
    // If we've fetched recently, don't fetch again
    if (lastFetch && now - lastFetch < DEBOUNCE_TIME) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.getProducts(params);
      set({ 
        products: response.data, 
        isLoading: false,
        lastFetchTime: now
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      
      // Handle rate limiting specifically
      if (errorMessage.includes('429')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      
      set({ 
        error: errorMessage,
        isLoading: false,
        lastFetchTime: now
      });
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.getProduct(id);
      set({ currentProduct: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch product',
        isLoading: false 
      });
    }
  },

  createProduct: async (productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.createProduct(productData);
      set(state => ({ 
        products: [...state.products, response.data],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create product',
        isLoading: false 
      });
    }
  },

  updateProduct: async (id, productData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.updateProduct(id, productData);
      set(state => ({
        products: state.products.map(p => p._id === id ? response.data : p),
        currentProduct: state.currentProduct?._id === id ? response.data : state.currentProduct,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update product',
        isLoading: false 
      });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await productAPI.deleteProduct(id);
      set(state => ({
        products: state.products.filter(p => p._id !== id),
        currentProduct: state.currentProduct?._id === id ? null : state.currentProduct,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete product',
        isLoading: false 
      });
    }
  },

  addReview: async (productId, rating, review) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.addReview(productId, { rating, review });
      set(state => ({
        products: state.products.map(p => 
          p._id === productId ? { ...p, ratings: response.data.ratings } : p
        ),
        currentProduct: state.currentProduct?._id === productId 
          ? { ...state.currentProduct, ratings: response.data.ratings }
          : state.currentProduct,
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add review',
        isLoading: false 
      });
    }
  },
}));