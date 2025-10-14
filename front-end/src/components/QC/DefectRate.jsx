import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { AlertTriangle } from "lucide-react"; // ⚠️ Icon for defects

// Connect to the socket server
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const DefectRate = () => {
  const [defectRate, setDefectRate] = useState("0.00");

  // This function fetches both production and defect counts to calculate the rate
  const fetchAndCalculateRate = async () => {
    try {
      // 1. Fetch total production count
      const productionResponse = await axios.get("http://localhost:8001/api/iot/scan-count");
      const totalProduction = productionResponse.data?.count || 0;

      // 2. Fetch total defect count
      const defectResponse = await axios.get("http://localhost:8001/api/defect-stats");
      const totalDefects = defectResponse.data?.totalGarmentsWithDefects || 0;

      // 3. Calculate the defect rate, avoiding division by zero
      let calculatedRate = "0.00";
      if (totalProduction > 0) {
        calculatedRate = ((totalDefects / totalProduction) * 100).toFixed(2);
      }

      setDefectRate(calculatedRate);

    } catch (error) {
      console.error("Error fetching data for defect rate calculation:", error);
    }
  };

  useEffect(() => {
    // Fetch initial data when the component mounts
    fetchAndCalculateRate();

    // Listen for the 'defectUpdate' event from the server.
    // When a defect is added, we refetch both counts to get the latest rate.
    socket.on("defectUpdate", fetchAndCalculateRate);

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("defectUpdate", fetchAndCalculateRate);
    };
  }, []); // Empty array ensures this effect runs only on mount and unmount

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-82">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Defect Rate</h3>
          <p className="text-2xl font-bold text-red-600">{defectRate}%</p>
        </div>
        
        {/* Right side (icon) */}
        <AlertTriangle className="w-12 h-12 text-red-600 bg-red-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default DefectRate;