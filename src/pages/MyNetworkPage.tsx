import React from 'react';
import NetworkTree from '../components/dashboard/NetworkTree';

const MyNetworkPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Network</h1>
      <NetworkTree />
    </div>
  );
};

export default MyNetworkPage; 