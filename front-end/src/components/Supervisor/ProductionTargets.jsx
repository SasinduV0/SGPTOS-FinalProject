import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8001", { transports: ["websocket"] });

function ProductionTargets() {
  const [dailyTarget, setDailyTarget] = useState(2500);
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(12500);
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [qualityRate, setQualityRate] = useState(100);
  const [defectRate, setDefectRate] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch production data using backend scan-count endpoint
  const fetchProduction = async () => {
    try {
      // Get today's date boundaries (start and end of day in Unix timestamp)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();
      const todayEnd = todayStart + 86400000; // 24 hours in milliseconds

      // Fetch today's production count using backend endpoint
      const dailyResponse = await fetch(
        `http://localhost:8001/api/iot/scan-count?startTime=${todayStart}&endTime=${todayEnd}`
      );
      const dailyData = await dailyResponse.json();
      const dailyProduced = dailyData.count || 0;
      
      // Calculate weekly production (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const weekAgoTimestamp = weekAgo.getTime();
      const nowTimestamp = Date.now();

      // Fetch weekly production count using backend endpoint
      const weeklyResponse = await fetch(
        `http://localhost:8001/api/iot/scan-count?startTime=${weekAgoTimestamp}&endTime=${nowTimestamp}`
      );
      const weeklyData = await weeklyResponse.json();
      const weeklyProduced = weeklyData.count || 0;

      // Set targets (you can adjust these or fetch from a settings API)
      const dailyTargetValue = 2500;
      const weeklyTargetValue = dailyTargetValue * 5; // 5 working days

      setDailyTarget(dailyTargetValue);
      setDailyCompleted(dailyProduced);
      setWeeklyTarget(weeklyTargetValue);
      setWeeklyCompleted(weeklyProduced);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching production data:", error);
      setDailyTarget(2500);
      setDailyCompleted(0);
      setWeeklyTarget(12500);
      setWeeklyCompleted(0);
      setLoading(false);
    }
  };

  // Fetch defect rate using backend endpoint
  const fetchDefectRate = async () => {
    try {
      const response = await fetch("http://localhost:8001/api/iot/defect-rate");
      const data = await response.json();
      
      // Extract defect rate from response
      let defectRateValue = 0;
      if (data.defectRate) {
        // Handle string format like "2.50%"
        defectRateValue = parseFloat(data.defectRate.replace('%', ''));
      } else if (data.defects !== undefined && data.total !== undefined) {
        // Calculate from raw numbers
        defectRateValue = data.total > 0 
          ? (data.defects / data.total) * 100 
          : 0;
      }
      
      const quality = Math.max(0, 100 - defectRateValue).toFixed(1);
      setDefectRate(defectRateValue.toFixed(1));
      setQualityRate(quality);
    } catch (error) {
      console.error("Error fetching defect rate:", error);
      setDefectRate(0);
      setQualityRate(100);
    }
  };

  useEffect(() => {
    fetchProduction();
    fetchDefectRate();
  }, []);

  useEffect(() => {
    // Listen for RFID scan updates
    socket.on("rfidUpdate", (data) => {
      console.log("📊 ProductionTargets received RFID scan update");
      fetchProduction();
    });

    // Listen for defect updates
    socket.on("defectUpdate", (data) => {
      console.log("📊 ProductionTargets received defect update");
      fetchDefectRate();
    });

    return () => {
      socket.off("rfidUpdate");
      socket.off("defectUpdate");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-gray-500 text-lg font-medium">Loading...</span>
      </div>
    );
  }

  const dailyPercent = dailyTarget > 0 ? Math.min(((dailyCompleted / dailyTarget) * 100), 100).toFixed(0) : 0;
  const weeklyPercent = weeklyTarget > 0 ? Math.min(((weeklyCompleted / weeklyTarget) * 100), 100).toFixed(0) : 0;
  const qualityPercent = Math.min(qualityRate, 100);

  return (
    <div className="bg-white rounded-2xl shadow p-8 w-full max-w-3xl">
      {/* Daily Target */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>Daily Target</span>
          <span>{dailyTarget.toLocaleString()} units</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              dailyPercent >= 100 ? 'bg-green-500' : 
              dailyPercent >= 80 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${dailyPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {dailyCompleted.toLocaleString()} units completed ({dailyPercent}%)
        </p>
      </div>

      {/* Weekly Target */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>Weekly Target</span>
          <span>{weeklyTarget.toLocaleString()} units</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              weeklyPercent >= 100 ? 'bg-green-500' : 
              weeklyPercent >= 70 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${weeklyPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {weeklyCompleted.toLocaleString()} units completed ({weeklyPercent}%)
        </p>
      </div>

      {/* Defect Rate */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>Defect Rate</span>
          <span>Target: &lt; 2%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              defectRate <= 2 ? 'bg-green-500' : 
              defectRate <= 5 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(defectRate * 5, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {defectRate}% current defect rate
        </p>
      </div>

      {/* Quality Rate */}
      <div>
        <div className="flex justify-between text-sm font-semibold text-gray-700">
          <span>Quality Rate</span>
          <span>98% Target</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              qualityPercent >= 98 ? 'bg-green-500' : 
              qualityPercent >= 95 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${qualityPercent}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {qualityRate}% achieved
        </p>
      </div>
    </div>
  );
}

export default ProductionTargets;