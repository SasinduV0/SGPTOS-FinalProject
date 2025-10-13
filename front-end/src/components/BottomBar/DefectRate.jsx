import React, { useState, useEffect } from "react";
import axios from "axios";

function DefectRate() {
  const [defectRate, setDefectRate] = useState("0.00");
  const [loading, setLoading] = useState(true);

  // Function to fetch total production and defect counts and calculate rate
  const fetchDefectRate = async () => {
    let totalProduction = 0;
    let totalDefects = 0;

    try {
      // 1. Fetch total production count
      const productionResponse = await axios.get("http://localhost:8001/api/scan-count");
      totalProduction = productionResponse.data?.count || 0;
    } catch (error) {
      console.error("Error fetching total production:", error);
    }

    try {
      // 2. Fetch total defect count
      const defectResponse = await axios.get("http://localhost:8001/api/defect-stats");
      // Assuming 'totalDefects' is the correct property name from your backend for defect count
      totalDefects = defectResponse.data?.totalDefects || 0; 
    } catch (error) {
      console.error("Error fetching total defects:", error);
    }

    // 3. Calculate the defect rate
    let calculatedRate = "0.00";
    if (totalProduction > 0) {
      calculatedRate = ((totalDefects / totalProduction) * 100).toFixed(2);
    }

    setDefectRate(calculatedRate);
    setLoading(false);
  };

  useEffect(() => {
    // Initial data fetch
    fetchDefectRate();

    // Set up polling for continuous updates every 5 seconds
    const intervalId = setInterval(fetchDefectRate, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex mt-5 ml-4 gap-1">
        <h3 className="text-gray-300 font-semibold text-xs">Defect Rate</h3>
        <p className="text-xs font-bold text-white">Loading...</p>
        <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>
      </div>
    );
  }

  return (
    <div className="flex mt-5 ml-4 gap-1">
      <h3 className="text-gray-300 font-semibold text-xs">Defect Rate</h3>
      <p className="text-xs font-bold text-white">{defectRate}%</p>
      <p className="text-sm font-bold text-gray-300 -mt-[2px] ml-3">|</p>
    </div>
  );
}

export default DefectRate;
