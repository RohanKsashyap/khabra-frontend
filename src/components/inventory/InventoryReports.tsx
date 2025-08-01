import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

interface ReportType {
  id: string;
  name: string;
  description: string;
}

interface InventoryReportsProps {
  franchiseId?: string;
}

export const InventoryReports: React.FC<InventoryReportsProps> = ({ franchiseId }) => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState<boolean>(false);

  const reportTypes: ReportType[] = [
    {
      id: 'stock_levels',
      name: 'Current Stock Levels',
      description: 'Report on current stock levels across all products'
    },
    {
      id: 'stock_movements',
      name: 'Stock Movement History',
      description: 'Report on stock movements within a date range'
    },
    {
      id: 'low_stock',
      name: 'Low Stock Alert',
      description: 'Report on products with stock below minimum threshold'
    },
    {
      id: 'stock_valuation',
      name: 'Stock Valuation',
      description: 'Report on the total value of current inventory'
    }
  ];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }

    try {
      setLoading(true);
      
      // In a real app, this would call an API endpoint
      // const response = await api.get(`/api/v1/inventory/reports/${selectedReport}`, {
      //   params: {
      //     franchiseId,
      //     startDate: dateRange.startDate,
      //     endDate: dateRange.endDate
      //   }
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Report generated successfully');
      
      // In a real app, you might download the report or display it
      // window.open(response.data.reportUrl, '_blank');
      
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const needsDateRange = ['stock_movements'].includes(selectedReport);

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Generate Inventory Reports</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Report Type</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="">Select a report type</option>
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  {reportTypes.find(r => r.id === selectedReport)?.description}
                </p>
              </div>
            )}
            
            {needsDateRange && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full p-2 border rounded"
                    value={dateRange.startDate}
                    onChange={handleDateChange}
                  />
                </div>
                <div>
                  <label className="block mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="w-full p-2 border rounded"
                    value={dateRange.endDate}
                    onChange={handleDateChange}
                  />
                </div>
              </div>
            )}
            
            {franchiseId ? (
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-600">
                  Report will be generated for the selected franchise only.
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-sm text-yellow-600">
                  Report will be generated for all franchises.
                </p>
              </div>
            )}
            
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleGenerateReport}
                disabled={loading || !selectedReport}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      <Card>
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Recent Reports</h2>
          
          <div className="text-center text-gray-500 py-8">
            <p>No recent reports found</p>
            <p className="text-sm mt-2">Generated reports will appear here</p>
          </div>
        </div>
      </Card>
    </div>
  );
}; 