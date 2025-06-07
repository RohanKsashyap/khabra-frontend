import { create } from 'zustand';
import { Product } from '../types';
import { productAPI } from '../services/api';

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (params?: { category?: string; search?: string; sort?: string }) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (productData: Partial<Product>) => Promise<void>;
  updateProduct: (id: string, productData: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addReview: (productId: string, rating: number, review: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async (params) => {
    console.log('Starting to fetch products...');
    set({ isLoading: true, error: null });
    try {
      console.log('Fetching products with params:', params);
      const response = await productAPI.getProducts(params);
      console.log('Products response:', response);
      console.log('Setting products in store:', response.data);
      set({ products: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching products:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch products',
        isLoading: false 
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