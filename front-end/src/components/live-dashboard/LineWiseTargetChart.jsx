// LineWiseTargetChart.jsx
import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LineWiseTargetChart = () => {
  const labels = ["Line 01", "Line 02", "Line 03", "Line 04", "Line 05", "Line 06", "Line 07", "Line 08", "Line 09"];
  const percentages = [70, 42.81, 82.81, 100, 64.99, 85.31, 35.53, 76.25, 60.31];

  const data = {
    labels,
    datasets: [
      {
        label: "Target %",
        data: percentages,
        backgroundColor: "#3B82F6", // Blue color
        borderRadius: 8,
        
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: true, 
        text: "hjghjguky"
      },  
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y}%`,
        },
      },
    },
    scales: {
         x: {
      ticks: {
        maxRotation: 90,  // Rotate labels to 90 degrees
        minRotation: 90,  // Keep them fixed at 90 degrees
      },
    },

      y: {
        beginAtZero: true,
        max: 110, // Little more than 100% for spacing
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

export default LineWiseTargetChart;
