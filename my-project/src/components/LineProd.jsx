import React, { useState } from "react";
import { TrendingUp, Target, BarChart3, Activity, ChevronDown, ChevronUp } from "lucide-react";

const LineProd = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLine, setSelectedLine] = useState("Line 1");

  const stats = [
    { title: "Total Target", value: "500", color: "text-blue-600", icon: <Target className="w-5 h-5 text-blue-500" /> },
    { title: "Total Output", value: "508", color: "text-green-600", icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { title: "Efficiency", value: "101.6%", color: "text-purple-600", icon: <Activity className="w-5 h-5 text-purple-500" /> },
    { title: "Variance", value: "+8", color: "text-green-600", icon: <BarChart3 className="w-5 h-5 text-green-500" /> },
  ];

  const dailyData = [
    { date: "2025-08-16", target: 500, actual: 508, efficiency: 101.6 },
    { date: "2025-08-17", target: 500, actual: 495, efficiency: 99 },
    { date: "2025-08-18", target: 500, actual: 520, efficiency: 104 },
    { date: "2025-08-19", target: 500, actual: 480, efficiency: 96 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Line Productivity</h1>
      </div>

      {/* Select Line Button */}
      <div className="flex items-center gap-2 relative">
        <span className="text-gray-700 font-medium">Select Line:</span>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center gap-2 hover:bg-gray-50"
        >
          {selectedLine}
          {dropdownOpen ? (
            <ChevronUp className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute top-12 left-0 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {["Line 1", "Line 2", "Line 3"].map((line) => (
              <button
                key={line}
                onClick={() => {
                  setSelectedLine(line);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {line}
              </button>
            ))}
          </div>
        )}
      

      {/* Report buttons */}
      <div className="flex gap-3 ml-auto">
      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
        View Report
      </button>
      <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
        Export Report
      </button>
      </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{s.title}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
            {s.icon}
          </div>
        ))}
      </div>

      {/* Daily Production Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Daily Production Breakdown</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dailyData.map((day, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{day.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.target} units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{day.actual} units</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        day.efficiency >= 100
                          ? "text-green-600"
                          : day.efficiency >= 95
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {day.efficiency}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        day.actual >= day.target ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {day.actual >= day.target ? "+" : ""}
                      {day.actual - day.target}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          day.efficiency >= 100
                            ? "bg-green-500"
                            : day.efficiency >= 95
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(day.efficiency, 100)}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LineProd;
