import React, { useState } from 'react';
import { Target, Activity } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { SupervisorLinks } from '../Data/SidebarNavlinks';


const ProductivityPage = ({ dashboardData }) => {
  const [selectedLine, setSelectedLine] = useState('all');
  const lineOptions = dashboardData.lines.map(line => line.name);
  // Helper to get line for a worker (if you want to assign workers to lines in data, update this logic)
    const getWorkerLine = (worker) => {
    // If you have line info per worker, use it. Otherwise, return '-'.
    return worker.line || '-';
  };
  return (
    <div className="flex">
      <SideBar title="Supervisor Panel" links={SupervisorLinks} />
  <div className="space-y-6 ml-64 w-full mt-16">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Productivity Analytics</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Performance Chart */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Line Performance Comparison</h3>
            <div className="h-72 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 italic">
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Line Performance Bar Chart</p>
                <small className="block mt-2">Real-time efficiency comparison across all lines</small>
              </div>
            </div>
          </div>

          {/* Daily Production Trends */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Daily Production Trends</h3>
            <div className="h-72 bg-gray-50 rounded-xl flex items-center justify-center text-gray-500 italic">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Production Trend Line Chart</p>
                <small className="block mt-2">Units produced over time with target goals</small>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Worker Performance Table */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Individual Worker Performance</h3>
            <div className="overflow-x-auto max-h-64" style={{maxHeight:'16rem', overflowY:'auto'}}>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="p-3 text-left font-semibold">Worker ID</th>
                    <th className="p-3 text-left font-semibold">Worker</th>
                    <th className="p-3 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        Line
                        <select
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-sm bg-white"
                          value={selectedLine}
                          onChange={e => setSelectedLine(e.target.value)}
                        >
                          <option value="all">All</option>
                          {lineOptions.map(line => (
                            <option key={line} value={line}>{line}</option>
                          ))}
                        </select>
                      </div>
                    </th>
                    <th className="p-3 text-left font-semibold">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {[...dashboardData.availableWorkers]
                    .sort((a, b) => a.id.localeCompare(b.id))
                    .filter(worker => selectedLine === 'all' || getWorkerLine(worker) === selectedLine)
                    .map((worker, index) => (
                      <tr key={worker.id} className="border-b border-gray-100">
                        <td className="p-3 font-mono text-xs text-gray-500">{worker.id}</td>
                        <td className="p-3">{worker.name}</td>
                        <td className="p-3">{getWorkerLine(worker)}</td>
                        <td className="p-3">
                          <span className="text-blue-600 font-bold">{worker.efficiency ? worker.efficiency : (80 + (index % 15))}%</span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Production Targets */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Production Targets vs Actual</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Daily Target</span>
                  <span>2,500 units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '94%' }}></div>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">2,340 units completed (94%)</div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Weekly Target</span>
                  <span>12,500 units</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-yellow-500 h-3 rounded-full" style={{ width: '78%' }}></div>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">9,750 units completed (78%)</div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>Quality Rate</span>
                  <span>98% Target</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '96%' }}></div>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">96.2% achieved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProductivityPage;