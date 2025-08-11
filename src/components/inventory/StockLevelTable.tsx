import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { inventoryAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Stock {
  _id: string;
  product: {
    _id: string;
    name: string;
    category: string;
  };
  currentQuantity: number;
  minimumThreshold: number;
  maximumCapacity: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface StockLevelTableProps {
  franchiseId: string;
  onStockSelect?: (stockId: string) => void;
}

export const StockLevelTable: React.FC<StockLevelTableProps> = ({ 
  franchiseId, 
  onStockSelect 
}) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await inventoryAPI.getStockLevels(franchiseId);
        
        if (response.success && response.data) {
          setStocks(response.data);
        } else {
          console.error('Invalid response format:', response);
          setError('Invalid data received from server');
          toast.error('Failed to load stock information');
        }
      } catch (err) {
        setError('Failed to fetch stock levels');
        console.error(err);
        toast.error('Failed to load stock information');
      } finally {
        setLoading(false);
      }
    };

    fetchStockLevels();
  }, [franchiseId]);

  const getStatusColor = (status: Stock['status']) => {
    switch (status) {
      case 'IN_STOCK': return 'text-green-600';
      case 'LOW_STOCK': return 'text-yellow-600';
      case 'OUT_OF_STOCK': return 'text-red-600';
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Stock Levels</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Current Quantity</th>
              <th className="p-3">Minimum Threshold</th>
              <th className="p-3">Maximum Capacity</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock) => (
              <tr key={stock._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{stock.product?.name || 'Unknown product'}</td>
                <td className="p-3">{stock.product?.category || 'Uncategorized'}</td>
                <td className="p-3">{stock.currentQuantity}</td>
                <td className="p-3">{stock.minimumThreshold}</td>
                <td className="p-3">{stock.maximumCapacity}</td>
                <td className={`p-3 font-bold ${getStatusColor(stock.status)}`}>
                  {stock.status.replace('_', ' ')}
                </td>
                <td className="p-3">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => onStockSelect?.(stock._id)}
                  >
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stocks.length === 0 && (
        <div className="text-center text-gray-500 p-4">
          No stock information available for this franchise
        </div>
      )}
    </Card>
  );
}; 