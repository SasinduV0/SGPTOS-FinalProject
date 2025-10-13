import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";
import io from "socket.io-client";
import axios from "axios";

// Backend connection
const socket = io("http://localhost:8001", {
  transports: ["websocket"],
  autoConnect: true,
  forceNew: true,
});

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{`Date: ${label}`}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="text-sm font-medium">
            {`${p.name}: ${p.value.toLocaleString()} scans`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Loading spinner component
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
  
  // Professional color palette
  const lineColors = [
    "#3b82f6", "#10b981", "#f97316", "#ef4444",
    "#8b5cf6", "#ec4899", "#facc15", "#06b6d4"
  ];

  // Fetch RFID scan data from IoT backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both employee data and RFID scans
        const [employeeResponse, scanResponse] = await Promise.all([
          axios.get("http://localhost:8001/api/employees"),
          axios.get("http://localhost:8001/api/iot/station-summary")
        ]);

        // Process combined data
        processChartData(employeeResponse.data, scanResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();

    // Poll for updates every 5 seconds to ensure real-time data
    const pollInterval = setInterval(fetchData, 5000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Listen for real-time updates from both employee and RFID systems
  useEffect(() => {
    const fetchLatestData = async () => {
      try {
        const [employeeResponse, scanResponse] = await Promise.all([
          axios.get("http://localhost:8001/api/employees"),
          axios.get("http://localhost:8001/api/iot/station-summary")
        ]);
        processChartData(employeeResponse.data, scanResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    // Employee updates
    socket.on("leadingLineUpdate", fetchLatestData);

    // RFID scan updates
    socket.on("rfidScanUpdate", fetchLatestData);

    // Generic scan update event
    socket.on("scanUpdate", fetchLatestData);

    // Connection status logging
    socket.on("connect", () => {
      console.log("✅ LineProductivityChart: Socket connected");
      fetchLatestData();
    });

    socket.on("disconnect", () => {
      console.log("❌ LineProductivityChart: Socket disconnected");
    });

    return () => {
      socket.off("leadingLineUpdate");
      socket.off("rfidScanUpdate");
      socket.off("scanUpdate");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  const processChartData = (employees, scanData) => {
    const dateMap = {};

    // Process employee data (existing logic)
    employees.forEach((emp) => {
      const date = new Date(emp.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!dateMap[date]) {
        dateMap[date] = {};
        lines.forEach(line => {
          dateMap[date][`Line ${line}`] = 0;
        });
      }
      dateMap[date][`Line ${emp.line}`] = (dateMap[date][`Line ${emp.line}`] || 0) + emp.pcs;
    });

    // Add RFID scan counts to the data (bonus tracking)
    // This adds scan-based productivity alongside employee pieces
    if (scanData && scanData.stationCounts) {
      const today = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dateMap[today]) {
        dateMap[today] = {};
        lines.forEach(line => {
          dateMap[today][`Line ${line}`] = 0;
        });
      }

      // Add scan counts as bonus productivity metric
      scanData.stationCounts.forEach(({ _id: lineNumber, count }) => {
        if (lineNumber >= 1 && lineNumber <= 8) {
          // Add scan count to existing production count
          // Or you can multiply by a factor if scans represent batches
          dateMap[today][`Line ${lineNumber}`] += count;
        }
      });
    }

    // Sort by date and format final data
    const processedData = Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        ...dateMap[date]
      }));

    setChartData(processedData);
  };

  if (loading) {
    return <ChartLoader />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl p-6 border border-gray-200/80">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">
            Daily Productivity - Line Wise
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Combined employee pieces + RFID scan tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          
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
            label={{ 
              value: 'Productivity (pcs + scans)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' }
            }}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />

          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          
          {lines.map((line, idx) => (
            <Line
              key={line}
              type="monotone"
              dataKey={`Line ${line}`}
              stroke={lineColors[idx % lineColors.length]}
              strokeWidth={2.5}
              dot={{ r: 3, fill: lineColors[idx % lineColors.length] }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Data source indicator */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          📊 Data sources: Employee production records + RFID scan tracking system
        </p>
      </div>
    </div>
  );
};

export default LineProductivityChart;