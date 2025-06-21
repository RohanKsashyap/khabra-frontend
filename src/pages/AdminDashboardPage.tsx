import React from 'react';
import AdminEarningsTable from '../components/admin/AdminEarningsTable';
import AdminWithdrawalsTable from '../components/admin/AdminWithdrawalsTable';
import AdminNetworkTreeViewer from '../components/admin/AdminNetworkTreeViewer';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <section className="mb-8">
        <AdminEarningsTable />
      </section>
      <section className="mb-8">
        <AdminWithdrawalsTable />
      </section>
      <section className="mb-8">
        <AdminNetworkTreeViewer />
      </section>
    </div>
  );
};

export default AdminDashboardPage; 