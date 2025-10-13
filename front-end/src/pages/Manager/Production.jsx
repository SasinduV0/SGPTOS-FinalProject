import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Clock, Target, Plus, Edit, Trash2, Calendar } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';
import TotalProduction from '../../components/Manager/TotalProduction';
import EfficiencyRate from '../../components/Manager/EfficiencyRate';
import ActiveWorkers from '../../components/Manager/ActiveWorkers';
import LinePerformanceTable from '../../components/Manager/LinePerformanceTable';
import RemainingTarget from '../../components/Manager/RemainingTarget';
import LineProductivityChart from '../../components/Manager/LineProductivityChart';
import DailyTotalBarChart from '../../components/Manager/DailyTotalBarChart';
import ProductionPlanTable from '../../components/Manager/ProductionPlanTable';

const API_URL = "http://localhost:8001/api/production"; // Your backend endpoint

const Production = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');
  const [showAddForm, setShowAddForm] = useState(false);
  const [productionPlans, setProductionPlans] = useState([]);
  const [newPlan, setNewPlan] = useState({
    product: '',
    totalStock: '',
    startDate: '',
    endDate: ''
  });

  // Load production plans from backend
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(API_URL);
      setProductionPlans(response.data);
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // Calculate targets
  const calculateTargets = (totalStock, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const remainingDays = Math.max(0, Math.ceil((end - today) / (1000 * 60 * 60 * 24)) + 1);
    const dailyTarget = remainingDays > 0 ? totalStock / remainingDays : 0;
    const weeklyTarget = dailyTarget * 7;
    return {
      dailyTarget: Math.round(dailyTarget * 10) / 10,
      weeklyTarget: Math.round(weeklyTarget),
      remainingDays,
      totalDays
    };
  };

  // Add new plan
  const handleAddPlan = async () => {
    if (!newPlan.product || !newPlan.totalStock || !newPlan.startDate || !newPlan.endDate) {
      alert('Please fill all fields');
      return;
    }

    const targets = calculateTargets(parseInt(newPlan.totalStock), newPlan.startDate, newPlan.endDate);

    const planToAdd = {
      ...newPlan,
      totalStock: parseInt(newPlan.totalStock),
      finishedUnits: 0,
      remainingUnits: parseInt(newPlan.totalStock),
      ...targets
    };

    try {
      const response = await axios.post(API_URL, planToAdd);
      setProductionPlans(prev => [...prev, response.data]);
      setShowAddForm(false);
      setNewPlan({ product: '', totalStock: '', startDate: '', endDate: '' });
    } catch (err) {
      console.error("Error adding plan:", err);
    }
  };

  // Delete plan
  const deletePlan = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProductionPlans(prev => prev.filter(plan => plan._id !== id));
    } catch (err) {
      console.error("Error deleting plan:", err);
    }
  };

  // Helpers
  const getStatusColor = (remainingDays) => {
    if (remainingDays <= 5) return 'bg-red-100 text-red-800';
    if (remainingDays <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getColorByEfficiency = (efficiency) => {
    if (efficiency >= 100) return 'text-green-600 bg-green-50';
    if (efficiency >= 90) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Sample metrics & charts
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

  return (
    <div className="space-y-6 ml-70 mt-25 mr-5">
      <SideBar title ="Manager Panel" links={ManagerLinks}/>
      {/* Header with Time Range Selector */}
      

    <div className='flex gap-5'>
        <TotalProduction/>
        <EfficiencyRate/>
        <RemainingTarget/>
        <ActiveWorkers/>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10 mb-10">
        <LineProductivityChart/>
        <DailyTotalBarChart/>
      </div>

      {/* Line Performance Table */}
      <LinePerformanceTable/>

    
    </div>
  );
};

export default Production;