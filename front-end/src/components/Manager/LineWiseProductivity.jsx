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

// Backend WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

// Production targets for each line (using raw, unscaled values)
const lineTargets = {
  1: 30,
  2: 30,
  3: 30,
  4: 30,
  5: 30,
  6: 30,
  7: 30,
  8: 30,
};

// Custom Tooltip now displays the direct values from the chart data
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const targetValue = payload[0].value.toLocaleString();
    const productionValue = payload[1].value.toLocaleString();
    return (
      <div className="p-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500">{`Target: ${targetValue} pcs`}</p>
        <p className="text-sm font-semibold text-emerald-600">{`Production: ${productionValue} pcs`}</p>
      </div>
    );
  }
  return null;
};

// Custom Legend for a clean UI (unchanged)
const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex justify-center items-center gap-6 pt-4">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }}></div>
          <span className="text-sm text-gray-600">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};


const LineWiseProductivity = () => {
  const [chartData, setChartData] = useState([]);

  // ** CORRECTED DATA PROCESSING LOGIC **
  // This function now uses the raw, unscaled data directly.
  const processStationData = (stationCounts) => {
    const lineWiseProduction = stationCounts.reduce((acc, station) => {
        acc[station._id] = station.count;
        return acc;
    }, {});

    // NO MORE SCALING: The data passed to the chart uses the actual target and production counts.
    const data = Object.keys(lineTargets).map((line) => ({
      name: `Line ${line}`,
      target: lineTargets[line],
      production: lineWiseProduction[line] || 0,
    }));
    setChartData(data);
  };

  // Data fetching logic (unchanged)
  useEffect(() => {
    const fetchStationSummary = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/iot/station-summary");
        if (data && data.stationCounts) {
            processStationData(data.stationCounts);
        }
      } catch (error) {
        console.error("Error fetching station summary:", error);
        const emptyData = Object.keys(lineTargets).map((line) => ({
            name: `Line ${line}`,
            target: lineTargets[line],
            production: 0,
        }));
        setChartData(emptyData);
      }
    };

    fetchStationSummary();
    socket.on("scanUpdate", fetchStationSummary);

    return () => {
        socket.off("scanUpdate", fetchStationSummary);
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 w-full">
      <h3 className="text-xl font-semibold text-gray-700 mb-10">
        Line Production
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} barGap={8}>
          <defs>
            <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          <XAxis 
            dataKey="name" 
            interval={0} 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={false} 
            tickLine={false} 
          />
          
          {/* ** CORRECTED Y-AXIS ** */}
          {/* REMOVED domain property. Recharts will now automatically calculate the scale,
              ensuring the bar heights are always proportional to their values. */}
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={false} 
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />
          <Legend content={<CustomLegend />} />

          <Bar 
            dataKey="target" 
            fill="#e5e7eb" 
            name="Target" 
            radius={[4, 4, 0, 0]} 
            barSize={25}
          />
          <Bar 
            dataKey="production" 
            fill="url(#productionGradient)" 
            name="Production" 
            radius={[4, 4, 0, 0]}
            barSize={25}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineWiseProductivity;

