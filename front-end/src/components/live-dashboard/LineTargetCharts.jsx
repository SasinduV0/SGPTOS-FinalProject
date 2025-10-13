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
import axios from "axios";

const LineTargetChartRFID = () => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Hardcoded target values for each line.
  // This could also be fetched from an API if needed.
  const lineTargets = {
    1: 10,
    2: 80,
    3: 90,
    4: 110,
    5: 95,
    6: 105,
    7: 70,
    8: 85,
  };

  // This function processes the raw data from the backend
  // and formats it for the chart.
  const updateChartData = (stationCounts = []) => {
    // Convert the array of station counts into a more accessible object format.
    const lineTotals = stationCounts.reduce((acc, station) => {
      acc[station._id] = station.count;
      return acc;
    }, {});

    // Create the final data structure for the chart, including all lines.
    const chartData = Object.keys(lineTargets).map((line) => {
      const total = lineTotals[line] || 0;
      // Calculate the completion percentage against the target.
      const percentage = Math.min(
        parseFloat(((total / lineTargets[line]) * 100).toFixed(2)),
        120 // Cap the percentage at 150% for better visualization
      );
      return { name: line, totalPcs: total, percentage: percentage };
    });

    setLineData(chartData);
  };

  useEffect(() => {
    // Fetches data from the new backend endpoint.
    const fetchLineData = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/station-summary");
        if (data && data.stationCounts) {
          console.log("📤 LineTargetChart fetched data:", data.stationCounts.length, "lines");
          updateChartData(data.stationCounts);
        } else {
          // If no data, initialize chart with zeros.
          updateChartData([]);
        }
      } catch (err) {
        console.error("❌ Error fetching line data:", err);
        // In case of an error, we can still render an empty chart.
        updateChartData([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch data immediately on component mount.
    fetchLineData();

    // Set up polling to refresh data every 5 seconds to keep the chart updated.
    const intervalId = setInterval(fetchLineData, 5000);

    // Clean up the interval when the component unmounts to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, []);

  // Determines the bar color based on whether the target has been met.
  const getBarColor = (percentage) => (percentage >= 100 ? "#8B0000" : "#4f46e5");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <span className="text-gray-500 text-lg font-medium">Loading Chart Data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl w-[500px] max-w-xl p-4">
      <h2 className="text-center text-gray-800 font-bold text-2xl">
        Total Productivity - Line Wise Target
      </h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={lineData}
          margin={{ top: 30, right: 20, left: 0, bottom: 20 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fill: "#0a0a0a", fontSize: 14, fontWeight: "500" }}
            axisLine={{ stroke: "#4b5563", strokeWidth: 2 }}
            tickLine={{ stroke: "#4b5563", strokeWidth: 1 }}
          >
            <Label
              value="Line Number"
              position="bottom"
              offset={-5}
              style={{ textAnchor: "middle", fill: "#000", fontWeight: "bold" }}
            />
          </XAxis>
          
          <YAxis
            domain={[0, 120]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "#0a0a0a", fontSize: 12 }}
            axisLine={{ stroke: "#4b5563", strokeWidth: 2 }}
            tickLine={{ stroke: "#4b5563", strokeWidth: 1 }}
          >
             <Label
              value="Target %"
              angle={-90}
              position="insideLeft"
              offset={10}
              style={{ textAnchor: "middle", fill: "#000", fontWeight: "bold" }}
            />
          </YAxis>

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
              `${props.payload.totalPcs} pcs`,
              `Target Completion: ${value}%`,
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

export default LineTargetChartRFID;
