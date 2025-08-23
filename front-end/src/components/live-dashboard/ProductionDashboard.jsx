import React, { useEffect, useRef } from 'react';
import * as Chart from 'chart.js';

const ProductionDashboard = () => {
  const donutChartRef = useRef(null);
  const barChartRef = useRef(null);
  const donutChartInstance = useRef(null);
  const barChartInstance = useRef(null);

  // Register Chart.js components
  useEffect(() => {
    Chart.Chart.register(
      Chart.CategoryScale,
      Chart.LinearScale,
      Chart.BarElement,
      Chart.ArcElement,
      Chart.Title,
      Chart.Tooltip,
      Chart.Legend
    );
  }, []);

  useEffect(() => {
    // Destroy existing charts
    if (donutChartInstance.current) {
      donutChartInstance.current.destroy();
    }
    if (barChartInstance.current) {
      barChartInstance.current.destroy();
    }

    // Donut Chart Configuration
    const donutCtx = donutChartRef.current.getContext('2d');
    donutChartInstance.current = new Chart.Chart(donutCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [68.04, 31.96],
          backgroundColor: ['#4F46E5', '#E5E7EB'],
          borderWidth: 0,
          cutout: '70%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      }
    });

    // Bar Chart Configuration
    const barCtx = barChartRef.current.getContext('2d');
    barChartInstance.current = new Chart.Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Line 01', 'Line 02', 'Line 03', 'Line 04', 'Line 05', 'Line 06', 'Line 07', 'Line 08', 'Line 09'],
        datasets: [{
          data: [47.06, 62.25, 84.31, 100, 66.67, 55.17, 35.48, 76.56, 60.19],
          backgroundColor: '#4F46E5',
          borderRadius: 4,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          y: {
            display: false,
            beginAtZero: true,
            max: 100
          },
          x: {
            display: true,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12
              },
              color: '#6B7280'
            }
          }
        },
        elements: {
          bar: {
            borderWidth: 0,
          }
        }
      },
      plugins: [{
        id: 'datalabels',
        afterDatasetsDraw: (chart) => {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((dataset, i) => {
            const meta = chart.getDatasetMeta(i);
            meta.data.forEach((bar, index) => {
              const data = dataset.data[index];
              ctx.fillStyle = '#FFFFFF';
              ctx.font = 'bold 10px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(data + '%', bar.x, bar.y);
            });
          });
        }
      }]
    });

    return () => {
      if (donutChartInstance.current) {
        donutChartInstance.current.destroy();
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="max-w-md mx-auto bg-white  rounded-lg overflow-hidden">
      {/* Overall Target Section */}
      <div className="p-6 text-center border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overall Target</h2>
        
        <div className="relative w-48 h-48 mx-auto mb-4">
          <canvas ref={donutChartRef}></canvas>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-gray-700">68.04%</div>
            <div className="text-sm text-indigo-600 font-medium">347 Pcs</div>
          </div>
        </div>
        
        <div className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">
          Time remaining<br />4hr 23min
        </div>
      </div>

      {/* Line wise Target Section */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Line wise Target</h3>
        <div className="">
          <canvas ref={barChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};

export default ProductionDashboard;