import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import io from "socket.io-client";

ChartJS.register(ArcElement, Tooltip, Legend);

// Socket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const ProductivityIncrease = () => {
  const [completed, setCompleted] = useState(0); // % present
  const [absentWorkers, setAbsentWorkers] = useState(0);
  const [shiftEnd, setShiftEnd] = useState("14:30");
  const [loading, setLoading] = useState(true);

  // --- Initial assigned workers per line (1–8) ---
  // You can fetch this from DB too
  const initialAssigned = {
    1: 5,
    2: 10,
    3: 10,
    4: 12,
    5: 14,
    6: 11,
    7: 11,
    8: 13,
  };

  // Fetch initial employees (present workers) from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("http://localhost:8001/api/employees");
        const employees = await response.json();
        updateProductivity(employees);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Listen for live updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      console.log("📊 ProductivityIncrease received update:", updatedEmployees.length, "employees");
      updateProductivity(updatedEmployees);
    });
    return () => socket.off("leadingLineUpdate");
  }, []);

  // --- Productivity Calculation ---
  const updateProductivity = (employees) => {
    // Count present employees per line
    const presentByLine = employees.reduce((acc, emp) => {
      acc[emp.line] = (acc[emp.line] || 0) + 1;
      return acc;
    }, {});

    const totalAssigned = Object.values(initialAssigned).reduce(
      (sum, val) => sum + val,
      0
    );

    const totalPresent = Object.keys(initialAssigned).reduce((sum, line) => {
      return sum + (presentByLine[line] || 0);
    }, 0);

    const absent = totalAssigned - totalPresent;
    const percentage = totalAssigned
      ? ((totalPresent / totalAssigned) * 100).toFixed(2)
      : 0;

    setCompleted(percentage);
    setAbsentWorkers(absent);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // Chart.js data
  const data = {
    labels: ["Present", "Absent"],
    datasets: [
      {
        data: [completed, 100 - completed],
        backgroundColor: ["#ef4444", "#e5e7eb"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
  };

  return (
    <div className="bg-white rounded-lg  p-6 flex flex-col items-center">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Productivity Increase
      </h3>
      <div className="relative flex items-center justify-center w-52 h-52">
        <Doughnut data={data} options={options} />
        <div className="absolute text-center">
          <div className="text-lg font-bold">{completed}%</div>
        </div>
      </div>
      <div className="text-center mt-5">
        <div className="text-md text-red-500 ">{absentWorkers} Workers absent</div>
        <div className="text-md text-gray-600">Shift ends at {shiftEnd}</div>
      </div>
    </div>
  );
};

export default ProductivityIncrease;
