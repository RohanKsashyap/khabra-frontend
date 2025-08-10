import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios, { AxiosError } from 'axios';
import { Edit, Trash2, Loader2, Info } from 'lucide-react';
import ImageUpload from '../components/admin/ImageUpload';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: {
    _id: string;
    name: string;
    displayName: string;
  } | string;
  stock: number;
  selfCommission: number;
  isActive: boolean;
}


const AdminProductsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{name: string, displayName: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    imageFileId: '',
    category: '',
    stock: '',
    selfCommission: '',
    isActive: true,
  });

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        setProducts(response.data.data || []);
      } else {
        setError('Invalid response format from server. Check console for details.');
        setProducts([]);
      }
    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to fetch products');
      } else {
        setError('An unexpected error occurred.');
      }
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (response.data && response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Keep empty array as fallback
    }
  };

  useEffect(() => {
    if (user && !loading) {
      fetchProducts();
      fetchCategories();
    }
  }, [user, loading]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        imageFileId: '',
        category: typeof product.category === 'object' ? product.category.name : product.category,
        stock: product.stock.toString(),
        selfCommission: product.selfCommission.toString(),
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        imageFileId: '',
        category: '',
        stock: '',
        selfCommission: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setError(null);
    setSuccess(null);
  };

  const handleOpenDetailModal = (product: Product) => {
    setSelectedProductForDetail(product);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProductForDetail(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found.');
        setIsSubmitting(false);
        return;
      }

      const productData = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        selfCommission: Number(formData.selfCommission),
      };

      console.log('Sending product data:', productData);

      if (editingProduct) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Product updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/products`,
          productData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Product created successfully');
      }
      
      await fetchProducts();
      handleCloseModal();
    } catch (err: unknown) {
      console.error('Failed to save product:', err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to save product');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found.');
          setIsSubmitting(false);
          return;
        }
        
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product deleted successfully');
        await fetchProducts();
      } catch (err: unknown) {
        console.error('Failed to delete product:', err);
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to delete product');
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
          disabled={isSubmitting}
        >
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No products found. Add your first product!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cashback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleOpenDetailModal(product)}>
                  <td className="px-6 py-4">
                    <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">
                    {typeof product.category === 'object' ? product.category.displayName : product.category}
                  </td>
                  <td className="px-6 py-4">₹{product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">{product.selfCommission}% Cashback</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium w-40">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from firing
                          handleOpenModal(product);
                        }}
                        className="text-primary hover:text-primary/80"
                        disabled={isSubmitting}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click from firing
                          handleDelete(product._id);
                        }}
                        className="text-red-600 hover:text-red-800"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-xl font-bold mb-4 sticky top-0 bg-white pb-2">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  required
                ></textarea>
              </div>
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  step="0.01"
                  required
                />
              </div>
              <div className="mb-4">
                <ImageUpload
                  currentImage={formData.image}
                  onImageUploaded={(imageUrl: string, fileId: string) => {
                    setFormData({ 
                      ...formData, 
                      image: imageUrl, 
                      imageFileId: fileId 
                    });
                  }}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>{cat.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="selfCommission" className="block text-sm font-medium text-gray-700">Self Commission Cashback (%)</label>
                <input
                  type="number"
                  id="selfCommission"
                  name="selfCommission"
                  value={formData.selfCommission}
                  onChange={(e) => setFormData({ ...formData, selfCommission: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>
              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingProduct ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedProductForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <h2 className="text-2xl font-bold mb-4 text-primary sticky top-0 bg-white pb-2">
              {selectedProductForDetail.name}
            </h2>
            <div className="space-y-4">
              <img
                src={selectedProductForDetail.image}
                alt={selectedProductForDetail.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <div>
                <p className="text-gray-600 font-medium">Description:</p>
                <p className="text-gray-800">{selectedProductForDetail.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 font-medium">Price:</p>
                  <p className="text-lg font-bold text-green-600">₹{selectedProductForDetail.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Category:</p>
                  <p className="text-gray-800 capitalize">
                    {typeof selectedProductForDetail.category === 'object' 
                      ? selectedProductForDetail.category.displayName 
                      : selectedProductForDetail.category}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Stock:</p>
                  <p className="text-gray-800">{selectedProductForDetail.stock}</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Self Commission Cashback:</p>
                  <p className="text-gray-800">{selectedProductForDetail.selfCommission}% Cashback</p>
                </div>
                <div>
                  <p className="text-gray-600 font-medium">Status:</p>
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    selectedProductForDetail.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProductForDetail.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductsPage; 