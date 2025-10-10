import React, { useEffect, useState } from "react";
import axios from "axios";

const StatsCard = ({ title, value, unit, bgColor }) => (
  <div className={`flex flex-col justify-center items-center p-6 rounded-2xl shadow-md ${bgColor}`}>
    <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    <p className="text-2xl font-bold text-black">
      {value}{unit && <span className="text-base ml-1">{unit}</span>}
    </p>
  </div>
);

const DashboardSummary = () => {
  const [summary, setSummary] = useState({
    totalProduction: 0,
    efficiencyRate: 0,
    activeWorkers: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await axios.get("http://localhost:8001/api/summary");
        setSummary(data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-8">
      <StatsCard title="Total Production" value={summary.totalProduction} unit="pcs" bgColor="bg-blue-100" />
      <StatsCard title="Efficiency Rate" value={summary.efficiencyRate} unit="%" bgColor="bg-green-100" />
      <StatsCard title="Active Workers" value={summary.activeWorkers} bgColor="bg-yellow-100" />
    </div>
  );
};

export default DashboardSummary;
