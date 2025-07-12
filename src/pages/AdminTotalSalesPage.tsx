import React, { useEffect, useState, useMemo } from 'react';
import { orderAPI, franchiseAPI } from '../services/api';

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function toCSV(rows: any[], headers: string[]) {
  const escape = (v: any) => `"${String(v).replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(row => headers.map(h => escape(row[h])).join(','))].join('\n');
}

const AdminTotalSalesPage: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [salesRes, franchisesRes] = await Promise.all([
          orderAPI.fetchTotalProductSales(),
          franchiseAPI.getAllFranchises()
        ]);
        setSales(salesRes.data || []);
        setFranchises(franchisesRes.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Add saleDate to each sale (simulate, as backend does not provide it)
  const salesWithDate = useMemo(() => {
    return sales.map((s: any) => ({
      ...s,
      saleDate: s.saleDate || s.createdAt || new Date().toISOString(), // fallback if not present
    }));
  }, [sales]);

  // Filter by date range, franchise, and order type
  const filteredSales = useMemo(() => {
    let filtered = salesWithDate;
    if (startDate) {
      filtered = filtered.filter(s => new Date(s.saleDate) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(s => new Date(s.saleDate) <= new Date(endDate));
    }
    if (franchiseFilter) {
      filtered = filtered.filter(s => s.franchiseName === franchiseFilter);
    }
    if (orderTypeFilter) {
      filtered = filtered.filter(s => s.orderType === orderTypeFilter);
    }
    return filtered;
  }, [salesWithDate, startDate, endDate, franchiseFilter, orderTypeFilter]);

  // Sorting
  const sortedSales = useMemo(() => {
    const sorted = [...filteredSales];
    sorted.sort((a, b) => {
      let vA, vB;
      if (sortBy === 'amount') {
        vA = a.totalSales;
        vB = b.totalSales;
      } else if (sortBy === 'date') {
        vA = new Date(a.saleDate).getTime();
        vB = new Date(b.saleDate).getTime();
      } else if (sortBy === 'mode') {
        vA = a.orderType;
        vB = b.orderType;
      } else if (sortBy === 'franchise') {
        vA = a.franchiseName || 'Direct';
        vB = b.franchiseName || 'Direct';
      } else {
        vA = a[sortBy];
        vB = b[sortBy];
      }
      if (vA < vB) return sortDir === 'asc' ? -1 : 1;
      if (vA > vB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredSales, sortBy, sortDir]);

  // Total sum
  const totalSum = sortedSales.reduce((sum, s) => sum + (s.totalSales || 0), 0);

  // Online/Offline breakdown
  const onlineSum = sortedSales.filter(s => s.orderType === 'online').reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const offlineSum = sortedSales.filter(s => s.orderType === 'offline').reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const onlineCount = sortedSales.filter(s => s.orderType === 'online').length;
  const offlineCount = sortedSales.filter(s => s.orderType === 'offline').length;

  // Franchise breakdown
  const franchiseSales = sortedSales.filter(s => s.franchiseName);
  const directSales = sortedSales.filter(s => !s.franchiseName);
  const franchiseSum = franchiseSales.reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const directSum = directSales.reduce((sum, s) => sum + (s.totalSales || 0), 0);
  const franchiseCount = franchiseSales.length;
  const directCount = directSales.length;

  // Pie chart data
  const totalPie = onlineSum + offlineSum;
  const onlinePercent = totalPie ? (onlineSum / totalPie) * 100 : 0;
  const offlinePercent = totalPie ? (offlineSum / totalPie) * 100 : 0;

  // CSV download
  const handleDownloadCSV = () => {
    const headers = ['productName', 'productPrice', 'productImage', 'orderType', 'franchiseName', 'totalQuantity', 'totalSales', 'orderCount', 'saleDate'];
    const csv = toCSV(sortedSales, headers);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded shadow p-4 mt-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Total Product Sales</h2>
      {/* Total sum */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="text-lg font-semibold text-gray-700">Total Sales Amount</div>
          <div className="text-3xl font-bold text-green-600">₹{totalSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium">Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">End Date</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Franchise</label>
            <select value={franchiseFilter} onChange={e => setFranchiseFilter(e.target.value)} className="border rounded px-2 py-1">
              <option value="">All Franchises</option>
              {franchises.map(franchise => (
                <option key={franchise._id} value={franchise.name}>
                  {franchise.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Order Type</label>
            <select value={orderTypeFilter} onChange={e => setOrderTypeFilter(e.target.value)} className="border rounded px-2 py-1">
              <option value="">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <button onClick={handleDownloadCSV} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Download CSV</button>
        </div>
      </div>
      {/* Online/Offline breakdown */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 items-center">
        <div className="flex gap-8">
          <div className="bg-blue-50 px-4 py-2 rounded text-blue-800 font-semibold">Online Sales: ₹{onlineSum.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({onlineCount})</div>
          <div className="bg-yellow-50 px-4 py-2 rounded text-yellow-800 font-semibold">Offline Sales: ₹{offlineSum.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({offlineCount})</div>
        </div>
        {/* Bar graph for online/offline split */}
        <div className="w-64 h-6 bg-gray-200 rounded overflow-hidden flex mt-4 sm:mt-0">
          <div
            className="bg-blue-500 h-full"
            style={{ width: `${onlinePercent}%` }}
            title={`Online: ₹${onlineSum.toLocaleString()}`}
          />
          <div
            className="bg-yellow-500 h-full"
            style={{ width: `${offlinePercent}%` }}
            title={`Offline: ₹${offlineSum.toLocaleString()}`}
          />
        </div>
        <div className="flex justify-between w-64 text-xs mt-1">
          <span className="text-blue-700">Online</span>
          <span className="text-yellow-700">Offline</span>
        </div>
      </div>

      {/* Franchise/Direct breakdown */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6 items-center">
        <div className="flex gap-8">
          <div className="bg-purple-50 px-4 py-2 rounded text-purple-800 font-semibold">Franchise Sales: ₹{franchiseSum.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({franchiseCount})</div>
          <div className="bg-gray-50 px-4 py-2 rounded text-gray-800 font-semibold">Direct Sales: ₹{directSum.toLocaleString(undefined, { minimumFractionDigits: 2 })} ({directCount})</div>
        </div>
        {/* Bar graph for franchise/direct split */}
        <div className="w-64 h-6 bg-gray-200 rounded overflow-hidden flex mt-4 sm:mt-0">
          <div
            className="bg-purple-500 h-full"
            style={{ width: `${totalPie ? (franchiseSum / totalPie) * 100 : 0}%` }}
            title={`Franchise: ₹${franchiseSum.toLocaleString()}`}
          />
          <div
            className="bg-gray-500 h-full"
            style={{ width: `${totalPie ? (directSum / totalPie) * 100 : 0}%` }}
            title={`Direct: ₹${directSum.toLocaleString()}`}
          />
        </div>
        <div className="flex justify-between w-64 text-xs mt-1">
          <span className="text-purple-700">Franchise</span>
          <span className="text-gray-700">Direct</span>
        </div>
      </div>
      {/* Sorting */}
      <div className="mb-2 flex gap-4 items-center">
        <label className="font-medium">Sort by:</label>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded px-2 py-1">
          <option value="date">Date</option>
          <option value="amount">Amount</option>
          <option value="mode">Mode</option>
          <option value="franchise">Franchise</option>
        </select>
        <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="px-2 py-1 border rounded bg-gray-100">{sortDir === 'asc' ? '↑' : '↓'}</button>
      </div>
      {/* Table */}
      {isLoading && <div>Loading total sales...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!isLoading && !error && (
        sortedSales.length === 0 ? (
          <div>No sales data found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left">Product Name</th>
                  <th className="px-2 py-1 text-left">Product Price</th>
                  <th className="px-2 py-1 text-left">Product Image</th>
                  <th className="px-2 py-1 text-left">Order Type</th>
                  <th className="px-2 py-1 text-left">Franchise</th>
                  <th className="px-2 py-1 text-left">Total Quantity Sold</th>
                  <th className="px-2 py-1 text-left">Total Sales Amount</th>
                  <th className="px-2 py-1 text-left">Order Count</th>
                  <th className="px-2 py-1 text-left">Sale Date</th>
                </tr>
              </thead>
              <tbody>
                {sortedSales.map((s: any, idx: number) => (
                  <tr key={s.productId || s.productName || idx}>
                    <td className="px-2 py-1">{s.productName}</td>
                    <td className="px-2 py-1">₹{s.productPrice}</td>
                    <td className="px-2 py-1">{s.productImage ? <img src={s.productImage} alt={s.productName} className="h-8 w-8 object-cover rounded" /> : '-'}</td>
                    <td className="px-2 py-1 capitalize">{s.orderType}</td>
                    <td className="px-2 py-1">
                      {s.franchiseName ? (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {s.franchiseName}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-xs">Direct</span>
                      )}
                    </td>
                    <td className="px-2 py-1">{s.totalQuantity}</td>
                    <td className="px-2 py-1">₹{s.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-2 py-1">{s.orderCount || 1}</td>
                    <td className="px-2 py-1">{formatDate(s.saleDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminTotalSalesPage; 