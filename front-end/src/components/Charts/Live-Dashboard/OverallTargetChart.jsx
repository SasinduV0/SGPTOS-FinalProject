import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const OverallTargetChart = () => {
  const data = {
    labels: ["Completed", "Remaining"],
    datasets: [
      {
        label: "Target",
        data: [68.04, 100 - 68.04],
        backgroundColor: ["#3b82f6", "#f3f4f6"],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: "70%",
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="flex flex-col items-center">
      <Doughnut data={data} options={options} className="w-60" />
      <h3 className="text-center mt-4 text-lg font-semibold">
        68.04% (347 Pcs)
      </h3>
    </div>
  );
};

export default OverallTargetChart;
