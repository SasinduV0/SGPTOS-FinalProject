
import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import io from "socket.io-client";
ChartJS.register(ArcElement, Tooltip, Legend);
// Socket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });
const ProductivityIncrease = () => {
const [totalProduction, setTotalProduction] = useState(0);
const [defectCount, setDefectCount] = useState(0);
const [defectRate, setDefectRate] = useState(0);
const [shiftEnd, setShiftEnd] = useState("14:30");
const [loading, setLoading] = useState(true);
// Fetch data function (reusable)
const fetchData = async () => {
try {
// Fetch total production (RFID scan count)
const scanResponse = await fetch("http://localhost:8001/api/iot/scan-count");
const scanData = await scanResponse.json();

// Fetch defect count
const defectResponse = await fetch("http://localhost:8001/api/iot/defect-rate");
const defectData = await defectResponse.json();

const production = scanData.count || 0;
const defects = defectData.defects || 0;

setTotalProduction(production);
setDefectCount(defects);

// Calculate defect rate percentage
const rate = production > 0
? ((defects / production) * 100).toFixed(2)
: 0;
setDefectRate(rate);

setLoading(false);
} catch (err) {
console.error("Error fetching data:", err);
setLoading(false);
}
};

// Fetch initial data from backend
useEffect(() => {
fetchData();
}, []);

// Polling: Fetch data every 5 seconds for real-time updates
useEffect(() => {
const interval = setInterval(() => {
fetchData();
}, 5000);

return () => clearInterval(interval);
}, []);

// Socket event listeners for instant updates
useEffect(() => {
// RFID scan updates
socket.on("rfidUpdate", () => {
console.log("📊 ProductivityIncrease: RFID update received");
fetchData();
});

    socket.on("rfidScanUpdate", () => {
      console.log("📊 ProductivityIncrease: RFID scan update received");
      fetchData();
    });

    socket.on("scanUpdate", () => {
      console.log("📊 ProductivityIncrease: Scan update received");
      fetchData();
    });

    // Defect updates
    socket.on("defectUpdate", () => {
      console.log("📊 ProductivityIncrease: Defect update received");
      fetchData();
    });

    // Connection monitoring
    socket.on("connect", () => {
      console.log("✅ ProductivityIncrease: Socket connected");
      fetchData();
    });

    socket.on("disconnect", () => {
      console.log("❌ ProductivityIncrease: Socket disconnected");
    });

    return () => {
      socket.off("rfidUpdate");
      socket.off("rfidScanUpdate");
      socket.off("scanUpdate");
      socket.off("defectUpdate");
      socket.off("connect");
      socket.off("disconnect");
    };
}, []);
if (loading) {
return (
<div className="flex justify-center items-center h-64">
<span className="text-gray-500 text-lg font-medium">Loading...</span>
</div>
);
}
// Calculate good production (non-defective items)
const goodProduction = totalProduction - defectCount;
const goodProductionRate = totalProduction > 0
? ((goodProduction / totalProduction) * 100).toFixed(2)
: 0;
// Chart.js data - showing good vs defective production
const data = {
labels: ["Good Production", "Defective"],
datasets: [
{
data: [goodProductionRate, defectRate],
backgroundColor: ["#10b981", "#ef4444"],
borderWidth: 2,
},
],
};
const options = {
cutout: "70%",
plugins: {
legend: { display: false },
tooltip: {
enabled: true,
callbacks: {
label: function(context) {
const label = context.label || '';
const value = context.parsed || 0;
const count = label === "Good Production" ? goodProduction : defectCount;
return `${label}: ${value}% (${count} pcs)`;
}
}
}
},
};
return (
<div className="bg-white rounded-lg p-6 flex flex-col items-center">
<div className="flex justify-between items-center w-full mb-6">
<h3 className="text-2xl font-bold text-gray-800">
Production Quality
</h3>
<div className="flex items-center gap-2 ml-5">
<div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
<span className="text-sm text-gray-600">Live</span>
</div>
</div>
<div className="relative flex items-center justify-center w-48 h-48">
<Doughnut data={data} options={options} />
<div className="absolute text-center">
<div className="text-lg font-bold text-green-600">{goodProductionRate}%</div>
<div className="text-xs text-gray-500">Good</div>
</div>
</div>
<div className="text-center mt-5">
<div className="text-md text-green-600 font-semibold">
{goodProduction} pcs Good Production
</div>
<div className="text-md text-red-500">
{defectCount} pcs Defective ({defectRate}%)
</div>
<div className="text-sm text-gray-600 mt-2">
Total: {totalProduction} pcs
</div>
<div className="text-md text-gray-600">Shift ends at {shiftEnd}</div>
</div>
</div>
);
};
export default ProductivityIncrease;