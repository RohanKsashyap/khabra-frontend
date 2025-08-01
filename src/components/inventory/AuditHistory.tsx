import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

interface Audit {
  _id: string;
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
}

interface AuditHistoryProps {
  franchiseId: string;
  onViewAuditDetails?: (auditId: string) => void;
}

export const AuditHistory: React.FC<AuditHistoryProps> = ({ 
  franchiseId,
  onViewAuditDetails 
}) => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAuditHistory();
  }, [franchiseId, page]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/v1/inventory/audits/history/${franchiseId}`, {
        params: { page }
      });
      
      setAudits(response.data.data);
      setTotalPages(response.data.pages);
    } catch (err) {
      setError('Failed to fetch audit history');
      console.error(err);
      toast.error('Failed to load audit history');
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

  if (loading && audits.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading audit history...</p>
        </div>
      </Card>
    );
  }

  if (error && audits.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center text-red-500">
          <p>{error}</p>
          <Button onClick={fetchAuditHistory} className="mt-4">Retry</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Audit History</h2>
        
        {audits.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            No audit history found for this franchise
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Initiated By</th>
                    <th className="p-3">Items Audited</th>
                    <th className="p-3">Discrepancies</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map((audit) => (
                    <tr key={audit._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{formatDate(audit.startDate)}</td>
                      <td className="p-3">{getStatusBadge(audit.status)}</td>
                      <td className="p-3">{audit.initiatedBy.name}</td>
                      <td className="p-3">{audit.totalItemsAudited}</td>
                      <td className="p-3">
                        <span className={audit.totalDiscrepancies > 0 ? 'text-red-600 font-medium' : ''}>
                          {audit.totalDiscrepancies} ({audit.discrepancyPercentage.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="p-3">
                        <Button
                          onClick={() => onViewAuditDetails?.(audit._id)}
                          className="text-sm bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded"
                >
                  Previous
                </Button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-1 px-3 rounded"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}; 