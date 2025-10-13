import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
import io from "socket.io-client";

ChartJS.register(ArcElement, Tooltip, Legend);


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

  // Setup Socket.IO inside the component and provide a polling fallback
  useEffect(() => {
    let socket;
    let pollId = null;

    const setupPolling = () => {
      if (pollId) return;
      pollId = setInterval(() => {
        fetchDefectRate();
      }, 10000); // poll every 10s when socket not available
      console.warn("⚠️ DefectRateChart polling enabled (10s)");
    };

    try {
      socket = io("http://localhost:8001", { transports: ["websocket"] });

      socket.on("connect", () => {
        console.log("� DefectRateChart socket connected", socket.id);
        // Immediately refresh when socket connects
        fetchDefectRate();
        // clear polling if it was running
        if (pollId) {
          clearInterval(pollId);
          pollId = null;
        }
      });

      // handle relevant server events
      const events = ["defectUpdate", "leadingLineUpdate", "supervisorUpdate"];
      events.forEach((ev) => socket.on(ev, () => {
        console.log(`📊 DefectRateChart received ${ev}`);
        fetchDefectRate();
      }));

      // If socket fails to connect within a short time, enable polling
      setTimeout(() => {
        if (!socket.connected) setupPolling();
      }, 3000);
    } catch (err) {
      console.error("DefectRateChart socket error:", err);
      setupPolling();
    }

    return () => {
      try {
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
      } catch (e) {
        // ignore cleanup errors
      }
      if (pollId) clearInterval(pollId);
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
      <div className="flex items-center justify-center bg-white px-8 rounded-2xl w-[400px] h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading defect data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-white  rounded-2xl gap-2 w-[440px]">
      <div className="relative w-[200px] h-[170px] flex mt-2">
        <Doughnut data={data} options={options} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-lg font-bold text-gray-800">{defectData.defectRate}</p>
          <p className="text-xs text-gray-500">Defect Rate</p>
        </div>
      </div>
      <div className="flex flex-col">
        <p className={`text-center text-md font-semibold ${color} mb-2`}>
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
