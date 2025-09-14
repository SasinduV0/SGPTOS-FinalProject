import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Clock, Target, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';
import TotalProduction from '../../components/Manager/TotalProduction';
import EfficiencyRate from '../../components/Manager/EfficiencyRate';
import ActiveWorkers from '../../components/Manager/ActiveWorkers';
import LinePerformanceTable from '../../components/Manager/LinePerformanceTable';


const Production = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [showAddForm, setShowAddForm] = useState(false);
  const [productionPlans, setProductionPlans] = useState([
    {
      id: 1,
      product: 'Brand 5',
      finishedUnits: 34,
      totalStock: 80,
      remainingUnits: 46,
      startDate: '2025-01-20',
      endDate: '2025-02-05',
      dailyTarget: 2.9,
      weeklyTarget: 20,
      remainingDays: 5
    },
    {
      id: 2,
      product: 'Brand 2',
      finishedUnits: 30,
      totalStock: 86,
      remainingUnits: 56,
      startDate: '2025-01-15',
      endDate: '2025-02-05',
      dailyTarget: 8.0,
      weeklyTarget: 56,
      remainingDays: 7
    },
    {
      id: 3,
      product: 'Brand 1',
      finishedUnits: 25,
      totalStock: 58,
      remainingUnits: 33,
      startDate: '2025-01-10',
      endDate: '2025-02-05',
      dailyTarget: 2.8,
      weeklyTarget: 19,
      remainingDays: 12
    },
    {
      id: 4,
      product: 'Brand 6',
      finishedUnits: 16,
      totalStock: 71,
      remainingUnits: 55,
      startDate: '2025-01-05',
      endDate: '2025-02-05',
      dailyTarget: 3.4,
      weeklyTarget: 24,
      remainingDays: 16
    },
    {
      id: 5,
      product: 'Brand 3',
      finishedUnits: 11,
      totalStock: 72,
      remainingUnits: 61,
      startDate: '2025-01-01',
      endDate: '2025-02-05',
      dailyTarget: 2.4,
      weeklyTarget: 17,
      remainingDays: 25
    },
    {
      id: 6,
      product: 'Brand 4',
      finishedUnits: 10,
      totalStock: 70,
      remainingUnits: 60,
      startDate: '2024-12-25',
      endDate: '2025-02-05',
      dailyTarget: 2.0,
      weeklyTarget: 14,
      remainingDays: 30
    }
  ]);

  const [newPlan, setNewPlan] = useState({
    product: '',
    totalStock: '',
    startDate: '',
    endDate: ''
  });

  // Sample production data
  const productionMetrics = [
    { title: 'Total Production', value: '1,247', change: '+12.5%', icon: Target, color: 'blue' },
    { title: 'Efficiency Rate', value: '87.3%', change: '+5.2%', icon: TrendingUp, color: 'green' },
    { title: 'Active Workers', value: '145', change: '-3', icon: Users, color: 'purple' },
    { title: 'Downtime', value: '2.1h', change: '-15min', icon: Clock, color: 'red' }
  ];

  const hourlyProductionData = [
    { hour: '08:00', target: 120, actual: 115 },
    { hour: '09:00', target: 120, actual: 125 },
    { hour: '10:00', target: 120, actual: 118 },
    { hour: '11:00', target: 120, actual: 132 },
    { hour: '12:00', target: 120, actual: 110 },
    { hour: '13:00', target: 120, actual: 105 },
    { hour: '14:00', target: 120, actual: 128 },
    { hour: '15:00', target: 120, actual: 135 }
  ];

  const lineProductionData = [
    { line: 'Line 1', target: 850, actual: 782, efficiency: 92 },
    { line: 'Line 2', target: 900, actual: 923, efficiency: 103 },
    { line: 'Line 3', target: 800, actual: 745, efficiency: 93 },
    { line: 'Line 4', target: 950, actual: 856, efficiency: 90 },
    { line: 'Line 5', target: 850, actual: 897, efficiency: 106 },
    { line: 'Line 6', target: 750, actual: 698, efficiency: 93 }
  ];

  const calculateTargets = (totalStock, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    
    // Calculate total days and remaining days
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const remainingDays = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)) + 1);
    
    // Calculate targets
    const dailyTarget = remainingDays > 0 ? totalStock / remainingDays : 0;
    const weeklyTarget = dailyTarget * 7;
    
    return {
      dailyTarget: Math.round(dailyTarget * 10) / 10,
      weeklyTarget: Math.round(weeklyTarget),
      remainingDays,
      totalDays
    };
  };

  const handleAddPlan = () => {
    if (!newPlan.product || !newPlan.totalStock || !newPlan.startDate || !newPlan.endDate) {
      alert('Please fill all fields');
      return;
    }

    const targets = calculateTargets(parseInt(newPlan.totalStock), newPlan.startDate, newPlan.endDate);
    
    const plan = {
      id: Date.now(),
      product: newPlan.product,
      finishedUnits: 0,
      totalStock: parseInt(newPlan.totalStock),
      remainingUnits: parseInt(newPlan.totalStock),
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      ...targets
    };

    setProductionPlans([...productionPlans, plan]);
    setNewPlan({ product: '', totalStock: '', startDate: '', endDate: '' });
    setShowAddForm(false);
  };

  const deletePlan = (id) => {
    setProductionPlans(productionPlans.filter(plan => plan.id !== id));
  };

  const getColorByEfficiency = (efficiency) => {
    if (efficiency >= 100) return 'text-green-600 bg-green-50';
    if (efficiency >= 90) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusColor = (remainingDays) => {
    if (remainingDays <= 5) return 'bg-red-100 text-red-800';
    if (remainingDays <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="space-y-6 ml-70 mt-25 mr-5">
      <SideBar title ="Manager Panel" links={ManagerLinks}/>
      {/* Header with Time Range Selector */}
      {/* <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Production Overview</h2>
        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Today">Today</option>
          <option value="This Week">This Week</option>
          <option value="This Month">This Month</option>
        </select>
      </div> */}

    <div className='flex gap-5'>
        <TotalProduction/>
        <EfficiencyRate/>
        <ActiveWorkers/>
    </div>    
      

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {productionMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className={`text-sm ${
                  metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Production Planning Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Production Planning</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Plan
          </button>
        </div>

        {/* Add New Plan Form */}
        {showAddForm && (
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={newPlan.product}
                  onChange={(e) => setNewPlan({...newPlan, product: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Stock</label>
                <input
                  type="number"
                  value={newPlan.totalStock}
                  onChange={(e) => setNewPlan({...newPlan, totalStock: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter total stock"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newPlan.startDate}
                  onChange={(e) => setNewPlan({...newPlan, startDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newPlan.endDate}
                  onChange={(e) => setNewPlan({...newPlan, endDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleAddPlan}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-1"
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Product</th>
                <th className="text-left p-4 font-medium text-gray-700">Total Units</th>
                <th className="text-left p-4 font-medium text-gray-700">Finished Units</th>
                <th className="text-left p-4 font-medium text-gray-700">Remaining Units</th>
                <th className="text-left p-4 font-medium text-gray-700">Due Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Remaining Days</th>
                <th className="text-left p-4 font-medium text-gray-700">Daily Target</th>
                <th className="text-left p-4 font-medium text-gray-700">Weekly Target</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productionPlans.map((plan) => (
                <tr key={plan.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {plan.product}
                  </td>
                  <td className="p-4 font-semibold text-gray-800">{plan.totalStock}</td>
                  <td className="p-4">{plan.finishedUnits}</td>
                  <td className="p-4">{plan.remainingUnits}</td>
                  <td className="p-4">{new Date(plan.endDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.remainingDays)}`}>
                      {plan.remainingDays} days
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-blue-600">{plan.dailyTarget}</td>
                  <td className="p-4 font-semibold text-green-600">{plan.weeklyTarget}</td>
                  <td className="p-4">
                    <button
                      onClick={() => deletePlan(plan.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Production Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Production</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyProductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="target" fill="#93c5fd" name="Target" />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Production Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Production Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyProductionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="target" stroke="#93c5fd" strokeWidth={2} name="Target" />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Performance Table */}
      <LinePerformanceTable/>

      {/* <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Line Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Production Line</th>
                <th className="text-left p-4 font-medium text-gray-700">Target</th>
                <th className="text-left p-4 font-medium text-gray-700">Actual</th>
                <th className="text-left p-4 font-medium text-gray-700">Efficiency</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {lineProductionData.map((line, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">{line.line}</td>
                  <td className="p-4">{line.target} pcs</td>
                  <td className="p-4">{line.actual} pcs</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getColorByEfficiency(line.efficiency)}`}>
                      {line.efficiency}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      line.efficiency >= 95 ? 'bg-green-100 text-green-800' :
                      line.efficiency >= 85 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {line.efficiency >= 95 ? 'Excellent' :
                       line.efficiency >= 85 ? 'Good' : 'Needs Attention'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quality Rate</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">96.2%</div>
            <div className="text-sm text-gray-600 mt-1">+2.1% from yesterday</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Defect Rate</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">3.8%</div>
            <div className="text-sm text-gray-600 mt-1">-0.5% from yesterday</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Rework Rate</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-600">2.1%</div>
            <div className="text-sm text-gray-600 mt-1">-0.3% from yesterday</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Production;