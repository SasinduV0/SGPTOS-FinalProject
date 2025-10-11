import React, { useState } from 'react';
import { X, Download, BarChart3, FileText } from 'lucide-react';
import { ManagerLinks } from '../../pages/Data/SidebarNavlinks';
import SideBar from '../../components/SideBar';

const ReportAnalytics = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  // Sample data for different report types and periods
  const reportData = {
    'Employee Efficiency': {
      Today: [
        { category: 'Line A', value: 16, percentage: 85, target: 20, status: 'Good' },
        { category: 'Line B', value: 45, percentage: 92, target: 50, status: 'Excellent' },
        { category: 'Line C', value: 37, percentage: 88, target: 42, status: 'Good' },
        { category: 'Line D', value: 7, percentage: 70, target: 10, status: 'Average' }
      ],
      Weekly: [
        { category: 'Line A', value: 120, percentage: 86, target: 140, status: 'Good' },
        { category: 'Line B', value: 300, percentage: 93, target: 320, status: 'Excellent' },
        { category: 'Line C', value: 250, percentage: 89, target: 280, status: 'Good' },
        { category: 'Line D', value: 80, percentage: 73, target: 110, status: 'Average' }
      ],
      Monthly: [
        { category: 'Line A', value: 480, percentage: 87, target: 550, status: 'Good' },
        { category: 'Line B', value: 1200, percentage: 94, target: 1280, status: 'Excellent' },
        { category: 'Line C', value: 1000, percentage: 89, target: 1120, status: 'Good' },
        { category: 'Line D', value: 320, percentage: 76, target: 420, status: 'Average' }
      ],
      Annually: [
        { category: 'Line A', value: 5760, percentage: 88, target: 6600, status: 'Good' },
        { category: 'Line B', value: 14400, percentage: 94, target: 15360, status: 'Excellent' },
        { category: 'Line C', value: 12000, percentage: 90, target: 13440, status: 'Good' },
        { category: 'Line D', value: 3840, percentage: 77, target: 5040, status: 'Average' }
      ]
    },
    'Line Efficiency': {
      Today: [
        { category: 'Line A', value: 25, percentage: 83, target: 30, status: 'Good' },
        { category: 'Line B', value: 35, percentage: 88, target: 40, status: 'Good' },
        { category: 'Line C', value: 42, percentage: 95, target: 44, status: 'Excellent' },
        { category: 'Line D', value: 18, percentage: 75, target: 24, status: 'Average' }
      ],
      Weekly: [
        { category: 'Line A', value: 175, percentage: 83, target: 210, status: 'Good' },
        { category: 'Line B', value: 245, percentage: 88, target: 280, status: 'Good' },
        { category: 'Line C', value: 294, percentage: 95, target: 308, status: 'Excellent' },
        { category: 'Line D', value: 126, percentage: 75, target: 168, status: 'Average' }
      ],
      Monthly: [
        { category: 'Line A', value: 700, percentage: 84, target: 840, status: 'Good' },
        { category: 'Line B', value: 980, percentage: 88, target: 1120, status: 'Good' },
        { category: 'Line C', value: 1176, percentage: 96, target: 1232, status: 'Excellent' },
        { category: 'Line D', value: 504, percentage: 75, target: 672, status: 'Average' }
      ],
      Annually: [
        { category: 'Line A', value: 8400, percentage: 84, target: 10080, status: 'Good' },
        { category: 'Line B', value: 11760, percentage: 88, target: 13440, status: 'Good' },
        { category: 'Line C', value: 14112, percentage: 96, target: 14784, status: 'Excellent' },
        { category: 'Line D', value: 6048, percentage: 75, target: 8064, status: 'Average' }
      ]
    },
    'Target Achievement': {
      Today: [
        { category: 'Line A', value: 30, percentage: 75, target: 40, status: 'Average' },
        { category: 'Line B', value: 40, percentage: 91, target: 44, status: 'Excellent' },
        { category: 'Line C', value: 25, percentage: 86, target: 29, status: 'Good' },
        { category: 'Line D', value: 15, percentage: 79, target: 19, status: 'Average' }
      ],
      Weekly: [
        { category: 'Line A', value: 210, percentage: 75, target: 280, status: 'Average' },
        { category: 'Line B', value: 280, percentage: 91, target: 308, status: 'Excellent' },
        { category: 'Line C', value: 175, percentage: 86, target: 203, status: 'Good' },
        { category: 'Line D', value: 105, percentage: 79, target: 133, status: 'Average' }
      ],
      Monthly: [
        { category: 'Line A', value: 840, percentage: 75, target: 1120, status: 'Average' },
        { category: 'Line B', value: 1120, percentage: 91, target: 1232, status: 'Excellent' },
        { category: 'Line C', value: 700, percentage: 86, target: 812, status: 'Good' },
        { category: 'Line D', value: 420, percentage: 79, target: 532, status: 'Average' }
      ],
      Annually: [
        { category: 'Line A', value: 10080, percentage: 75, target: 13440, status: 'Average' },
        { category: 'Line B', value: 13440, percentage: 91, target: 14784, status: 'Excellent' },
        { category: 'Line C', value: 8400, percentage: 86, target: 9744, status: 'Good' },
        { category: 'Line D', value: 5040, percentage: 79, target: 6384, status: 'Average' }
      ]
    },
    'Defect Rate': {
      Today: [
        { category: 'Line A', value: 5, percentage: 2.5, target: 3, status: 'Poor' },
        { category: 'Line B', value: 12, percentage: 3.2, target: 5, status: 'Poor' },
        { category: 'Line C', value: 8, percentage: 2.8, target: 4, status: 'Poor' },
        { category: 'Line D', value: 3, percentage: 1.8, target: 2, status: 'Good' }
      ],
      Weekly: [
        { category: 'Line A', value: 35, percentage: 2.5, target: 21, status: 'Poor' },
        { category: 'Line B', value: 84, percentage: 3.2, target: 35, status: 'Poor' },
        { category: 'Line C', value: 56, percentage: 2.8, target: 28, status: 'Poor' },
        { category: 'Line D', value: 21, percentage: 1.8, target: 14, status: 'Good' }
      ],
      Monthly: [
        { category: 'Line A', value: 140, percentage: 2.5, target: 84, status: 'Poor' },
        { category: 'Line B', value: 336, percentage: 3.2, target: 140, status: 'Poor' },
        { category: 'Line C', value: 224, percentage: 2.8, target: 112, status: 'Poor' },
        { category: 'Line D', value: 84, percentage: 1.8, target: 56, status: 'Good' }
      ],
      Annually: [
        { category: 'Line A', value: 1680, percentage: 2.5, target: 1008, status: 'Poor' },
        { category: 'Line B', value: 4032, percentage: 3.2, target: 1680, status: 'Poor' },
        { category: 'Line C', value: 2688, percentage: 2.8, target: 1344, status: 'Poor' },
        { category: 'Line D', value: 1008, percentage: 1.8, target: 672, status: 'Good' }
      ]
    },
    'Productivity': {
      Today: [
        { category: 'Line A', value: 28, percentage: 82, target: 34, status: 'Good' },
        { category: 'Line B', value: 52, percentage: 93, target: 56, status: 'Excellent' },
        { category: 'Line C', value: 34, percentage: 85, target: 40, status: 'Good' },
        { category: 'Line D', value: 16, percentage: 76, target: 21, status: 'Average' }
      ],
      Weekly: [
        { category: 'Line A', value: 196, percentage: 82, target: 238, status: 'Good' },
        { category: 'Line B', value: 364, percentage: 93, target: 392, status: 'Excellent' },
        { category: 'Line C', value: 238, percentage: 85, target: 280, status: 'Good' },
        { category: 'Line D', value: 112, percentage: 76, target: 147, status: 'Average' }
      ],
      Monthly: [
        { category: 'Line A', value: 784, percentage: 82, target: 952, status: 'Good' },
        { category: 'Line B', value: 1456, percentage: 93, target: 1568, status: 'Excellent' },
        { category: 'Line C', value: 952, percentage: 85, target: 1120, status: 'Good' },
        { category: 'Line D', value: 448, percentage: 76, target: 588, status: 'Average' }
      ],
      Annually: [
        { category: 'Line A', value: 9408, percentage: 82, target: 11424, status: 'Good' },
        { category: 'Line B', value: 17472, percentage: 93, target: 18816, status: 'Excellent' },
        { category: 'Line C', value: 11424, percentage: 85, target: 13440, status: 'Good' },
        { category: 'Line D', value: 5376, percentage: 76, target: 7056, status: 'Average' }
      ]
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
  const generateReport = () => {
    if (!selectedReport) return;
    setShowPopup(false);
    setShowDashboard(true);
  };
  const generatePDFContent = () => {
    const data = getCurrentData();
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const totalTarget = data.reduce((sum, item) => sum + item.target, 0);
    const avgPercentage = (data.reduce((sum, item) => sum + item.percentage, 0) / data.length).toFixed(1);

    return `

<!DOCTYPE html>
<html>
<head>
<title>${selectedReport} - ${selectedPeriod} Report</title>
<style>
body {
font-family: Arial, sans-serif;
padding: 40px;
color: #333;
}
.header {
text-align: center;
margin-bottom: 30px;
border-bottom: 3px solid #1f2937;
padding-bottom: 20px;
}
.header h1 {
color: #1f2937;
margin: 0 0 10px 0;
}
.header p {
color: #6b7280;
margin: 5px 0;
}
.summary {
display: flex;
justify-content: space-around;
margin: 30px 0;
padding: 20px;
background-color: #f3f4f6;
border-radius: 8px;
}
.summary-item {
text-align: center;
}
.summary-item h3 {
color: #6b7280;
font-size: 14px;
margin: 0 0 5px 0;
}
.summary-item p {
color: #1f2937;
font-size: 24px;
font-weight: bold;
margin: 0;
}
table {
width: 100%;
border-collapse: collapse;
margin-top: 20px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
thead {
background-color: #1f2937;
color: white;
}
th {
padding: 12px;
text-align: left;
font-weight: 600;
}
td {
padding: 12px;
border-bottom: 1px solid #e5e7eb;
}
tbody tr:hover {
background-color: #f9fafb;
}
tfoot {
background-color: #f3f4f6;
font-weight: bold;
}
.status-excellent { color: #059669; }
.status-good { color: #2563eb; }
.status-average { color: #d97706; }
.status-poor { color: #dc2626; }
.positive { color: #059669; }
.negative { color: #dc2626; }
.footer {
margin-top: 40px;
text-align: center;
color: #6b7280;
font-size: 12px;
border-top: 1px solid #e5e7eb;
padding-top: 20px;
}
@media print {
body { padding: 20px; }
.no-print { display: none; }
}
</style>
</head>
<body>
<div class="header">
<h1>${selectedReport}</h1>
<p><strong>Period:</strong> ${selectedPeriod}</p>
<p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
</div>
<div class="summary">
<div class="summary-item">
<h3>Total Value</h3>
<p>${totalValue}</p>
</div>
<div class="summary-item">
<h3>Total Target</h3>
<p>${totalTarget}</p>
</div>
<div class="summary-item">
<h3>Average Performance</h3>
<p>${avgPercentage}%</p>
</div>
<div class="summary-item">
<h3>Total Lines</h3>
<p>${data.length}</p>
</div>
</div>
<table>
<thead>
<tr>
<th>Category</th>
<th>Actual Value</th>
<th>Target Value</th>
<th>Achievement %</th>
<th>Status</th>
<th>Variance</th>
</tr>
</thead>
<tbody>
${data.map(row => {
const variance = row.value - row.target;
const variancePercent = ((variance / row.target) * 100).toFixed(1);
const statusClass = `status-${row.status.toLowerCase()}`;
const varianceClass = variance >= 0 ? 'positive' : 'negative';

return `
<tr>
<td><strong>${row.category}</strong></td>
<td>${row.value}</td>
<td>${row.target}</td>
<td>${row.percentage}%</td>
<td class="${statusClass}">${row.status}</td>
<td class="${varianceClass}">${variance >= 0 ? '+' : ''}${variance} (${variancePercent}%)</td>
</tr>
`;
}).join('')}
</tbody>
<tfoot>
<tr>
<td>Total</td>
<td>${totalValue}</td>
<td>${totalTarget}</td>
<td>${avgPercentage}%</td>
<td>-</td>
<td class="${totalValue >= totalTarget ? 'positive' : 'negative'}">${totalValue - totalTarget}</td>
</tr>
</tfoot>
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

// Hide buttons before capturing
document.querySelector('.no-print').style.display = 'none';

html2canvas(document.body, {
scale: 2,
useCORS: true,
logging: false
}).then(canvas => {
const imgData = canvas.toDataURL('image/png');
const imgWidth = 595.28; // A4 width in points
const pageHeight = 841.89; // A4 height in points
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

// Show buttons again
document.querySelector('.no-print').style.display = 'block';
});
}
</script>
</body>
</html>
`;
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

  return (
    <div className="flex bg-gray-50 min-h-screen ml-70 mt-25">
      {/* Sidebar is now correctly placed as a main layout component */}
      <SideBar title="Manager Panel" links={ManagerLinks} />

      {/* Main content area that will display either the dashboard or the initial view */}
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto">
          {showDashboard ? (
            // --- REPORT DASHBOARD VIEW ---
            <div>
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
                <div className="flex justify-between items-center">
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
                  <div className="flex gap-3">
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
                      PRINT REPORT
                    </button>
                  </div>
                </div>
              </div>
              {/* Summary Cards and Data Table... */}
              {(() => {
                const data = getCurrentData();
                const totalValue = data.reduce((sum, item) => sum + item.value, 0);
                const avgPercentage = (data.reduce((sum, item) => sum + item.percentage, 0) / data.length).toFixed(1);
                return (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm">Total Value</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{totalValue}</p>
                          </div>
                          <div className="bg-blue-100 p-3 rounded-full">
                            <FileText className="text-blue-600" size={24} />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm">Average Performance</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{avgPercentage}%</p>
                          </div>
                          <div className="bg-green-100 p-3 rounded-full">
                            <BarChart3 className="text-green-600" size={24} />
                          </div>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm">Total Lines</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{data.length}</p>
                          </div>
                          <div className="bg-purple-100 p-3 rounded-full">
                            <span className="text-2xl">🏭</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Data Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-800 text-white">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Category</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Actual Value</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Target Value</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Achievement %</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold">Variance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {data.map((row, index) => {
                              const variance = row.value - row.target;
                              const variancePercent = ((variance / row.target) * 100).toFixed(1);
                              return (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-6 py-4"><div className="font-medium text-gray-800">{row.category}</div></td>
                                  <td className="px-6 py-4"><div className="text-gray-800 font-semibold">{row.value}</div></td>
                                  <td className="px-6 py-4"><div className="text-gray-600">{row.target}</div></td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className={`h-2 rounded-full ${row.percentage >= 90 ? 'bg-green-500' : row.percentage >= 75 ? 'bg-blue-500' : row.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(row.percentage, 100)}%` }} />
                                      </div>
                                      <span className="font-medium text-gray-700">{row.percentage}%</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>{row.status}</span></td>
                                  <td className="px-6 py-4"><div className={`font-medium ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{variance >= 0 ? '+' : ''}{variance} ({variancePercent}%)</div></td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot className="bg-gray-50 font-semibold">
                            <tr>
                              <td className="px-6 py-4 text-gray-800">Total</td>
                              <td className="px-6 py-4 text-gray-800">{totalValue}</td>
                              <td className="px-6 py-4 text-gray-600">{data.reduce((sum, item) => sum + item.target, 0)}</td>
                              <td className="px-6 py-4 text-gray-700">{avgPercentage}%</td>
                              <td className="px-6 py-4"></td>
                              <td className="px-6 py-4 text-gray-700">{totalValue - data.reduce((sum, item) => sum + item.target, 0)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          ) : (
            // --- INITIAL VIEW (GENERATE REPORT BUTTON) ---
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
                      <button onClick={() => setShowPopup(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {reportOptions.map((option) => (
                          <div
                            key={option.name}
                            onClick={() => setSelectedReport(option.name)}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedReport === option.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
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
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedReport ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                      >
                        Generate Report
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