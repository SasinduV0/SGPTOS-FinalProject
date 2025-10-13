import React, { useEffect, useState } from "react";
import axios from "axios";
import { Target } from 'lucide-react';

const RemainingTargetRFIDYY = () => {
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  // Define line targets (Hardcoded, as in the original component)
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

  // Calculate the overall target once
  const totalTarget = Object.values(lineTargets).reduce((sum, val) => sum + val, 0);

  // Fetch the total completed pieces from the new backend endpoint
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        // Fetch the count from the new endpoint, which counts documents in RFIDTagScan collection (PCs produced)
        const response = await axios.get("http://localhost:8001/api/scan-count");
        const data = response.data;
        
        if (data && typeof data.count === 'number') {
           setTotalCompleted(data.count);
        }
      } catch (err) {
        console.error("❌ Error fetching total scan count:", err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchTotalCount();

    // Set up polling to refresh the data every 5 seconds (5000ms)
    const intervalId = setInterval(fetchTotalCount, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this runs only on mount/unmount

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-lg w-[247px] h-[150px] flex flex-col justify-center items-center">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  // Compute the remaining target, ensuring it's not negative
  const remainingTarget = Math.max(0, totalTarget - totalCompleted);

  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-6 w-[247px] ">
      <h2 className="text-center text-gray-400 font-bold text-lg mb-1">
        Remaining Target
      </h2>
      <p className="text-5xl font-extrabold text-red-600 mb-4">{remainingTarget.toLocaleString()}</p>
      
      <div className="border-t border-gray-200 w-full pt-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span className="font-medium">Total Target:</span>
          <span className="font-semibold">{totalTarget.toLocaleString()} Pcs</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span className="font-medium">Completed:</span>
          <span className="font-semibold">{totalCompleted.toLocaleString()} Pcs</span>
        </div>
      </div>

      {/* <div className="mt-4 p-2 bg-red-50 rounded-full">
         <Target className="w-6 h-6 text-red-500" />
      </div> */}
    </div>
  );
};

export default RemainingTargetRFIDYY;
