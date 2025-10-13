import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const StatsCard = ({ title, value, unit, bgColor }) => (
  <div className={`flex gap-6 justify-between items-center p-6 rounded-2xl shadow-md ${bgColor}`}>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-lg font-semibold text-black">
      {value}
      {unit && <span className="text-base ml-1">{unit}</span>}
    </p>
  </div>
);

const DashboardSummary = () => {
  const [summary, setSummary] = useState({
    totalProduction: 0,
    efficiencyRate: 0,
    activeWorkers: 0,
    defectRate: 0,
  });
  const [socket, setSocket] = useState(null);

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      console.log("🔄 Fetching dashboard summary...");
      const { data } = await axios.get("http://localhost:8001/api/summary");
      setSummary(prev => ({ ...prev, ...data }));
      console.log("📊 Summary data updated:", data);
    } catch (err) {
      console.error("❌ Error fetching summary:", err);
    }
  };

  // Fetch defect rate data
  const fetchDefectRate = async () => {
    try {
      console.log("🔄 Fetching defect rate for dashboard...");
      const { data } = await axios.get("http://localhost:8001/api/iot/defect-rate");
      setSummary(prev => ({ ...prev, defectRate: data.defectRate }));
      console.log("📊 Defect rate updated:", data.defectRate);
    } catch (err) {
      console.error("❌ Error fetching defect rate:", err);
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchSummary();
    fetchDefectRate();

    // Create Socket.IO connection for real-time updates
    const newSocket = io("http://localhost:8001", { 
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("🔌 DashboardSummary Socket.IO connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ DashboardSummary Socket.IO disconnected");
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔌 DashboardSummary Socket connection error:", error);
    });

    // Event handler functions for real-time updates
    const handleDefectUpdate = (data) => {
      console.log("📊 DashboardSummary received defect update:", data);
      fetchDefectRate(); // Update defect rate when new defects are added
    };

    const handleEmployeeUpdate = (data) => {
      console.log("📊 DashboardSummary received employee update:", data);
      fetchSummary(); // Update summary when employee data changes
      fetchDefectRate(); // Also update defect rate as it may affect calculations
    };

    const handleSupervisorUpdate = (data) => {
      console.log("📊 DashboardSummary received supervisor update:", data);
      fetchSummary(); // Update summary for any supervisor changes
    };

    // Listen for real-time updates
    newSocket.on("defectUpdate", handleDefectUpdate);
    newSocket.on("leadingLineUpdate", handleEmployeeUpdate);
    newSocket.on("supervisorUpdate", handleSupervisorUpdate);

    setSocket(newSocket);

    // Cleanup function
    return () => {
      console.log("🧹 DashboardSummary cleaning up socket connections");
      newSocket.off("defectUpdate", handleDefectUpdate);
      newSocket.off("leadingLineUpdate", handleEmployeeUpdate);
      newSocket.off("supervisorUpdate", handleSupervisorUpdate);
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 my-8">
      <StatsCard 
        title="Total Production" 
        value={summary.totalProduction} 
        unit="pcs" 
        bgColor="bg-blue-100"
      />
      <StatsCard 
        title="Efficiency Rate" 
        value={summary.efficiencyRate} 
        unit="%" 
        bgColor="bg-green-100" 
      />
      <StatsCard 
        title="Active Workers" 
        value={summary.activeWorkers} 
        bgColor="bg-yellow-100" 
      />
      <StatsCard 
        title="Defect Rate" 
        value={summary.defectRate} 
        unit="%" 
        bgColor="bg-red-100" 
      />
    </div>
  );
};

export default DashboardSummary;
