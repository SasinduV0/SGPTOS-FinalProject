import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

function DefectRate() {
  const [defectRate, setDefectRate] = useState("0.00%");
  const [loading, setLoading] = useState(true);

  // Fetch defect rate data from backend
  const fetchDefectRate = async () => {
    try {
      const response = await axios.get("http://localhost:8001/api/iot/defect-rate");
      setDefectRate(response.data.defectRate);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching defect rate:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefectRate();
  }, []);

  useEffect(() => {
    socket.on("leadingLineUpdate", fetchDefectRate);
    socket.on("supervisorUpdate", fetchDefectRate);

    return () => {
      socket.off("leadingLineUpdate");
      socket.off("supervisorUpdate");
    };
  }, []);

  if (loading) {
    return (
      <p className="text-gray-500 text-center">Loading defect rate...</p>
    );
  }

  return (

    <div className="flex mt-5 ml-4 gap-2">
        <h3 className="text-gray-300 font-semibold text-sm">Defect Rate</h3>
        <p className="text-sm font-bold text-white">{defectRate}%</p>
        <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>

    // <p className="text-sm font-bold text-gray-800">
    //   Defect Rate: {defectRate}
    // </p>
  );
}

export default DefectRate;
