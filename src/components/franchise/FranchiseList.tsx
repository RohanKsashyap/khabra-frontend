import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Franchise } from '../../types';
import { Card } from '../../components/ui/Card';

const API_BASE = import.meta.env.VITE_API_URL;

const FranchiseList: React.FC = () => {
    const [franchises, setFranchises] = useState<Franchise[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');

    const punjabDistricts = [
        'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib',
        'Fazilka', 'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar',
        'Kapurthala', 'Ludhiana', 'Mansa', 'Moga', 'Muktsar',
        'Nawanshahr', 'Pathankot', 'Patiala', 'Rupnagar', 'Mohali',
        'Sangrur', 'Tarn Taran'
    ];

    useEffect(() => {
        fetchFranchises();
    }, [selectedDistrict]);

    const fetchFranchises = async () => {
        try {
            const url = selectedDistrict 
                ? `${API_BASE}/api/v1/franchises/district/${selectedDistrict}`
                : `${API_BASE}/api/v1/franchises`;
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await axios.get(url, config);
            setFranchises(response.data.data.filter((f: Franchise) => f.status === 'active'));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching franchises:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Our Franchises</h2>
            
            <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Filter by District</label>
                <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full md:w-64 p-2 border rounded"
                >
                    <option value="">All Districts</option>
                    {punjabDistricts.map(district => (
                        <option key={district} value={district}>{district}</option>
                    ))}
                </select>
            </div>

            {franchises.length === 0 ? (
                <p className="text-center text-gray-600">
                    {selectedDistrict 
                        ? `No franchises found in ${selectedDistrict}`
                        : 'No franchises found'}
                </p>
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
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FranchiseList; 