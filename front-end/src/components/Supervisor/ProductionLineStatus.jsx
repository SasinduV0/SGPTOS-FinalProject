import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

// WebSocket
const socket = io("http://localhost:8001", { transports: ["websocket"] });

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

const getColor = (percentage) => {
  if (percentage >= 85) return "bg-green-500";
  if (percentage >= 70) return "bg-yellow-500";
  return "bg-red-500";
};

const ProductionLineStatus = () => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/employees");
        updateLineData(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employees:", err);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      updateLineData(updatedEmployees);
    });
    return () => socket.off("leadingLineUpdate");
  }, []);

  const updateLineData = (employees) => {
    const lineTotals = {};
    const lineWorkers = {};

    employees.forEach((emp) => {
      lineTotals[emp.line] = (lineTotals[emp.line] || 0) + (emp.pcs || 0);
      lineWorkers[emp.line] = (lineWorkers[emp.line] || 0) + 1;
    });

    const updated = Object.keys(lineTargets).map((line) => {
      const total = lineTotals[line] || 0;
      const workers = lineWorkers[line] || 0;
      const percentage = Math.min(
        ((total / lineTargets[line]) * 100).toFixed(2),
        150
      );
      return { line, workers, percentage: Number(percentage) };
    });

    setLineData(updated);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  return (
  <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
    <h2 className="text-lg font-bold text-gray-800 mb-4">
      Production Lines Status
    </h2>
    <div
      className="space-y-4 max-h-125 overflow-y-auto pr-2"
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE/Edge
      }}
    >
      {lineData.map((line) => (
        <div
          key={line.line}
          className="p-3 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-gray-700">Line {line.line}</span>
            <span className="text-sm text-gray-500">
              {line.workers} workers
            </span>
          </div>
          <div className="relative w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className={`absolute top-0 left-0 h-2.5 rounded-full ${getColor(
                line.percentage
              )}`}
              style={{ width: `${Math.min(line.percentage, 100)}%` }}
            ></div>
          </div>
          <div className="text-right font-medium text-sm">
            <span
              className={
                line.percentage >= 85
                  ? "text-green-600"
                  : line.percentage >= 70
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              {line.percentage}%
            </span>
          </div>
        </div>
      ))}
    </div>
    {/* Hide scroll bar - WebKit browsers */}
    <style jsx>{`
      div::-webkit-scrollbar {
        display: none;
      }
    `}</style>
  </div>
);

};

export default ProductionLineStatus;
