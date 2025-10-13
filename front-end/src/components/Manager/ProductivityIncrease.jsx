
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
// Fetch initial data from backend
useEffect(() => {
const fetchData = async () => {
try {
// Fetch total production (RFID scan count)
const scanResponse = await fetch("http://localhost:8001/api/iot/scan-count");
const scanData = await scanResponse.json();

// Fetch defect count
const defectResponse = await fetch("http://localhost:8001/api/iot/defect-rate");
const defectData = await defectResponse.json();

setTotalProduction(scanData.count || 0);
setDefectCount(defectData.defects || 0);

// Calculate defect rate percentage
const rate = scanData.count > 0
? ((defectData.defects / scanData.count) * 100).toFixed(2)
: 0;
setDefectRate(rate);

setLoading(false);
} catch (err) {
console.error("Error fetching data:", err);
setLoading(false);
}
};
fetchData();
}, []);
// Listen for live RFID scan updates
useEffect(() => {
socket.on("rfidUpdate", async () => {
console.log("📊 ProductivityIncrease received RFID update");
try {
const scanResponse = await fetch("http://localhost:8001/api/iot/scan-count");
const scanData = await scanResponse.json();
setTotalProduction(scanData.count || 0);

// Recalculate defect rate
const rate = scanData.count > 0
? ((defectCount / scanData.count) * 100).toFixed(2)
: 0;
setDefectRate(rate);
} catch (err) {
console.error("Error updating production:", err);
}
});
return () => socket.off("rfidUpdate");
}, [defectCount]);
// Listen for live defect updates
useEffect(() => {
socket.on("defectUpdate", async (data) => {
console.log("📊 ProductivityIncrease received defect update");
try {
const defectResponse = await fetch("http://localhost:8001/api/iot/defect-rate");
const defectData = await defectResponse.json();

setDefectCount(defectData.defects || 0);

// Recalculate defect rate
const rate = totalProduction > 0
? ((defectData.defects / totalProduction) * 100).toFixed(2)
: 0;
setDefectRate(rate);
} catch (err) {
console.error("Error updating defects:", err);
}
});
return () => socket.off("defectUpdate");
}, [totalProduction]);
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
<h3 className="text-2xl font-bold text-gray-800 mb-6">
Production Quality
</h3>
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