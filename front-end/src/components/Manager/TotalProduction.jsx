import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Package } from "lucide-react"; // 📦 Production icon

// Connect to the socket server (ensure the URL is correct for your setup)
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const TotalProduction = () => {
  const [totalProduction, setTotalProduction] = useState(0);

  // This function fetches the total production count from the new backend endpoint.
  const fetchProductionCount = async () => {
    try {
      // The endpoint is updated to call the new /scan-count route.
      // Make sure the URL matches your server's host and the prefix for your iot routes.
      const { data } = await axios.get("http://localhost:8001/api/iot/scan-count");
      if (data && typeof data.count === 'number') {
        setTotalProduction(data.count);
      }
    } catch (error) {
      console.error("Error fetching total production count:", error);
    }
  };

  useEffect(() => {
    // Fetch the initial production count when the component mounts.
    fetchProductionCount();

    // Listen for the 'defectUpdate' event from the server.
    // When a defect is added or updated, we'll refetch the production count
    // to keep the display updated in real-time.
    socket.on("defectUpdate", fetchProductionCount);

    // Clean up the socket listener when the component unmounts.
    return () => {
      socket.off("defectUpdate", fetchProductionCount);
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-full">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Total Production</h3>
          <p className="text-2xl font-bold text-indigo-600">{totalProduction} pcs</p>
        </div>

        {/* Right side (icon) */}
        <Package className="w-12 h-12 text-indigo-600 bg-violet-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default TotalProduction;
