import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
}

const AdminCategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories?includeInactive=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.success) {
        setCategories(response.data.data || []);
      } else {
        setError('Failed to fetch categories');
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchCategories();
    }
  }, [user]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        displayName: category.displayName,
        description: category.description || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        displayName: '',
        description: '',
        isActive: true,
        sortOrder: 0,
      });
    }
    setIsModalOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
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
        setError('Authentication token not found');
        return;
      }

      const categoryData = {
        ...formData,
        sortOrder: Number(formData.sortOrder),
      };

      if (editingCategory) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/categories/${editingCategory._id}`,
          categoryData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Category updated successfully');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/categories`,
          categoryData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Category created successfully');
      }
      
      await fetchCategories();
      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to save category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }
        
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSuccess('Category deleted successfully');
        await fetchCategories();
      } catch (err: any) {
        console.error('Failed to delete category:', err);
        setError(err.response?.data?.message || 'Failed to delete category');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Category Management</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 flex items-center gap-2"
          disabled={isSubmitting}
        >
          <Plus className="h-4 w-4" />
          Add New Category
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
        ) : categories.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No categories found. Add your first category!
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.displayName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {category.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.sortOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleOpenModal(category)}
                        className="text-primary hover:text-primary/80"
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-800"
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Category Name (Internal)
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., health-supplements"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Lowercase, use hyphens instead of spaces</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  placeholder="e.g., Health Supplements"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  placeholder="Brief description of the category..."
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>
              
              <div className="mb-6 flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
