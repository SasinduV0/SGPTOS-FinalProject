import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
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

// A stylish, custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{`Date: ${label}`}</p>
        <p className="text-indigo-600 text-sm font-medium">
          {`Total Production: ${payload[0].value.toLocaleString()} pcs`}
        </p>
      </div>
    );
  }
  return null;
};

// A consistent loading spinner component
const ChartLoader = () => (
  <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-lg border border-gray-200/80 w-full max-w-4xl p-6">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-gray-600 text-lg font-medium mt-4">Loading Chart Data...</span>
  </div>
);


const DailyTotalBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

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
      // Using a more readable date format
      const date = new Date(emp.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateMap[date] = (dateMap[date] || 0) + (emp.pcs || 0);
    });

    const processedData = Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        total: dateMap[date],
      }));
    setChartData(processedData);
  };

  if (loading) {
    return <ChartLoader />;
  }

  return (
    // Enhanced container with shadow, border, and more padding
    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 border border-gray-200/80">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        Total Productivity Per Day
      </h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
          {/* SVG gradient definition for the bars */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0.6}/>
            </linearGradient>
          </defs>

          {/* Added a subtle horizontal grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          {/* Styled axes with angled labels to prevent overlap */}
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-45}
            textAnchor="end"
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
          />
          
          {/* Using the new custom tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />

          <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
            {/* Styled the labels on top of the bars */}
            <LabelList dataKey="total" position="top" style={{ fontSize: 12, fill: '#4a5568', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyTotalBarChart;