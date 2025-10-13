import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { TrendingUp } from "lucide-react"; // 📈 Efficiency icon

// Connect to the socket server (ensure the URL is correct for your setup)
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const EfficiencyRate = () => {
  const [efficiency, setEfficiency] = useState(0);

  // This function fetches the defect rate from the new backend endpoint 
  // and calculates the overall efficiency.
  const fetchEfficiencyRate = async () => {
    try {
      // The endpoint is updated to call the new /defect-rate route.
      // Make sure the URL matches your server's host and the prefix for your iot routes.
      const { data } = await axios.get("http://localhost:8001/api/iot/defect-rate");

      if (data && data.defectRate) {
        // The API returns the defectRate as a string (e.g., "5.25%").
        // We parse the floating-point number from this string.
        const defectPercentage = parseFloat(data.defectRate);
        
        // Efficiency is calculated as 100% minus the defect rate.
        const efficiencyPercentage = 100 - defectPercentage;
        
        // We ensure the efficiency is not negative and format it to 2 decimal places.
        setEfficiency(Math.max(0, efficiencyPercentage).toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching efficiency rate:", error);
    }
  };

  useEffect(() => {
    // Fetch the initial efficiency rate when the component mounts.
    fetchEfficiencyRate();

    // Listen for the 'defectUpdate' event from the server.
    // When a defect is added or updated, we'll refetch the rate
    // to keep the display updated in real-time.
    socket.on("defectUpdate", fetchEfficiencyRate);

    // Clean up the socket listener when the component unmounts.
    return () => {
      socket.off("defectUpdate", fetchEfficiencyRate);
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-full">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Overall Efficiency</h3>
          <p className="text-2xl font-bold text-green-600">{efficiency}%</p>
        </div>

        {/* Right side (icon) */}
        <TrendingUp className="w-12 h-12 text-green-600 bg-green-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default EfficiencyRate;
