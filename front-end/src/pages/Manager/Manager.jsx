import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SideBar from '../../components/SideBar';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';
import LineWiseProductivity from '../../components/Manager/LineWiseProductivity';
import OverallTargetChart from '../../components/Charts/Live-Dashboard/OverallTargetChart';
import RemainingTime from '../../components/live-dashboard/RemainingTime';
import DashboardSummary from '../../components/Manager/DashboardSummary';
import ProductivityIncrease from '../../components/Manager/ProductivityIncrease';
import LineTargetChart from '../../components/live-dashboard/LineTargetChart';
import LineProductivityChart from '../../components/Manager/LineProductivityChart';
import DailyTotalBarChart from '../../components/Manager/DailyTotalBarChart';
import ProductionLineStatus from '../../components/Supervisor/ProductionLineStatus';
import ProductionPlanTable from '../../components/Manager/ProductionPlanTable';
import ProductionSummaryTable from '../../components/Manager/ProductionSummaryTable';
import ProductionTargets from '../../components/Supervisor/ProductionTargets';
import OverallTargetChartsRFID from '../../components/Charts/Live-Dashboard/OverallTargetChartsRFID';

const ManagerHome = ({ lineData }) => {

  const lineTargets = {
  1: 1000,
  2: 800,
  3: 900,
  4: 1100,
  5: 950,
  6: 1050,
  7: 700,
  8: 850,
};


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="text-sm">{`${label}: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ml-70 mt-22 mr-5">
      <SideBar title ="Manager Panel" links={ManagerLinks}/>
      
      {/* Total Status Card */}
      <div className="bg-white rounded-lg shadow px-6">
        {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Total status</h3> */}
        <div className="space-y-3">

        <DashboardSummary />


        </div>
      </div>
       

      {/* Productivity Chart */}
      <div className="bg-white rounded-lg shadow p-3">
        {/* <h3 className="text-lg font-semibold text-gray-800 mb-4">Productivity increase</h3> */}
        <div className="flex items-center justify-center">

          <ProductivityIncrease/>
          {/* <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productivityData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={120}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {productivityData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer> */}
        </div>
        {/* <div className="text-center mt-2">
          <div className="text-lg font-bold">12.5%</div>
          <div className="text-sm text-red-500">15 Workers absent</div>
          <div className="text-sm text-gray-600">Shift ends at 14:30</div>
        </div> */}
      </div>

      
      
       {/* Overall Target */}
      <div className="bg-white rounded-lg shadow p-6 mt-2">
        <div className="flex items-center justify-center">
          {/* <OverallTargetChart lineTargets={lineTargets} /> */}

          <OverallTargetChartsRFID/>
        </div>
        <div className="text-center mt-2">
         <RemainingTime/>
        </div>
      </div>




      {/* <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Target</h3>
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={targetData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {targetData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="text-center mt-2">
          <div className="text-lg font-bold text-blue-600">68.04%</div>
          <div className="text-sm text-blue-600">347 Pcs</div>
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mt-2 inline-block">
            Time remaining 4hr 23min
          </div>
        </div>
      </div> */}

    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-70 mt-10 mb-10">

      {/* Line wise Target Chart */}

      <LineWiseProductivity/>


      {/* Production Table */}
      <div className="mr-5">
        <ProductionTargets/>
      </div>

   
     <LineProductivityChart/>
    <DailyTotalBarChart/>
     </div>

    <div className='ml-70 mr-5 mb-10'>
        <ProductionSummaryTable/>
    </div> 
    
      

    
    </>
  );
};

export default ManagerHome;