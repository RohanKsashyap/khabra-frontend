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
    } else if (error.response?.status === 429) {
      // Handle rate limiting
      console.warn('Rate limited by server. Consider implementing exponential backoff.');
      // Don't redirect, just let the component handle the error
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response?.data);
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (userData: any) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/api/auth/forgotpassword', { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string) => {
    const response = await api.put(`/api/auth/resetpassword/${token}`, { password });
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
  createAdminOrder: async (orderData: any) => {
    const response = await api.post('/api/orders/admin/create', orderData);
    return response.data;
  },
  createFranchiseOrder: async (orderData: any) => {
    const response = await api.post('/api/v1/franchises/orders', orderData);
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
    const response = await api.get('/api/returns');
    return response.data;
  },
  updateReturnStatus: async (returnRequestId: string, status: string, adminNotes?: string) => {
    const response = await api.put(`/api/returns/${returnRequestId}`, { status, adminNotes });
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
  fetchTotalProductSales: async () => {
    const response = await api.get('/api/orders/admin/total-sales');
    return response.data;
  },
  deleteAllReturnRequests: async () => {
    const response = await api.delete('/api/returns/admin/all');
    return response.data;
  },
};

export const franchiseAPI = {
  // Admin endpoints
  getAllFranchises: async () => {
    const response = await api.get('/api/v1/franchises');
    return response.data;
  },
  getFranchiseOverview: async () => {
    const response = await api.get('/api/v1/franchises/admin/overview');
    return response.data;
  },
  getFranchiseStatistics: async () => {
    const response = await api.get('/api/v1/franchises/admin/statistics');
    return response.data;
  },
  getFranchiseDetails: async (franchiseId: string) => {
    const response = await api.get(`/api/v1/franchises/${franchiseId}/details`);
    return response.data;
  },
  createFranchise: async (franchiseData: any) => {
    const response = await api.post('/api/v1/franchises', franchiseData);
    return response.data;
  },
  updateFranchise: async (franchiseId: string, franchiseData: any) => {
    const response = await api.put(`/api/v1/franchises/${franchiseId}`, franchiseData);
    return response.data;
  },
  deleteFranchise: async (franchiseId: string) => {
    const response = await api.delete(`/api/v1/franchises/${franchiseId}`);
    return response.data;
  },

  // Franchise owner endpoints
  getMyFranchiseSales: async () => {
    const response = await api.get('/api/v1/franchises/my/sales');
    return response.data;
  },
  createFranchiseOrder: async (orderData: any) => {
    const response = await api.post('/api/v1/franchises/orders', orderData);
    return response.data;
  },
  addDownlineMember: async (memberData: any) => {
    const response = await api.post('/api/v1/franchises/downline', memberData);
    return response.data;
  },

  // Public endpoints
  getFranchisesByDistrict: async (district: string) => {
    const response = await api.get(`/api/v1/franchises/district/${district}`);
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

export const notificationAPI = {
  getNotifications: async () => {
    const response = await api.get('/api/notifications');
    return response.data;
  },
  createNotification: async (notification: { title: string; message: string }) => {
    const response = await api.post('/api/notifications', notification);
    return response.data;
  },
  deleteNotification: async (id: string) => {
    const response = await api.delete(`/api/notifications/${id}`);
    return response.data;
  },
  updateNotification: async (id: string, notification: { title: string; message: string }) => {
    const response = await api.put(`/api/notifications/${id}`, notification);
    return response.data;
  },
};

export const userAPI = {
  getUsers: async (params?: { search?: string; email?: string }) => {
    const response = await api.get('/api/users', { params });
    return response.data;
  },
  getUser: async (id: string) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/api/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id: string) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data;
  },
};

export const mlmAPI = {
  // Earnings
  getUserEarnings: async () => {
    try {
      const response = await api.get('/api/earnings');
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },
  getAllEarnings: async (params = {}) => {
    try {
      const response = await api.get('/api/earnings/all', { params });
      return response.data;
    } catch (error: any) {
      throw error.response.data;
    }
  },

  // Withdrawals
  requestWithdrawal: async (amount: number) => {
    const response = await api.post('/api/withdrawals/request', { amount });
    return response.data;
  },
  getMyWithdrawals: async () => {
    const response = await api.get('/api/withdrawals/my');
    return response.data;
  },
  getAllWithdrawals: async (params?: { user?: string; status?: string; startDate?: string; endDate?: string }) => {
    const response = await api.get('/api/withdrawals/all', { params });
    return response.data;
  },
  updateWithdrawalStatus: async (id: string, status: 'approved' | 'rejected', adminNotes?: string) => {
    const response = await api.put(`/api/withdrawals/${id}`, { status, adminNotes });
    return response.data;
  },

  // Network Tree
  getNetworkTree: async () => {
    const response = await api.get('/api/network/tree');
    return response.data;
  },
  getNetworkTreeByUser: async (userId: string) => {
    const response = await api.get(`/api/network/tree/${userId}`);
    return response.data;
  },
  getDownlineAnalytics: async () => {
    const response = await api.get('/api/network/analytics');
    return response.data;
  },
  clearUserEarnings: async () => {
    const response = await api.delete('/api/earnings');
    return response.data;
  },
  clearAllEarnings: async () => {
    const response = await api.delete('/api/earnings/admin/clear-all');
    return response.data;
  },
};

export const rankAPI = {
  // Public
  getRanks: async () => {
    return api.get('/api/ranks');
  },
  // User
  getMyRankStatus: async () => {
    return api.get('/api/ranks/user/my-status');
  },
  // Admin
  updateRank: async (id: string, data: any) => {
    return api.put(`/api/ranks/${id}`, data);
  },
  getCommissionRates: async () => {
    const response = await api.get('/api/ranks/mlm-commission');
    return response.data;
  },
  updateCommissionRates: async (rates: number[]) => {
    const response = await api.put('/api/ranks/mlm-commission', { rates });
    return response.data;
  },
};

export default api; 