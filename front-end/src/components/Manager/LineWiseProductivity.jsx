import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const socket = io("http://localhost:8001", { transports: ["websocket"] });

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

const LineWiseProductivity = () => {
  const [chartData, setChartData] = useState([]);

  const calculateProductivity = (employees) => {
    // Group pcs by line
    const lineWiseProduction = {};
    employees.forEach((emp) => {
      if (emp.line && emp.pcs) {
        lineWiseProduction[emp.line] =
          (lineWiseProduction[emp.line] || 0) + emp.pcs;
      }
    });

    // Build chart data
    const data = Object.keys(lineTargets).map((line) => ({
      name: `Line ${line}`,
      target: lineTargets[line] / 10, // scale to 100
      production: (lineWiseProduction[line] || 0) / 10,
    }));

    setChartData(data);
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      const { data } = await axios.get("http://localhost:8001/api/employees");
      calculateProductivity(data);
    };
    fetchEmployees();

    socket.on("leadingLineUpdate", calculateProductivity);
    return () => socket.off("leadingLineUpdate", calculateProductivity);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Line wise Target
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} barGap={5}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} tick={{ fontSize: 14 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 14 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="target" fill="#60a5fa" name="Target" />
          <Bar dataKey="production" fill="#2563eb" name="Production" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineWiseProductivity;
