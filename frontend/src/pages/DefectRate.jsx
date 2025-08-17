import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit3, Save, X, Plus, Trash2 } from 'lucide-react';
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { useDefectData } from '../context/DefectDataContext';

const DefectRatePage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('05/08/2025');
  const [editingRow, setEditingRow] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [editData, setEditData] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDefect, setNewDefect] = useState({ defectType: '', defectCount: '' });

  // Use the shared context
  const {
    productCounts,
    products,
    defectData,
    getCurrentProductCount,
    addProduct,
    updateProductCount,
    addDefect,
    updateDefect,
    deleteDefect,
    calculateDefectRate
  } = useDefectData();

  // Add new product
  const handleAddProduct = () => {
    if (addProduct(newProductName)) {
      setNewProductName('');
      setShowAddProduct(false);
    }
  };

  // Handle edit defect
  const handleEdit = (id) => {
    const item = defectData.find(d => d.id === id);
    setEditData({ ...item });
    setEditingRow(id);
  };

  const handleSave = (id) => {
    updateDefect(id, editData);
    setEditingRow(null);
    setEditData({});
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditData({});
  };

  const handleDelete = (id) => {
    deleteDefect(id);
  };

  const handleAddDefect = () => {
    if (newDefect.defectType && newDefect.defectCount) {
      addDefect({
        defectType: newDefect.defectType,
        defectCount: newDefect.defectCount,
        products: selectedProduct === 'ALL' ? ['A', 'B', 'C'] : [selectedProduct]
      });
      setNewDefect({ defectType: '', defectCount: '' });
      setShowAddForm(false);
    }
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
  
  const chartData = filteredDefects.map(item => ({
    name: item.defectType.length > 15 ? item.defectType.substring(0, 15) + '...' : item.defectType,
    defects: item.defectCount,
    rate: calculateDefectRate(item.defectCount, currentProductCount)
  })).sort((a, b) => b.rate - a.rate);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Component */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* Header Controls */}
        <div className="bg-white shadow-sm border-b p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Defect Rate Management</h1>
            
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
                  <button
                    onClick={() => setShowAddProduct(true)}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    title="Add Product"
                  >
                    <Plus size={16} />
                  </button>
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
                    onChange={(e) => updateProductCount(selectedProduct, e.target.value)}
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

            {/* Add Product Form */}
            {showAddProduct && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex gap-4 items-end">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">New Product Name</label>
                    <input
                      type="text"
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <button
                    onClick={handleAddProduct}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProduct(false);
                      setNewProductName('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

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
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Table Section */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Defect Details</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing data for: {selectedProduct} 
                      {selectedProduct !== 'ALL' && ` (${currentProductCount} units)`}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Add Defect
                  </button>
                </div>
              </div>

              {/* Add Form */}
              {showAddForm && (
                <div className="p-4 bg-gray-50 border-b">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Defect Type"
                      value={newDefect.defectType}
                      onChange={(e) => setNewDefect(prev => ({ ...prev, defectType: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Defect Count"
                      value={newDefect.defectCount}
                      onChange={(e) => setNewDefect(prev => ({ ...prev, defectCount: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">
                      Defect Rate: {newDefect.defectCount ? 
                        calculateDefectRate(parseInt(newDefect.defectCount || 0), currentProductCount).toFixed(2) + '%' : 
                        '0.00%'
                      }
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddDefect}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewDefect({ defectType: '', defectCount: '' });
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
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
                        Defect Rate %
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDefects.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRow === item.id ? (
                            <input
                              type="text"
                              value={editData.defectType}
                              onChange={(e) => setEditData(prev => ({ ...prev, defectType: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item.defectType}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRow === item.id ? (
                            <input
                              type="number"
                              value={editData.defectCount}
                              onChange={(e) => setEditData(prev => ({ ...prev, defectCount: parseInt(e.target.value) || 0 }))}
                              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{item.defectCount}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {calculateDefectRate(
                              editingRow === item.id ? editData.defectCount : item.defectCount, 
                              currentProductCount
                            ).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingRow === item.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSave(item.id)}
                                className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                              >
                                <Edit3 size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
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

export default DefectRatePage;