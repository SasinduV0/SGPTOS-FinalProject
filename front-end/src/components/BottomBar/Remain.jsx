import React, { useEffect, useState } from "react";
import io from "socket.io-client";

// Socket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const Remain = () => {
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
    <div className="flex mt-5 ml-4 gap-2">
      <h2 className=" text-gray-300 font-semibold text-sm"> Remaining Target </h2>
      <p className="text-sm font-bold text-white">{remainingTarget} Pcs</p>
      <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>
  );
};

export default Remain;
