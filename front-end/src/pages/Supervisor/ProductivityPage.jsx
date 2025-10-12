import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

import SideBar from '../../components/SideBar';
import { SupervisorLinks } from '../Data/SidebarNavlinks';
import LineWiseProductivity from '../../components/Manager/LineWiseProductivity';
import DailyTotalBarChart from '../../components/Manager/DailyTotalBarChart';
import DailyEmployeesList from '../../components/Supervisor/DailyEmployeesList';
import ProductionTargets from '../../components/Supervisor/ProductionTargets';


const ProductivityPage = ({ dashboardData }) => {
  //Select line 
  const [selectedLine, setSelectedLine] = useState('all');
  const lineOptions = dashboardData.lines.map(line => line.name);
  const getWorkerLine = (worker) => {
    const foundLine = dashboardData.lines.find(line =>
      line.workerDetails && line.workerDetails.some(w => w.id === worker.id)
    );
    return foundLine ? foundLine.name : '-';
  };
  
  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
  <div className="space-y-6 ml-64 w-full mt-16">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Productivity Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          {/* Line Performance Chart */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Line Performance Comparison</h3> */}
            <div className="">
              <LineWiseProductivity/>
            </div>
          </div>

          {/* Daily Production Trends */}
          <div className="">
            <div className="">
              <DailyTotalBarChart/>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Worker Performance Table */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Worker Performance</h3> */}
              <DailyEmployeesList/>
          </div>

          {/* Production Targets */}
          <div className="">
            {/* <h3 className="text-xl font-bold text-gray-800 mb-4">Production Targets vs Actual</h3> */}
            <div className="space-y-4">
              <ProductionTargets/>
              
              
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductivityPage;