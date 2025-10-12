import React, { useState, useEffect } from 'react';
import { X, Download, BarChart3, FileText, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import SideBar from '../../components/SideBar';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';

const ReportAnalytics = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('All');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'http://localhost:8001/api'; // Adjust to your backend URL

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
    let data = [...reportData];

    // Apply status filter
    if (filterStatus !== 'All') {
      data = data.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue, bValue;
      
      switch(sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'achievement':
          aValue = a.achievement;
          bValue = b.achievement;
          break;
        case 'variance':
          aValue = a.variance;
          bValue = b.variance;
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

    return data;
  };

  const generateReport = () => {
    if (!selectedReport) return;
    setShowPopup(false);
    setShowDashboard(true);
    fetchReportData();
  };

  // ==================================================================
  // ===== MODIFIED FUNCTIONS FOR PDF/PRINT EXPORT ====================
  // ==================================================================

  // This function is now the single point for exporting.
  // It opens the print dialog, where users can choose to print or "Save as PDF".
  const exportReport = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = generatePDFContent();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    // Use a timeout to ensure the content is fully rendered before printing
    setTimeout(() => {
      printWindow.focus(); // Focus on the new window
      printWindow.print();
    }, 500);
  };

  // The 'downloadReport' function is removed as 'exportReport' now handles it.
  // The 'printReport' function is also removed for the same reason.

  const generatePDFContent = () => {
    const data = getCurrentData();
    let tableHeaders = '';
    let tableRows = '';

    switch(selectedReport) {
      case 'Employee Efficiency':
        tableHeaders = '<th>Date</th><th>Worker ID</th><th>Name</th><th>Line</th><th>Pieces</th><th>Efficiency %</th><th>Achievement %</th><th>Status</th><th>Variance</th>';
        tableRows = data.map(row => `
          <tr>
            <td>${row.date}</td>
            <td>${row.workerId}</td>
            <td><strong>${row.workerName}</strong></td>
            <td>${row.line}</td>
            <td>${row.pieces}</td>
            <td>${row.efficiency}%</td>
            <td>${row.achievement}%</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
            <td class="${row.variance >= 0 ? 'positive' : 'negative'}">${row.variance >= 0 ? '+' : ''}${row.variance}</td>
          </tr>
        `).join('');
        break;

      case 'Line Efficiency':
        tableHeaders = '<th>Date</th><th>Line</th><th>Pieces</th><th>Efficiency %</th><th>Achievement %</th><th>Status</th><th>Variance</th>';
        tableRows = data.map(row => `
          <tr>
            <td>${row.date}</td>
            <td><strong>${row.line}</strong></td>
            <td>${row.pieces}</td>
            <td>${row.efficiency}%</td>
            <td>${row.achievement}%</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
            <td class="${row.variance >= 0 ? 'positive' : 'negative'}">${row.variance >= 0 ? '+' : ''}${row.variance}</td>
          </tr>
        `).join('');
        break;

      case 'Target Achievement':
        tableHeaders = '<th>Product</th><th>Total Units</th><th>Finished</th><th>Remaining</th><th>Achievement %</th><th>Due Date</th><th>Days Left</th><th>Daily Target</th><th>Weekly Target</th><th>Status</th>';
        tableRows = data.map(row => `
          <tr>
            <td><strong>${row.productName || row.line}</strong></td>
            <td>${row.target}</td>
            <td>${row.actual}</td>
            <td>${row.remaining || 0}</td>
            <td>${row.achievement}%</td>
            <td>${row.dueDate || row.endDate || 'N/A'}</td>
            <td>${row.remainingDays || 0} days</td>
            <td>${row.dailyTarget || 'N/A'}</td>
            <td>${row.weeklyTarget || 'N/A'}</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
          </tr>
        `).join('');
        break;

      case 'Defect Rate':
        tableHeaders = '<th>Date</th><th>Worker ID</th><th>Name</th><th>Line</th><th>Defect Type</th><th>Count</th><th>Achievement %</th><th>Status</th>';
        tableRows = data.map(row => `
          <tr>
            <td>${row.date}</td>
            <td>${row.workerId}</td>
            <td><strong>${row.workerName}</strong></td>
            <td>${row.line}</td>
            <td>${row.defectType}</td>
            <td>${row.defects}</td>
            <td>${row.achievement}%</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
          </tr>
        `).join('');
        break;

      case 'Supervisor Management':
        tableHeaders = '<th>Date</th><th>ID</th><th>Supervisor Name</th><th>Assigned Lines</th><th>Line Count</th><th>Status</th>';
        tableRows = data.map(row => `
          <tr>
            <td>${row.date}</td>
            <td>${row.supervisorId}</td>
            <td><strong>${row.supervisorName}</strong></td>
            <td>${row.assignedLines}</td>
            <td>${row.lineCount}</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
          </tr>
        `).join('');
        break;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <title>${selectedReport} - ${selectedPeriod} Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #1f2937; padding-bottom: 20px; }
    .header h1 { color: #1f2937; margin: 0 0 10px 0; }
    .header p { color: #6b7280; margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    thead { background-color: #1f2937; color: white; }
    th { padding: 12px; text-align: left; font-weight: 600; font-size: 12px; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 11px; }
    tbody tr:hover { background-color: #f9fafb; }
    .status-excellent { color: #059669; font-weight: bold; }
    .status-good { color: #2563eb; font-weight: bold; }
    .status-average { color: #d97706; font-weight: bold; }
    .status-poor { color: #dc2626; font-weight: bold; }
    .status-active { color: #059669; font-weight: bold; }
    .positive { color: #059669; font-weight: bold; }
    .negative { color: #dc2626; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; padding: 0; }
      .header { border-bottom: 2px solid #1f2937; padding-bottom: 15px; margin-bottom: 20px; }
      table { box-shadow: none; }
      .footer { border-top: 1px solid #e5e7eb; padding-top: 15px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${selectedReport}</h1>
    <p><strong>Period:</strong> ${selectedPeriod}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Filter:</strong> ${filterStatus} | <strong>Sort:</strong> ${sortBy} (${sortOrder})</p>
  </div>
  <table>
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">
    <p>Report Analytics System - Real-time Production Data</p>
    <p>&copy; ${new Date().getFullYear()} - All Rights Reserved</p>
  </div>
</body>
</html>`;
  };

  const renderTableHeaders = () => {
    switch(selectedReport) {
      case 'Employee Efficiency':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Worker ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Pieces</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Efficiency %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Variance</th>
          </>
        );
      case 'Line Efficiency':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Pieces</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Efficiency %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Variance</th>
          </>
        );
      case 'Target Achievement':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Product</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Total Units</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Finished</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Remaining</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Due Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Days Left</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Daily Target</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Weekly Target</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
          </>
        );
      case 'Defect Rate':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Worker ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Defect Type</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Count</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
          </>
        );
      case 'Supervisor Management':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Supervisor ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Assigned Lines</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line Count</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (row, index) => {
    switch(selectedReport) {
      case 'Employee Efficiency':
        return (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-gray-700">{row.date}</td>
            <td className="px-6 py-4 text-gray-700">{row.workerId}</td>
            <td className="px-6 py-4 font-medium text-gray-800">{row.workerName}</td>
            <td className="px-6 py-4 text-gray-700">{row.line}</td>
            <td className="px-6 py-4 text-gray-700">{row.pieces}</td>
            <td className="px-6 py-4 text-gray-700">{row.efficiency}%</td>
            <td className="px-6 py-4 text-gray-700">{row.achievement}%</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                {row.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`font-medium ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {row.variance >= 0 ? '+' : ''}{row.variance}
              </span>
            </td>
          </tr>
        );
      case 'Line Efficiency':
        return (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-gray-700">{row.date}</td>
            <td className="px-6 py-4 font-medium text-gray-800">{row.line}</td>
            <td className="px-6 py-4 text-gray-700">{row.pieces}</td>
            <td className="px-6 py-4 text-gray-700">{row.efficiency}%</td>
            <td className="px-6 py-4 text-gray-700">{row.achievement}%</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                {row.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`font-medium ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {row.variance >= 0 ? '+' : ''}{row.variance}
              </span>
            </td>
          </tr>
        );
      case 'Target Achievement':
        return (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 font-medium text-gray-900">{row.productName || row.line}</td>
            <td className="px-6 py-4 text-gray-700">{row.target}</td>
            <td className="px-6 py-4 text-gray-700">{row.actual}</td>
            <td className="px-6 py-4 text-gray-700">{row.remaining || 0}</td>
            <td className="px-6 py-4">
              <span className={`font-semibold ${
                row.achievement >= 95 ? 'text-green-600' : 
                row.achievement >= 85 ? 'text-blue-600' : 
                row.achievement >= 70 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {row.achievement}%
              </span>
            </td>
            <td className="px-6 py-4 text-gray-700">{row.dueDate || row.endDate || 'N/A'}</td>
            <td className="px-6 py-4 text-gray-700">{row.remainingDays || 0} days</td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {row.dailyTarget || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                {row.weeklyTarget || 'N/A'}
              </span>
            </td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      case 'Defect Rate':
        return (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-gray-700">{row.date}</td>
            <td className="px-6 py-4 text-gray-700">{row.workerId}</td>
            <td className="px-6 py-4 font-medium text-gray-800">{row.workerName}</td>
            <td className="px-6 py-4 text-gray-700">{row.line}</td>
            <td className="px-6 py-4 text-gray-700">{row.defectType}</td>
            <td className="px-6 py-4 text-gray-700">{row.defects}</td>
            <td className="px-6 py-4 text-gray-700">{row.achievement}%</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      case 'Supervisor Management':
        return (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-gray-700">{row.date}</td>
            <td className="px-6 py-4 text-gray-700">{row.supervisorId}</td>
            <td className="px-6 py-4 font-medium text-gray-800">{row.supervisorName}</td>
            <td className="px-6 py-4 text-gray-700">{row.assignedLines}</td>
            <td className="px-6 py-4 text-gray-700">{row.lineCount}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                {row.status}
              </span>
            </td>
          </tr>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen mt-18 ml-62">
      <SideBar title="Manager Panel" links={ManagerLinks} />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {showDashboard ? (
            <div>
              {/* Header */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">{selectedReport}</h2>
                    <p className="text-gray-600 mt-1">Real-time data analysis from MongoDB</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchReportData}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                      Refresh
                    </button>
                    <button
                      onClick={() => setShowDashboard(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      ← Back
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-red-800 font-semibold">Error Loading Data</h4>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  {/* Period Selection */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    {['today', 'weekly', 'monthly', 'annually'].map((period) => (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                          selectedPeriod === period
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 hover:text-gray-800'
                        }`}
                      >
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Filters and Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-600" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="All">All Status</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Poor">Poor</option>
                      </select>
                    </div>

                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="date">Sort by Date</option>
                      <option value="achievement">Sort by Achievement</option>
                      <option value="variance">Sort by Variance</option>
                    </select>

                    {/* Sort Order */}
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                    </button>

                    {/* ===== MODIFIED EXPORT BUTTONS ===== */}
                    <button
                      onClick={exportReport}
                      disabled={loading || reportData.length === 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <Download size={16} />
                      SAVE AS PDF
                    </button>
                    <button
                      onClick={exportReport}
                      disabled={loading || reportData.length === 0}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                      <FileText size={16} />
                      PRINT
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="animate-spin text-blue-600 mr-3" size={24} />
                    <span className="text-gray-600">Loading report data...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800 text-white">
                        <tr>
                          {renderTableHeaders()}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {getCurrentData().length > 0 ? (
                          getCurrentData().map((row, index) => renderTableRow(row, index))
                        ) : (
                          <tr>
                            <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                              {error ? 'Failed to load data' : 'No data available for the selected filters'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Summary Stats */}
                {!loading && reportData.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Total Records: <strong className="text-gray-800">{getCurrentData().length}</strong>
                      </span>
                      <span className="text-gray-600">
                        Last Updated: <strong className="text-gray-800">{new Date().toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <BarChart3 size={32} className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Report Analytics Dashboard</h3>
                <p className="text-gray-600 mb-8">Generate comprehensive reports from real-time production data</p>
                
                <button 
                  onClick={() => setShowPopup(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto shadow-lg"
                >
                  <BarChart3 size={20} />
                  Generate Report Analysis
                </button>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <div className="text-blue-600 text-3xl mb-2">📊</div>
                    <h4 className="font-semibold text-gray-800 mb-1">Real-Time Data</h4>
                    <p className="text-sm text-gray-600">Connected to live MongoDB database</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <div className="text-green-600 text-3xl mb-2">📈</div>
                    <h4 className="font-semibold text-gray-800 mb-1">5 Report Types</h4>
                    <p className="text-sm text-gray-600">Comprehensive analytics coverage</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <div className="text-purple-600 text-3xl mb-2">📄</div>
                    <h4 className="font-semibold text-gray-800 mb-1">Export Ready</h4>
                    <p className="text-sm text-gray-600">Print & download reports instantly</p>
                  </div>
                </div>
              </div>

              {/* Popup Modal */}
              {showPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800">Select Report Type</h2>
                        <p className="text-gray-600 mt-1">Choose the type of analysis you want to generate</p>
                      </div>
                      <button 
                        onClick={() => {
                          setShowPopup(false);
                          setSelectedReport(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={24} />
                      </button>
                    </div>

                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {reportOptions.map((option) => (
                          <div
                            key={option.name}
                            onClick={() => setSelectedReport(option.name)}
                            className={`p-6 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                              selectedReport === option.name
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="text-3xl mb-3">{option.icon}</div>
                            <h3 className="font-bold text-gray-800 mb-2 text-lg">{option.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{option.description}</p>
                            <div className="flex items-center text-xs text-gray-500">
                              <code className="bg-gray-100 px-2 py-1 rounded">/{option.endpoint}</code>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={generateReport}
                        disabled={!selectedReport}
                        className={`w-full py-4 rounded-lg font-semibold transition-all text-lg ${
                          selectedReport
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {selectedReport ? `Generate ${selectedReport} Report` : 'Select a Report Type'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportAnalytics;