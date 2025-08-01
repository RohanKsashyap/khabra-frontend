import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { inventoryAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

interface StockMovement {
  _id: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGED' | 'EXPIRED';
  previousQuantity: number;
  changeAmount: number;
  newQuantity: number;
  user: {
    name: string;
  };
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

interface StockMovementHistoryProps {
  stockId: string;
}

export const StockMovementHistory: React.FC<StockMovementHistoryProps> = ({ stockId }) => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchStockMovements = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await inventoryAPI.getStockMovementHistory(stockId, { page });
        
        if (response.success && response.data) {
          setMovements(response.data);
          setTotalPages(response.pages || 1);
        } else {
          console.error('Invalid response format:', response);
          setError('Invalid data received from server');
          toast.error('Failed to load movement history');
        }
      } catch (err) {
        setError('Failed to fetch stock movement history');
        console.error(err);
        toast.error('Failed to load movement history');
      } finally {
        setLoading(false);
      }
    };

    fetchStockMovements();
  }, [stockId, page]);

  const getMovementTypeColor = (type: StockMovement['type']) => {
    switch (type) {
      case 'STOCK_IN': return 'text-green-600';
      case 'STOCK_OUT': return 'text-red-600';
      case 'ADJUSTMENT': return 'text-blue-600';
      case 'RETURN': return 'text-yellow-600';
      case 'DAMAGED': return 'text-gray-600';
      case 'EXPIRED': return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4">Stock Movement History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Previous Quantity</th>
              <th className="p-3">Change</th>
              <th className="p-3">New Quantity</th>
              <th className="p-3">User</th>
              <th className="p-3">Reference</th>
              <th className="p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement) => (
              <tr key={movement._id} className="border-b hover:bg-gray-50">
                <td className="p-3">{formatDate(movement.createdAt)}</td>
                <td className={`p-3 font-bold ${getMovementTypeColor(movement.type)}`}>
                  {movement.type.replace('_', ' ')}
                </td>
                <td className="p-3">{movement.previousQuantity}</td>
                <td className={`p-3 font-bold ${
                  movement.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {movement.changeAmount > 0 ? '+' : ''}{movement.changeAmount}
                </td>
                <td className="p-3">{movement.newQuantity}</td>
                <td className="p-3">{movement.user.name}</td>
                <td className="p-3">{movement.referenceNumber || 'N/A'}</td>
                <td className="p-3">{movement.notes || 'No notes'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {movements.length === 0 && (
        <div className="text-center text-gray-500 p-4">
          No stock movement history available
        </div>
      )}
      <div className="flex justify-between items-center p-4">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>Page {page} of {totalPages}</span>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </Card>
  );
}; 