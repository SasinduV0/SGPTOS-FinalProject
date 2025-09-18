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
    // Listen for employee updates (affects total production)
    socket.on("leadingLineUpdate", () => {
      fetchDefectRate();
    });

    // Listen for supervisor updates (might affect data)
    socket.on("supervisorUpdate", () => {
      fetchDefectRate();
    });

    // Cleanup
    return () => {
      socket.off("leadingLineUpdate");
      socket.off("supervisorUpdate");
    };
  }, []);

  const defectRateNumber = parseFloat(defectData.defectRate.replace('%', ''));

  // Get message & color based on defect rate
  const getDefectMessage = (rate) => {
    if (rate <= 5)
      return { text: "Excellent quality minimal defects!", color: "text-gray-900" };
    if (rate <= 10)
      return { text: "Quality is acceptable, but keep monitoring.", color: "text-yellow-600" };
    if (rate <= 20)
      return { text: "Defects count is higher than expected.", color: "text-orange-600" };
    return { text: "Critical! Immediate action required to reduce defects.", color: "text-red-600" };
  };

  const { text, color } = getDefectMessage(defectRateNumber);

  const data = {
    labels: ["Defects", "Good"],
    datasets: [
      {
        data: [defectRateNumber, 100 - defectRateNumber],
        backgroundColor: ["#8B0000", "#A9A9A9"], // red for defects, gray for good
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    maintainAspectRatio: false,
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
        <p className={`text-center text-xl font-semibold ${color}`}>
          {text}
        </p>
        <div className="mt-3 text-center">
          <p className="text-md text-gray-600">
            <span className="font-medium">Total :</span> {defectData.total} pcs
          </p>
          <p className="text-xl text-red-600">
            <span className="font-medium">Defects:</span> {defectData.defects} pcs
          </p>
        </div>
      </div>
    </div>
  );
}

export default DefectRateChart;
