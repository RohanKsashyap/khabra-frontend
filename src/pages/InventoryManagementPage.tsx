import React from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { StockManagementDashboard } from '../components/inventory/StockManagementDashboard';

export const InventoryManagementPage: React.FC = () => {
  const { user } = useAuthContext();

  // Ensure only franchise owners or admins can access this page
  if (!user || !['franchise', 'admin'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>You do not have permission to access inventory management.</p>
        </div>
      </div>
    );
  }

  const franchiseId = (user as any)?.franchiseId || (user as any)?.franchise?._id || (user as any)?.franchise || '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Inventory Management</h1>
      {franchiseId ? (
        <StockManagementDashboard franchiseId={franchiseId} />
      ) : (
        <div className="text-center text-gray-600">
          No franchise associated with this account
        </div>
      )}
    </div>
  );
}; 