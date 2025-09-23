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

// Backend connection is unchanged
const socket = io("http://localhost:8001", { transports: ["websocket"] });

// Production targets are unchanged
const lineTargets = {
  1: 1000, 2: 800, 3: 900, 4: 1100, 5: 950, 6: 1050, 7: 700, 8: 850,
};

// Custom Tooltip for a consistent, polished look
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Un-scaling the values to show the original numbers
    const targetValue = (payload[0].value * 10).toLocaleString();
    const productionValue = (payload[1].value * 10).toLocaleString();
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

// Custom Legend for a cleaner UI
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

  // Data processing logic is unchanged
  const calculateProductivity = (employees) => {
    const lineWiseProduction = {};
    employees.forEach((emp) => {
      if (emp.line && emp.pcs) {
        lineWiseProduction[emp.line] = (lineWiseProduction[emp.line] || 0) + emp.pcs;
      }
    });

    const data = Object.keys(lineTargets).map((line) => ({
      name: `Line ${line}`,
      target: lineTargets[line] / 10,
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
    // Applying the same modern card style for consistency
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200/80 w-full">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">
        Line Target vs. Production (%)
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} barGap={8}>
          {/* SVG gradient definition for the production bars */}
          <defs>
            <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
            </linearGradient>
          </defs>

          {/* Clean horizontal grid */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          {/* Styled Axes */}
          <XAxis 
            dataKey="name" 
            interval={0} 
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis 
            domain={[0, 120]} // Set domain slightly higher than 100%
            tick={{ fontSize: 12, fill: '#6b7280' }} 
            axisLine={false} 
            tickLine={false}
            tickFormatter={(value) => `${value}%`} // Add percentage sign
          />
          
          {/* Custom Tooltip and Legend */}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }} />
          <Legend content={<CustomLegend />} />

          {/* Styled Bars */}
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