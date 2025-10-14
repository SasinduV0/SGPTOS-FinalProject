import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { AlertCircle } from "lucide-react"; // Changed icon to AlertCircle for defects

// Connect to the socket server
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const TotalDefectTypes = () => {
  const [totalDefects, setTotalDefects] = useState(0);

  // This function fetches the actual count of defects saved in the database
  const fetchDefectCount = async () => {
    try {
      // Fetch all garment defects from the database
      const { data } = await axios.get("http://localhost:8001/api/iot/defects");
      
      // Count total individual defects across all garments
      let count = 0;
      if (Array.isArray(data)) {
        data.forEach(garment => {
          if (garment.Defects && Array.isArray(garment.Defects)) {
            count += garment.Defects.length;
          }
        });
      }
      
      setTotalDefects(count);
    } catch (error) {
      console.error("Error fetching defect count:", error);
      setTotalDefects(0);
    }
  };

  useEffect(() => {
    // Fetch the initial defect count when the component mounts
    fetchDefectCount();

    // Set up polling every 5 seconds for real-time updates
    const pollInterval = setInterval(fetchDefectCount, 5000);

    // Listen for defect updates from the server via Socket.IO
    socket.on("defectUpdate", fetchDefectCount);

    // Clean up on unmount
    return () => {
      clearInterval(pollInterval);
      socket.off("defectUpdate", fetchDefectCount);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl shadow w-82">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Total Defects</h3>
          <p className="text-2xl font-bold text-red-600">{totalDefects}</p>
        </div>
        
        {/* Right side (icon) */}
        <AlertCircle className="w-12 h-12 text-red-600 bg-red-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
  );
};

export default TotalDefectTypes;

