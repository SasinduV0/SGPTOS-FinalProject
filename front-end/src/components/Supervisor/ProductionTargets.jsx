import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:8001", { transports: ["websocket"] });

function ProductionTargets() {
  const [dailyTarget, setDailyTarget] = useState(2500); // from backend or fixed
  const [dailyCompleted, setDailyCompleted] = useState(0);
  const [weeklyTarget, setWeeklyTarget] = useState(12500); // from backend or fixed
  const [weeklyCompleted, setWeeklyCompleted] = useState(0);
  const [qualityRate, setQualityRate] = useState(100);
  const [defectRate, setDefectRate] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch production data
  const fetchProduction = async () => {
    try {
      const response = await axios.get("http://localhost:8001/api/employees"); 
      const employees = response.data;

      // Calculate daily production (sum of all employee pcs for today)
      const today = new Date().toLocaleDateString();
      const todaysEmployees = employees.filter(emp => 
        new Date(emp.createdAt).toLocaleDateString() === today
      );
      
      const dailyProduced = todaysEmployees.reduce((sum, emp) => sum + (emp.pcs || 0), 0);
      const dailyTargetCalc = todaysEmployees.length * 120; // 120 pcs per employee per day
      
      // Calculate weekly production (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weeklyEmployees = employees.filter(emp => 
        new Date(emp.createdAt) >= weekAgo
      );
      
      const weeklyProduced = weeklyEmployees.reduce((sum, emp) => sum + (emp.pcs || 0), 0);
      const weeklyTargetCalc = dailyTargetCalc * 5; // 5 working days

      setDailyTarget(dailyTargetCalc || 2500);
      setDailyCompleted(dailyProduced);
      setWeeklyTarget(weeklyTargetCalc || 12500);
      setWeeklyCompleted(weeklyProduced);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching production data:", error);
      // Set fallback values
      setDailyTarget(2500);
      setDailyCompleted(0);
      setWeeklyTarget(12500);
      setWeeklyCompleted(0);
      setLoading(false);
    }
  };

  // Fetch defect rate to calculate quality rate
  const fetchDefectRate = async () => {
    try {
      const response = await axios.get("http://localhost:8001/api/iot/defect-rate");
      const defectRateValue = parseFloat(response.data.defectRate) || 0;
      const quality = (100 - defectRateValue).toFixed(1);
      setDefectRate(defectRateValue.toFixed(1));
      setQualityRate(quality);
    } catch (error) {
      console.error("Error fetching defect rate:", error);
    }
  };

  useEffect(() => {
    fetchProduction();
    fetchDefectRate();
  }, []);

  useEffect(() => {
    // Listen for real-time updates
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      console.log("📊 ProductionTargets received update:", updatedEmployees.length, "employees");
      // Recalculate production targets with new data
      fetchProduction();
    });

    // Also listen for defect rate updates
    socket.on("defectRateUpdate", () => {
      fetchDefectRate();
    });

    return () => {
      socket.off("leadingLineUpdate");
      socket.off("defectRateUpdate");
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
