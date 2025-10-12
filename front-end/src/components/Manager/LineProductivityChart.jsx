import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid, // Added for a background grid
} from "recharts";
import io from "socket.io-client";
import axios from "axios";

// Backend connection remains unchanged
const socket = io("http://localhost:8001", {
  transports: ["websocket"],
  autoConnect: true,
  forceNew: true,
});

// A stylish, custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{`Date: ${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm font-medium">
            {`${p.name}: ${p.value.toLocaleString()} pcs`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// An improved loading spinner component
const ChartLoader = () => (
  <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-lg border border-gray-200/80 w-full max-w-4xl p-6">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-gray-600 text-lg font-medium mt-4">Loading Chart Data...</span>
  </div>
);

const LineProductivityChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const lines = [1, 2, 3, 4, 5, 6, 7, 8];
  
  // A more professional and harmonious color palette
  const lineColors = [
    "#3b82f6", "#10b981", "#f97316", "#ef4444",
    "#8b5cf6", "#ec4899", "#facc15", "#06b6d4"
  ];

  // Data fetching and processing logic remains the same
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/employees");
        processChartData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      processChartData(updatedEmployees);
    });
    return () => socket.off("leadingLineUpdate");
  }, []);

  const processChartData = (employees) => {
    const dateMap = {};
    employees.forEach((emp) => {
      const date = new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!dateMap[date]) dateMap[date] = {};
      dateMap[date][`Line ${emp.line}`] = (dateMap[date][`Line ${emp.line}`] || 0) + emp.pcs;
    });

    const processedData = Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        ...lines.reduce((acc, line) => {
          acc[`Line ${line}`] = dateMap[date][`Line ${line}`] || 0;
          return acc;
        }, {}),
      }));
    setChartData(processedData);
  };
  
  // Render the new loader while data is being fetched
  if (loading) {
    return <ChartLoader />;
  }

  return (
    // Enhanced container with shadow, border, and more padding
    <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 border border-gray-200/80">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Daily Productivity - Line Wise
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          {/* Added a subtle grid for better readability */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
          {/* Styled axes */}
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={{ stroke: '#d1d5db' }}
            tickLine={false}
          />
          
          {/* Using the new custom tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />

          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {lines.map((line, idx) => (
            <Line
              key={line}
              type="monotone"
              dataKey={`Line ${line}`}
              // Using the new color palette
              stroke={lineColors[idx % lineColors.length]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: lineColors[idx % lineColors.length] }}
              // Adds a larger dot on hover for better interaction
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineProductivityChart;