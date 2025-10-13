import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { QCManagerLinks } from '../../pages/Data/SidebarNavlinks';
import DefectRateChart from '../../components/live-dashboard/DefectRateChart';
import DefectRateQC from '../../components/QC/DefectRateQC';

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

function QualityControl() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Local state for defect data
  const productCounts = {
    'A': 1000,
    'B': 800,
    'C': 1200
  };

  const defectData = [
    { id: 1, defectType: 'Stitching errors', defectCount: 10, product: 'A', line: 'Line 1', unit: 'Unit 1' },
    { id: 2, defectType: 'Fabric damage', defectCount: 5, product: 'A', line: 'Line 2', unit: 'Unit 1' },
    { id: 3, defectType: 'Color mismatches', defectCount: 6, product: 'B', line: 'Line 1', unit: 'Unit 2' },
    { id: 4, defectType: 'Misaligned stickers', defectCount: 3, product: 'B', line: 'Line 3', unit: 'Unit 2' },
    { id: 5, defectType: 'Finishing defects', defectCount: 2, product: 'C', line: 'Line 2', unit: 'Unit 3' },
    { id: 6, defectType: 'Others', defectCount: 8, product: 'C', line: 'Line 1', unit: 'Unit 3' }
  ];

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

  // Get processed data
  const aggregatedDefectData = getAggregatedDefectData();
  const totalProductCount = getTotalProductCount();

  const totalDefects = aggregatedDefectData.reduce((sum, item) => sum + item.count, 0);
  const overallDefectRate = totalProductCount > 0 ? ((totalDefects / totalProductCount) * 100).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex ml-70 mt-20">
      {/* Sidebar Component */}
      <SideBar title="QC Panel" links={QCManagerLinks} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Dashboard Content */}
        <div className="p-4 lg:p-6">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justif y-between">
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
                  <p className="text-2xl font-bold text-green-600">{aggregatedDefectData.length}</p>
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
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Unit</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Line</th>
                        <th className="text-left py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Defect Type</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Defect Count</th>
                        <th className="text-center py-3 px-2 font-semibold text-gray-700 text-sm lg:text-base">Defect Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defectData
                        .sort((a, b) => calculateDefectRate(b.defectCount, productCounts[b.product]) - calculateDefectRate(a.defectCount, productCounts[a.product]))
                        .map((defect) => (
                        <tr key={defect.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-2 text-gray-800 text-sm lg:text-base font-medium">{defect.unit}</td>
                          <td className="py-4 px-2 text-gray-800 text-sm lg:text-base font-medium">{defect.line}</td>
                          <td className="py-4 px-2">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 lg:w-5 lg:h-5 rounded-full mr-2 lg:mr-3 flex-shrink-0"
                                style={{ backgroundColor: getDefectColor(defect.defectType) }}
                              ></div>
                              <span className="text-gray-800 text-sm lg:text-base">{defect.defectType}</span>
                            </div>
                          </td>
                          <td className="text-center py-4 px-2 font-semibold text-gray-900 text-sm lg:text-base">{defect.defectCount}</td>
                          <td className="text-center py-4 px-2 font-semibold text-gray-900 text-sm lg:text-base">
                            {calculateDefectRate(defect.defectCount, productCounts[defect.product]).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Product Quality Distribution */}
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Product Quality Distribution</h3>
              <div className='-ml-5'>
                <DefectRateQC/>
              </div>
              
              
              {/* <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Good Products', value: totalProductCount - totalDefects, color: '#3B82F6' },
                      { name: 'Defected Products', value: totalDefects, color: '#EF4444' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value.toLocaleString()} products`,
                      name
                    ]}
                    contentStyle={{
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer> */}
              {/* <div className="mt-4 text-center">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Good: {(totalProductCount - totalDefects).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Defected: {totalDefects}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">Total Defects</div>
                <div className="text-2xl font-bold text-red-600">{totalDefects} Pcs</div>
                <div className="text-xs text-gray-500 mt-1">
                  {parseFloat(overallDefectRate) > 2 ? 
                    "Defect rate is higher than target (2%)" : 
                    "Defect rate is within acceptable range"
                  }
                </div>
              </div> */}
            </div>
          </div>

          {/* Product Breakdown */}
          <div className="mt-6">
            <div className="bg-white rounded-lg shadow-lg p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-800 mb-4">Product-wise Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['A', 'B', 'C'].map(product => {
                  const productDefects = defectData.filter(d => d.product === product);
                  
                  const productDefectCount = productDefects.reduce((sum, d) => sum + d.defectCount, 0);
                  const productCount = productCounts[product];
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
}

export default QualityControl;