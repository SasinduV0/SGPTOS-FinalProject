import React, { useState, useEffect } from 'react';
import { X, Download, BarChart3, FileText, Filter, RefreshCw, AlertCircle } from 'lucide-react';
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
      description: 'Track individual worker performance and output',
      icon: '👥',
      endpoint: 'employees'
    },
    { 
      name: 'Line Efficiency', 
      description: 'Monitor production line performance metrics',
      icon: '🏭',
      endpoint: 'line-performance'
    },
    { 
      name: 'Target Achievement', 
      description: 'Compare actual vs planned production goals',
      icon: '🎯',
      endpoint: 'product'
    },
    { 
      name: 'Defect Rate', 
      description: 'Quality control and defect analysis',
      icon: '⚠️',
      endpoint: 'iot/defect-rate'
    },
    { 
      name: 'Supervisor Management', 
      description: 'Line supervisor assignments and coverage',
      icon: '👨‍💼',
      endpoint: 'line-management'
    }
  ];

  // Fetch data based on report type and period
  const fetchReportData = async () => {
    if (!selectedReport) return;
    
    setLoading(true);
    setError(null);

    try {
      const reportConfig = reportOptions.find(r => r.name === selectedReport);
      let response;

      switch(selectedReport) {
        case 'Employee Efficiency':
          response = await fetch(`${API_BASE_URL}/${reportConfig.endpoint}`);
          const employeesResponse = await response.json();
          const employees = Array.isArray(employeesResponse) ? employeesResponse : (employeesResponse.data || employeesResponse.employees || []);
          setReportData(transformEmployeeData(employees, selectedPeriod));
          break;

        case 'Line Efficiency':
          response = await fetch(`${API_BASE_URL}/${reportConfig.endpoint}`);
          const lineDataResponse = await response.json();
          const lineData = Array.isArray(lineDataResponse) ? lineDataResponse : (lineDataResponse.data || lineDataResponse.lines || []);
          setReportData(transformLineData(lineData, selectedPeriod));
          break;

        case 'Target Achievement':
          response = await fetch(`${API_BASE_URL}/${reportConfig.endpoint}`);
          const plansResponse = await response.json();
          // Handle both array and object with data property
          const plans = Array.isArray(plansResponse) ? plansResponse : (plansResponse.data || plansResponse.plans || []);
          setReportData(transformTargetData(plans, selectedPeriod));
          break;

        case 'Defect Rate':
          response = await fetch(`${API_BASE_URL}/${reportConfig.endpoint}`);
          const defectData = await response.json();
          const defectsResponse = await fetch(`${API_BASE_URL}/iot/defects`);
          const allDefectsResponse = await defectsResponse.json();
          const allDefects = Array.isArray(allDefectsResponse) ? allDefectsResponse : (allDefectsResponse.data || allDefectsResponse.defects || []);
          setReportData(transformDefectData(defectData, allDefects, selectedPeriod));
          break;

        case 'Supervisor Management':
          response = await fetch(`${API_BASE_URL}/${reportConfig.endpoint}`);
          const supervisorsResponse = await response.json();
          const supervisors = Array.isArray(supervisorsResponse) ? supervisorsResponse : (supervisorsResponse.data || supervisorsResponse.supervisors || []);
          setReportData(transformSupervisorData(supervisors, selectedPeriod));
          break;

        default:
          throw new Error('Invalid report type');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch data when period changes
  useEffect(() => {
    if (showDashboard && selectedReport) {
      fetchReportData();
    }
  }, [selectedPeriod]);

  // Helper to filter data by period
  const filterDataByPeriod = (data, period) => {
    const now = new Date();
    const filtered = data.filter(item => {
      const itemDate = new Date(item.date || item.updatedAt || item.createdAt);
      
      switch(period) {
        case 'today':
          return itemDate.toDateString() === now.toDateString();
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return itemDate >= weekAgo;
        case 'monthly':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return itemDate >= monthAgo;
        case 'annually':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return itemDate >= yearAgo;
        default:
          return true;
      }
    });
    return filtered;
  };

  // Aggregate data based on period
  const aggregateByPeriod = (data, period, groupKey) => {
    if (period === 'today') return data;

    const grouped = {};
    data.forEach(item => {
      const key = item[groupKey];
      if (!grouped[key]) {
        grouped[key] = { ...item, pieces: 0, actual: 0, defects: 0, count: 0 };
      }
      grouped[key].pieces += item.pieces || 0;
      grouped[key].actual += item.actual || 0;
      grouped[key].defects += item.defects || 0;
      grouped[key].count += 1;
    });

    return Object.values(grouped).map(item => {
      const multiplier = period === 'weekly' ? 7 : period === 'monthly' ? 30 : 365;
      const target = getLineTarget(parseInt(item.line?.replace('Line ', '') || 1)) * multiplier;
      const achievement = target > 0 ? ((item.pieces / target) * 100).toFixed(1) : 0;
      
      return {
        ...item,
        efficiency: parseFloat(achievement),
        achievement: parseFloat(achievement),
        status: getStatus(parseFloat(achievement)),
        variance: item.pieces - target
      };
    });
  };

  // Data transformation functions
  const transformEmployeeData = (employees, period) => {
    // Ensure employees is an array
    if (!Array.isArray(employees)) {
      console.error('transformEmployeeData: Expected array but got:', typeof employees);
      return [];
    }

    const transformed = employees.map(emp => {
      const multiplier = period === 'weekly' ? 7 : period === 'monthly' ? 30 : period === 'annually' ? 365 : 1;
      const target = getLineTarget(emp.line) * multiplier;
      const actualPieces = (emp.pcs || 0) * (period === 'today' ? 1 : multiplier);
      const achievement = target > 0 ? ((actualPieces / target) * 100).toFixed(1) : 0;
      const variance = actualPieces - target;
      
      return {
        date: new Date(emp.updatedAt).toISOString().split('T')[0],
        workerId: emp.employeeId,
        workerName: emp.name,
        line: `Line ${emp.line}`,
        pieces: actualPieces,
        efficiency: parseFloat(achievement),
        achievement: parseFloat(achievement),
        status: getStatus(parseFloat(achievement)),
        variance: variance,
        updatedAt: emp.updatedAt
      };
    });

    return filterDataByPeriod(transformed, period);
  };

  const transformLineData = (lineData, period) => {
    // Ensure lineData is an array
    if (!Array.isArray(lineData)) {
      console.error('transformLineData: Expected array but got:', typeof lineData);
      return [];
    }

    const multiplier = period === 'weekly' ? 7 : period === 'monthly' ? 30 : period === 'annually' ? 365 : 1;
    
    return lineData.map(line => ({
      date: new Date().toISOString().split('T')[0],
      line: line.line,
      pieces: line.actual * multiplier,
      efficiency: line.efficiency,
      achievement: line.efficiency,
      status: getStatus(line.efficiency),
      variance: (line.actual - line.target) * multiplier
    }));
  };

  const transformTargetData = (plans, period) => {
    // Ensure plans is an array
    if (!Array.isArray(plans)) {
      console.error('transformTargetData: Expected array but got:', typeof plans);
      return [];
    }

    const transformed = plans.map(plan => {
      // Calculate achievement percentage
      const achievement = plan.totalStock > 0 
        ? ((plan.finishedUnits / plan.totalStock) * 100).toFixed(1) 
        : 0;
      
      // Calculate remaining units
      const remainingUnits = plan.remainingUnits || (plan.totalStock - plan.finishedUnits);
      
      // Format dates
      const startDate = plan.startDate ? new Date(plan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const endDate = plan.endDate ? new Date(plan.endDate).toISOString().split('T')[0] : 'N/A';
      
      return {
        date: startDate,
        productName: plan.product,
        line: plan.product,
        actual: plan.finishedUnits || 0,
        target: plan.totalStock || 0,
        remaining: remainingUnits,
        achievement: parseFloat(achievement),
        status: getStatus(parseFloat(achievement)),
        variance: (plan.finishedUnits || 0) - (plan.totalStock || 0),
        remainingDays: plan.remainingDays || 0,
        dailyTarget: plan.dailyTarget || 0,
        weeklyTarget: plan.weeklyTarget || 0,
        dueDate: endDate,
        createdAt: plan.createdAt || startDate,
        startDate: startDate,
        endDate: endDate
      };
    });

    return filterDataByPeriod(transformed, period);
  };

  const transformDefectData = (defectRate, allDefects, period) => {
    // Ensure allDefects is an array
    if (!Array.isArray(allDefects)) {
      console.error('transformDefectData: Expected array but got:', typeof allDefects);
      return [];
    }

    const defectsByWorker = {};
    
    const filteredDefects = allDefects.filter(defectDoc => {
      const defectDate = new Date(defectDoc.Time_Stamp);
      const now = new Date();
      
      switch(period) {
        case 'today':
          return defectDate.toDateString() === now.toDateString();
        case 'weekly':
          return defectDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case 'monthly':
          return defectDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case 'annually':
          return defectDate >= new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default:
          return true;
      }
    });

    filteredDefects.forEach(defectDoc => {
      defectDoc.Defects.forEach(defect => {
        const key = defectDoc.Station_ID;
        if (!defectsByWorker[key]) {
          defectsByWorker[key] = {
            stationId: defectDoc.Station_ID,
            tagUID: defectDoc.Tag_UID,
            defects: [],
            timestamp: defectDoc.Time_Stamp
          };
        }
        defectsByWorker[key].defects.push(defect);
      });
    });

    return Object.values(defectsByWorker).map((item, index) => ({
      date: new Date(item.timestamp).toISOString().split('T')[0],
      workerId: `ST-${item.stationId}`,
      workerName: `Station ${item.stationId}`,
      line: `Line ${Math.ceil(item.stationId / 2)}`,
      defectType: item.defects.map(d => getDefectName(d.Type, d.Subtype)).join(', '),
      defects: item.defects.length,
      achievement: (100 - (item.defects.length * 0.5)).toFixed(1),
      status: item.defects.length <= 2 ? 'Excellent' : item.defects.length <= 5 ? 'Good' : 'Poor',
      variance: item.defects.length
    }));
  };

  const transformSupervisorData = (supervisors, period) => {
    // Ensure supervisors is an array
    if (!Array.isArray(supervisors)) {
      console.error('transformSupervisorData: Expected array but got:', typeof supervisors);
      return [];
    }

    const transformed = supervisors.map(sup => ({
      date: new Date(sup.createdAt).toISOString().split('T')[0],
      supervisorId: sup._id.substring(0, 8),
      supervisorName: sup.name,
      assignedLines: Array.isArray(sup.lineNo) ? sup.lineNo.join(', ') : sup.lineNo,
      lineCount: Array.isArray(sup.lineNo) ? sup.lineNo.length : 1,
      status: 'Active',
      efficiency: 100,
      achievement: 100,
      createdAt: sup.createdAt
    }));

    return filterDataByPeriod(transformed, period);
  };

  // Helper functions
  const getLineTarget = (lineNumber) => {
    const targets = { 1: 1000, 2: 800, 3: 900, 4: 1100, 5: 950, 6: 1050, 7: 700, 8: 850 };
    return targets[lineNumber] || 800;
  };

  const getStatus = (percentage) => {
    if (percentage >= 95) return 'Excellent';
    if (percentage >= 85) return 'Good';
    if (percentage >= 70) return 'Average';
    return 'Poor';
  };

  const getDefectName = (type, subtype) => {
    const defectMap = {
      0: { name: 'Fabric', subtypes: { 0: 'Hole', 1: 'Stain', 2: 'Shading', 3: 'Slub' } },
      1: { name: 'Stitching', subtypes: { 0: 'Broken', 1: 'Uneven' } },
      2: { name: 'Button', subtypes: { 0: 'Missing', 1: 'Loose' } }
    };
    return defectMap[type]?.subtypes[subtype] || `Type ${type}-${subtype}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Excellent': return 'bg-green-100 text-green-800';
      case 'Good': return 'bg-blue-100 text-blue-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and sort data
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
      <div className="bg-white rounded-lg shadow p-6 mt-20 ml-70 ">
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