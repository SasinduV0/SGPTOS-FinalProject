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


const HomePage = ({ dashboardData }) => {
  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
    <div className="space-y-6 ml-64 w-full pt-20 px-4 max-w-screen-xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Today's Overview Stats */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Today's Overview</h3>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full uppercase">
              All Systems Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{dashboardData.overview.activeLines}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Active Lines</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{dashboardData.overview.totalWorkers}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Total Workers</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{dashboardData.overview.avgEfficiency}%</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Avg Efficiency</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-800">{dashboardData.overview.unitsProduced}</div>
              <div className="text-xs text-gray-600 uppercase mt-1">Total Tasks</div>
            </div>
          </div>
        </div>

        {/* Production Lines Status */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Production Lines Status</h3>
          </div>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {dashboardData.lines.map((line) => (
              <div key={line.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <h4 className="font-semibold text-gray-800">{line.name}</h4>
                  <p className="text-sm text-gray-600">{line.workers} workers  {line.product}</p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${getEfficiencyColor(line.efficiency)}`}
                      style={{ width: `${line.efficiency}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${getEfficiencyTextColor(line.efficiency)}`}>
                    {line.efficiency}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:transform hover:scale-105 transition-all duration-300">
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
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Performance Trends</h3>
          </div>
          <div className="h-72 bg-gray-50 rounded-xl flex items-center justify-center">
            <Line
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: dashboardData.lines.map((line, idx) => ({
                  label: line.name,
                  data: [
                    line.efficiency - 8 + idx,
                    line.efficiency - 3 + idx,
                    line.efficiency - 2 + idx,
                    line.efficiency + idx,
                    line.efficiency + 2 + idx,
                    line.efficiency + 1 + idx,
                    line.efficiency + 3 + idx
                  ],
                  borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(251, 191, 36, 1)',
                    'rgba(239, 68, 68, 1)'
                  ][idx % 4],
                  backgroundColor: 'rgba(0,0,0,0)',
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6,
                  borderWidth: 3
                }))
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y}%`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Efficiency (%)'
                    }
                  }
                }
              }}
              height={250}
            />
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-gray-100">
            <h3 className="text-xl font-bold text-gray-800">Top Performers Today</h3>
          </div>
          <div className="space-y-3">
            {dashboardData.topPerformers.map((performer, index) => {
              
              // Try to find the worker ID from availableWorkers
              const worker = dashboardData.availableWorkers.find(w => w.name === performer.name);
              return (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span>
                    <span className="font-mono text-xs text-gray-500 mr-2">{worker ? worker.id : '-'}</span>
                    <strong>{performer.name}</strong> - {performer.line}, {performer.station}
                  </span>
                  <span className="text-green-600 font-bold">{performer.efficiency}% Eff.</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default HomePage;