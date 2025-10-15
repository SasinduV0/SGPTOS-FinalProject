import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

// WebSocket connection to the backend
const socket = io("http://localhost:8001", { transports: ["websocket"] });

// Hardcoded production targets for each line
const lineTargets = {
  1: 30,
  2: 80,
  3: 90,
  4: 110,
  5: 16,
  6: 10,
  7: 70,
  8: 85,
};

// Helper function to determine progress bar color based on percentage
const getColor = (percentage) => {
  if (percentage >= 85) return "bg-green-500";
  if (percentage >= 70) return "bg-yellow-500";
  return "bg-red-500";
};

const ProductionLineStatus = () => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ** UPDATED: This function now processes the aggregated station counts **
  const updateLineStatus = (stationCounts) => {
    // Convert the array from the backend (e.g., [{_id: 1, count: 25}]) 
    // into a simple map for easy lookup (e.g., { '1': 25 })
    const lineTotals = stationCounts.reduce((acc, station) => {
      acc[station._id] = station.count;
      return acc;
    }, {});

    const updated = Object.keys(lineTargets).map((line) => {
      const total = lineTotals[line] || 0;
      // Calculate the production percentage against the target
      const percentage = Math.min(
        ((total / lineTargets[line]) * 100).toFixed(2),
        150 // Cap the percentage at 150% for display purposes
      );
      return { line, percentage: Number(percentage) };
    });

    setLineData(updated);
  };

  // ** UPDATED: Fetches data from the new endpoint and listens for the correct event **
  useEffect(() => {
    const fetchLineStatus = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/iot/station-summary");
        if (data && data.stationCounts) {
          updateLineStatus(data.stationCounts);
        }
      } catch (err) {
        console.error("Error fetching station summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLineStatus(); // Initial data fetch

    // Listen for the 'scanUpdate' event to refresh data in real-time
    socket.on("scanUpdate", fetchLineStatus);

    // Clean up the listener when the component unmounts
    return () => {
      socket.off("scanUpdate", fetchLineStatus);
    };
  }, []);


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
        className="space-y-4 max-h-116 overflow-y-auto pr-2"
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
              {/* REMOVED: The worker count is no longer available from the new backend */}
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
