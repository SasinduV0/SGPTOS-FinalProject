import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
import { getEfficiencyColor, getEfficiencyTextColor, getAlertStyle } from '../../utils/helpers';
import SideBar from '../../components/SideBar';
import { SupervisorLinks } from '../Data/SidebarNavlinks';
import TotalProduction from '../../components/Manager/TotalProduction';
import EfficiencyRate from '../../components/Manager/EfficiencyRate';
import ActiveWorkers from '../../components/Manager/ActiveWorkers';
import RemainingTarget from '../../components/Manager/RemainingTarget';
import ProductionLineStatus from '../../components/Supervisor/ProductionLineStatus';
import TopPerformers from '../../components/Supervisor/TopPerformers';
import ProductivityIncrease from '../../components/Manager/ProductivityIncrease';
import LineProductivityChart from '../../components/Manager/LineProductivityChart';
import DailyEmployeesList from '../../components/Supervisor/DailyEmployeesList';
import ProductionTargets from '../../components/Supervisor/ProductionTargets';


const HomePage = ({ dashboardData }) => {
  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
    <div className="space-y-6 ml-70 mr-5 w-full pt-25 px-4 max-w-screen-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">

        {/* Today's Overview Stats */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Today's Overview</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
              All Systems Active
            </span>
          </div>

          <div className="flex flex-col gap-4 items-center">
            <TotalProduction/>
            <EfficiencyRate/>
            <ActiveWorkers/>
            <RemainingTarget/>
          </div>
        </div>

        {/* Production Lines Status */}
        <ProductionLineStatus/>
        

        {/* Alerts & Notifications */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Alerts & Notifications</h3>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full uppercase">
              3 Alerts
            </span>
          </div>
          <div className="space-y-3">
            {dashboardData.alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${getAlertStyle(alert.type)}`}>
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Performance Chart Placeholder */}
        <div className='mb-10 mt-5'>
            <LineProductivityChart/>
        </div>
        

        {/* Top Performers */}
        <div className='mb-10 mt-5'>
            <TopPerformers/>
        </div>
        
      </div>
      </div>
    </div>
  );
};

export default HomePage;