import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8000", { transports: ["websocket"] });

const LineTargetChart = () => {
  const [lineData, setLineData] = useState([]);

  // Static targets given by supervisor
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

  // Fetch data initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/employees");
        calculateLinePercentages(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      calculateLinePercentages(updatedEmployees);
    });

    return () => {
      socket.off("leadingLineUpdate");
    };
  }, []);

  // Calculate percentage per line
  const calculateLinePercentages = (employees) => {
    const lineTotals = employees.reduce((acc, emp) => {
      acc[emp.line] = (acc[emp.line] || 0) + Number(emp.pcs || 0);
      return acc;
    }, {});

    const chartData = Object.keys(lineTargets).map((line) => {
      const total = lineTotals[line] || 0;
      const percentage = ((total / lineTargets[line]) * 100).toFixed(2);
      return { name: `Line ${line.padStart(2, "0")}`, percentage: Number(percentage) };
    });

    setLineData(chartData);
  };

  return (
    <div className=" bg-gray-400 rounded-2xl w-[420px] pr-2 mr-4 pb-6">
      <h2 className="text-center text-white font-bold text-xl mb-4">
        Line wise Target
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={lineData}>
          <XAxis dataKey="name" tick={{ fill: "#0a0a0a" }} />
          <YAxis tick={{ fill: "#0a0a0a" }} />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none" }} />
          <Bar dataKey="percentage" fill="#4f46e5" radius={[5, 5, 0, 0]}>
            {lineData.map((entry, index) => (
              <Cell key={`cell-${index}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineTargetChart;
