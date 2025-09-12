import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import io from "socket.io-client";

ChartJS.register(ArcElement, Tooltip, Legend);

// Socket connection
const socket = io("http://localhost:8000", { transports: ["websocket"] });

const OverallTargetChart = () => {
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
        const response = await fetch("http://localhost:8000/api/employees");
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
      const percentage = Math.min(
        ((total / lineTargets[line]) * 100).toFixed(2),
        150
      );
      return { name: line, totalPcs: total, percentage: Number(percentage) };
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

  // Compute totals for doughnut
  const totalCompleted = lineData.reduce((sum, line) => sum + line.totalPcs, 0);
  const totalTarget = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);
  const completionPercentage = totalTarget
    ? ((totalCompleted / totalTarget) * 100).toFixed(2)
    : 0;

  // Chart data
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [completionPercentage, 100 - completionPercentage],
        backgroundColor: ["#3b82f6", "#f3f4f6"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  return (
    <div className="relative flex flex-col items-center bg-white rounded-2xl p-4 w-[280px]">
      <h2 className="text-center text-black font-bold text-2xl mb-4">
        Overall Target
      </h2>
      <Doughnut data={data} options={options} className="w-45" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <div className="text-xl font-bold text-black">{totalCompleted} Pcs</div>
        <div className="text-sm text-gray-700">{completionPercentage}%</div>
      </div>
    </div>
  );
};

export default OverallTargetChart;
