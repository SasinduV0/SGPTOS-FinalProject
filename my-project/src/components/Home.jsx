import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const Home = () => {
  const lineStats = [
    { title: "Current Workers", value: "8/8", change: "All present", trend: "neutral" },
    { title: "Hourly Target", value: "125", change: "units/hr", trend: "neutral" },
    { title: "Current Output", value: "100", change: "-25", trend: "down" },
    { title: "Line Efficiency", value: "80%", change: "-20", trend: "down" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Home Page</h1>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
    
      </div>

      {/* Line Stats */}
      <div className="flex flex-col gap-6">
        {lineStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div
                className={`flex items-center text-sm ${
                  stat.trend === "up"
                    ? "text-green-600"
                    : stat.trend === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {stat.trend === "up" && <ArrowUp size={16} />}
                {stat.trend === "down" && <ArrowDown size={16} />}
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;

