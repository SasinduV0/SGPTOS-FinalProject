import React, { useEffect, useState } from "react";
import axios from "axios";

const ProductionSummaryTable = () => {
  const [plans, setPlans] = useState([]);

  // Fetch data from backend
  const fetchPlans = async () => {
    try {
      const res = await axios.get("http://localhost:8001/api/product"); // adjust API route
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ## Helper function to determine status color based on remaining days
  const getStatusColor = (days) => {
    if (days <= 3) return "bg-red-500"; // Urgent
    if (days <= 7) return "bg-yellow-500"; // Nearing due date
    return "bg-green-500"; // On track
  };

  return (
    // ## Main container styled as a card for a modern dashboard feel
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Production Summary
      </h2>
      {/* ## Wrapper for responsiveness on small screens */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* ## Cleaner, modern table header */}
          <thead className="border-b-2 border-gray-200">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Product
              </th>
              {/* ## Added a Progress column for better visualization */}
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Finished
              </th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Remaining
              </th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Days Left
              </th>
            </tr>
          </thead>
          {/* ## A clean divider between rows, without harsh borders */}
          <tbody className="divide-y divide-gray-200">
            {plans.map((plan) => {
              // Calculate total for progress bar; ensure no division by zero
              const totalUnits = plan.finishedUnits + plan.remainingUnits;
              const progressPercentage =
                totalUnits > 0
                  ? (plan.finishedUnits / totalUnits) * 100
                  : 0;

              return (
                // ## Subtle hover effect on rows
                <tr
                  key={plan._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="p-4 font-medium text-gray-800 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {/* ## Status dot now dynamically changes color */}
                      <span
                        className={`w-3 h-3 ${getStatusColor(
                          plan.remainingDays
                        )} rounded-full flex-shrink-0`}
                        title={
                          plan.remainingDays <= 3
                            ? "Urgent"
                            : plan.remainingDays <= 7
                            ? "Nearing Due Date"
                            : "On Track"
                        }
                      ></span>
                      {plan.product}
                    </div>
                  </td>
                  {/* ## Visual progress bar */}
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-600 font-medium text-xs">
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {plan.finishedUnits}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {plan.remainingUnits}
                  </td>
                  <td className="p-4 text-gray-600 whitespace-nowrap">
                    {new Date(plan.endDate).toLocaleDateString()}
                  </td>
                  {/* ## Remaining days styled as a badge for emphasis */}
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {plan.remainingDays} days
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductionSummaryTable;