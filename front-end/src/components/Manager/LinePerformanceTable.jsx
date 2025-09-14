import React, { useEffect, useState } from "react";
import axios from "axios";

const getColorByEfficiency = (efficiency) => {
  if (efficiency >= 100) return "bg-green-100 text-green-800";   // Excellent
  if (efficiency >= 85) return "bg-blue-100 text-blue-800";     // Good
  if (efficiency >= 70) return "bg-yellow-100 text-yellow-800"; // Moderate
  return "bg-red-100 text-red-800";                             // Needs Attention
};

const LinePerformanceTable = () => {
  const [lineData, setLineData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/line-performance");
        setLineData(data);
      } catch (err) {
        console.error("Error fetching line performance:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow mb-10">
      {/* Header */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800">
          Line Performance
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-4 font-medium text-gray-700">Production Line</th>
              <th className="text-left p-4 font-medium text-gray-700">Target</th>
              <th className="text-left p-4 font-medium text-gray-700">Actual</th>
              <th className="text-left p-4 font-medium text-gray-700">Efficiency</th>
              <th className="text-left p-4 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {lineData.map((line, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{line.line}</td>
                <td className="p-4">{line.target} pcs</td>
                <td className="p-4">{line.actual} pcs</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getColorByEfficiency(line.efficiency)}`}
                  >
                    {line.efficiency}%
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      line.efficiency >= 100
                        ? "bg-green-100 text-green-800"
                        : line.efficiency >= 85
                        ? "bg-blue-100 text-blue-800"
                        : line.efficiency >= 70
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {line.efficiency >= 100
                      ? "Excellent"
                      : line.efficiency >= 85
                      ? "Good"
                      : line.efficiency >= 70
                      ? "Moderate"
                      : "Needs Attention"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LinePerformanceTable;
