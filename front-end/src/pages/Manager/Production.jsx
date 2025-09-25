import React, { useState } from 'react';
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
      

    <div className='flex gap-5'>
        <TotalProduction/>
        <EfficiencyRate/>
        <RemainingTarget/>
        <ActiveWorkers/>
    </div>    
      

      {/* Production Planning Table */}
      <ProductionPlanTable/>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10 mb-10">
        <LineProductivityChart/>
        <DailyTotalBarChart/>
      </div>

      {/* Line Performance Table */}
      <LinePerformanceTable/>

      
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