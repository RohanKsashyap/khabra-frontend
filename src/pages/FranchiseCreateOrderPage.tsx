import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { productAPI, userAPI } from '../services/api';
import { useOrderStore } from '../store/orderStore';
import { toast } from 'react-hot-toast';
import { Address } from '../types';

const FranchiseCreateOrderPage: React.FC = () => {
  const [userQuery, setUserQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [foundProducts, setFoundProducts] = useState<any[]>([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);
  const [productSearchError, setProductSearchError] = useState<string | null>(null);
  const { createOrder, isLoading } = useOrderStore();
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      userId: '',
      items: [] as { product: string; quantity: number; productName: string; productPrice: number; productImage: string }[],
      shippingAddress: {
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: ''
      } as Address,
      billingAddress: {
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: ''
      } as Address,
      paymentMethod: 'cod',
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });
  const [showProductModal, setShowProductModal] = useState(false);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allProductsLoading, setAllProductsLoading] = useState(false);
  const [allProductsError, setAllProductsError] = useState<string | null>(null);
  const [productCategory, setProductCategory] = useState<string>('');
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Fetch all products when modal opens or filters change
  useEffect(() => {
    if (showProductModal) {
      setAllProductsLoading(true);
      setAllProductsError(null);
      productAPI.getProducts({ category: productCategory, page: productPage, limit: 12 })
        .then((res: any) => {
          let products: any[] = [];
          let categories: string[] = [];
          if (Array.isArray(res)) products = res;
          else if (Array.isArray(res.data)) products = res.data;
          else if (Array.isArray(res.products)) products = res.products;
          if (res && Array.isArray(res.data)) {
            categories = Array.from(new Set(res.data.map((p: any) => p.category)));
          }
          setAllProducts(products);
          setProductPages(res.pages || 1);
          if (categories.length) setProductCategories(categories);
        })
        .catch(() => setAllProductsError('Failed to load products.'))
        .finally(() => setAllProductsLoading(false));
    }
  }, [showProductModal, productCategory, productPage]);

  const handleUserSearch = async () => {
    console.log('User search triggered:', userQuery);
    if (!userQuery) return;
    setUserSearchLoading(true);
    setUserSearchError(null);
    try {
      const users = await userAPI.getUsers({ search: userQuery });
      setFoundUsers(users);
      if (!users.length) setUserSearchError('No customers found.');
    } catch (err: any) {
      setUserSearchError('Error searching customers.');
      setFoundUsers([]);
    } finally {
      setUserSearchLoading(false);
    }
  };

  const selectUser = (user: any) => {
    setSelectedUser(user);
    setValue('userId', user._id);
    setValue('shippingAddress.fullName', user.name || '');
    setValue('shippingAddress.phone', user.phone || '');
    setFoundUsers([]);
  };

  const handleProductSearch = async () => {
    console.log('Product search triggered:', productQuery);
    if (!productQuery) return;
    setProductSearchLoading(true);
    setProductSearchError(null);
    try {
      const products = await productAPI.getProducts({ search: productQuery });
      let result: any[] = [];
      if (Array.isArray(products)) {
        result = products;
      } else if (Array.isArray(products.products)) {
        result = products.products;
      }
      setFoundProducts(result);
      if (!result.length) setProductSearchError('No products found.');
    } catch (err: any) {
      setProductSearchError('Error searching products.');
      setFoundProducts([]);
    } finally {
      setProductSearchLoading(false);
    }
  };

  const addProductToOrder = (product: any) => {
    const currentItems = watch('items');
    const existingItemIndex = currentItems.findIndex(item => item.product === product._id);
    if (existingItemIndex === -1) {
      append({
        product: product._id,
        quantity: 1,
        productName: product.name,
        productPrice: product.price,
        productImage: product.image
      });
    }
    setShowProductModal(false);
  };

  const onSubmit = async (data: any) => {
    if (!selectedUser && !isGuest) {
      alert('Please select a customer or choose Guest/Walk-in.');
      return;
    }
    if (isGuest && (!guestName.trim() || !guestPhone.trim())) {
      alert('Please enter guest name and phone.');
      return;
    }
    if (!data.items || !data.items.length) {
      alert('Please add at least one product to the order.');
      return;
    }
    // Calculate totalAmount
    const totalAmount = data.items.reduce((sum: number, item: any) => sum + (item.productPrice * item.quantity), 0);
    try {
      await createOrder({
        ...data,
        totalAmount,
        userId: !isGuest && selectedUser ? selectedUser._id : undefined,
        guestName: isGuest ? guestName : undefined,
        guestPhone: isGuest ? guestPhone : undefined,
        franchiseId: selectedUser?.franchise || undefined,
        orderType: 'offline',
      });
      toast.success('Order created and auto-approved!');
    } catch (error) {
      toast.error('Failed to create order.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">Create Walk-in/In-store Order</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <div className="flex gap-2 mt-1">
            <input
              type="text"
              placeholder="Search by name or email"
              value={userQuery}
              onChange={e => { setUserQuery(e.target.value); setIsGuest(false); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={isGuest}
            />
            <button type="button" onClick={handleUserSearch} className="px-4 py-2 bg-primary text-white rounded-md" disabled={isGuest}>Search</button>
            <button type="button" onClick={() => { setIsGuest(true); setSelectedUser(null); setUserQuery(''); }} className={`px-4 py-2 rounded-md ${isGuest ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>Guest/Walk-in</button>
          </div>
          {userSearchLoading && <div className="text-blue-500 mt-2">Searching...</div>}
          {userSearchError && <div className="text-red-500 mt-2">{userSearchError}</div>}
          {foundUsers.length > 0 && !userSearchLoading && !userSearchError && !isGuest && (
            <ul className="border rounded p-2 mt-2 bg-gray-50">
              {foundUsers.map(user => (
                <li key={user._id} onClick={() => { selectUser(user); setIsGuest(false); }} className="cursor-pointer p-2 hover:bg-gray-100">
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          )}
          {selectedUser && !isGuest && <div className="mt-2 font-semibold">Selected: {selectedUser.name}</div>}
          {isGuest && (
            <div className="mt-4 space-y-2">
              <input
                type="text"
                placeholder="Guest Name"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <input
                type="text"
                placeholder="Guest Phone"
                value={guestPhone}
                onChange={e => setGuestPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                onClick={() => { setIsGuest(false); setGuestName(''); setGuestPhone(''); }}
              >
                Back to Search
              </button>
            </div>
          )}
        </div>
        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Products</label>
          <button type="button" onClick={() => setShowProductModal(true)} className="px-4 py-2 bg-primary text-white rounded-md mb-2">Add Product</button>
          {/* List of added products */}
          <div className="mt-2">
            {fields.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-2 mb-2">
                <span>{allProducts.find(p => p._id === item.product)?.name || item.productName}</span>
                <input
                  type="number"
                  min={1}
                  {...register(`items.${idx}.quantity` as const, { valueAsNumber: true })}
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md"
                />
                <button type="button" onClick={() => remove(idx)} className="text-red-500">Remove</button>
              </div>
            ))}
          </div>
        </div>
        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative">
              <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setShowProductModal(false)}>&times;</button>
              <h3 className="text-xl font-bold mb-4">Select a Product</h3>
              {/* Category Filter */}
              <div className="mb-4 flex gap-4 items-center">
                <label className="font-medium">Category:</label>
                <select value={productCategory} onChange={e => { setProductCategory(e.target.value); setProductPage(1); }} className="border px-2 py-1 rounded">
                  <option value="">All</option>
                  {productCategories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
              {allProductsLoading && <div className="text-blue-500">Loading products...</div>}
              {allProductsError && <div className="text-red-500">{allProductsError}</div>}
              {!allProductsLoading && !allProductsError && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto mb-4">
                    {allProducts.map(product => (
                      <div key={product._id} className="border rounded-lg p-4 flex flex-col items-center">
                        <div className="font-semibold mb-2">{product.name}</div>
                        {product.image && <img src={product.image} alt={product.name} className="w-24 h-24 object-contain mb-2" />}
                        <div className="mb-2">₹{product.price}</div>
                        <button type="button" className="px-3 py-1 bg-primary text-white rounded" onClick={() => addProductToOrder(product)}>ADD</button>
                      </div>
                    ))}
                  </div>
                  {/* Pagination */}
                  <div className="flex justify-center gap-2 mt-2">
                    <button disabled={productPage <= 1} onClick={() => setProductPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
                    <span>Page {productPage} of {productPages}</span>
                    <button disabled={productPage >= productPages} onClick={() => setProductPage(p => Math.min(productPages, p + 1))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* Shipping Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
          <input {...register('shippingAddress.fullName')} placeholder="Full Name" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.addressLine1')} placeholder="Address Line 1" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.addressLine2')} placeholder="Address Line 2" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.city')} placeholder="City" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.state')} placeholder="State" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.postalCode')} placeholder="Postal Code" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.country')} placeholder="Country" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('shippingAddress.phone')} placeholder="Phone" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
        </div>
        {/* Billing Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Billing Address</label>
          <input {...register('billingAddress.fullName')} placeholder="Full Name" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.addressLine1')} placeholder="Address Line 1" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.addressLine2')} placeholder="Address Line 2" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.city')} placeholder="City" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.state')} placeholder="State" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.postalCode')} placeholder="Postal Code" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.country')} placeholder="Country" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
          <input {...register('billingAddress.phone')} placeholder="Phone" className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2" />
        </div>
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select {...register('paymentMethod')} className="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="cod">Cash/UPI/Card (In-store)</option>
            <option value="card">Card (Online)</option>
            <option value="upi">UPI (Online)</option>
          </select>
        </div>
        <button type="submit" className="w-full py-3 bg-primary text-white rounded-md font-semibold" disabled={isLoading}>
          {isLoading ? 'Placing Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default FranchiseCreateOrderPage; 