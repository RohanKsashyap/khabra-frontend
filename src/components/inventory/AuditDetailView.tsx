import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface AuditItem {
  _id: string;
  stock: {
    _id: string;
    product: {
      _id: string;
      name: string;
      category: string;
    };
  };
  systemQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  discrepancyPercentage: number;
  checkedBy: {
    _id: string;
    name: string;
  };
  notes?: string;
  status: 'MATCHED' | 'DISCREPANCY' | 'NEEDS_REVIEW';
}

interface Audit {
  _id: string;
  franchise: {
    _id: string;
    name: string;
    location: string;
  };
  startDate: string;
  endDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  initiatedBy: {
    _id: string;
    name: string;
  };
  completedBy?: {
    _id: string;
    name: string;
  };
  notes?: string;
  totalItemsAudited: number;
  totalDiscrepancies: number;
  discrepancyPercentage: number;
  items: AuditItem[];
}

interface AuditDetailViewProps {
  auditId: string;
  onBack: () => void;
}

export const AuditDetailView: React.FC<AuditDetailViewProps> = ({ auditId, onBack }) => {
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'discrepancies' | 'matched'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAuditDetails();
  }, [auditId]);

  const fetchAuditDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/inventory/audits/${auditId}`);
      setAudit(response.data.data);
    } catch (err) {
      setError('Failed to fetch audit details');
      console.error(err);
      toast.error('Failed to load audit details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: Audit['status']) => {
    let colorClass = '';
    
    switch (status) {
      case 'PENDING':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'IN_PROGRESS':
        colorClass = 'bg-blue-100 text-blue-800';
        break;
      case 'COMPLETED':
        colorClass = 'bg-green-100 text-green-800';
        break;
      case 'CANCELLED':
        colorClass = 'bg-red-100 text-red-800';
        break;
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getDiscrepancyClass = (discrepancy: number) => {
    if (discrepancy === 0) return 'text-gray-600';
    return discrepancy > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
  };

  // Filter audit items
  const getFilteredItems = () => {
    if (!audit || !audit.items) return [];
    
    return audit.items.filter(item => {
      // Filter by type
      const matchesType = 
        filterType === 'all' || 
        (filterType === 'discrepancies' && item.discrepancy !== 0) ||
        (filterType === 'matched' && item.discrepancy === 0);
      
      // Filter by search term
      const matchesSearch = 
        !searchTerm || 
        item.stock.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stock.product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  };

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading audit details...</p>
        </div>
      </Card>
    );
  }

  if (error || !audit) {
    return (
      <Card>
        <div className="p-6 text-center text-red-500">
          <p>{error || 'Failed to load audit details'}</p>
          <div className="mt-4">
            <Button 
              onClick={fetchAuditDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
            >
              Retry
            </Button>
            <Button 
              onClick={onBack}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
            >
              Back
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Audit Details</h2>
          <Button 
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded"
          >
            Back to Audit History
          </Button>
        </div>

        {/* Audit Summary */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Franchise</p>
              <p className="font-medium">{audit.franchise.name}</p>
              <p className="text-sm text-gray-500">{audit.franchise.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p>{getStatusBadge(audit.status)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dates</p>
              <p className="font-medium">Start: {formatDate(audit.startDate)}</p>
              {audit.endDate && <p className="font-medium">End: {formatDate(audit.endDate)}</p>}
            </div>
            <div>
              <p className="text-sm text-gray-500">Initiated By</p>
              <p className="font-medium">{audit.initiatedBy.name}</p>
            </div>
            {audit.completedBy && (
              <div>
                <p className="text-sm text-gray-500">Completed By</p>
                <p className="font-medium">{audit.completedBy.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Statistics</p>
              <p className="font-medium">
                {audit.totalDiscrepancies} discrepancies out of {audit.totalItemsAudited} items
                ({audit.discrepancyPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
          {audit.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Notes</p>
              <p className="bg-white p-2 rounded border mt-1">{audit.notes}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="filterType" className="block mb-2 text-sm font-medium">Filter Items</label>
            <select
              id="filterType"
              className="w-full p-2 border rounded"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
            >
              <option value="all">All Items</option>
              <option value="discrepancies">Items with Discrepancies</option>
              <option value="matched">Matched Items</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="searchTerm" className="block mb-2 text-sm font-medium">Search Products</label>
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

        {/* Audit Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">System Quantity</th>
                <th className="p-3">Actual Quantity</th>
                <th className="p-3">Discrepancy</th>
                <th className="p-3">Checked By</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.stock.product.name}</td>
                  <td className="p-3 capitalize">{item.stock.product.category}</td>
                  <td className="p-3">{item.systemQuantity}</td>
                  <td className="p-3">{item.actualQuantity}</td>
                  <td className={`p-3 ${getDiscrepancyClass(item.discrepancy)}`}>
                    {item.discrepancy > 0 ? '+' : ''}{item.discrepancy.toFixed(2)}
                    {item.discrepancy !== 0 && ` (${item.discrepancyPercentage.toFixed(1)}%)`}
                  </td>
                  <td className="p-3">{item.checkedBy.name}</td>
                  <td className="p-3">{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center text-gray-500 p-4">
            No items found matching your filters
          </div>
        )}
      </div>
    </Card>
  );
}; 