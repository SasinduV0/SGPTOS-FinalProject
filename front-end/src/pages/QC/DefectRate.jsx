import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SideBar from '../../components/SideBar';
import { QCManagerLinks } from '../../pages/Data/SidebarNavlinks';

const DefectRate = () => {
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('05/08/2025');

  // Local state for defect data management
  const [productCounts, setProductCounts] = useState({
    'A': 1000,
    'B': 800,
    'C': 1200
  });

  const [products] = useState(['ALL', 'A', 'B', 'C']);

  const [defectData] = useState([
    { id: 1, defectType: 'Stitching errors', defectCount: 10, unit: 'Unit 1', line: 'Line A1', products: ['A'] },
    { id: 2, defectType: 'Fabric damage', defectCount: 5, unit: 'Unit 2', line: 'Line A2', products: ['A'] },
    { id: 3, defectType: 'Color mismatches', defectCount: 6, unit: 'Unit 1', line: 'Line B1', products: ['B'] },
    { id: 4, defectType: 'Misaligned stickers', defectCount: 3, unit: 'Unit 3', line: 'Line B2', products: ['B'] },
    { id: 5, defectType: 'Finishing defects', defectCount: 2, unit: 'Unit 2', line: 'Line C1', products: ['C'] },
    { id: 6, defectType: 'Others', defectCount: 8, unit: 'Unit 1', line: 'Line C2', products: ['C'] }
  ]);

  // Helper functions
  const getCurrentProductCount = (product) => {
    if (product === 'ALL') {
      return Object.values(productCounts).reduce((sum, count) => sum + count, 0);
    }
    return productCounts[product] || 0;
  };

  // Filter defects based on selected product
  const getFilteredDefects = () => {
    if (selectedProduct === 'ALL') {
      return defectData;
    }
    return defectData.filter(item =>
      item.products && item.products.includes(selectedProduct)
    );
  };

  // Calculate chart data with defect rates
  const currentProductCount = getCurrentProductCount(selectedProduct);
  const filteredDefects = getFilteredDefects();

  const calculateDefectRate = (defectCount, productCount) => {
    if (productCount === 0 || !productCount) return 0;
    return (defectCount / productCount) * 100;
  };

  const chartData = filteredDefects.map(item => ({
    name: item.defectType.length > 15 ? item.defectType.substring(0, 15) + '...' : item.defectType,
    defects: item.defectCount,
    rate: calculateDefectRate(item.defectCount, currentProductCount)
  })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="ml-70 mt-20 min-h-screen bg-gray-50">
      <SideBar title="QC Panel" links={QCManagerLinks} />

      <div className="p-4 lg:p-6">
        {/* Header Controls */}
        <div className="bg-white shadow-sm border rounded-lg p-6 mb-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">QC Defect Rate Dashboard</h1>

            <div className="flex gap-6 items-end flex-wrap">
              {/* Product Selector */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <div className="flex gap-2">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-32"
                  >
                    {products.map(product => (
                      <option key={product} value={product}>{product}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Count Input (only show for specific products, not ALL) */}
              {selectedProduct !== 'ALL' && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">
                    Product Count for {selectedProduct}
                  </label>
                  <input
                    type="number"
                    value={productCounts[selectedProduct] || 0}
                    onChange={(e) => setProductCounts(prev => ({ ...prev, [selectedProduct]: parseInt(e.target.value) || 0 }))}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-40"
                    placeholder="Enter product count"
                  />
                </div>
              )}

              {/* Show total when ALL is selected */}
              {selectedProduct === 'ALL' && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Total Product Count</label>
                  <div className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md min-w-40 text-gray-700">
                    {currentProductCount}
                  </div>
                </div>
              )}

              {/* Date Selector */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate.split('/').reverse().join('-')}
                  onChange={(e) => {
                    const date = new Date(e.target.value);
                    const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                    setSelectedDate(formattedDate);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Product Counts Overview */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Object.entries(productCounts).map(([product, count]) => (
                <div key={product} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="text-sm font-medium text-blue-800">Product {product}</div>
                  <div className="text-lg font-bold text-blue-900">{count} units</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">QC Defect Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing data for: {selectedProduct}
                      {selectedProduct !== 'ALL' && ` (${currentProductCount} units)`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Table without Actions column, auto-expand to fit all data */}
              <div>
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defect Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defect Count
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Line
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Defect Rate %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDefects.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.defectType}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.defectCount}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.unit}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{item.line}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {calculateDefectRate(item.defectCount, currentProductCount).toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Defect Rate Analysis</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Based on {selectedProduct} product count: {currentProductCount.toLocaleString()} units
                </p>
              </div>
              <div className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [
                        name === 'rate' ? `${value}%` : value,
                        name === 'rate' ? 'Defect Rate' : 'Defect Count'
                      ]}
                      labelFormatter={(label) => `Defect Type: ${label}`}
                    />
                    <Bar
                      dataKey="rate"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Total Defects</div>
              <div className="text-2xl font-bold text-gray-900 mt-2">
                {filteredDefects.reduce((sum, item) => sum + item.defectCount, 0)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Product Count</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">
                {currentProductCount.toLocaleString()}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Overall Defect Rate</div>
              <div className="text-2xl font-bold text-red-600 mt-2">
                {calculateDefectRate(
                  filteredDefects.reduce((sum, item) => sum + item.defectCount, 0),
                  currentProductCount
                ).toFixed(2)}%
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Highest Rate</div>
              <div className="text-2xl font-bold text-orange-600 mt-2">
                {chartData.length > 0 ? Math.max(...chartData.map(item => item.rate)).toFixed(2) : '0.00'}%
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="text-sm font-medium text-gray-500">Defect Types</div>
              <div className="text-2xl font-bold text-green-600 mt-2">
                {filteredDefects.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectRate;