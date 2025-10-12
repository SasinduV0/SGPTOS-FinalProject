import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import io from "socket.io-client";

ChartJS.register(ArcElement, Tooltip, Legend);

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

function DefectRateChart() {
  const [defectData, setDefectData] = useState({
    defects: 0,
    total: 0,
    defectRate: "0.00%"
  });
  const [loading, setLoading] = useState(true);

  // Fetch defect rate data from backend
  const fetchDefectRate = async () => {
    try {
      const response = await axios.get("http://localhost:8001/api/iot/defect-rate");
      setDefectData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching defect rate:", error);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDefectRate();
  }, []);

  // Listen for real-time updates via Socket.IO
  useEffect(() => {
    // Listen for defect updates (when new defects are added)
    socket.on("defectUpdate", () => {
      console.log("📊 DefectRateChart received defect update");
      fetchDefectRate();
    });

    // Listen for employee updates (affects total production)
    socket.on("leadingLineUpdate", () => {
      console.log("📊 DefectRateChart received employee update");
      fetchDefectRate();
    });

    // Listen for supervisor updates (might affect data)
    socket.on("supervisorUpdate", () => {
      console.log("📊 DefectRateChart received supervisor update");
      fetchDefectRate();
    });

    // Cleanup
    return () => {
      socket.off("defectUpdate");
      socket.off("leadingLineUpdate");
      socket.off("supervisorUpdate");
    };
  }, []);

  // Safe parsing of defect rate
  const defectRateNumber = parseFloat((defectData.defectRate || "0%").replace('%', ''));

  // Get message & color based on defect rate
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

  // Safer data structure for chart
  const data = {
    labels: ["Defects", "Good"],
    datasets: [
      {
        data: [
          defectRateNumber, 
          Math.max(0, 100 - defectRateNumber) // Ensure no negative values
        ],
        backgroundColor: [
          defectRateNumber > 10 ? "#DC2626" : // Red for high defects
          defectRateNumber > 5 ? "#F59E0B" :  // Orange for medium defects
          "#EF4444", // Light red for low defects
          "#696969"  // Green for good parts
        ],
        borderColor: ["#FFFFFF", "#FFFFFF"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

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
      duration: 1000
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-white px-8 rounded-2xl w-[500px] h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading defect data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-white px-8 rounded-2xl gap-4 w-[500px]">
      <div className="relative w-[200px] h-[200px] flex">
        <Doughnut data={data} options={options} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-lg font-bold text-gray-800">{defectData.defectRate}</p>
          <p className="text-xs text-gray-500">Defect Rate</p>
        </div>
      </div>
      <div className="flex flex-col">
        <p className={`text-center text-lg font-semibold ${color} mb-2`}>
          {text}
        </p>
        <div className="space-y-2 text-center">
          <p className="text-lg text-gray-600">
            <span className="font-medium">Total:</span> {defectData.total.toLocaleString()} pcs
          </p>
          <p className="text-lg text-red-600">
            <span className="font-medium">Defects:</span> {defectData.defects.toLocaleString()} pcs
          </p>
          <p className="text-sm text-gray-500">
            Good: {(defectData.total - defectData.defects).toLocaleString()} pcs ({(100 - defectRateNumber).toFixed(2)}%)
          </p>
        </div>
      </div>
    </div>
  );
}

export default DefectRateChart;
