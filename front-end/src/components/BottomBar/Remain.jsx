import React, { useEffect, useState } from "react";
import axios from "axios";

const Remain = () => {
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  // Define the production targets for each line (used for totalTarget calculation).
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

  // This effect fetches the total completed pieces from the new backend endpoint via polling.
  useEffect(() => {
    const fetchCompletedCount = async () => {
      try {
        // Fetch total production count from the dedicated API endpoint
        const response = await axios.get("http://localhost:8001/api/scan-count");
        if (response.data && typeof response.data.count === 'number') {
          setTotalCompleted(response.data.count);
        }
      } catch (err) {
        console.error("Error fetching completed count for Remain component:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initial data fetch.
    fetchCompletedCount();

    // Set up a polling interval to get live updates every 5 seconds.
    const intervalId = setInterval(fetchCompletedCount, 5000);

    // Clean up the interval when the component is unmounted.
    return () => clearInterval(intervalId);
  }, []);

  // Calculate total and remaining targets.
  const totalTarget = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);
  const remainingTarget = totalTarget - totalCompleted;

  // Render a loading state if data is still fetching.
  if (loading) {
    return (
      <div className="flex mt-5 ml-4 gap-1">
        <h2 className="text-gray-300 font-semibold text-xs"> Remaining Target </h2>
        <p className="text-xs font-bold text-white">Loading...</p>
        <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
      </div>
    );
  }

  // Render the component with the original styling.
  return (
    <div className="flex mt-5 ml-4 gap-1">
      <h2 className=" text-gray-300 font-semibold text-xs"> Remaining Target </h2>
      {/* Use toLocaleString for better number formatting */}
      <p className="text-xs font-bold text-white">{remainingTarget.toLocaleString()} Pcs</p>
      <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>
  );
};

export default Remain;
