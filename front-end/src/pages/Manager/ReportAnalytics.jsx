import React, { useState } from 'react';
import { X, Download, BarChart3, FileText, Filter } from 'lucide-react';

const ReportAnalytics = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterStatus, setFilterStatus] = useState('All');

  // Sample data for Employee Efficiency
  const employeeEfficiencyData = {
    Today: [
      { date: '2025-10-11', workerId: 'W001', workerName: 'John Doe', line: 'Line A', pieces: 450, efficiency: 92, achievement: 95, status: 'Excellent', variance: 25 },
      { date: '2025-10-11', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', pieces: 380, efficiency: 85, achievement: 88, status: 'Good', variance: 15 },
      { date: '2025-10-11', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', pieces: 420, efficiency: 88, achievement: 90, status: 'Good', variance: 20 },
      { date: '2025-10-11', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', pieces: 310, efficiency: 72, achievement: 75, status: 'Average', variance: -10 },
    ],
    Weekly: [
      { date: '2025-10-05', workerId: 'W001', workerName: 'John Doe', line: 'Line A', pieces: 3150, efficiency: 93, achievement: 96, status: 'Excellent', variance: 150 },
      { date: '2025-10-05', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', pieces: 2660, efficiency: 86, achievement: 89, status: 'Good', variance: 110 },
      { date: '2025-10-05', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', pieces: 2940, efficiency: 89, achievement: 91, status: 'Good', variance: 140 },
      { date: '2025-10-05', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', pieces: 2170, efficiency: 73, achievement: 76, status: 'Average', variance: -70 },
    ],
    Monthly: [
      { date: '2025-09-01', workerId: 'W001', workerName: 'John Doe', line: 'Line A', pieces: 13500, efficiency: 94, achievement: 97, status: 'Excellent', variance: 600 },
      { date: '2025-09-01', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', pieces: 11400, efficiency: 87, achievement: 90, status: 'Good', variance: 450 },
      { date: '2025-09-01', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', pieces: 12600, efficiency: 90, achievement: 92, status: 'Excellent', variance: 550 },
      { date: '2025-09-01', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', pieces: 9300, efficiency: 74, achievement: 77, status: 'Average', variance: -300 },
    ],
    Annually: [
      { date: '2024-01-01', workerId: 'W001', workerName: 'John Doe', line: 'Line A', pieces: 162000, efficiency: 95, achievement: 98, status: 'Excellent', variance: 7200 },
      { date: '2024-01-01', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', pieces: 136800, efficiency: 88, achievement: 91, status: 'Good', variance: 5400 },
      { date: '2024-01-01', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', pieces: 151200, efficiency: 91, achievement: 93, status: 'Excellent', variance: 6600 },
      { date: '2024-01-01', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', pieces: 111600, efficiency: 75, achievement: 78, status: 'Average', variance: -3600 },
    ]
  };

  // Sample data for Line Efficiency
  const lineEfficiencyData = {
    Today: [
      { date: '2025-10-11', line: 'Line A', pieces: 1250, efficiency: 91, achievement: 94, status: 'Excellent', variance: 50 },
      { date: '2025-10-11', line: 'Line B', pieces: 1080, efficiency: 86, achievement: 88, status: 'Good', variance: 30 },
      { date: '2025-10-11', line: 'Line C', pieces: 920, efficiency: 78, achievement: 80, status: 'Average', variance: -20 },
      { date: '2025-10-11', line: 'Line D', pieces: 1150, efficiency: 89, achievement: 92, status: 'Good', variance: 45 },
    ],
    Weekly: [
      { date: '2025-10-05', line: 'Line A', pieces: 8750, efficiency: 92, achievement: 95, status: 'Excellent', variance: 350 },
      { date: '2025-10-05', line: 'Line B', pieces: 7560, efficiency: 87, achievement: 89, status: 'Good', variance: 210 },
      { date: '2025-10-05', line: 'Line C', pieces: 6440, efficiency: 79, achievement: 81, status: 'Average', variance: -140 },
      { date: '2025-10-05', line: 'Line D', pieces: 8050, efficiency: 90, achievement: 93, status: 'Excellent', variance: 315 },
    ],
    Monthly: [
      { date: '2025-09-01', line: 'Line A', pieces: 37500, efficiency: 93, achievement: 96, status: 'Excellent', variance: 1500 },
      { date: '2025-09-01', line: 'Line B', pieces: 32400, efficiency: 88, achievement: 90, status: 'Good', variance: 900 },
      { date: '2025-09-01', line: 'Line C', pieces: 27600, efficiency: 80, achievement: 82, status: 'Average', variance: -600 },
      { date: '2025-09-01', line: 'Line D', pieces: 34500, efficiency: 91, achievement: 94, status: 'Excellent', variance: 1350 },
    ],
    Annually: [
      { date: '2024-01-01', line: 'Line A', pieces: 450000, efficiency: 94, achievement: 97, status: 'Excellent', variance: 18000 },
      { date: '2024-01-01', line: 'Line B', pieces: 388800, efficiency: 89, achievement: 91, status: 'Good', variance: 10800 },
      { date: '2024-01-01', line: 'Line C', pieces: 331200, efficiency: 81, achievement: 83, status: 'Average', variance: -7200 },
      { date: '2024-01-01', line: 'Line D', pieces: 414000, efficiency: 92, achievement: 95, status: 'Excellent', variance: 16200 },
    ]
  };

  // Sample data for Target Achievement
  const targetAchievementData = {
    Today: [
      { date: '2025-10-11', line: 'Line A', actual: 1250, target: 1200, achievement: 104, status: 'Excellent', variance: 50 },
      { date: '2025-10-11', line: 'Line B', actual: 1080, target: 1100, achievement: 98, status: 'Good', variance: -20 },
      { date: '2025-10-11', line: 'Line C', actual: 920, target: 1000, achievement: 92, status: 'Good', variance: -80 },
      { date: '2025-10-11', line: 'Line D', actual: 1150, target: 1150, achievement: 100, status: 'Excellent', variance: 0 },
    ],
    Weekly: [
      { date: '2025-10-05', line: 'Line A', actual: 8750, target: 8400, achievement: 104, status: 'Excellent', variance: 350 },
      { date: '2025-10-05', line: 'Line B', actual: 7560, target: 7700, achievement: 98, status: 'Good', variance: -140 },
      { date: '2025-10-05', line: 'Line C', actual: 6440, target: 7000, achievement: 92, status: 'Good', variance: -560 },
      { date: '2025-10-05', line: 'Line D', actual: 8050, target: 8050, achievement: 100, status: 'Excellent', variance: 0 },
    ],
    Monthly: [
      { date: '2025-09-01', line: 'Line A', actual: 37500, target: 36000, achievement: 104, status: 'Excellent', variance: 1500 },
      { date: '2025-09-01', line: 'Line B', actual: 32400, target: 33000, achievement: 98, status: 'Good', variance: -600 },
      { date: '2025-09-01', line: 'Line C', actual: 27600, target: 30000, achievement: 92, status: 'Good', variance: -2400 },
      { date: '2025-09-01', line: 'Line D', actual: 34500, target: 34500, achievement: 100, status: 'Excellent', variance: 0 },
    ],
    Annually: [
      { date: '2024-01-01', line: 'Line A', actual: 450000, target: 432000, achievement: 104, status: 'Excellent', variance: 18000 },
      { date: '2024-01-01', line: 'Line B', actual: 388800, target: 396000, achievement: 98, status: 'Good', variance: -7200 },
      { date: '2024-01-01', line: 'Line C', actual: 331200, target: 360000, achievement: 92, status: 'Good', variance: -28800 },
      { date: '2024-01-01', line: 'Line D', actual: 414000, target: 414000, achievement: 100, status: 'Excellent', variance: 0 },
    ]
  };

  // Sample data for Defect Rate
  const defectRateData = {
    Today: [
      { date: '2025-10-11', workerId: 'W001', workerName: 'John Doe', line: 'Line A', defectType: 'Stitching', defects: 5, achievement: 98.9, status: 'Good', variance: 5 },
      { date: '2025-10-11', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', defectType: 'Sizing', defects: 8, achievement: 97.9, status: 'Average', variance: 8 },
      { date: '2025-10-11', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', defectType: 'Button', defects: 3, achievement: 99.3, status: 'Excellent', variance: 3 },
      { date: '2025-10-11', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', defectType: 'Fabric', defects: 12, achievement: 96.1, status: 'Poor', variance: 12 },
    ],
    Weekly: [
      { date: '2025-10-05', workerId: 'W001', workerName: 'John Doe', line: 'Line A', defectType: 'Stitching', defects: 35, achievement: 98.9, status: 'Good', variance: 35 },
      { date: '2025-10-05', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', defectType: 'Sizing', defects: 56, achievement: 97.9, status: 'Average', variance: 56 },
      { date: '2025-10-05', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', defectType: 'Button', defects: 21, achievement: 99.3, status: 'Excellent', variance: 21 },
      { date: '2025-10-05', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', defectType: 'Fabric', defects: 84, achievement: 96.1, status: 'Poor', variance: 84 },
    ],
    Monthly: [
      { date: '2025-09-01', workerId: 'W001', workerName: 'John Doe', line: 'Line A', defectType: 'Stitching', defects: 150, achievement: 98.9, status: 'Good', variance: 150 },
      { date: '2025-09-01', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', defectType: 'Sizing', defects: 240, achievement: 97.9, status: 'Average', variance: 240 },
      { date: '2025-09-01', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', defectType: 'Button', defects: 90, achievement: 99.3, status: 'Excellent', variance: 90 },
      { date: '2025-09-01', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', defectType: 'Fabric', defects: 360, achievement: 96.1, status: 'Poor', variance: 360 },
    ],
    Annually: [
      { date: '2024-01-01', workerId: 'W001', workerName: 'John Doe', line: 'Line A', defectType: 'Stitching', defects: 1800, achievement: 98.9, status: 'Good', variance: 1800 },
      { date: '2024-01-01', workerId: 'W002', workerName: 'Jane Smith', line: 'Line B', defectType: 'Sizing', defects: 2880, achievement: 97.9, status: 'Average', variance: 2880 },
      { date: '2024-01-01', workerId: 'W003', workerName: 'Mike Johnson', line: 'Line A', defectType: 'Button', defects: 1080, achievement: 99.3, status: 'Excellent', variance: 1080 },
      { date: '2024-01-01', workerId: 'W004', workerName: 'Sarah Williams', line: 'Line C', defectType: 'Fabric', defects: 4320, achievement: 96.1, status: 'Poor', variance: 4320 },
    ]
  };

  // Sample data for Productivity
  const productivityData = {
    Today: [
      { date: '2025-10-11', line: 'Line A', actual: 1250, target: 1200, achievement: 104, status: 'Excellent', variance: 50 },
      { date: '2025-10-11', line: 'Line B', actual: 1080, target: 1150, achievement: 94, status: 'Good', variance: -70 },
      { date: '2025-10-11', line: 'Line C', actual: 920, target: 1000, achievement: 92, status: 'Good', variance: -80 },
      { date: '2025-10-11', line: 'Line D', actual: 1150, target: 1100, achievement: 105, status: 'Excellent', variance: 50 },
    ],
    Weekly: [
      { date: '2025-10-05', line: 'Line A', actual: 8750, target: 8400, achievement: 104, status: 'Excellent', variance: 350 },
      { date: '2025-10-05', line: 'Line B', actual: 7560, target: 8050, achievement: 94, status: 'Good', variance: -490 },
      { date: '2025-10-05', line: 'Line C', actual: 6440, target: 7000, achievement: 92, status: 'Good', variance: -560 },
      { date: '2025-10-05', line: 'Line D', actual: 8050, target: 7700, achievement: 105, status: 'Excellent', variance: 350 },
    ],
    Monthly: [
      { date: '2025-09-01', line: 'Line A', actual: 37500, target: 36000, achievement: 104, status: 'Excellent', variance: 1500 },
      { date: '2025-09-01', line: 'Line B', actual: 32400, target: 34500, achievement: 94, status: 'Good', variance: -2100 },
      { date: '2025-09-01', line: 'Line C', actual: 27600, target: 30000, achievement: 92, status: 'Good', variance: -2400 },
      { date: '2025-09-01', line: 'Line D', actual: 34500, target: 33000, achievement: 105, status: 'Excellent', variance: 1500 },
    ],
    Annually: [
      { date: '2024-01-01', line: 'Line A', actual: 450000, target: 432000, achievement: 104, status: 'Excellent', variance: 18000 },
      { date: '2024-01-01', line: 'Line B', actual: 388800, target: 414000, achievement: 94, status: 'Good', variance: -25200 },
      { date: '2024-01-01', line: 'Line C', actual: 331200, target: 360000, achievement: 92, status: 'Good', variance: -28800 },
      { date: '2024-01-01', line: 'Line D', actual: 414000, target: 396000, achievement: 105, status: 'Excellent', variance: 18000 },
    ]
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
    
    let data = [];
    switch(selectedReport) {
      case 'Employee Efficiency':
        data = employeeEfficiencyData[selectedPeriod] || [];
        break;
      case 'Line Efficiency':
        data = lineEfficiencyData[selectedPeriod] || [];
        break;
      case 'Target Achievement':
        data = targetAchievementData[selectedPeriod] || [];
        break;
      case 'Defect Rate':
        data = defectRateData[selectedPeriod] || [];
        break;
      case 'Productivity':
        data = productivityData[selectedPeriod] || [];
        break;
      default:
        data = [];
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      data = data.filter(item => item.status === filterStatus);
    }

    // Apply sorting
    const sortedData = [...data].sort((a, b) => {
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

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sortedData;
  };

  const generateReport = () => {
    if (!selectedReport) return;
    setShowPopup(false);
    setShowDashboard(true);
  };

  const downloadReport = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = generatePDFContent();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = generatePDFContent();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const generatePDFContent = () => {
    const data = getCurrentData();
    let tableHeaders = '';
    let tableRows = '';

    switch(selectedReport) {
      case 'Employee Efficiency':
        tableHeaders = '<th>Date</th><th>Worker ID</th><th>Worker Name</th><th>Line</th><th>Pieces</th><th>Efficiency %</th><th>Achievement %</th><th>Status</th><th>Variance</th>';
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
        tableHeaders = '<th>Date</th><th>Line</th><th>Actual</th><th>Target</th><th>Achievement %</th><th>Status</th><th>Variance</th>';
        tableRows = data.map(row => `
          <tr>
            <td>${row.date}</td>
            <td><strong>${row.line}</strong></td>
            <td>${row.actual}</td>
            <td>${row.target}</td>
            <td>${row.achievement}%</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
            <td class="${row.variance >= 0 ? 'positive' : 'negative'}">${row.variance >= 0 ? '+' : ''}${row.variance}</td>
          </tr>
        `).join('');
        break;

      case 'Defect Rate':
        tableHeaders = '<th>Date</th><th>Worker ID</th><th>Worker Name</th><th>Line</th><th>Defect Type</th><th>Defects</th><th>Achievement %</th><th>Status</th><th>Variance</th>';
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
            <td class="${row.variance >= 0 ? 'positive' : 'negative'}">${row.variance >= 0 ? '+' : ''}${row.variance}</td>
          </tr>
        `).join('');
        break;

      case 'Productivity':
        tableHeaders = '<th>Date</th><th>Line</th><th>Actual</th><th>Target</th><th>Achievement %</th><th>Status</th><th>Variance</th>';
        tableRows = data.map(row => `
          <tr>
            <td>${row.date}</td>
            <td><strong>${row.line}</strong></td>
            <td>${row.actual}</td>
            <td>${row.target}</td>
            <td>${row.achievement}%</td>
            <td class="status-${row.status.toLowerCase()}">${row.status}</td>
            <td class="${row.variance >= 0 ? 'positive' : 'negative'}">${row.variance >= 0 ? '+' : ''}${row.variance}</td>
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
    .positive { color: #059669; font-weight: bold; }
    .negative { color: #dc2626; font-weight: bold; }
    .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${selectedReport}</h1>
    <p><strong>Period:</strong> ${selectedPeriod}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Filter:</strong> ${filterStatus} | <strong>Sort By:</strong> ${sortBy} (${sortOrder})</p>
  </div>
  <table>
    <thead><tr>${tableHeaders}</tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">
    <p>This report was automatically generated by the Report Analytics System</p>
    <p>&copy; ${new Date().getFullYear()} - All Rights Reserved</p>
  </div>
  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="padding: 10px 20px; background-color: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">Print Report</button>
    <button onclick="downloadPDF()" style="padding: 10px 20px; background-color: #059669; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-right: 10px;">Download as PDF</button>
    <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">Close</button>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
  <script>
    function downloadPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'pt', 'a4');
      
      document.querySelector('.no-print').style.display = 'none';
      
      html2canvas(document.body, {
        scale: 2,
        useCORS: true,
        logging: false
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 595.28;
        const pageHeight = 841.89;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        doc.save('${selectedReport.replace(/\s+/g, '_')}_${selectedPeriod}_Report.pdf');
        
        document.querySelector('.no-print').style.display = 'block';
      });
    }
  </script>
</body>
</html>`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Average':
        return 'bg-yellow-100 text-yellow-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderTableHeaders = () => {
    switch(selectedReport) {
      case 'Employee Efficiency':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Worker ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Worker Name</th>
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
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Actual</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Target</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Variance</th>
          </>
        );
      case 'Defect Rate':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Worker ID</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Worker Name</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Defect Type</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Defects</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Variance</th>
          </>
        );
      case 'Productivity':
        return (
          <>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Line</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Actual</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Target</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Variance</th>
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
            <td className="px-6 py-4 text-gray-700">{row.date}</td>
            <td className="px-6 py-4 font-medium text-gray-800">{row.line}</td>
            <td className="px-6 py-4 text-gray-700">{row.actual}</td>
            <td className="px-6 py-4 text-gray-700">{row.target}</td>
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
            <td className="px-6 py-4">
              <span className={`font-medium ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {row.variance >= 0 ? '+' : ''}{row.variance}
              </span>
            </td>
          </tr>
        );
      case 'Productivity':
        return (
          <tr key={index} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 text-gray-700">{row.date}</td>
            <td className="px-6 py-4 font-medium text-gray-800">{row.line}</td>
            <td className="px-6 py-4 text-gray-700">{row.actual}</td>
            <td className="px-6 py-4 text-gray-700">{row.target}</td>
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
      default:
        return null;
    }
  };

  if (showDashboard) {
    const data = getCurrentData();

    return (
      <div className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">{selectedReport}</h2>
                <p className="text-gray-600 mt-1">Comprehensive analysis and detailed insights</p>
              </div>
              <button 
                onClick={() => setShowDashboard(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              {/* Period Selection */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {['Today', 'Weekly', 'Monthly', 'Annually'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {period}
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

                {/* Download and Print */}
                <button 
                  onClick={downloadReport}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <Download size={16} />
                  DOWNLOAD PDF
                </button>
                <button 
                  onClick={printReport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                >
                  <FileText size={16} />
                  PRINT
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    {renderTableHeaders()}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.length > 0 ? (
                    data.map((row, index) => renderTableRow(row, index))
                  ) : (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No data available for the selected filters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Analytics</h3>
        <p className="text-gray-600 mb-6">Generate comprehensive reports and analytics</p>
        
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
    </div>
  );
};

export default ReportAnalytics;