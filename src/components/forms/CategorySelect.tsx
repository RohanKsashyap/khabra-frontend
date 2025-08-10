import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Category {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

interface CategorySelectProps {
  value?: string;
  onChange: (categoryId: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const CategorySelect = ({ 
  value, 
  onChange, 
  error, 
  required = false, 
  placeholder = "Select a category..." 
}: CategorySelectProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category {required && <span className="text-red-500">*</span>}
        </label>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Category {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.displayName}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
