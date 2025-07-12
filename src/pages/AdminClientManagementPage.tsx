import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, Filter, Download, Eye, Mail, Phone } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  franchiseId?: {
    _id: string;
    name: string;
  };
  uplineId?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  lastLogin?: string;
  totalOrders?: number;
  totalSpent?: number;
  status: 'active' | 'inactive';
}

interface Franchise {
  _id: string;
  name: string;
  district: string;
}

const AdminClientManagementPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [franchiseFilter, setFranchiseFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
    fetchFranchises();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API_BASE}/api/users/admin/clients`, config);
      setClients(response.data.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchFranchises = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API_BASE}/api/v1/franchises`, config);
      setFranchises(response.data.data);
    } catch (error) {
      console.error('Failed to load franchises:', error);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.phone.includes(searchTerm);
    const matchesFranchise = !franchiseFilter || client.franchiseId?._id === franchiseFilter;
    const matchesRole = !roleFilter || client.role === roleFilter;
    const matchesStatus = !statusFilter || client.status === statusFilter;
    const matchesDate = !dateFrom || new Date(client.createdAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(client.createdAt) <= new Date(dateTo);
    
    return matchesSearch && matchesFranchise && matchesRole && matchesStatus && matchesDate && matchesDateTo;
  });

  const exportClients = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'Franchise', 'Upline', 'Status', 'Joined Date', 'Total Orders', 'Total Spent'],
      ...filteredClients.map(client => [
        client.name,
        client.email,
        client.phone,
        client.role,
        client.franchiseId?.name || 'N/A',
        client.uplineId?.name || 'N/A',
        client.status,
        new Date(client.createdAt).toLocaleDateString(),
        client.totalOrders || 0,
        client.totalSpent || 0
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_blank');
  };

  const callPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Client Management</h1>
          <p className="text-gray-600">Manage all clients across franchises</p>
        </div>
        <Button onClick={exportClients} className="bg-green-600 hover:bg-green-700">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Franchise</label>
            <select
              value={franchiseFilter}
              onChange={(e) => setFranchiseFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Franchises</option>
              {franchises.map(franchise => (
                <option key={franchise._id} value={franchise._id}>
                  {franchise.name} ({franchise.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Roles</option>
              <option value="user">Customer</option>
              <option value="distributor">Distributor</option>
              <option value="franchise_owner">Franchise Owner</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredClients.length}</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {filteredClients.filter(c => c.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Active Clients</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {filteredClients.filter(c => c.role === 'distributor').length}
            </div>
            <div className="text-sm text-gray-600">Distributors</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredClients.filter(c => c.role === 'user').length}
            </div>
            <div className="text-sm text-gray-600">Customers</div>
          </div>
        </Card>
      </div>

      {/* Clients Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 border text-left">Name</th>
                <th className="px-4 py-3 border text-left">Contact</th>
                <th className="px-4 py-3 border text-left">Role</th>
                <th className="px-4 py-3 border text-left">Franchise</th>
                <th className="px-4 py-3 border text-left">Upline</th>
                <th className="px-4 py-3 border text-left">Status</th>
                <th className="px-4 py-3 border text-left">Joined</th>
                <th className="px-4 py-3 border text-left">Activity</th>
                <th className="px-4 py-3 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border">
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-gray-600">ID: {client._id.slice(-8)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border">
                    <div className="space-y-1">
                      <div className="text-sm">{client.email}</div>
                      <div className="text-sm">{client.phone}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border">
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.role === 'distributor' ? 'bg-purple-100 text-purple-800' :
                      client.role === 'franchise_owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {client.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 border text-sm">
                    {client.franchiseId?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 border text-sm">
                    {client.uplineId?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-3 border">
                    <span className={`px-2 py-1 rounded text-xs ${
                      client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 border text-sm">
                    {new Date(client.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border text-sm">
                    <div>
                      <div>Orders: {client.totalOrders || 0}</div>
                      <div>Spent: ₹{(client.totalSpent || 0).toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 border">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedClient(client)}
                        className="p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendEmail(client.email)}
                        className="p-1"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => callPhone(client.phone)}
                        className="p-1"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-500">No clients found</div>
          )}
        </div>
      </Card>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Client Details</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedClient(null)}
              >
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Basic Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {selectedClient.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedClient.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedClient.phone}</p>
                  <p><span className="font-medium">Role:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedClient.role === 'distributor' ? 'bg-purple-100 text-purple-800' :
                      selectedClient.role === 'franchise_owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedClient.role}
                    </span>
                  </p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedClient.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedClient.status}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Network Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Franchise:</span> {selectedClient.franchiseId?.name || 'N/A'}</p>
                  <p><span className="font-medium">Upline:</span> {selectedClient.uplineId?.name || 'N/A'}</p>
                  <p><span className="font-medium">Joined:</span> {new Date(selectedClient.createdAt).toLocaleDateString()}</p>
                  <p><span className="font-medium">Last Login:</span> {selectedClient.lastLogin ? new Date(selectedClient.lastLogin).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Activity Summary</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{selectedClient.totalOrders || 0}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">₹{(selectedClient.totalSpent || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex gap-2">
              <Button onClick={() => sendEmail(selectedClient.email)}>
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button onClick={() => callPhone(selectedClient.phone)}>
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClientManagementPage; 