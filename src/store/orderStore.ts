import { create } from 'zustand';
import { Order, Address } from '../types';
import { orderAPI } from '../services/api';

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  createOrder: (orderData: {
    items: { product: string; quantity: number }[];
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: string;
  }) => Promise<Order>;
  fetchOrders: (isAdmin?: boolean, userFilter?: string) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
  getOrderById: (orderId: string) => Order | null;
  deleteBulkOrders: () => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      const order = await orderAPI.createOrder(orderData);
      
      set(state => ({
        orders: [...state.orders, order],
        currentOrder: order,
        isLoading: false
      }));
      
      return order;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to create order',
        isLoading: false 
      });
      throw error;
    }
  },

  fetchOrders: async (isAdmin: boolean = false, userFilter: string = '') => {
    set({ isLoading: true, error: null });
    try {
      const responseData = await orderAPI.fetchOrders(isAdmin, userFilter);
      let ordersArray;

      if (isAdmin) {
        // For admin all orders endpoint, responseData is { success: true, count: ..., data: [...] }
        if (responseData && Array.isArray(responseData.data)) {
          ordersArray = responseData.data;
        } else {
          ordersArray = [];
          console.warn("Unexpected API response structure for admin orders:", responseData);
        }
      } else {
        // For regular user orders endpoint, responseData might be an object with a 'data' array
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          ordersArray = responseData.data;
        } else if (responseData && Array.isArray(responseData)) { // Fallback for direct array response
          ordersArray = responseData;
        } else {
          ordersArray = [];
          console.warn("Unexpected API response structure for user orders:", responseData);
        }
      }

      set({ orders: ordersArray, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch orders',
        isLoading: false 
      });
    }
  },

  fetchOrderById: async (orderId: string) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const order = await orderAPI.fetchOrderById(orderId);
      set({ currentOrder: order, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to fetch order',
        isLoading: false,
        currentOrder: null
      });
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      await orderAPI.cancelOrder(orderId);

      set(state => ({
        orders: state.orders.filter(order => order._id !== orderId),
        isLoading: false,
        currentOrder: state.currentOrder?._id === orderId ? null : state.currentOrder
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to cancel order',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteBulkOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      await orderAPI.deleteBulkOrders();
      set({ orders: [], isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || error.message || 'Failed to delete all orders',
        isLoading: false,
      });
      throw error;
    }
  },

  getOrderById: (orderId) => {
    return get().orders.find(order => order._id === orderId) || null;
  }
}));