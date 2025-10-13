import React, { useEffect, useState } from "react";
import axios from "axios";
import { Target } from 'lucide-react';

const RemainingTargetRFID = () => {
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  // Hardcoded line targets. These could be fetched from an API in a real-world scenario.
  const lineTargets = {
    1: 100,
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
    // This function fetches the total scan count, which represents the total
    // pieces completed across all production lines.
    const fetchTotalCount = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/scan-count");
        if (data && typeof data.count === 'number') {
           setTotalCompleted(data.count);
        }
      } catch (err) {
        console.error("❌ Error fetching remaining target count:", err);
        // In case of an error, we keep the last known value.
      } finally {
        setLoading(false);
      }
    };

    // Fetch the initial count as soon as the component mounts.
    fetchTotalCount();

    // Set up a polling interval to fetch the count every 5 seconds for live updates.
    const intervalId = setInterval(fetchTotalCount, 5000);

    // Clean up the interval when the component unmounts to prevent memory leaks.
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-82 h-[100px] flex justify-center items-center">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // Calculate the remaining target. Ensure it doesn't show a negative value.
  const remainingTarget = Math.max(0, totalTarget - totalCompleted);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg w-82">
      <div className="flex items-center justify-between">
        {/* Left side (text content) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-700">Remaining Target</h3>
          <p className="text-2xl font-bold text-red-600">{remainingTarget.toLocaleString()} Pcs</p>
        </div>

        {/* Right side (icon) */}
        <div className="bg-red-100 p-3 rounded-full">
          <Target className="w-8 h-8 text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default RemainingTargetRFID;
