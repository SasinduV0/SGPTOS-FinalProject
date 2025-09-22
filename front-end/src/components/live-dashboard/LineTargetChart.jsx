import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Label,
} from "recharts";
import io from "socket.io-client";
import axios from "axios";

// Enhanced socket connection
const socket = io("http://localhost:8001", { 
  transports: ["websocket"],
  autoConnect: true,
  forceNew: true
});

const LineTargetChart = () => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

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

  // Handle socket connection events
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ LineTargetChart Socket connected:", socket.id);
      setConnectionStatus("connected");
      socket.emit("getAllEmployees");
    });

    socket.on("disconnect", () => {
      console.log("❌ LineTargetChart Socket disconnected");
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ LineTargetChart Socket connection error:", error);
      setConnectionStatus("error");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/employees");
        console.log("📤 LineTargetChart fetched initial data:", data.length, "employees");
        updateChartData(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching employees:", err);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      console.log("🔄 LineTargetChart received update:", updatedEmployees.length, "employees");
      updateChartData(updatedEmployees);
    });
    return () => socket.off("leadingLineUpdate");
  }, []);

  const updateChartData = (employees) => {
    const lineTotals = employees.reduce((acc, emp) => {
      acc[emp.line] = (acc[emp.line] || 0) + Number(emp.pcs || 0);
      return acc;
    }, {});

    const chartData = Object.keys(lineTargets).map((line) => {
      const total = lineTotals[line] || 0;
      const percentage = Math.min(
        ((total / lineTargets[line]) * 100).toFixed(2),
        150
      );
      return { name: line, totalPcs: total, percentage: Number(percentage) };
    });

    setLineData(chartData);
  };

  const getBarColor = (percentage) => (percentage >= 100 ? "#8B0000" : "#4f46e5");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl w-[500px] max-w-xl ">
      <h2 className="text-center text-gray-800 font-bold text-2xl mb-6">
        Total Productivity - Line Wise Target
        {/* {connectionStatus === "connected" && <span className="text-green-500 text-xs ml-2">●</span>}
        {connectionStatus === "disconnected" && <span className="text-red-500 text-xs ml-2">●</span>} */}
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={lineData}
          margin={{ top: 20, right: 20, left: 20, bottom: 40 }}
        >
          {/* X Axis with border and label */}
          <XAxis
            dataKey="name"
            tick={{ fill: "#0a0a0a", fontSize: 14, fontWeight: "500" }}
            axisLine={{ stroke: "#4b5563", strokeWidth: 2 }}
            tickLine={{ stroke: "#4b5563", strokeWidth: 1 }}
          >
            <Label
              value="Line Number"
              position="bottom"
              offset={10}
              style={{ textAnchor: "middle", fill: "#000", fontWeight: "bold" }}
            />
          </XAxis>

          {/* Y Axis with border and label */}
          {/* <YAxis
            domain={[0, Math.max(...lineData.map((d) => d.percentage)) + 20]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "#0a0a0a", fontSize: 12 }}
            axisLine={{ stroke: "#4b5563", strokeWidth: 2 }}
            tickLine={{ stroke: "#4b5563", strokeWidth: 1 }}
          >
            <Label
              value="Target Completion (%)"
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ textAnchor: "middle", fill: "#000", fontWeight: "bold" }}
            />
          </YAxis> */}

          <Tooltip
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #4b5563",
              color: "#e5e7eb",
              borderRadius: "8px",
            }}
            labelFormatter={(label) => `Line ${label}`}
            formatter={(value, name, props) => [
              `${value}%`,
              `Total Pieces: ${props.payload.totalPcs}`,
            ]}
          />

          <Bar dataKey="percentage" radius={[6, 6, 0, 0]} animationDuration={800}>
            <LabelList
              dataKey="percentage"
              position="top"
              formatter={(val) => `${val}%`}
              style={{ fill: "#000", fontSize: 12, fontWeight: "bold" }}
            />
            {lineData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineTargetChart;
