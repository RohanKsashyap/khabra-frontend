import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { StockCreationForm } from '../components/inventory/StockCreationForm';
import { InventoryReports } from '../components/inventory/InventoryReports';
import { InventoryAuditForm } from '../components/inventory/InventoryAuditForm';

interface Franchise {
  _id: string;
  name: string;
  location: string;
}

interface Stock {
  _id: string;
  product: {
    _id: string;
    name: string;
    category: string;
  };
  franchise: {
    _id: string;
    name: string;
  };
  currentQuantity: number;
  minimumThreshold: number;
  maximumCapacity: number;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

interface StockMovement {
  _id: string;
  type: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'RETURN' | 'DAMAGED' | 'EXPIRED';
  previousQuantity: number;
  changeAmount: number;
  newQuantity: number;
  createdAt: string;
  notes?: string;
}

export const AdminInventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchise, setSelectedFranchise] = useState<string>('');
  const [franchisesLoaded, setFranchisesLoaded] = useState<boolean>(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [showMovementModal, setShowMovementModal] = useState<boolean>(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState<boolean>(false);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0);
  const [adjustmentType, setAdjustmentType] = useState<'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT'>('STOCK_IN');
  const [adjustmentNotes, setAdjustmentNotes] = useState<string>('');
  const [movementLoading, setMovementLoading] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'stock' | 'audit' | 'reports'>('stock');

  // Fetch franchises on component mount
  useEffect(() => {
    const fetchFranchises = async () => {
      try {
        if (!user) {
          setFranchisesLoaded(true);
          return;
        }

        if (user?.role === 'franchise') {
          // Franchise user: only allow their own franchise
          const userFranchiseId = (user as any)?.franchise?._id || (user as any)?.franchise || '';
          if (userFranchiseId) {
            setFranchises([{ _id: userFranchiseId, name: user.name, location: '' }]);
            setSelectedFranchise(userFranchiseId);
          } else {
            toast.error('No franchise associated with your account');
            setFranchises([]);
          }
        } else {
          // Admin: fetch all franchises
          const response = await api.get('/api/v1/franchises');
          if (response.data.data && response.data.data.length > 0) {
            setFranchises(response.data.data);
            setSelectedFranchise(response.data.data[0]._id);
          } else {
            toast.error('No franchises found');
          }
        }
        setFranchisesLoaded(true);
      } catch (error) {
        console.error('Error fetching franchises:', error);
        toast.error('Failed to fetch franchises');
        setFranchisesLoaded(true);
      }
    };
    fetchFranchises();
  }, [user]);

  // Fetch stocks when franchise is selected
  useEffect(() => {
    if (selectedFranchise) {
      fetchStocks();
    }
  }, [selectedFranchise]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/inventory/stock-levels/${selectedFranchise}`);
      setStocks(response.data.data);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async (stockId: string) => {
    try {
      setMovementLoading(true);
      const response = await api.get(`/api/v1/inventory/stock-movements/${stockId}`);
      setStockMovements(response.data.data);
      setShowMovementModal(true);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      toast.error('Failed to fetch stock movement history');
    } finally {
      setMovementLoading(false);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedStock) return;

    try {
      setLoading(true);
      await api.post('/api/v1/inventory/stock-movement', {
        stockId: selectedStock._id,
        type: adjustmentType,
        changeAmount: adjustmentType === 'STOCK_OUT' ? -Math.abs(adjustmentQuantity) : adjustmentQuantity,
        notes: adjustmentNotes
      });
      
      toast.success('Stock updated successfully');
      setShowAdjustmentModal(false);
      setAdjustmentQuantity(0);
      setAdjustmentNotes('');
      fetchStocks(); // Refresh stocks
    } catch (error) {
      console.error('Error adjusting stock:', error);
      toast.error('Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Stock['status']) => {
    switch (status) {
      case 'IN_STOCK': return 'text-green-600';
      case 'LOW_STOCK': return 'text-yellow-600';
      case 'OUT_OF_STOCK': return 'text-red-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderTabContent = () => {
    // If franchises are still loading, show a loading indicator
    if (!franchisesLoaded) {
      return (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    // If no franchises are available, show a message
    if (franchises.length === 0) {
      return (
        <div className="text-center text-gray-500 p-4">
          No franchises available. Please create a franchise first.
        </div>
      );
    }

    switch (activeTab) {
      case 'stock':
        return (
          <>
            {showCreateForm && (
              <div className="mb-6">
                <StockCreationForm 
                  franchiseId={selectedFranchise} 
                  onStockCreated={() => {
                    setShowCreateForm(false);
                    fetchStocks();
                  }}
                />
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Card>
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
                        <td className="p-3 flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedStock(stock);
                              fetchStockMovements(stock._id);
                            }}
                          >
                            History
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              setSelectedStock(stock);
                              setShowAdjustmentModal(true);
                            }}
                          >
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loading && (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                </div>
              )}
              {!loading && stocks.length === 0 && (
                <div className="text-center text-gray-500 p-4">
                  No stock information available for this franchise
                </div>
              )}
            </Card>
          </>
        );
      case 'audit':
        return <InventoryAuditForm franchiseId={selectedFranchise} onAuditComplete={() => fetchStocks()} />;
      case 'reports':
        return <InventoryReports franchiseId={selectedFranchise} />;
      default:
        return (
          <>
            {showCreateForm && (
              <div className="mb-6">
                <StockCreationForm 
                  franchiseId={selectedFranchise} 
                  onStockCreated={() => {
                    setShowCreateForm(false);
                    fetchStocks();
                  }}
                />
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="secondary" 
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Card>
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
                        <td className="p-3 flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => {
                              setSelectedStock(stock);
                              fetchStockMovements(stock._id);
                            }}
                          >
                            History
                          </Button>
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              setSelectedStock(stock);
                              setShowAdjustmentModal(true);
                            }}
                          >
                            Adjust
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {loading && (
                <div className="text-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                </div>
              )}
              {!loading && stocks.length === 0 && (
                <div className="text-center text-gray-500 p-4">
                  No stock information available for this franchise
                </div>
              )}
            </Card>
          </>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex items-center space-x-4">
          {user?.role === 'franchise' ? (
            <span className="p-2 border rounded bg-gray-100">
              {franchises[0]?.name || 'My Franchise'}
            </span>
          ) : (
            <select
              className="p-2 border rounded"
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
            >
              {franchises.map((franchise) => (
                <option key={franchise._id} value={franchise._id}>
                  {franchise.name} - {franchise.location}
                </option>
              ))}
            </select>
          )}
          {activeTab === 'stock' && (
            <>
              <Button 
                variant="secondary" 
                onClick={fetchStocks}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button 
                variant="primary" 
                onClick={() => setShowCreateForm(true)}
              >
                Add New Stock
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stock'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('stock')}
            >
              Stock Management
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'audit'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('audit')}
            >
              Inventory Audit
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </nav>
        </div>
      </div>

      {renderTabContent()}

      {/* Stock Movement History Modal */}
      {showMovementModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Stock Movement History: {selectedStock.product?.name || 'Unknown product'}
              </h2>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowMovementModal(false)}
              >
                Close
              </Button>
            </div>
            
            {movementLoading ? (
              <div className="text-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Previous</th>
                    <th className="p-3">Change</th>
                    <th className="p-3">New</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {stockMovements.map((movement) => (
                    <tr key={movement._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(movement.createdAt)}</td>
                      <td className="p-3">{movement.type.replace('_', ' ')}</td>
                      <td className="p-3">{movement.previousQuantity}</td>
                      <td className={`p-3 font-bold ${
                        movement.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.changeAmount > 0 ? '+' : ''}{movement.changeAmount}
                      </td>
                      <td className="p-3">{movement.newQuantity}</td>
                      <td className="p-3">{movement.notes || 'No notes'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {!movementLoading && stockMovements.length === 0 && (
              <div className="text-center text-gray-500 p-4">
                No movement history available
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustmentModal && selectedStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                Adjust Stock: {selectedStock.product?.name || 'Unknown product'}
              </h2>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setShowAdjustmentModal(false)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Adjustment Type</label>
                <select
                  className="w-full p-2 border rounded"
                  value={adjustmentType}
                  onChange={(e) => setAdjustmentType(e.target.value as any)}
                >
                  <option value="STOCK_IN">Stock In</option>
                  <option value="STOCK_OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              
              <div>
                <label className="block mb-1">Notes</label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={adjustmentNotes}
                  onChange={(e) => setAdjustmentNotes(e.target.value)}
                  rows={3}
                  placeholder="Enter notes about this adjustment"
                />
              </div>
              
              <div className="flex justify-end">
                <Button 
                  variant="primary" 
                  onClick={handleStockAdjustment}
                  disabled={loading || adjustmentQuantity <= 0}
                >
                  {loading ? 'Processing...' : 'Submit Adjustment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 