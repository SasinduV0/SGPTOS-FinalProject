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
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react';

const HomePage = ({ dashboardData }) => {
  // Helper function to get alert icon based on type
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  // Helper function to get enhanced alert styling
  const getEnhancedAlertStyle = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-500 hover:bg-red-100 hover:shadow-md';
      case 'warning':
        return 'bg-yellow-50 border-yellow-500 hover:bg-yellow-100 hover:shadow-md';
      case 'info':
        return 'bg-blue-50 border-blue-500 hover:bg-blue-100 hover:shadow-md';
      case 'success':
        return 'bg-green-50 border-green-500 hover:bg-green-100 hover:shadow-md';
      default:
        return 'bg-gray-50 border-gray-500 hover:bg-gray-100 hover:shadow-md';
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
    <div className="flex-1 space-y-6 ml-64 mr-5 pt-20 px-4 overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Today's Overview Stats */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 min-h-fit">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Today's Overview</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
              All Systems Active
            </span>
          </div>

          <div className="space-y-4">
            <TotalProduction/>
            <EfficiencyRate/>
            <ActiveWorkers/>
            <RemainingTarget/>
          </div>
        </div>

        {/* Production Lines Status */}
        <ProductionLineStatus/>
        

        {/* Alerts & Notifications - Enhanced */}
        <div className="bg-gradient-to-br from-white via-white to-orange-50/30 rounded-2xl p-6 shadow-xl border border-orange-100/50 hover:shadow-2xl transition-all duration-300">
          {/* Header with Live Indicator */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 pb-4 border-b-2 border-gradient-to-r from-orange-200 to-yellow-200">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Alerts & Notifications</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <span className="px-4 py-1.5 bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 text-xs font-bold rounded-full uppercase shadow-sm">
                {dashboardData.alerts.length} Active Alerts
              </span>
            </div>
          </div>

          {/* Alerts List with Enhanced Styling */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {dashboardData.alerts.map((alert, index) => (
              <div 
                key={alert.id} 
                className={`
                  group p-4 rounded-xl border-l-4 transition-all duration-300 cursor-pointer
                  ${getEnhancedAlertStyle(alert.type)}
                  transform hover:scale-[1.02] hover:translate-x-1
                  animate-slideIn
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Alert Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-relaxed">
                      {alert.message}
                    </p>
                    
                    {/* Optional: Alert timestamp or additional info */}
                    {alert.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {/* Action indicator on hover */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer - View All Link */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full text-center text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors">
              View All Alerts →
            </button>
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