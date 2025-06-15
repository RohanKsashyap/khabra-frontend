import axios from 'axios';
import config from '../config';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/auth/resetpassword/${token}`, { password });
    return response.data;
  },
};

export const productAPI = {
  getProducts: async (params?: { category?: string; search?: string; sort?: string }) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: any) => {
    const response = await api.post('/api/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: any) => {
    const response = await api.put(`/api/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  addReview: async (productId: string, reviewData: { rating: number; review: string }) => {
    const response = await api.post(`/api/products/${productId}/reviews`, reviewData);
    return response.data;
  },
};

export const orderAPI = {
  fetchOrders: async (isAdmin: boolean = false, userFilter: string = '') => {
    const url = isAdmin ? '/api/orders/admin/all' : '/api/orders';
    const params: { userFilter?: string } = {};
    if (userFilter) {
      params.userFilter = userFilter;
    }
    const response = await api.get(url, { params });
    return response.data;
  },
  createOrder: async (orderData: any) => {
    const response = await api.post('/api/orders', orderData);
    return response.data;
  },
  fetchOrderById: async (orderId: string) => {
    const response = await api.get(`/api/orders/${orderId}`);
    return response.data;
  },
  cancelOrder: async (orderId: string) => {
    const response = await api.put(`/api/orders/${orderId}/cancel`);
    return response.data;
  },
  fetchReturnRequests: async () => {
    const response = await api.get('/api/orders/admin/returns');
    return response.data;
  },
  updateReturnStatus: async (orderId: string, status: string, notes?: string) => {
    const response = await api.put(`/api/orders/${orderId}/return-status`, { status, notes });
    return response.data;
  },
  deleteBulkOrders: async () => {
    const response = await api.delete('/api/orders/bulk');
    return response.data;
  },
  updateOrderStatus: async (orderId: string, status: string, trackingInfo?: { trackingNumber?: string; carrier?: string; estimatedDelivery?: string; deliveryNotes?: string }) => {
    const response = await api.put(`/api/orders/${orderId}/status`, { status, ...trackingInfo });
    return response.data;
  },
  requestReturn: async (orderId: string, productId: string, reason: string) => {
    const response = await api.post('/api/returns/request', { orderId, productId, reason });
    return response.data;
  },
};

export const reviewAPI = {
  getProductReviews: async (productId: string, params?: { page?: number; limit?: number; sort?: string }) => {
    const response = await api.get(`/api/reviews/product/${productId}`, { params });
    return response.data;
  },

  addReview: async (reviewData: {
    productId: string;
    orderId: string;
    rating: number;
    review: string;
    images?: string[];
  }) => {
    const response = await api.post('/api/reviews', reviewData);
    return response.data;
  },

  updateReview: async (reviewId: string, reviewData: {
    rating: number;
    review: string;
    images?: string[];
  }) => {
    const response = await api.put(`/api/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  deleteReview: async (reviewId: string) => {
    const response = await api.delete(`/api/reviews/${reviewId}`);
    return response.data;
  },

  toggleLike: async (reviewId: string) => {
    const response = await api.post(`/api/reviews/${reviewId}/like`);
    return response.data;
  },

  // Admin endpoints
  getAllReviews: async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/api/reviews/admin', { params });
    return response.data;
  },

  updateReviewStatus: async (reviewId: string, status: 'pending' | 'approved' | 'rejected') => {
    const response = await api.put(`/api/reviews/admin/${reviewId}/status`, { status });
    return response.data;
  }
};

export default api; 