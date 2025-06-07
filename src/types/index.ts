export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'distributor' | 'admin';
  referralCode: string;
  referredBy?: string;
  wallet: {
    balance: number;
    transactions: string[];
  };
  network: {
    level1: string[];
    level2: string[];
    level3: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  commission: number;
  isActive: boolean;
  ratings: Array<{
    user: string;
    rating: number;
    review: string;
  }>;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  _id: string;
  product: string;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  pv?: number;
  bv?: number;
}

export interface TrackingInfo {
  number?: string;
  carrier?: string;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  estimatedDelivery?: string; // Use string for date from backend
  updates: Array<{
    status: string;
    location?: string;
    description?: string;
    timestamp: string; // Use string for date from backend
  }>;
}

export interface ReturnRequest {
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string; // Use string for date from backend
  processedAt?: string; // Use string for date from backend
  notes?: string;
}

export interface Order {
  _id: string;
  user: string; // Changed from userId to user based on backend populate
  items: OrderItem[];
  totalAmount: number;
  totalPV?: number; // Made optional based on backend
  totalBV?: number; // Made optional based on backend
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'on the way';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address; // Added billingAddress
  tracking?: TrackingInfo; // Added tracking info
  returnRequest?: ReturnRequest; // Added return request
  createdAt: string;
  updatedAt: string; // Added updatedAt
}

export interface Address {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface SavedAddress extends Address {
  _id: string;
  isDefault: boolean;
  label?: string; // e.g., "Home", "Work"
}

export interface MLMNode {
  userId: string;
  username: string;
  level: number;
  position?: 'left' | 'right'; // For binary plan
  personalPV: number;
  groupPV: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  children: MLMNode[];
}

export interface Wallet {
  userId: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'commission' | 'bonus' | 'withdrawal' | 'refund';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  createdAt: Date;
}

export interface Commission {
  id: string;
  userId: string;
  fromUserId: string;
  orderId?: string;
  amount: number;
  type: 'direct' | 'level' | 'matching' | 'leadership';
  level?: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: Date;
}