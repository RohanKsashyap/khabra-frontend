export interface User {
  id: string;
  _id?: string; // Add this line for MongoDB ObjectId compatibility
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'franchise' | 'admin';
  referralCode: string;
  referredBy?: string;
  referrerName?: string;
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
  franchise?: string; // Optional franchise property for users
}

export interface ProductStock {
  currentQuantity: number;
  minimumThreshold: number;
  maximumCapacity: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  commission: number;
  averageRating?: number;
  
  // Enhanced stock management
  inventoryDetails?: {
    currentQuantity: number;
    status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
    franchiseStocks?: {
      franchiseId: string;
      quantity: number;
    }[];
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  _id: string;
  product: Product;
  productName: string;
  productPrice: number;
  productImage: string;
  quantity: number;
  pv?: number;
  bv?: number;
  returnStatus?: 'none' | 'pending' | 'approved' | 'rejected' | 'completed';
  returnRequest?: ReturnRequest;
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
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  totalPV?: number;
  totalBV?: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned' | 'on the way';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  billingAddress: Address;
  tracking?: TrackingInfo;
  returnRequest?: ReturnRequest;
  createdAt: string;
  updatedAt: string;
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

export interface Franchise {
  _id: string;
  name: string;
  district: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  openingDate: string;
  createdAt: string;
  updatedAt: string;
  additionalLocation?: string;
}