import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  category: string;
}

interface Franchise {
  _id: string;
  name: string;
  location: string;
}

interface StockCreationFormProps {
  onStockCreated?: () => void;
  franchiseId?: string;
}

export const StockCreationForm: React.FC<StockCreationFormProps> = ({ 
  onStockCreated,
  franchiseId: defaultFranchiseId
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    franchiseId: defaultFranchiseId || '',
    currentQuantity: 0,
    minimumThreshold: 5,
    maximumCapacity: 100
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, franchisesResponse] = await Promise.all([
          api.get('/api/products'),
          api.get('/api/v1/franchises')
        ]);

        setProducts(productsResponse.data.data);
        setFranchises(franchisesResponse.data.data);

        // Set default values if available
        if (productsResponse.data.data.length > 0 && !formData.productId) {
          setFormData(prev => ({
            ...prev,
            productId: productsResponse.data.data[0]._id
          }));
        }

        if (!defaultFranchiseId && franchisesResponse.data.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            franchiseId: franchisesResponse.data.data[0]._id
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch products or franchises');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [defaultFranchiseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'currentQuantity' || name === 'minimumThreshold' || name === 'maximumCapacity'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      await api.post('/api/v1/inventory/stock', formData);
      
      toast.success('Stock created successfully');
      
      // Reset form
      setFormData({
        productId: products[0]?._id || '',
        franchiseId: defaultFranchiseId || franchises[0]?._id || '',
        currentQuantity: 0,
        minimumThreshold: 5,
        maximumCapacity: 100
      });
      
      // Notify parent component
      if (onStockCreated) {
        onStockCreated();
      }
    } catch (error) {
      console.error('Error creating stock:', error);
      toast.error('Failed to create stock');
    } finally {
      setLoading(false);
    }
  };

  if (loading && (!products.length || !franchises.length)) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Create New Stock Entry</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="productId" className="block mb-1">Product</label>
          <select
            id="productId"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product._id} value={product._id}>
                {product.name} - {product.category}
              </option>
            ))}
          </select>
        </div>

        {!defaultFranchiseId && (
          <div>
            <label htmlFor="franchiseId" className="block mb-1">Franchise</label>
            <select
              id="franchiseId"
              name="franchiseId"
              value={formData.franchiseId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a franchise</option>
              {franchises.map(franchise => (
                <option key={franchise._id} value={franchise._id}>
                  {franchise.name} - {franchise.location}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="currentQuantity" className="block mb-1">Initial Quantity</label>
          <input
            type="number"
            id="currentQuantity"
            name="currentQuantity"
            value={formData.currentQuantity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="0"
            required
          />
        </div>

        <div>
          <label htmlFor="minimumThreshold" className="block mb-1">Minimum Threshold</label>
          <input
            type="number"
            id="minimumThreshold"
            name="minimumThreshold"
            value={formData.minimumThreshold}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="0"
            required
          />
          <p className="text-sm text-gray-500">Stock will be marked as low when it reaches this level</p>
        </div>

        <div>
          <label htmlFor="maximumCapacity" className="block mb-1">Maximum Capacity</label>
          <input
            type="number"
            id="maximumCapacity"
            name="maximumCapacity"
            value={formData.maximumCapacity}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            min="1"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Stock Entry'}
          </Button>
        </div>
      </form>
    </Card>
  );
}; 