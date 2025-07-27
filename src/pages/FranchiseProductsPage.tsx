import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';
import { Navigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  commission: number;
  isActive: boolean;
  franchiseId: string;
}

const categories = ['health', 'beauty', 'wellness', 'other'];

export default function FranchiseProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: '',
    commission: '',
    isActive: true,
  });

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    // eslint-disable-next-line
  }, [user]);

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
      const response = await axios.get(`/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Only show products for this franchise
      setProducts(response.data.data.filter((p: Product) => p.franchiseId === user.franchiseId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        image: product.image,
        category: product.category,
        stock: product.stock.toString(),
        commission: product.commission.toString(),
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        stock: '',
        commission: '',
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
        commission: Number(formData.commission),
      };
      if (editingProduct) {
        await axios.put(`/products/${editingProduct._id}`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product updated successfully');
      } else {
        await axios.post(`/products`, productData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product created successfully');
      }
      await fetchProducts();
      handleCloseModal();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
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
        await axios.delete(`/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Product deleted successfully');
        await fetchProducts();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete product');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!user || user.role !== 'franchise') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage My Products</h1>
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
            <span className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded-md" />
                  </td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">${product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">{product.commission}%</td>
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
                        onClick={() => handleOpenModal(product)}
                        className="text-primary hover:text-primary/80"
                        disabled={isSubmitting}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isSubmitting}
                      >
                        Delete
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
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  required
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
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
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
                <label htmlFor="commission" className="block text-sm font-medium text-gray-700">Commission (%)</label>
                <input
                  type="number"
                  id="commission"
                  name="commission"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
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
                  {isSubmitting ? 'Saving...' : (editingProduct ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 