import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { inventoryAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { IndianRupee, TrendingUp } from 'lucide-react';

interface InventoryStats {
  totalProducts: number;
  totalStockItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  formattedTotalStockValue: string;
  recentMovements: number;
  topValueProducts?: TopValueProduct[];
  valueByCategory?: ValueByCategory[];
}

interface TopValueProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  formattedUnitPrice: string;
  formattedTotalValue: string;
}

interface ValueByCategory {
  category: string;
  value: number;
  formattedValue: string;
  percentage: number;
}

interface StockByCategory {
  category: string;
  count: number;
  percentage: number;
}

interface InventoryDashboardProps {
  franchiseId?: string;
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({ franchiseId }) => {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [stockByCategory, setStockByCategory] = useState<StockByCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If no franchiseId is provided, don't try to fetch data
    if (!franchiseId) {
      setLoading(false);
      return;
    }

    const fetchInventoryStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try the debug endpoint first
        try {
          const debugResponse = await inventoryAPI.debugInventoryStats(franchiseId);
          
          if (debugResponse.success && debugResponse.data) {
            console.log('Debug inventory stats:', debugResponse.data);
            
            // Use the debug data
            setStats({
              totalProducts: debugResponse.data.totalProducts || 0,
              totalStockItems: debugResponse.data.totalStocks || 0,
              lowStockItems: 0, // Not provided by debug endpoint
              outOfStockItems: 0, // Not provided by debug endpoint
              totalStockValue: debugResponse.data.totalValue || 0,
              formattedTotalStockValue: debugResponse.data.formattedTotalValue || '₹0',
              recentMovements: 0, // Not provided by debug endpoint
              topValueProducts: [], // Not provided by debug endpoint
              valueByCategory: [] // Not provided by debug endpoint
            });
            
            setStockByCategory([]); // Not provided by debug endpoint
            setLoading(false);
            return;
          }
        } catch (debugError) {
          console.warn('Debug endpoint failed, falling back to regular endpoint:', debugError);
        }
        
        // Fall back to regular endpoint
        const response = await inventoryAPI.getInventoryStats(franchiseId);
        
        if (response.success && response.data) {
          setStats({
            totalProducts: response.data.totalProducts || 0,
            totalStockItems: response.data.totalStockItems || 0,
            lowStockItems: response.data.lowStockItems || 0,
            outOfStockItems: response.data.outOfStockItems || 0,
            totalStockValue: response.data.totalStockValue || 0,
            formattedTotalStockValue: response.data.formattedTotalStockValue || '₹0',
            recentMovements: response.data.recentMovements || 0,
            topValueProducts: response.data.topValueProducts || [],
            valueByCategory: response.data.valueByCategory || []
          });
          
          setStockByCategory(response.data.stockByCategory || []);
        } else {
          console.error('Invalid response format:', response);
          setError('Invalid data received from server');
          toast.error('Failed to load inventory statistics');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inventory stats:', error);
        setError('Failed to load inventory statistics');
        toast.error('Failed to load inventory statistics');
        setLoading(false);
      }
    };

    fetchInventoryStats();
  }, [franchiseId]);

  if (!franchiseId) {
    return (
      <div className="text-center text-gray-500 p-4">
        Please select a franchise to view inventory statistics
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 p-4">
        No inventory statistics available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card>
        <div className="p-4">
          <h3 className="font-bold mb-3">Inventory Summary</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm text-gray-500">Total Value</p>
                <p className="font-bold">{stats.formattedTotalStockValue}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-2">
                <p className="text-sm text-gray-500">Recent Movements</p>
                <p className="font-bold">{stats.recentMovements}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs">
                  !
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="font-bold text-yellow-500">{stats.lowStockItems}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                  0
                </div>
              </div>
              <div className="ml-2">
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="font-bold text-red-500">{stats.outOfStockItems}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Total Products</h3>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Total Stock Items</h3>
            <p className="text-2xl font-bold">{stats.totalStockItems}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Low Stock Items</h3>
            <p className="text-2xl font-bold text-yellow-500">{stats.lowStockItems}</p>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="text-gray-500 text-sm">Out of Stock Items</h3>
            <p className="text-2xl font-bold text-red-500">{stats.outOfStockItems}</p>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-4">
            <h3 className="font-bold mb-4">Stock by Category</h3>
            <div className="space-y-4">
              {stockByCategory && stockByCategory.length > 0 ? (
                stockByCategory.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between mb-1">
                      <span>{item.category}</span>
                      <span className="font-bold">{item.count} items</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <h3 className="font-bold mb-4">Inventory Value</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="text-center">
                <p className="text-3xl font-bold">{stats.formattedTotalStockValue}</p>
                <p className="text-gray-500">Total inventory value</p>
              </div>
            </div>
            
            {stats.valueByCategory && stats.valueByCategory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Value by Category</h4>
                <div className="space-y-3">
                  {stats.valueByCategory.map((item) => (
                    <div key={item.category} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span>{item.category}</span>
                        <span className="font-medium">{item.formattedValue}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {stats.topValueProducts && stats.topValueProducts.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2">Top Value Products</h4>
                <div className="space-y-2">
                  {stats.topValueProducts.map((product) => (
                    <div key={product.productId} className="flex justify-between text-sm border-b pb-1">
                      <span className="truncate max-w-[60%]" title={product.productName}>
                        {product.productName}
                      </span>
                      <span className="font-medium">{product.formattedTotalValue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}; 