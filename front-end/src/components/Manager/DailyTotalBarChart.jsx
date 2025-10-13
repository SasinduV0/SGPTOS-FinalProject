import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
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

// Custom tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{`Date: ${label}`}</p>
        <p className="text-indigo-600 text-sm font-medium">
          {`Total Production: ${payload[0].value.toLocaleString()} pcs`}
        </p>
        {payload[0].payload.scans && (
          <p className="text-green-600 text-sm font-medium">
            {`RFID Scans: ${payload[0].payload.scans.toLocaleString()}`}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Loading spinner component
const ChartLoader = () => (
  <div className="flex flex-col justify-center items-center h-96 bg-white rounded-xl shadow-lg border border-gray-200/80 w-full max-w-4xl p-6">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-gray-600 text-lg font-medium mt-4">Loading Chart Data...</span>
  </div>
);

const DailyTotalBarChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from both employee and IoT endpoints
  const fetchLatestData = async () => {
    try {
      const [employeeResponse, scanResponse] = await Promise.all([
        axios.get("http://localhost:8001/api/employees"),
        axios.get("http://localhost:8001/api/iot/station-summary")
      ]);
      processChartData(employeeResponse.data, scanResponse.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchLatestData();
  }, []);

  // Polling: Fetch data every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLatestData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Socket event listeners for real-time updates
  useEffect(() => {
    // Listen for employee updates
    socket.on("leadingLineUpdate", () => {
      console.log("📡 Received leadingLineUpdate event");
      fetchLatestData();
    });

    // Listen for RFID scan updates
    socket.on("rfidScanUpdate", () => {
      console.log("📡 Received rfidScanUpdate event");
      fetchLatestData();
    });

    // Listen for general scan updates
    socket.on("scanUpdate", () => {
      console.log("📡 Received scanUpdate event");
      fetchLatestData();
    });

    // Connection monitoring
    socket.on("connect", () => {
      console.log("✅ Socket connected to backend");
      fetchLatestData();
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected from backend");
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

    // Process employee production data
    employees.forEach((emp) => {
      const date = new Date(emp.createdAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (!dateMap[date]) {
        dateMap[date] = { total: 0, scans: 0 };
      }
      dateMap[date].total += (emp.pcs || 0);
    });

    // Add RFID scan counts to today's data
    if (scanData && scanData.stationCounts) {
      const today = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!dateMap[today]) {
        dateMap[today] = { total: 0, scans: 0 };
      }

      // Sum all RFID scans across all lines for today
      const totalScans = scanData.stationCounts.reduce((sum, { count }) => sum + count, 0);
      dateMap[today].scans = totalScans;
      
      // Add scan count to total production (optional, or keep separate)
      dateMap[today].total += totalScans;
    }

    // Sort by date and format final data
    const processedData = Object.keys(dateMap)
      .sort((a, b) => new Date(a) - new Date(b))
      .map((date) => ({
        date,
        total: dateMap[date].total,
        scans: dateMap[date].scans
      }));

    setChartData(processedData);
  };

  if (loading) {
    return <ChartLoader />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl p-6 border border-gray-200/80">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-700">
            Daily Productivity
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
        <BarChart data={chartData} margin={{ top: 30, right: 10, left: 0, bottom: 20 }}>
          {/* SVG gradient definition for the bars */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#818cf8" stopOpacity={0.6}/>
            </linearGradient>
          </defs>

          {/* Subtle horizontal grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          {/* Styled axes */}
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
            label={{ 
              value: 'Total Production (pcs)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#6b7280' }
            }}
          />
          
          {/* Custom tooltip */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />

          <Bar dataKey="total" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
            <LabelList 
              dataKey="total" 
              position="top" 
              style={{ fontSize: 12, fill: '#4a5568', fontWeight: 600 }} 
            />
          </Bar>
        </BarChart>
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

export default DailyTotalBarChart;