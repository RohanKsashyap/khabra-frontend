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
  retryCount: number;
  fetchProducts: (params?: { category?: string; search?: string; sort?: string }) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReview: (productId: string, rating: number, review: string) => Promise<void>;
}

const DEBOUNCE_TIME = 5000; // 5 seconds to prevent rate limiting
const MAX_RETRIES = 3;

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,
  retryCount: 0,

  fetchProducts: async (params) => {
    const now = Date.now();
    const lastFetch = get().lastFetchTime;
    const retryCount = get().retryCount;
    
    // If we've fetched recently, don't fetch again
    if (lastFetch && now - lastFetch < DEBOUNCE_TIME) {
      console.log('Skipping fetch - too recent');
      return;
    }

    // If we've retried too many times, don't retry
    if (retryCount >= MAX_RETRIES) {
      console.log('Max retries reached, skipping fetch');
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.getProducts(params);
      set({ 
        products: response.data, 
        isLoading: false,
        lastFetchTime: now,
        retryCount: 0 // Reset retry count on success
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      
      // Handle rate limiting specifically
      if (error.response?.status === 429) {
        const newRetryCount = retryCount + 1;
        const backoffTime = Math.pow(2, newRetryCount) * 1000; // Exponential backoff
        
        set({ 
          error: 'Rate limited. Retrying...',
          isLoading: false,
          lastFetchTime: now,
          retryCount: newRetryCount
        });
        
        toast.error(`Too many requests. Retrying in ${backoffTime / 1000} seconds...`);
        
        // Retry after backoff
        setTimeout(() => {
          get().fetchProducts(params);
        }, backoffTime);
        
        return;
      }
      
      set({ 
        error: errorMessage,
        isLoading: false,
        lastFetchTime: now,
        retryCount: retryCount + 1
      });
      
      toast.error('Failed to load products. Please try again later.');
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await productAPI.getProduct(id);
      set({ currentProduct: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      
      set({ 
        error: errorMessage,
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
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      
      set({ 
        error: errorMessage,
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
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      
      set({ 
        error: errorMessage,
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
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      
      set({ 
        error: errorMessage,
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
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add review';
      
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please wait a moment and try again.');
      }
      
      set({ 
        error: errorMessage,
        isLoading: false 
      });
    }
  },
}));