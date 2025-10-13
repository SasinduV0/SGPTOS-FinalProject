import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

function DefectRateQC() {
  const [defectData, setDefectData] = useState({
    defects: 0,
    total: 0,
    defectRate: "0.00%"
  });
  const [loading, setLoading] = useState(true);

  // This effect fetches data from two separate endpoints and calculates the defect rate.
  useEffect(() => {
    const fetchDefectData = async () => {
      try {
        // Fetch total production count and defect statistics concurrently.
        const [totalResponse, defectStatsResponse] = await Promise.all([
          axios.get("http://localhost:8001/api/iot/scan-count"),
          axios.get("http://localhost:8001/api/iot/defect-stats")
        ]);

        const total = totalResponse.data.count || 0;
        const defects = defectStatsResponse.data.totalGarmentsWithDefects || 0;
        
        // Calculate the defect rate on the client-side.
        const rate = total > 0 ? ((defects / total) * 100).toFixed(2) : 0;
        
        setDefectData({
          total,
          defects,
          defectRate: `${rate}%`
        });

      } catch (error) {
        console.error("❌ Error fetching defect data:", error);
        // In case of an error, we can choose to keep the last known state or reset it.
        // For now, we'll just log the error.
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch when the component mounts.
    fetchDefectData();

    // Set up a polling interval to refresh the data every 5 seconds.
    const intervalId = setInterval(fetchDefectData, 5000);

    // Clean up the interval on component unmount.
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  // Safe parsing of defect rate for chart calculations.
  const defectRateNumber = parseFloat((defectData.defectRate || "0%").replace('%', ''));

  // Get a descriptive message and color based on the current defect rate.
  const getDefectMessage = (rate) => {
    if (rate <= 2)
      return { text: "Excellent quality! Minimal defects detected.", color: "text-green-600" };
    if (rate <= 5)
      return { text: "Good quality. Keep monitoring defects.", color: "text-yellow-600" };
    if (rate <= 10)
      return { text: "Quality needs attention. Review processes.", color: "text-orange-600" };
    return { text: "Critical! Immediate action required to reduce defects.", color: "text-red-600" };
  };

  const { text, color } = getDefectMessage(defectRateNumber);

  // Data structure for the Doughnut chart.
  const data = {
    labels: ["Defects", "Good"],
    datasets: [
      {
        data: [
          defectRateNumber, 
          Math.max(0, 100 - defectRateNumber) // Ensure the "Good" part is not negative.
        ],
        backgroundColor: [
          defectRateNumber > 10 ? "#b91c1c" : // Dark Red for critical
          defectRateNumber > 5 ? "#d97706" :  // Amber for warning
          "#ef4444",                           // Lighter Red for acceptable
          "#e5e7eb"                           // Gray for good parts
        ],
        borderColor: ["#FFFFFF", "#FFFFFF"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Configuration options for the Doughnut chart.
  const options = {
    cutout: "70%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false }, 
      tooltip: { 
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value.toFixed(2)}%`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-white px-8 rounded-2xl w-[440px] h-[200px] shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading defect data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl p-4  w-[360px]">
      <div className="relative w-[170px] h-[170px]">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-bold text-gray-800">{defectData.defectRate}</p>
          <p className="text-xs text-gray-500">Defect Rate</p>
        </div>
      </div>
      <div className="flex-1 pl-4 mt-8">
        <p className={`text-sm font-semibold ${color} mb-3 text-center`}>
          {text}
        </p>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between text-gray-700">
            <span className="font-medium">Total Production:</span> <span className="font-bold">{defectData.total.toLocaleString()} pcs</span>
          </p>
          <p className="flex justify-between text-red-600">
            <span className="font-medium">Defective Items:</span> <span className="font-bold">{defectData.defects.toLocaleString()} pcs</span>
          </p>
          <p className="flex justify-between text-gray-600">
            <span className="font-medium">Good Items:</span> <span className="font-bold">{(defectData.total - defectData.defects).toLocaleString()} pcs ({(100 - defectRateNumber).toFixed(2)}%)</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default DefectRateQC;
