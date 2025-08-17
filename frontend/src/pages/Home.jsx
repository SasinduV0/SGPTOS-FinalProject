import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

// Shared data context - in a real app, this would be from a state management solution
const useSharedDefectData = () => {
  // This mirrors the data structure from DefectRate.jsx
  const [productCounts] = useState({
    'A': 1000,
    'B': 800,
    'C': 1200
  });

  const [defectData] = useState([
    { id: 1, defectType: 'Stitching errors', defectCount: 10, product: 'A' },
    { id: 2, defectType: 'Fabric damage', defectCount: 5, product: 'A' },
    { id: 3, defectType: 'Color mismatches', defectCount: 6, product: 'B' },
    { id: 4, defectType: 'Misaligned stickers', defectCount: 3, product: 'B' },
    { id: 5, defectType: 'Finishing defects', defectCount: 2, product: 'C' },
    { id: 6, defectType: 'Others', defectCount: 8, product: 'C' }
  ]);

  // Calculate defect rate
  const calculateDefectRate = (defectCount, productCount) => {
    if (productCount === 0 || !productCount) return 0;
    return parseFloat(((defectCount / productCount) * 100).toFixed(2));
  };

  // Get total product count
  const getTotalProductCount = () => {
    return Object.values(productCounts).reduce((sum, count) => sum + count, 0);
  };

  // Aggregate defects by type across all products
  const getAggregatedDefectData = () => {
    const aggregated = {};
    
    defectData.forEach(item => {
      if (aggregated[item.defectType]) {
        aggregated[item.defectType].count += item.defectCount;
      } else {
        aggregated[item.defectType] = {
          type: item.defectType,
          count: item.defectCount,
          color: getDefectColor(item.defectType)
        };
      }
    });

    // Calculate rates for aggregated data
    const totalProducts = getTotalProductCount();
    return Object.values(aggregated).map(item => ({
      ...item,
      rate: calculateDefectRate(item.count, totalProducts)
    }));
  };

  // Generate time series data based on current defects
  const getTimeSeriesData = () => {
    const aggregatedData = getAggregatedDefectData();
    const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00'];
    
    return times.map((time, index) => {
      const multiplier = (index + 1) / 6; // Progressive increase throughout the day
      const dataPoint = { time };
      
      aggregatedData.forEach(defect => {
        const key = defect.type.toLowerCase().replace(/\s+/g, '').replace('errors', '').replace('defects', '');
        dataPoint[key] = Math.round(defect.count * multiplier);
      });
      
      return dataPoint;
    });
  };

  return {
    productCounts,
    defectData,
    getAggregatedDefectData,
    getTimeSeriesData,
    getTotalProductCount,
    calculateDefectRate
  };
};

// Helper function to get consistent colors for defect types
const getDefectColor = (defectType) => {
  const colorMap = {
    'Stitching errors': '#EF4444',
    'Fabric damage': '#F97316', 
    'Color mismatches': '#06B6D4',
    'Misaligned stickers': '#3B82F6',
    'Finishing defects': '#8B5CF6',
    'Others': '#10B981'
  };
  return colorMap[defectType] || '#6B7280';
};

const QCDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Use shared data
  const { 
    getAggregatedDefectData, 
    getTotalProductCount 
  } = useSharedDefectData();

  // Get processed data
  const defectData = getAggregatedDefectData();
  const totalProductCount = getTotalProductCount();

  const totalDefects = defectData.reduce((sum, item) => sum + item.count, 0);
  const overallDefectRate = totalProductCount > 0 ? ((totalDefects / totalProductCount) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-blue-600">{totalProductCount.toLocaleString()}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Defects</p>
                  <p className="text-2xl font-bold text-red-600">{totalDefects}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Defect Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{overallDefectRate}%</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-full">
                  <div className="w-6 h-6 bg-orange-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Defect Types</p>
                  <p className="text-2xl font-bold text-green-600">{defectData.length}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Defects Table */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg lg:text-xl font-semibold text-gray-800">Daily Defect Summary</h3>
                  <div className="text-sm text-gray-600">
                    All Products Combined
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Defect Type</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Defect Count</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Defect Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defectData
                        .sort((a, b) => b.rate - a.rate) // Sort by highest rate first
                        .map((defect, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-2">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 lg:w-5 lg:h-5 rounded-full mr-2 lg:mr-3 flex-shrink-0"
                                style={{ backgroundColor: defect.color }}
                              ></div>
                              <span className="text-gray-800 text-sm lg:text-base">{defect.type}</span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2 font-semibold text-gray-900 text-sm lg:text-base">{defect.count}</td>
                          <td className="text-center py-4 px-2 font-semibold text-gray-900 text-sm lg:text-base">{defect.rate.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Alert Card */}
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-lg p-4 lg:p-6 text-white">
              <div className="flex flex-col items-center justify-center mb-4">
                <div className="bg-white bg-opacity-20 rounded-full p-3 mb-4">
                  <div className="relative">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-8 border-white border-opacity-30 flex items-center justify-center">
                      <div 
                        className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-8 border-orange-500 border-t-transparent animate-spin-slow"
                        style={{
                          background: `conic-gradient(#f97316 0% ${overallDefectRate}%, transparent ${overallDefectRate}% 100%)`
                        }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs lg:text-sm font-bold">{overallDefectRate}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl lg:text-2xl font-bold">Defects</div>
                  <div className="text-blue-300 text-2xl lg:text-3xl font-bold">{totalDefects} Pcs</div>
                </div>
              </div>
              <div className="text-xs lg:text-sm text-gray-300 text-center">
                {parseFloat(overallDefectRate) > 2 ? 
                  "Defect rate is higher than target (2%)" : 
                  "Defect rate is within acceptable range"
                }
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-4 lg:mt-6">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Defects Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={defectData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="count"
                    label={({ type, rate }) => `${type.split(' ')[0]}: ${rate.toFixed(1)}%`}
                    labelLine={false}
                  >
                    {defectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} defects (${props.payload.rate.toFixed(2)}%)`,
                      'Count'
                    ]}
                    labelFormatter={(label) => `Defect Type: ${label}`}
                    contentStyle={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Breakdown */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Product-wise Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['A', 'B', 'C'].map(product => {
                  const productDefects = defectData.filter(d => 
                    // This would need actual product mapping in real implementation
                    (product === 'A' && ['Stitching errors', 'Fabric damage'].includes(d.type)) ||
                    (product === 'B' && ['Color mismatches', 'Misaligned stickers'].includes(d.type)) ||
                    (product === 'C' && ['Finishing defects', 'Others'].includes(d.type))
                  );
                  
                  const productDefectCount = productDefects.reduce((sum, d) => sum + d.count, 0);
                  const productCount = product === 'A' ? 1000 : product === 'B' ? 800 : 1200;
                  const productDefectRate = ((productDefectCount / productCount) * 100).toFixed(2);
                  
                  return (
                    <div key={product} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="text-center">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Product {product}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Units Produced</div>
                            <div className="text-xl font-bold text-blue-600">{productCount}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Defects</div>
                            <div className="text-xl font-bold text-red-600">{productDefectCount}</div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="text-gray-600 text-sm">Defect Rate</div>
                          <div className="text-2xl font-bold text-orange-600">{productDefectRate}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QCDashboard;