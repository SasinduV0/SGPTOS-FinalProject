import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SideBar from '../../components/SideBar';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';
import LineWiseProductivity from '../../components/Manager/LineWiseProductivity';
import OverallTargetChart from '../../components/Charts/Live-Dashboard/OverallTargetChart';
import RemainingTime from '../../components/live-dashboard/RemainingTime';
import DashboardSummary from '../../components/Manager/DashboardSummary';
import ProductivityIncrease from '../../components/Manager/ProductivityIncrease';

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


  // Sample data for charts
  const productivityData = [
    { name: 'Completed', value: 12.5, color: '#ef4444' },
    { name: 'Remaining', value: 87.5, color: '#e5e7eb' }
  ];

  const targetData = [
    { name: 'Achieved', value: 68.04, color: '#3b82f6' },
    { name: 'Remaining', value: 31.96, color: '#fecaca' }
  ];

  // const lineWiseData = [
  //   { line: 'Line 1', target: 85, actual: 78 },
  //   { line: 'Line 2', target: 90, actual: 95 },
  //   { line: 'Line 3', target: 80, actual: 72 },
  //   { line: 'Line 4', target: 95, actual: 88 },
  //   { line: 'Line 5', target: 85, actual: 90 },
  //   { line: 'Line 6', target: 75, actual: 65 },
  //   { line: 'Line 7', target: 88, actual: 82 },
  //   { line: 'Line 8', target: 92, actual: 96 }
  // ];

  const productionData = [
    { brand: 'Brand 5', finished: 25, remaining: 46, dueDate: '5/02/2025', remainingDays: 5 },
    { brand: 'Brand 2', finished: 30, remaining: 56, dueDate: '5/02/2025', remainingDays: 7 },
    { brand: 'Brand 1', finished: 25, remaining: 33, dueDate: '5/02/2025', remainingDays: 12 },
    { brand: 'Brand 6', finished: 16, remaining: 55, dueDate: '5/02/2025', remainingDays: 16 },
    { brand: 'Brand 3', finished: 11, remaining: 61, dueDate: '5/02/2025', remainingDays: 25 },
    { brand: 'Brand 4', finished: 10, remaining: 60, dueDate: '5/02/2025', remainingDays: 30 }
  ];

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
        <div className="space-y-4">

        <DashboardSummary />


          {/* <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Defect Rate</div>
            <div className="text-xl font-bold text-red-500">21.37%</div>
          </div>


          
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Traget units</div>
            <div className="text-xl font-bold">200</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Completed units</div>
            <div className="text-xl font-bold">130</div>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">Units Remaining</div>
            <div className="text-xl font-bold">70</div>
          </div> */}
        </div>
      </div>
       

      {/* Productivity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
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
          <OverallTargetChart lineTargets={lineTargets} />
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


      {/* <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Line wise Target</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={lineWiseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="line" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="target" fill="#93c5fd" name="Target" />
            <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      {/* Production Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Product</th>
                <th className="text-left p-2">Finished units</th>
                <th className="text-left p-2">Remaining units</th>
                <th className="text-left p-2">Due Date</th>
                <th className="text-left p-2">Remaining Days</th>
              </tr>
            </thead>
            <tbody>
              {productionData.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2 flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                    {item.brand}
                  </td>
                  <td className="p-2">{item.finished}</td>
                  <td className="p-2">{item.remaining}</td>
                  <td className="p-2">{item.dueDate}</td>
                  <td className="p-2">{item.remainingDays}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    
     
              
      

    </div>
    </>
  );
};

export default ManagerHome;