import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Franchise, User, Address } from '../../types';
import toast from 'react-hot-toast';
import FranchiseNetworkTree from '../franchise/FranchiseNetworkTree';

const API_BASE = import.meta.env.VITE_API_URL;

interface FranchiseSales {
    _id: string;
    name: string;
    owner?: { name: string; email: string };
    ownerId?: { name?: string; email?: string };
    commissionPercentage: number;
    totalSales: number;
    commission: number;
    sales?: { total: number };
}

const FranchiseManagement: React.FC = () => {
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        additionalLocation: '',
        district: '',
        address: '',
        contactPerson: '',
        phone: '',
        email: '',
        status: 'active' as 'active' | 'inactive',
        ownerId: '',
        commissionPercentage: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [franchiseSales, setFranchiseSales] = useState<FranchiseSales[]>([]);
    const [salesLoading, setSalesLoading] = useState(true);
    const [salesError, setSalesError] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [expandedNetworkId, setExpandedNetworkId] = useState<string | null>(null);

    const punjabDistricts = [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar',
        'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Mohali',
        'Sangrur', 'Tarn Taran'
    ];

    useEffect(() => {
        fetchFranchises();
        fetchFranchiseSales();
        fetchUsers();
    }, []);

    const fetchFranchises = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            console.log('fetchFranchises config:', config);
            const response = await axios.get(`${API_BASE}/api/v1/franchises`, config);
            if (response.data && response.data.data) {
                setFranchises(response.data.data);
            } else {
                setError('Invalid response format from server');
            }
        } catch (error) {
            console.error('Error fetching franchises:', error);
            setError('Failed to load franchises. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFranchiseSales = async () => {
        try {
            setSalesLoading(true);
            setSalesError(null);
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            console.log('fetchFranchiseSales config:', config);
            const response = await axios.get(`${API_BASE}/api/v1/franchises/admin/overview`, config);
            // Normalize totalSales to always be a number
            const normalized = (response.data.data || []).map((f: any) => ({
                ...f,
                totalSales: typeof f.totalSales === 'object' && f.totalSales !== null ? (f.totalSales.total ?? 0) : (f.totalSales ?? 0)
            }));
            setFranchiseSales(normalized);
        } catch (error) {
            setSalesError('Failed to load franchise sales.');
        } finally {
            setSalesLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(`${API_BASE}/api/users/franchise-owners`, config);
            console.log('Users loaded:', response.data);
            setUsers(response.data);
        } catch (error) {
            console.error('Error loading users:', error);
            // Fallback to regular users endpoint
            try {
                const token = localStorage.getItem('token');
                const fallbackConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const response = await axios.get(`${API_BASE}/api/users`, fallbackConfig);
                console.log('Users loaded (fallback):', response.data);
                setUsers(response.data);
            } catch (fallbackError) {
                console.error('Fallback error loading users:', fallbackError);
            }
        }
    };

    const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'ownerId') {
            setFormData(prev => ({ ...prev, ownerId: value }));
            if (value) {
                setAddressLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                    const response = await axios.get(`${API_BASE}/api/addresses/user/${value}`, config);
                    const addresses: Address[] = response.data;
                    const defaultAddress = addresses.find(a => (a as any).isDefault) || addresses[0];
                    // Find user by id or _id
                    const selectedUser = users.find(u => u.id === value || u._id === value);
                    console.log('Selected user for autofill:', selectedUser);
                    let phone = defaultAddress?.phone || '';
                    // Use address phone if valid, else use user's phone
                    if (!/^[0-9]{10}$/.test(phone) && selectedUser?.phone) {
                        phone = selectedUser.phone;
                    }
                    setFormData(prev => ({
                        ...prev,
                        address: defaultAddress ? defaultAddress.addressLine1 + (defaultAddress.addressLine2 ? (', ' + defaultAddress.addressLine2) : '') : '',
                        phone: phone,
                        email: selectedUser?.email || '',
                        contactPerson: selectedUser?.name || '',
                    }));
                } catch (err) {
                    // Optionally handle error
                } finally {
                    setAddressLoading(false);
                }
            }
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Debug: Log form data
        console.log('Form data being sent:', formData);
        // Validate required fields
        if (!formData.ownerId) {
            setError('Please select an owner');
            return;
        }
        if (!formData.commissionPercentage) {
            setError('Please enter commission percentage');
            return;
        }
        if (!formData.email || !/^[^@]+@[^@]+\.[^@]+$/.test(formData.email)) {
            setError('Please enter a valid email');
            return;
        }
        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
            setError('Please enter a valid 10-digit phone number');
            return;
        }
        try {
            setError(null);
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            // Convert commissionPercentage to number
            const dataToSend = {
                ...formData,
                location: formData.additionalLocation, // Map additionalLocation to location for backend
                commissionPercentage: Number(formData.commissionPercentage)
            };
            console.log('Data being sent to backend:', dataToSend);
            if (isEditing && editingId) {
                await axios.put(`${API_BASE}/api/v1/franchises/${editingId}`, dataToSend, config);
                toast.success('Franchise updated successfully!');
            } else {
                await axios.post(`${API_BASE}/api/v1/franchises`, dataToSend, config);
                toast.success('Franchise added successfully!');
            }
            fetchFranchises();
            resetForm();
        } catch (error: any) {
            console.error('Error saving franchise:', error);
            setError(error.response?.data?.message || 'Failed to save franchise. Please try again.');
        }
    };

    const handleEdit = (franchise: Franchise) => {
        setFormData({
            name: franchise.name,
            additionalLocation: franchise.additionalLocation || '',
            district: franchise.district,
            address: franchise.address,
            contactPerson: franchise.contactPerson,
            phone: franchise.phone,
            email: franchise.email,
            status: franchise.status,
            ownerId: (franchise as any).ownerId || (franchise as any).owner || '',
            commissionPercentage: (franchise as any).commissionPercentage || ''
        });
        setIsEditing(true);
        setEditingId(franchise._id);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this franchise?')) {
            try {
                setError(null);
                const tokenDel = localStorage.getItem('token');
                const configDel = tokenDel ? { headers: { Authorization: `Bearer ${tokenDel}` } } : {};
                await axios.delete(`${API_BASE}/api/v1/franchises/${id}`, configDel);
                toast.success('Franchise deleted successfully!');
                fetchFranchises();
            } catch (error: any) {
                console.error('Error deleting franchise:', error);
                setError(error.response?.data?.message || 'Failed to delete franchise. Please try again.');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            additionalLocation: '',
            district: '',
            address: '',
            contactPerson: '',
            phone: '',
            email: '',
            status: 'active',
            ownerId: '',
            commissionPercentage: ''
        });
        setIsEditing(false);
        setEditingId(null);
    };
    console.log('API_BASE:', API_BASE);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Franchise Management</h2>
            
            {error && franchises.length === 0 ? (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
                    {error}
                </div>
            ) : null}
            
            {/* Franchise Sales & Commission Table */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">Franchise Sales & Commissions</h3>
                {salesLoading ? (
                    <div>Loading sales data...</div>
                ) : salesError && franchiseSales.length === 0 ? (
                    <div className="text-red-600">{salesError}</div>
                ) : franchiseSales.length === 0 ? (
                    <div className="text-gray-500">No franchise sales data found yet. Sales and commissions will appear here after your first order.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 border">Franchise</th>
                                    <th className="px-4 py-2 border">Owner</th>
                                    <th className="px-4 py-2 border">Total Sales</th>
                                    <th className="px-4 py-2 border">Commission %</th>
                                    <th className="px-4 py-2 border">Commission</th>
                                    <th className="px-4 py-2 border">Network</th>
                                </tr>
                            </thead>
                            <tbody>
                                {franchiseSales.map(f => (
                                    <React.Fragment key={f._id}>
                                        <tr>
                                            <td className="px-4 py-2 border">{f.name}</td>
                                            <td className="px-4 py-2 border">{f.owner?.name || f.ownerId?.name || f.ownerId?.email || '-'}</td>
                                            <td className="px-4 py-2 border">₹{(typeof f.totalSales === 'number' ? f.totalSales : (f.sales?.total ?? 0)).toLocaleString()}</td>
                                            <td className="px-4 py-2 border">{f.commissionPercentage || 0}%</td>
                                            <td className="px-4 py-2 border">₹{(f.commission || 0).toLocaleString()}</td>
                                            <td className="px-4 py-2 border">
                                                <button
                                                    className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                                                    onClick={() => setExpandedNetworkId(expandedNetworkId === f._id ? null : f._id)}
                                                >
                                                    {expandedNetworkId === f._id ? 'Hide Network' : 'View Network'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedNetworkId === f._id && (
                                            <tr>
                                                <td colSpan={6} className="p-4 bg-gray-50">
                                                    <FranchiseNetworkTree franchiseId={f._id} />
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            <Card className="mb-6 p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">District</label>
                            <select
                                name="district"
                                value={formData.district}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select District</option>
                                {punjabDistricts.map(district => (
                                    <option key={district} value={district}>{district}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-gray-100"
                                readOnly
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Contact Person</label>
                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-gray-100"
                                readOnly
                                required
                                pattern="[0-9]{10}"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded bg-gray-100"
                                readOnly
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Additional Location</label>
                            <input
                                type="text"
                                name="additionalLocation"
                                value={formData.additionalLocation}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Owner (User) - {users.length} users available</label>
                            <select
                                name="ownerId"
                                value={formData.ownerId}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Select Owner</option>
                                {users.map(user => (
                                    <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                                ))}
                            </select>
                            {users.length === 0 && (
                                <p className="text-red-500 text-sm mt-1">No users available. Please create a user first.</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Commission Percentage</label>
                            <input
                                type="number"
                                name="commissionPercentage"
                                value={formData.commissionPercentage}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                min="0"
                                max="100"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" className="bg-primary text-white">
                            {isEditing ? 'Update Franchise' : 'Add Franchise'}
                        </Button>
                        {isEditing && (
                            <Button type="button" onClick={resetForm} className="bg-gray-200 text-gray-700">
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            {franchises.length === 0 && !error ? (
                <div className="text-center text-gray-500 py-8">
                    No franchises found. Please add your first franchise using the form above.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {franchises.map(franchise => (
                        <Card key={franchise._id} className="p-4">
                            <h3 className="text-lg font-semibold mb-2">{franchise.name}</h3>
                            <p className="text-sm mb-1"><strong>District:</strong> {franchise.district}</p>
                            <p className="text-sm mb-1"><strong>Address:</strong> {franchise.address}</p>
                            <p className="text-sm mb-1"><strong>Contact:</strong> {franchise.contactPerson}</p>
                            <p className="text-sm mb-1"><strong>Phone:</strong> {franchise.phone}</p>
                            <p className="text-sm mb-1"><strong>Email:</strong> {franchise.email}</p>
                            <p className="text-sm mb-2">
                                <strong>Status:</strong>
                                <span className={`ml-1 ${franchise.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                    {franchise.status}
                                </span>
                            </p>
                            <div className="flex gap-2 mt-2">
                                <Button onClick={() => handleEdit(franchise)} className="bg-blue-500 text-white">
                                    Edit
                                </Button>
                                <Button onClick={() => handleDelete(franchise._id)} className="bg-red-500 text-white">
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
                
            )}
        </div>
        
    );
};

export default FranchiseManagement; 