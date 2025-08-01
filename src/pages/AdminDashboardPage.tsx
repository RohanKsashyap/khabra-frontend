import React, { useState } from 'react';
import AdminEarningsTable from '../components/admin/AdminEarningsTable';
import AdminWithdrawalsTable from '../components/admin/AdminWithdrawalsTable';
import AdminNetworkTreeViewer from '../components/admin/AdminNetworkTreeViewer';
import AdminDashboardOverview from '../components/admin/AdminDashboardOverview';
import AdminRanksPage from './AdminRanksPage';
import AdminTotalSalesPage from './AdminTotalSalesPage';
import AdminAddOrderPage from './AdminAddOrderPage';
import { Button } from '../components/ui/Button';

type AdminTab = 'overview' | 'ranks' | 'earnings' | 'sales' | 'withdrawals' | 'network' | 'addOrder';

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboardOverview />;
      case 'ranks':
        return <AdminRanksPage />;
      case 'earnings':
        return <AdminEarningsTable />;
      case 'sales':
        return <AdminTotalSalesPage />;
      case 'withdrawals':
        return <AdminWithdrawalsTable />;
      case 'network':
        return <AdminNetworkTreeViewer />;
      case 'addOrder':
        return <AdminAddOrderPage />;
      default:
        return <AdminDashboardOverview />;
    }
  };

  const TabButton: React.FC<{ tab: AdminTab; label: string }> = ({ tab, label }) => (
    <Button
      onClick={() => setActiveTab(tab)}
      className={activeTab === tab ? 'bg-primary text-primary-foreground' : ''}
    >
      {label}
    </Button>
  );

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 mb-6 border-b pb-4 overflow-x-auto">
        <TabButton tab="overview" label="Overview" />
        <TabButton tab="ranks" label="Ranks" />
        <TabButton tab="earnings" label="Earnings" />
        <TabButton tab="sales" label="Total Sales" />
        <TabButton tab="withdrawals" label="Withdrawals" />
        <TabButton tab="network" label="Network Viewer" />
        <TabButton tab="addOrder" label="Add Offline Order" />
      </div>
      <section>
        {renderContent()}
      </section>
    </div>
  );
};

export default AdminDashboardPage; 