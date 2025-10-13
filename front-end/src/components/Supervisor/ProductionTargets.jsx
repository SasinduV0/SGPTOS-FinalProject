import React, { useEffect, useState } from "react";
import axios from "axios";

function ProductionTargets() {
  // Fixed Targets (Assuming these are still client-side constants)
  const DAILY_TARGET_BASE = 250; 
  const WEEKLY_TARGET_BASE = 1250; 

  const [dailyTarget] = useState(DAILY_TARGET_BASE); 
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [weeklyTarget] = useState(WEEKLY_TARGET_BASE); 
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  
  const [qualityRate, setQualityRate] = useState(100);
  const [defectRate, setDefectRate] = useState(0);
  const [loading, setLoading] = useState(true);

  // Function to fetch all necessary data
  const fetchData = async () => {
    let currentDailyCompleted = 0;
    let currentTotalDefects = 0;
    
    try {
      // 1. Fetch total production count (Daily Production)
      const productionResponse = await axios.get("http://localhost:8001/api/scan-count");
      currentDailyCompleted = productionResponse.data?.count || 0;
      setDailyCompleted(currentDailyCompleted);
      
      // Placeholder calculation for weekly completion
      setWeeklyCompleted(currentDailyCompleted * 5); 

    } catch (error) {
      console.error("Error fetching production data:", error);
    }

    try {
      // 2. Fetch total defect count
      const defectStatsResponse = await axios.get("http://localhost:8001/api/defect-stats");
      currentTotalDefects = defectStatsResponse.data?.totalGarmentsWithDefects || 0;
    } catch (error) {
      console.error("Error fetching defect data:", error);
    }

    // 3. Calculate Defect and Quality Rates
    let calculatedDefectRate = 0;
    if (currentDailyCompleted > 0) {
      calculatedDefectRate = ((currentTotalDefects / currentDailyCompleted) * 100);
    }
    
    const calculatedQualityRate = (100 - calculatedDefectRate).toFixed(1);
    
    setDefectRate(calculatedDefectRate.toFixed(1));
    setQualityRate(calculatedQualityRate);
    setLoading(false);
  };

  useEffect(() => {
    // Initial data fetch
    fetchData();

    // Set up polling for continuous updates every 5 seconds
    const intervalId = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 bg-gray-100 rounded-xl shadow-lg">
        <span className="text-blue-600 text-lg font-medium">Loading Data...</span>
      </div>
    );
  }

  // Calculate percentages (ensuring they don't exceed 100%)
  const dailyPercent = dailyTarget > 0 ? Math.min(((dailyCompleted / dailyTarget) * 100), 100).toFixed(0) : 0;
  const weeklyPercent = weeklyTarget > 0 ? Math.min(((weeklyCompleted / weeklyTarget) * 100), 100).toFixed(0) : 0;
  const qualityPercent = Math.min(parseFloat(qualityRate), 100);

  // Helper function to determine bar color based on performance
  const getPerformanceBarColor = (percent) => {
    if (percent >= 90) return 'bg-green-600'; // Increased green shade for contrast
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-red-600'; // Increased red shade for contrast
  };

  // Helper function to determine defect bar color (inverse logic)
  const getDefectBarColor = (rate) => {
    if (rate <= 1.5) return 'bg-green-600'; // Excellent
    if (rate <= 4.0) return 'bg-yellow-500'; // Acceptable
    return 'bg-red-600'; // High Defect
  };

  return (
    <div className="bg-white border border-gray-200 text-gray-800 rounded-xl shadow-lg p-6 sm:p-8 w-full max-w-3xl">
      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">
        Production & Quality Overview
      </h2>

      {/* Daily Target */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
          <span className="text-blue-600">Daily Target</span>
          <span className="font-bold text-gray-900">{dailyTarget.toLocaleString()} units</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${getPerformanceBarColor(dailyPercent)}`}
            style={{ width: `${dailyPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-bold text-gray-900">{dailyCompleted.toLocaleString()}</span> units completed (<span className="font-bold">{dailyPercent}%</span>)
        </p>
      </div>

      {/* Weekly Target */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
          <span className="text-blue-600">Weekly Target</span>
          <span className="font-bold text-gray-900">{weeklyTarget.toLocaleString()} units</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${getPerformanceBarColor(weeklyPercent)}`}
            style={{ width: `${weeklyPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-bold text-gray-900">{weeklyCompleted.toLocaleString()}</span> units completed (<span className="font-bold">{weeklyPercent}%</span>)
        </p>
      </div>

      {/* --- Divider --- */}
      <hr className="my-8 border-gray-300" />

      {/* Defect Rate */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
          <span className="text-red-600">Defect Rate</span>
          <span className="text-red-600">Target: &lt; 5.0%</span>
        </div>
        {/* Defect Bar: Bar width represents the actual rate against a max scale of 20% (rate * 5) */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${getDefectBarColor(parseFloat(defectRate))}`}
            // Max bar width is 100%, achieved if defect rate hits 20% (20 * 5 = 100)
            style={{ width: `${Math.min(parseFloat(defectRate) * 5, 100)}%` }} 
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-bold text-red-600">{defectRate}%</span> current defect rate (lower is better)
        </p>
      </div>

      {/* Quality Rate */}
      <div>
        <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
          <span className="text-green-600">Quality Rate</span>
          <span className="text-green-600">98.0% Target</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${
              qualityPercent >= 70 ? 'bg-green-600' : 
              qualityPercent >= 50 ? 'bg-yellow-500' : 'bg-red-600'
            }`}
            style={{ width: `${qualityPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-bold text-green-600">{qualityRate}%</span> achieved
        </p>
      </div>
    </div>
  );
}

export default ProductionTargets;
