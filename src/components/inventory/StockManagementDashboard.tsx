import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StockLevelTable } from './StockLevelTable';
import { StockMovementHistory } from './StockMovementHistory';
import { InventoryAuditForm } from './InventoryAuditForm';

interface StockManagementDashboardProps {
  franchiseId: string;
}

export const StockManagementDashboard: React.FC<StockManagementDashboardProps> = ({ franchiseId }) => {
  const [selectedView, setSelectedView] = useState<
    'stock_levels' | 'stock_movements' | 'inventory_audit'
  >('stock_levels');

  const [selectedStockId, setSelectedStockId] = useState<string | null>(null);

  const renderView = () => {
    switch (selectedView) {
      case 'stock_levels':
        return (
          <StockLevelTable 
            franchiseId={franchiseId} 
            onStockSelect={(stockId) => {
              setSelectedStockId(stockId);
              setSelectedView('stock_movements');
            }}
          />
        );
      case 'stock_movements':
        return selectedStockId ? (
          <div>
            <div className="mb-4">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => setSelectedView('stock_levels')}
              >
                Back to Stock Levels
              </Button>
            </div>
            <StockMovementHistory stockId={selectedStockId} />
          </div>
        ) : null;
      case 'inventory_audit':
        return (
          <InventoryAuditForm 
            franchiseId={franchiseId} 
            onAuditComplete={() => setSelectedView('stock_levels')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={selectedView === 'stock_levels' ? 'primary' : 'secondary'}
            onClick={() => setSelectedView('stock_levels')}
          >
            Stock Levels
          </Button>
          <Button
            variant={selectedView === 'inventory_audit' ? 'primary' : 'secondary'}
            onClick={() => setSelectedView('inventory_audit')}
          >
            Inventory Audit
          </Button>
        </div>
      </div>
      {renderView()}
    </div>
  );
}; 