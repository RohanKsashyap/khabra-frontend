import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { userAPI, productAPI, orderAPI } from '../services/api';
import { toast } from 'react-hot-toast';

const AdminAddOrderPage: React.FC = () => {
  const [userQuery, setUserQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [foundProducts, setFoundProducts] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [manualProductId, setManualProductId] = useState('');
  const [manualProductQty, setManualProductQty] = useState(1);
  const [manualProductName, setManualProductName] = useState('');
  const [manualProductPrice, setManualProductPrice] = useState('');
  const [manualProductDetails, setManualProductDetails] = useState('');
  const [manualProductImage, setManualProductImage] = useState('');
  const [orderType, setOrderType] = useState('online');
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      userId: '',
      items: [] as { product: string; quantity: number; productName: string; productPrice: string; productDetails: string; productImage: string }[],
      status: 'delivered',
      paymentMethod: 'cod',
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const handleUserSearch = async () => {
    if (!userQuery) return;
    const users = await userAPI.getUsers({ search: userQuery });
    setFoundUsers(users);
  };

  const handleProductSearch = async () => {
    if (!productQuery) return;
    const { data } = await productAPI.getProducts({ search: productQuery, limit: 10 });
    setFoundProducts(data);
  };

  const handleProductFocus = async () => {
    // Fetch all products without limit to show all on focus
    const { data } = await productAPI.getProducts();
    setFoundProducts(data);
  };

  const selectUser = (user: any) => {
    setSelectedUser(user);
    setValue('userId', user._id);
    setFoundUsers([]);
  };

  const addProductToOrder = (product: any, quantity: number = 1, name?: string, price?: string, details?: string, image?: string) => {
    const currentItems = watch('items');
    const existingItemIndex = currentItems.findIndex(item => item.product === product._id);
    if (existingItemIndex === -1) {
      append({
        product: product._id,
        quantity,
        productName: name || product.name || '',
        productPrice: price || product.price || '',
        productDetails: details || product.details || '',
        productImage: image || product.image || '',
      });
    }
    // Clear suggestions and input
    setFoundProducts([]);
    setProductQuery('');
  };

  const onSubmit = async (data: any) => {
    // Validate userId
    if (!data.userId) {
      alert('Please select a user.');
      return;
    }
    // Validate items
    if (!data.items || !data.items.length) {
      alert('Please add at least one product to the order.');
      return;
    }
    // Validate each item
    let allItemsHaveProduct = true;
    const cleanedItems = data.items.map((item: any) => {
      if (item.product) {
        // Real product: must have product, productName, productPrice, productImage, quantity
        if (!item.productName || !item.productPrice || !item.productImage || !item.quantity) {
          alert(`Product at position ${data.items.indexOf(item) + 1} is missing required fields.`);
          throw new Error('Validation failed');
        }
        return item;
      } else {
        allItemsHaveProduct = false;
        // Custom product: must have productName, productPrice, productImage, quantity
        if (!item.productName || !item.productPrice || !item.productImage || !item.quantity) {
          alert(`Custom product at position ${data.items.indexOf(item) + 1} is missing required fields.`);
          throw new Error('Validation failed');
        }
        // Omit product field if present
        const { product, ...rest } = item;
        return rest;
      }
    });
    // Use explicit orderType from state
    const payload = { ...data, items: cleanedItems, orderType };
    try {
      await orderAPI.createAdminOrder(payload);
      toast.success('Order created successfully!');
    } catch (error) {
      console.error('Failed to create order:', error);
      console.log(payload)
      alert('Failed to create order. See console for details.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Add Offline Order</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Order Type</label>
          <select
            value={orderType}
            onChange={e => setOrderType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        {/* User Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">User</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by name or email"
              value={userQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            <button type="button" onClick={handleUserSearch} className="px-4 py-2 bg-primary text-white rounded-md">Search</button>
          </div>
          {foundUsers.length > 0 && (
            <ul className="border rounded p-2 mt-2">
              {foundUsers.map(user => (
                <li key={user._id} onClick={() => selectUser(user)} className="cursor-pointer p-2 hover:bg-gray-100">
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          )}
          {selectedUser && <div className="mt-2 font-semibold">Selected: {selectedUser.name}</div>}
        </div>

        {/* Product Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Products</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search products"
              value={productQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductQuery(e.target.value)}
              onFocus={handleProductFocus}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
            <button type="button" onClick={handleProductSearch} className="px-4 py-2 bg-primary text-white rounded-md">Search</button>
          </div>
          {foundProducts.length > 0 && (
            <ul className="border rounded p-2 mt-2 max-h-96 overflow-y-auto">
              {foundProducts.map(product => {
                const isMatch = productQuery && product.name.toLowerCase().includes(productQuery.toLowerCase());
                return (
                  <li
                    key={product._id}
                    onClick={() => addProductToOrder(product)}
                    className={`cursor-pointer p-2 hover:bg-gray-100 ${isMatch ? 'bg-yellow-100 font-semibold' : ''}`}
                  >
                    {product.name}
                  </li>
                );
              })}
            </ul>
          )}
          {/* Manual Product Entry */}
          <div className="flex flex-wrap gap-2 mt-4 items-end">
            <input
              type="text"
              placeholder="Enter Product ID"
              id="manual-product-id"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={manualProductId}
              onChange={e => setManualProductId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Product Name"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={manualProductName}
              onChange={e => setManualProductName(e.target.value)}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              className="w-24 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={manualProductPrice}
              onChange={e => setManualProductPrice(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Qty"
              id="manual-product-qty"
              className="w-20 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={manualProductQty}
              onChange={e => setManualProductQty(Number(e.target.value))}
            />
            <input
              type="text"
              placeholder="Product Image URL"
              className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={manualProductImage}
              onChange={e => setManualProductImage(e.target.value)}
            />
            <input
              type="text"
              placeholder="Details"
              className="w-40 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={manualProductDetails}
              onChange={e => setManualProductDetails(e.target.value)}
            />
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
              onClick={() => {
                if (manualProductId && manualProductQty > 0 && manualProductName && manualProductPrice && manualProductImage) {
                  addProductToOrder(
                    { _id: manualProductId },
                    manualProductQty,
                    manualProductName,
                    manualProductPrice,
                    manualProductDetails,
                    manualProductImage
                  );
                  setManualProductId('');
                  setManualProductQty(1);
                  setManualProductName('');
                  setManualProductPrice('');
                  setManualProductDetails('');
                  setManualProductImage('');
                }
              }}
            >
              Add Product by ID
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Order Items</h3>
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-center gap-2 p-2 border-b">
              <input {...register(`items.${index}.product`)} type="hidden" />
              <span className="text-xs text-gray-500">Product ID:</span>
              <span className="w-30">{watch(`items.${index}.product`)}</span>
              <input
                {...register(`items.${index}.productName`)}
                type="text"
                placeholder="Name"
                className="w-32 px-2 py-1 border border-gray-300 rounded-md"
              />
              <input
                {...register(`items.${index}.productPrice`)}
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                className="w-20 px-2 py-1 border border-gray-300 rounded-md"
              />
              <input
                {...register(`items.${index}.quantity`)}
                type="number"
                min="1"
                placeholder="Qty"
                className="w-16 px-2 py-1 border border-gray-300 rounded-md"
              />
              <input
                {...register(`items.${index}.productImage`)}
                type="text"
                placeholder="Image URL"
                className="w-40 px-2 py-1 border border-gray-300 rounded-md"
              />
              <input
                {...register(`items.${index}.productDetails`)}
                type="text"
                placeholder="Details"
                className="w-40 px-2 py-1 border border-gray-300 rounded-md"
              />
              <button type="button" onClick={() => remove(index)} className="px-3 py-1 bg-red-600 text-white rounded-md">Remove</button>
            </div>
          ))}
          {fields.length === 0 && <p className="text-gray-500">No products added yet.</p>}
        </div>

        <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Create Order</button>
      </form>
    </div>
  );
};

export default AdminAddOrderPage; 