import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface AddressData {
  _id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const userResponse = await axiosInstance.get('/users/me');
        setUserData(userResponse.data);

        // Fetch default address
        const addressResponse = await axiosInstance.get('/addresses/default');
        setAddressData(addressResponse.data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-white rounded-lg shadow-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-4 px-6 font-medium text-sm ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Preferences
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && userData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={userData.name}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={userData.email}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={userData.phone}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                />
              </div>
              {addressData && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address Line 1</label>
                    <input
                      type="text"
                      value={addressData.addressLine1}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                    />
                  </div>
                  {addressData.addressLine2 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address Line 2</label>
                      <input
                        type="text"
                        value={addressData.addressLine2}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">City</label>
                      <input
                        type="text"
                        value={addressData.city}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">State</label>
                      <input
                        type="text"
                        value={addressData.state}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                      <input
                        type="text"
                        value={addressData.postalCode}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Country</label>
                      <input
                        type="text"
                        value={addressData.country}
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Notifications settings coming soon...</p>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Preferences settings coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 