import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Stock {
  _id: string;
  product: {
    _id: string;
    name: string;
    category: string;
  };
  currentQuantity: number;
}

interface AuditItem {
  stockId: string;
  systemQuantity: number;
  actualQuantity: number;
  notes?: string;
  productName?: string; // For display purposes
  productCategory?: string; // For display purposes
  discrepancy?: number; // Calculated field
}

interface InventoryAuditFormProps {
  franchiseId: string;
  onAuditComplete?: () => void;
}

export const InventoryAuditForm: React.FC<InventoryAuditFormProps> = ({ 
  franchiseId, 
  onAuditComplete 
}) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditStatus, setAuditStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchStockLevels = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/inventory/stock-levels/${franchiseId}`);
        const stockData = response.data.data;
        
        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(stockData.map((stock: Stock) => stock.product.category))
        );
        setCategories(uniqueCategories as string[]);
        
        // Initialize audit items with system quantities
        const initialAuditItems = stockData.map((stock: Stock) => ({
          stockId: stock._id,
          systemQuantity: stock.currentQuantity,
          actualQuantity: stock.currentQuantity,
          notes: '',
          productName: stock.product.name,
          productCategory: stock.product.category,
          discrepancy: 0
        }));

        setStocks(stockData);
        setAuditItems(initialAuditItems);
      } catch (err) {
        setError('Failed to fetch stock levels');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Check if there's an ongoing audit for this franchise
    const checkOngoingAudit = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/v1/inventory/audits/ongoing/${franchiseId}`);
        
        if (response.data.success && response.data.data) {
          const ongoingAudit = response.data.data;
          setAuditId(ongoingAudit._id);
          setAuditStatus(ongoingAudit.status);
          setAuditNotes(ongoingAudit.notes || '');
          
          // If there are audit items, load them
          if (ongoingAudit.items && ongoingAudit.items.length > 0) {
            setAuditItems(ongoingAudit.items.map((item: any) => ({
              stockId: item.stock._id,
              systemQuantity: item.systemQuantity,
              actualQuantity: item.actualQuantity,
              notes: item.notes || '',
              productName: item.stock.product.name,
              productCategory: item.stock.product.category,
              discrepancy: item.discrepancy
            })));
          } else {
            // Otherwise fetch stock levels to initialize audit items
            await fetchStockLevels();
          }
        } else {
          // No ongoing audit, fetch stock levels
          await fetchStockLevels();
        }
      } catch (err) {
        console.error('Failed to check ongoing audit:', err);
        // Fallback to fetching stock levels
        await fetchStockLevels();
      } finally {
        setLoading(false);
      }
    };

    checkOngoingAudit();
  }, [franchiseId]);

  const updateAuditItem = (stockId: string, field: keyof AuditItem, value: any) => {
    setAuditItems(prevItems => 
      prevItems.map(item => {
        if (item.stockId === stockId) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate discrepancy if actualQuantity changes
          if (field === 'actualQuantity') {
            updatedItem.discrepancy = parseFloat(value) - item.systemQuantity;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  const initiateAudit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // First, initiate the audit
      const initiateResponse = await api.post('/api/v1/inventory/audits/initiate', {
        franchiseId,
        notes: auditNotes
      });

      const newAuditId = initiateResponse.data.data._id;
      setAuditId(newAuditId);
      setAuditStatus('IN_PROGRESS');

      toast.success('Inventory audit initiated successfully');
      return newAuditId;
    } catch (err) {
      setError('Failed to initiate inventory audit');
      console.error(err);
      toast.error('Failed to initiate audit');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const addAuditItems = async (auditId: string) => {
    try {
      setSubmitting(true);
      
      // Add audit items
      await api.post('/api/v1/inventory/audits/add-items', {
        auditId,
        items: auditItems.map(item => ({
          stockId: item.stockId,
          actualQuantity: item.actualQuantity,
          notes: item.notes
        }))
      });

      toast.success('Audit items added successfully');
      return true;
    } catch (err) {
      setError('Failed to add audit items');
      console.error(err);
      toast.error('Failed to add audit items');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const completeAudit = async (auditId: string) => {
    try {
      setSubmitting(true);
      
      // Complete the audit
      await api.post('/api/v1/inventory/audits/complete', {
        auditId,
        notes: auditNotes
      });

      setAuditStatus('COMPLETED');
      toast.success('Inventory audit completed successfully');
      
      // Trigger onAuditComplete callback if provided
      onAuditComplete?.();
      return true;
    } catch (err) {
      setError('Failed to complete inventory audit');
      console.error(err);
      toast.error('Failed to complete audit');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAudit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      let currentAuditId = auditId;

      // If no audit has been initiated yet, initiate one
      if (!currentAuditId) {
        currentAuditId = await initiateAudit();
        if (!currentAuditId) return;
      }

      // Add or update audit items
      const itemsAdded = await addAuditItems(currentAuditId);
      if (!itemsAdded) return;

      // Complete the audit
      await completeAudit(currentAuditId);
    } catch (err) {
      setError('Failed to complete inventory audit process');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveProgress = async () => {
    try {
      setSubmitting(true);
      setError(null);

      let currentAuditId = auditId;

      // If no audit has been initiated yet, initiate one
      if (!currentAuditId) {
        currentAuditId = await initiateAudit();
        if (!currentAuditId) return;
      }

      // Add or update audit items
      await addAuditItems(currentAuditId);
      
      toast.success('Audit progress saved');
    } catch (err) {
      setError('Failed to save audit progress');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter audit items based on category and search term
  const filteredAuditItems = auditItems.filter(item => {
    const matchesCategory = filterCategory === 'all' || item.productCategory === filterCategory;
    const matchesSearch = !searchTerm || 
      item.productName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Calculate audit statistics
  const totalItems = auditItems.length;
  const itemsWithDiscrepancy = auditItems.filter(item => item.discrepancy !== 0).length;
  const discrepancyPercentage = totalItems > 0 
    ? ((itemsWithDiscrepancy / totalItems) * 100).toFixed(1) 
    : '0';

  if (loading) return <div className="text-center p-8">Loading inventory audit form...</div>;
  if (error) return <div className="text-red-500 text-center p-8">{error}</div>;

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Inventory Audit</h2>
        
        {auditStatus === 'COMPLETED' ? (
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-6">
            <p className="text-green-800 font-semibold">This audit has been completed.</p>
            <p className="text-green-700 mt-2">
              Total Items: {totalItems} | Items with Discrepancy: {itemsWithDiscrepancy} ({discrepancyPercentage}%)
            </p>
            <Button 
              variant="primary"
              className="mt-4"
              onClick={() => {
                setAuditId(null);
                setAuditStatus(null);
                setAuditNotes('');
                // Reset audit items to match current stock
                const initialAuditItems = stocks.map((stock: Stock) => ({
                  stockId: stock._id,
                  systemQuantity: stock.currentQuantity,
                  actualQuantity: stock.currentQuantity,
                  notes: '',
                  productName: stock.product.name,
                  productCategory: stock.product.category,
                  discrepancy: 0
                }));
                setAuditItems(initialAuditItems);
              }}
            >
              Start New Audit
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label htmlFor="auditNotes" className="block mb-2 font-medium">Audit Notes</label>
              <textarea
                id="auditNotes"
                className="w-full p-2 border rounded"
                placeholder="Enter any additional notes about this audit"
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-blue-800">
                {auditStatus === 'IN_PROGRESS' 
                  ? 'This audit is in progress. Complete the count for all items.'
                  : 'Start a new inventory audit by verifying the actual quantities.'}
              </p>
              <p className="text-blue-700 mt-2">
                Total Items: {totalItems} | Items with Discrepancy: {itemsWithDiscrepancy} ({discrepancyPercentage}%)
              </p>
            </div>
            
            <div className="mb-6 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="categoryFilter" className="block mb-2">Filter by Category</label>
                <select
                  id="categoryFilter"
                  className="w-full p-2 border rounded"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="searchTerm" className="block mb-2">Search Products</label>
                <input
                  id="searchTerm"
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Search by product name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">System Quantity</th>
                    <th className="p-3">Actual Quantity</th>
                    <th className="p-3">Discrepancy</th>
                    <th className="p-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditItems.map((item) => {
                    const discrepancy = item.actualQuantity - item.systemQuantity;
                    
                    return (
                      <tr key={item.stockId} className="border-b hover:bg-gray-50">
                        <td className="p-3">{item.productName}</td>
                        <td className="p-3 capitalize">{item.productCategory}</td>
                        <td className="p-3">{item.systemQuantity}</td>
                        <td className="p-3">
                          <input
                            type="number"
                            className="w-20 p-1 border rounded"
                            value={item.actualQuantity}
                            onChange={(e) => 
                              updateAuditItem(
                                item.stockId, 
                                'actualQuantity', 
                                parseFloat(e.target.value) || 0
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className={`p-3 font-bold ${
                          discrepancy > 0 
                            ? 'text-green-600' 
                            : discrepancy < 0 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                        }`}>
                          {discrepancy > 0 ? '+' : ''}{discrepancy.toFixed(2)}
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            className="w-full p-1 border rounded"
                            placeholder="Audit notes"
                            value={item.notes}
                            onChange={(e) => 
                              updateAuditItem(
                                item.stockId, 
                                'notes', 
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredAuditItems.length === 0 && (
              <div className="text-center text-gray-500 p-4">
                No items found matching your filters
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="secondary" 
                onClick={handleSaveProgress}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save Progress'}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmitAudit}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Complete Audit'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}; 