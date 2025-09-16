import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

function DefectRateChart({ defects = 20, total = 100 }) {
  const defectRate = total > 0 ? ((defects / total) * 100).toFixed(2) : 0;

  // Get message & color based on defect rate
  const getDefectMessage = (rate) => {
    if (rate <= 5)
      return { text: "Excellent quality – minimal defects!", color: "text-green-600" };
    if (rate <= 10)
      return { text: "Quality is acceptable, but keep monitoring.", color: "text-yellow-600" };
    if (rate <= 20)
      return { text: "Defects count is higher than expected.", color: "text-orange-600" };
    return { text: "Critical! Immediate action required to reduce defects.", color: "text-red-600" };
  };

  const { text, color } = getDefectMessage(defectRate);

  const data = {
    labels: ["Defects", "Good"],
    datasets: [
      {
        data: [defectRate, 100 - defectRate],
        backgroundColor: ["#ef4444", "#22c55e"], // red for defects, green for good
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: "75%",
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    maintainAspectRatio: false,
  };

  return (
    <div className="flex items-center bg-white px-8 rounded-2xl gap-4 w-[500px]">
      <div className="relative w-[200px] h-[200px] flex">
        <Doughnut data={data} options={options} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-lg font-bold text-gray-800">{defectRate}%</p>
          <p className="text-xs text-gray-500">Defect Rate</p>
        </div>
      </div>
      <p className={` text-center text-xl font-semibold ${color}`}>
        {text}
      </p>
    </div>
  );
}

export default DefectRateChart;
