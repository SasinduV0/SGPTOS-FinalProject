import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import {Target } from 'lucide-react';

// Socket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const RemainingTarget = () => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Define line targets
  const lineTargets = {
    1: 1000,
    2: 800,
    3: 900,
    4: 1100,
    5: 950,
    6: 1050,
    7: 700,
    8: 850,
  };

  // Fetch initial data from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/employees");
        const data = await response.json();
        updateChartData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      updateChartData(updatedEmployees);
    });
    return () => socket.off("leadingLineUpdate");
  }, []);

  // Aggregate data per line
  const updateChartData = (employees) => {
    const lineTotals = employees.reduce((acc, emp) => {
      acc[emp.line] = (acc[emp.line] || 0) + Number(emp.pcs || 0);
      return acc;
    }, {});

    const aggregated = Object.keys(lineTargets).map((line) => {
      const total = lineTotals[line] || 0;
      return { name: line, totalPcs: total };
    });

    setLineData(aggregated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // Compute totals
  const totalCompleted = lineData.reduce((sum, line) => sum + line.totalPcs, 0);
  const totalTarget = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);
  const remainingTarget = totalTarget - totalCompleted;

  return (
    <>
    <div className="bg-white p-4 rounded-2xl shadow w-full">
      <div className="flex items-center justify-between">
        {/* Left side (text) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Remaining Target</h3>
          <p className="text-2xl font-bold text-red-600">{remainingTarget} Pcs</p>
        </div>

        {/* Right side (icon) */}
        <Target className="w-12 h-12 text-red-600 bg-red-200 p-2 rounded-full opacity-80" />
      </div>
    </div>
</>
  );
};

export default RemainingTarget;
