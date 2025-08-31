import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Settings as SettingsIcon, 
  Shield, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Eye, 
  EyeOff, 
  Lock,
  Key,
  Globe,
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  CheckCircle,
  AlertCircle,
  Info,
  TrendingUp,
  DollarSign,
  Gift,
  MessageCircle
} from 'lucide-react';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  referralCode?: string;
  referrerName?: string;
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

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  orderUpdates: boolean;
  rankUpdates: boolean;
  earningsUpdates: boolean;
}

interface Preferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  timezone: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [addressData, setAddressData] = useState<AddressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'billing'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [formData, setFormData] = useState<Partial<AddressData>>({});
  const [profileData, setProfileData] = useState<Partial<UserData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notification and preference states
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    sms: true,
    push: true,
    marketing: false,
    orderUpdates: true,
    rankUpdates: true,
    earningsUpdates: true
  });

  const [preferences, setPreferences] = useState<Preferences>({
    theme: 'auto',
    language: 'English',
    currency: 'INR',
    timezone: 'Asia/Kolkata'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const userResponse = await axiosInstance.get('/users/me');
        setUserData(userResponse.data.data);
        setProfileData(userResponse.data.data);

        // Fetch default address
        const addressResponse = await axiosInstance.get('/addresses/default');
        setAddressData(addressResponse.data.data);
        setFormData(addressResponse.data.data || {});
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationToggle = (key: keyof NotificationSettings, value?: string) => {
    setNotificationSettings(prev => {
      if (value !== undefined) {
        return { ...prev, [key]: value };
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (addressData?._id) {
        // Update existing address
        const response = await axiosInstance.put(`/addresses/${addressData._id}`, formData);
        setAddressData(response.data.data);
        toast.success('Address updated successfully');
      } else {
        // Create new address
        const response = await axiosInstance.post('/addresses', formData);
        setAddressData(response.data);
        toast.success('Address added successfully');
      }
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to save address');
      console.error('Error saving address:', err);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put('/users/me', profileData);
      setUserData(response.data.data);
      toast.success('Profile updated successfully');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error('Failed to update profile');
      console.error('Error updating profile:', err);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await axiosInstance.put('/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error('Failed to change password');
      console.error('Error changing password:', err);
    }
  };

  const handlePreferenceChange = (key: keyof Preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-accent text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <SettingsIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Settings</h1>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Manage your account, preferences, and security settings
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Enhanced Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex overflow-x-auto scrollbar-hide">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'security', label: 'Security', icon: Shield },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
                { id: 'billing', label: 'Billing', icon: CreditCard }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-3 sm:py-4 px-4 sm:px-6 font-medium text-sm whitespace-nowrap transition-all duration-200 min-w-fit ${
                      activeTab === tab.id
                        ? 'border-b-2 border-accent text-accent bg-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.charAt(0)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {activeTab === 'profile' && userData && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 text-accent rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                    <User className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-2">{userData.name}</h2>
                    <p className="text-gray-500 text-base sm:text-lg">{userData.email}</p>
                    <p className="text-gray-400 text-sm sm:text-base">Member since {new Date().getFullYear()}</p>
                  </div>
                  <div className="sm:ml-auto">
                    <button
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-accent text-white rounded-xl transition-colors flex items-center justify-center space-x-2"
                    >
                      {isEditingProfile ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />}
                      <span className="text-sm sm:text-base">{isEditingProfile ? 'Cancel' : 'Edit Profile'}</span>
                    </button>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="py-6 border-b border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  </div>
                  {isEditingProfile ? (
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={profileData.name || ''}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={profileData.phone || ''}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email || ''}
                          onChange={handleProfileChange}
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center space-x-2"
                        >
                          <Save className="h-5 w-5" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{userData._id}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{userData.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{userData.email}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{userData.phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Your Referral Code</label>
                          <p className="text-sm font-medium text-accent bg-accent/10 px-4 py-3 rounded-lg">{userData.referralCode || 'N/A'}</p>
                        </div>
                        {userData.referrerName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Referred By</label>
                            <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{userData.referrerName}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Address Section */}
                <div className="py-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                    </div>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`px-6 py-3 rounded-lg transition-colors flex items-center space-x-2 ${
                        isEditing 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-accent hover:bg-accent/90 text-white'
                      }`}
                    >
                      {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
                      <span>{isEditing ? 'Cancel' : addressData ? 'Edit Address' : 'Add Address'}</span>
                    </button>
                  </div>
                  {!addressData && !isEditing && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800 mb-1">No Address Saved</h4>
                          <p className="text-sm text-yellow-700">
                            Please add a default shipping address to continue with your orders.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 1</label>
                          <input
                            type="text"
                            name="addressLine1"
                            value={formData.addressLine1 || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Address Line 2</label>
                          <input
                            type="text"
                            name="addressLine2"
                            value={formData.addressLine2 || ''}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Postal Code</label>
                          <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={formData.country || ''}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent transition-all duration-200"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center space-x-2"
                        >
                          <Save className="h-5 w-5" />
                          <span>Save Address</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{addressData?.fullName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{addressData?.phone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Country</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{addressData?.country}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                            {addressData?.addressLine1}<br />
                            {addressData?.addressLine2 && <>{addressData.addressLine2}<br /></>}
                            {addressData?.city}, {addressData?.state} {addressData?.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Security</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Notifications Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-8"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <Bell className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Notification Preferences</h2>
                      <p className="text-blue-100 text-lg">Customize how and when you receive notifications</p>
                    </div>
                  </div>
                </motion.div>

                {/* Email Notifications */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Email Notifications</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    <div>
                          <h4 className="font-medium text-gray-900">Order Updates</h4>
                          <p className="text-sm text-gray-600">Get notified about order status changes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                      <input
                          type="checkbox"
                          checked={notificationSettings.orderUpdates}
                          onChange={() => handleNotificationToggle('orderUpdates')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Rank Updates</h4>
                          <p className="text-sm text-gray-600">Get notified about rank changes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.rankUpdates}
                          onChange={() => handleNotificationToggle('rankUpdates')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Earnings Updates</h4>
                          <p className="text-sm text-gray-600">Get notified about commission earnings</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.earningsUpdates}
                          onChange={() => handleNotificationToggle('earningsUpdates')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                          <Gift className="h-4 w-4 text-pink-600" />
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Marketing Communications</h4>
                          <p className="text-sm text-gray-600">Special deals and promotional content</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.marketing}
                          onChange={() => handleNotificationToggle('marketing')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                      </div>
                    </div>
                </motion.div>

                {/* SMS & Push Notifications */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">SMS & Push Notifications</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <MessageCircle className="h-4 w-4 text-indigo-600" />
                        </div>
                      <div>
                          <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via text message</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.sms}
                          onChange={() => handleNotificationToggle('sms')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <Bell className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                          <h4 className="font-medium text-gray-900">Push Notifications</h4>
                          <p className="text-sm text-gray-600">Receive instant app notifications</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.push}
                          onChange={() => handleNotificationToggle('push')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-accent/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                      </label>
                    </div>
                  </div>
                </motion.div>

                {/* Save Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => {
                      // Handle saving notification settings
                      console.log('Saving notification settings:', notificationSettings);
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-accent to-purple-600 text-white rounded-xl hover:from-accent/90 hover:to-purple-600/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Save Notification Preferences
                  </button>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Preferences</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Theme</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={preferences.theme === 'light'}
                        onChange={() => handlePreferenceChange('theme', 'light')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Light</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={preferences.theme === 'dark'}
                        onChange={() => handlePreferenceChange('theme', 'dark')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Dark</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value="auto"
                        checked={preferences.theme === 'auto'}
                        onChange={() => handlePreferenceChange('theme', 'auto')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Auto</span>
                    </label>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-4">Language</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="English"
                        checked={preferences.language === 'English'}
                        onChange={() => handlePreferenceChange('language', 'English')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">English</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="Spanish"
                        checked={preferences.language === 'Spanish'}
                        onChange={() => handlePreferenceChange('language', 'Spanish')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Spanish</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="language"
                        value="French"
                        checked={preferences.language === 'French'}
                        onChange={() => handlePreferenceChange('language', 'French')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">French</span>
                    </label>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-4">Currency</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        value="INR"
                        checked={preferences.currency === 'INR'}
                        onChange={() => handlePreferenceChange('currency', 'INR')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">INR</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        value="USD"
                        checked={preferences.currency === 'USD'}
                        onChange={() => handlePreferenceChange('currency', 'USD')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">USD</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="currency"
                        value="EUR"
                        checked={preferences.currency === 'EUR'}
                        onChange={() => handlePreferenceChange('currency', 'EUR')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">EUR</span>
                    </label>
                  </div>

                  <h3 className="text-lg font-medium mt-6 mb-4">Timezone</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="timezone"
                        value="Asia/Kolkata"
                        checked={preferences.timezone === 'Asia/Kolkata'}
                        onChange={() => handlePreferenceChange('timezone', 'Asia/Kolkata')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Asia/Kolkata</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="timezone"
                        value="UTC"
                        checked={preferences.timezone === 'UTC'}
                        onChange={() => handlePreferenceChange('timezone', 'UTC')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">UTC</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                        <input
                        type="radio"
                        name="timezone"
                        value="Europe/London"
                        checked={preferences.timezone === 'Europe/London'}
                        onChange={() => handlePreferenceChange('timezone', 'Europe/London')}
                        className="form-radio text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Europe/London</span>
                    </label>
                      </div>
                    </div>
                  </div>
                )}

            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">Billing</h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Credit Card</p>
                        <p className="text-xs text-gray-500">**** **** **** 1234</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Manage
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Bank Transfer</p>
                        <p className="text-xs text-gray-500">Account: 1234567890</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Manage
                      </button>
              </div>
            </div>

                  <h3 className="text-lg font-medium mt-6 mb-4">Invoices</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Invoice #123456789</p>
                        <p className="text-xs text-gray-500">Date: 2023-10-27</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Download
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-md shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Invoice #123456790</p>
                        <p className="text-xs text-gray-500">Date: 2023-10-28</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                        Download
                      </button>
                    </div>
                  </div>
            </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 