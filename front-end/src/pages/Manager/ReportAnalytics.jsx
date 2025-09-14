import React, { useState, useEffect } from 'react';
import { X, Download, BarChart3 } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';

import LineWiseProductivity from '../../components/Manager/LineWiseProductivity';
import DashboardSummary from '../../components/Manager/DashboardSummary';
import LinePerformanceTable from '../../components/Manager/LinePerformanceTable';

const ReportAnalytics = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Today');

  // Sample data for different report types and periods
  const reportData = {
    'Employee Efficiency': {
      Today: [16, 45, 37, 7],
      Weekly: [120, 300, 250, 80],
      Monthly: [480, 1200, 1000, 320],
      Annually: [5760, 14400, 12000, 3840]
    },
    'Line Efficiency': {
      Today: [25, 35, 42, 18],
      Weekly: [175, 245, 294, 126],
      Monthly: [700, 980, 1176, 504],
      Annually: [8400, 11760, 14112, 6048]
    },
    'Target Achievement': {
      Today: [30, 40, 25, 15],
      Weekly: [210, 280, 175, 105],
      Monthly: [840, 1120, 700, 420],
      Annually: [10080, 13440, 8400, 5040]
    },
    'Defect Rate': {
      Today: [5, 12, 8, 3],
      Weekly: [35, 84, 56, 21],
      Monthly: [140, 336, 224, 84],
      Annually: [1680, 4032, 2688, 1008]
    },
    'Productivity': {
      Today: [28, 52, 34, 16],
      Weekly: [196, 364, 238, 112],
      Monthly: [784, 1456, 952, 448],
      Annually: [9408, 17472, 11424, 5376]
    }
  };

  const reportOptions = [
    { 
      name: 'Employee Efficiency', 
      description: 'Track individual and team performance metrics',
      icon: '👥'
    },
    { 
      name: 'Line Efficiency', 
      description: 'Monitor production line performance and output',
      icon: '🏭'
    },
    { 
      name: 'Target Achievement', 
      description: 'Compare actual vs target production goals',
      icon: '🎯'
    },
    { 
      name: 'Defect Rate', 
      description: 'Quality control and defect tracking analysis',
      icon: '⚠️'
    },
    { 
      name: 'Productivity', 
      description: 'Overall productivity and efficiency trends',
      icon: '📈'
    }
  ];

  const getCurrentData = () => {
    if (!selectedReport) return [];
    return reportData[selectedReport][selectedPeriod] || [];
  };

  const getMaxValue = () => {
    const data = getCurrentData();
    return Math.max(...data);
  };

  const generateReport = () => {
    if (!selectedReport) return;
    setShowPopup(false);
    setShowDashboard(true);
  };

  const downloadReport = () => {
    // Simulate download
    const fileName = `${selectedReport.replace(/\s+/g, '_')}_${selectedPeriod}_Report.pdf`;
    
    // Create a temporary link for download simulation
    const link = document.createElement('a');
    link.download = fileName;
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(
      `Report: ${selectedReport}\nPeriod: ${selectedPeriod}\nGenerated: ${new Date().toLocaleDateString()}`
    );
    link.click();
    
    // Show feedback
    alert(`${fileName} downloaded successfully!`);
  };

  if (showDashboard) {
    const data = getCurrentData();
    const maxValue = getMaxValue();

    return (
      <div className="bg-white rounded-lg shadow p-6 mt-20 ml-70">
        <SideBar title ="Manager Panel" links={ManagerLinks}/>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{selectedReport}</h2>
            <p className="text-gray-600 mt-1">Comprehensive analysis and insights</p>
          </div>
          <button 
            onClick={() => setShowDashboard(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Time Period Buttons */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['Today', 'Weekly', 'Monthly', 'Annually'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-gray-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
              SHOW
            </button>
            <button 
              onClick={downloadReport}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
            >
              <Download size={16} />
              DOWNLOAD
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-end items-center mb-6">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Max: {maxValue}</span>
            </div>
          </div>

          <div className="relative h-80">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-500 pr-4">
              {[maxValue, Math.floor(maxValue * 0.75), Math.floor(maxValue * 0.5), Math.floor(maxValue * 0.25), 0].map((value, index) => (
                <span key={index}>{value}</span>
              ))}
            </div>

            {/* Chart area */}
            <div className="ml-12 h-full flex items-end justify-center gap-8">
              {data.map((value, index) => {
                const height = (value / maxValue) * 100;
                const colors = ['#ef4444', '#f97316', '#eab308', '#84cc16'];
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div 
                      className="w-16 rounded-t transition-all duration-1000 relative group cursor-pointer"
                      style={{ 
                        height: `${height}%`, 
                        backgroundColor: colors[index % colors.length],
                        minHeight: '8px'
                      }}
                    >
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {value}
                      </div>
                    </div>
                    <span className="mt-2 text-sm font-medium text-gray-700">
                      {['A', 'B', 'C', 'D'][index]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Grid lines */}
            <div className="absolute inset-0 ml-12 pointer-events-none">
              {[0, 25, 50, 75, 100].map((position) => (
                <div
                  key={position}
                  className="absolute w-full border-t border-gray-200"
                  style={{ bottom: `${position}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 ml-70 mt-20">
      <SideBar title ="Manager Panel" links={ManagerLinks}/>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Analytics</h3>
        <p className="text-gray-600 mb-6 ">Generate comprehensive reports and analytics</p>
        
        <button 
          onClick={() => setShowPopup(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
        >
          <BarChart3 size={20} />
          Generate Report Analysis
        </button>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Popup Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Select Report Type</h2>
                <p className="text-gray-600 mt-1">Choose the type of analysis you want to generate</p>
              </div>
              <button 
                onClick={() => setShowPopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Report Options */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {reportOptions.map((option) => (
                  <div
                    key={option.name}
                    onClick={() => setSelectedReport(option.name)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedReport === option.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <h3 className="font-semibold text-gray-800 mb-1">{option.name}</h3>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              <button
                onClick={generateReport}
                disabled={!selectedReport}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedReport
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='mt-10 flex flex-col'>
          <LineWiseProductivity/>
          <DashboardSummary />
          <LinePerformanceTable/>

      </div>


    </div>
  );
};

export default ReportAnalytics;