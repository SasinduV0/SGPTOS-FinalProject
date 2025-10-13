import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";

// Register the necessary components for Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const OverallTargetChartsRFID = () => {
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  // These targets are hardcoded for now, but could be fetched from an API.
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

  // Calculate the total target by summing up all individual line targets.
  const totalTarget = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);

  useEffect(() => {
    // This function fetches the total number of scans, which represents the
    // total completed pieces across all lines.
    const fetchTotalCount = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/scan-count");
        if (data && typeof data.count === 'number') {
           setTotalCompleted(data.count);
        }
      } catch (err) {
        console.error("❌ Error fetching overall scan count:", err);
        // If there's an error, we don't update the count, keeping the last known value.
      } finally {
        setLoading(false);
      }
    };

    // Fetch the data as soon as the component mounts.
    fetchTotalCount();

    // Set up an interval to poll the endpoint every 5 seconds for live updates.
    const intervalId = setInterval(fetchTotalCount, 5000);

    // Clean up the interval when the component is unmounted to avoid memory leaks.
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-69 w-[260px]">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // Calculate the overall completion percentage.
  const completionPercentage = totalTarget > 0
    ? parseFloat(((totalCompleted / totalTarget) * 100).toFixed(2))
    : 0;
  
  // To avoid the chart exceeding 100%, we calculate the remaining percentage.
  const remainingPercentage = Math.max(0, 100 - completionPercentage);
  const displayPercentage = Math.min(completionPercentage, 100);

  // Data for the Doughnut chart.
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        data: [displayPercentage, remainingPercentage],
        backgroundColor: ["#3b82f6", "#e5e7eb"], // Blue for completed, Gray for remaining
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
        hoverBackgroundColor: ["#2563eb", "#d1d5db"]
      },
    ],
  };

  // Configuration options for the Doughnut chart.
  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            if (context.label === 'Completed') {
              return ` ${context.label}: ${totalCompleted} Pcs`;
            }
            const remainingPcs = totalTarget - totalCompleted;
            return ` ${context.label}: ${remainingPcs > 0 ? remainingPcs : 0} Pcs`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="relative flex flex-col items-center bg-white rounded-2xl p-4 w-[250px] ">
      <h2 className="text-center text-gray-800 font-bold text-2xl mb-2">
        Overall Target
      </h2>
      <div className="relative w-48 h-48">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-2xl font-bold text-gray-900">{totalCompleted}</div>
          <div className="text-sm text-gray-600">Pieces</div>
          <div className="text-md font-semibold text-blue-600 mt-1">{completionPercentage}%</div>
        </div>
      </div>
    </div>
  );
};

export default OverallTargetChartsRFID;
