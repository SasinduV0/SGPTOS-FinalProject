import React, { useEffect, useState } from "react";
import axios from "axios";
import { TrendingUp } from "lucide-react"; // 📈 Efficiency icon

// Define line targets (remains static and is used for total target calculation)
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

// Calculate the fixed total target once
const totalTarget = Object.values(lineTargets).reduce((sum, t) => sum + t, 0);

const EfficiencyRate = () => {
  const [efficiency, setEfficiency] = useState("0.00");

  const fetchEfficiency = async () => {
    try {
      // 1. Fetch total production count from the dedicated API endpoint
      const response = await axios.get("http://localhost:8001/api/scan-count");
      const totalProduction = response.data?.count || 0;

      // 2. Calculate the efficiency rate
      const rate = totalTarget > 0 ? ((totalProduction / totalTarget) * 100).toFixed(2) : "0.00";
      setEfficiency(rate);

    } catch (error) {
      console.error("Error fetching efficiency rate:", error);
      // Keep existing efficiency on error
    }
  };

  useEffect(() => {
    // Initial data fetch
    fetchEfficiency();

    // Set up a polling interval to get live updates every 5 seconds.
    const intervalId = setInterval(fetchEfficiency, 5000);

    // Clean up the interval when the component is unmounted.
    return () => clearInterval(intervalId);
  }, []);

  // Use the original JSX structure and styling.
  return (
    <div className="flex mt-5 ml-4 gap-1">
      <h3 className="text-gray-300 font-semibold text-xs">Overall Efficiency</h3>
      <p className="text-xs font-bold text-white">{efficiency}%</p>
      <p className="text-xs font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>
  );
};

export default EfficiencyRate;
