import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';

const API_BASE = import.meta.env.VITE_API_URL;

interface Franchise {
  name: string;
  commissionPercentage: number;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: string;
  openingDate: string;
}

interface FranchiseSalesData {
  franchise: Franchise;
  totalSales: number;
  commission: number;
  totalProductsSold: number;
}

const FranchiseDashboard: React.FC = () => {
  const [data, setData] = useState<FranchiseSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`${API_BASE}/api/v1/franchises/my/sales`, config);
        setData(response.data);
      } catch (err) {
        setError('Failed to load franchise sales data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!data) return <div className="p-8 text-center">No data found.</div>;

  const { franchise, totalSales, commission, totalProductsSold } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Welcome, {franchise.contactPerson || franchise.name}!</h2>
      <Card className="p-8 max-w-2xl mx-auto shadow-lg border border-gray-200">
        <h3 className="text-2xl font-semibold mb-4 text-primary">{franchise.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="mb-1"><strong>Commission Percentage:</strong> {franchise.commissionPercentage}%</p>
            <p className="mb-1"><strong>Status:</strong> <span className={franchise.status === 'active' ? 'text-green-600' : 'text-red-600'}>{franchise.status}</span></p>
            <p className="mb-1"><strong>Opening Date:</strong> {new Date(franchise.openingDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="mb-1"><strong>Contact Person:</strong> {franchise.contactPerson}</p>
            <p className="mb-1"><strong>Phone:</strong> {franchise.phone}</p>
            <p className="mb-1"><strong>Email:</strong> {franchise.email}</p>
            <p className="mb-1"><strong>Address:</strong> {franchise.address}</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 mt-6 justify-center">
          <div className="bg-gray-50 rounded-lg p-6 flex-1 text-center border border-gray-100">
            <div className="text-lg font-medium text-gray-600 mb-2">Total Sales</div>
            <div className="text-2xl font-bold text-primary mb-1">₹{totalSales.toLocaleString()}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 flex-1 text-center border border-gray-100">
            <div className="text-lg font-medium text-gray-600 mb-2">Products Sold</div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{totalProductsSold}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 flex-1 text-center border border-gray-100">
            <div className="text-lg font-medium text-gray-600 mb-2">Commission Earned</div>
            <div className="text-2xl font-bold text-green-600 mb-1">₹{commission.toLocaleString()}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FranchiseDashboard; 