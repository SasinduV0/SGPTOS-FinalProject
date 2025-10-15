
import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
const StatsCard = ({ title, value, unit, bgColor }) => (
<div className={`flex gap-6 justify-between items-center p-6 rounded-2xl shadow-md ${bgColor}`}>
<h3 className="text-lg font-semibold text-gray-700">{title}</h3>
<p className="text-lg font-semibold text-black">
{value}
{unit && <span className="text-base ml-1">{unit}</span>}
</p>
</div>
);
const DashboardSummary = () => {
const [summary, setSummary] = useState({
totalProduction: 0,
efficiencyRate: 0,
defectRate: 0,
activeWorkers: 58, // Static count for active workers
});
// This function fetches the total production count from the new backend endpoint.
const fetchTotalProduction = async () => {
try {
console.log("🔄 Fetching total production...");
// The endpoint is updated to call the new /scan-count route.
const { data } = await axios.get("http://localhost:8001/api/iot/scan-count");
if (data && typeof data.count === 'number') {
setSummary(prev => ({ ...prev, totalProduction: data.count }));
console.log("📊 Total production updated:", data.count);
}
} catch (err) {
console.error("❌ Error fetching total production:", err);
}
};
// This function fetches the defect rate and then calculates the efficiency rate.
const fetchRates = async () => {
try {
console.log("🔄 Fetching defect and efficiency rates...");
// The endpoint gets the defect rate.
const { data } = await axios.get("http://localhost:8001/api/iot/defect-rate");
if (data && data.defectRate) {
// The API returns the defectRate as a string (e.g., "5.25%").
// We parse the floating-point number from this string.
const defectPercentage = parseFloat(data.defectRate);

// Efficiency is calculated as 100% minus the defect rate.
const efficiencyPercentage = 100 - defectPercentage;

// Format to 2 decimal places and ensure it's not negative.
const finalEfficiency = Math.max(0, efficiencyPercentage).toFixed(2);

setSummary(prev => ({
...prev,
defectRate: defectPercentage.toFixed(2),
efficiencyRate: finalEfficiency,
}));
console.log("📊 Rates updated:", { defect: defectPercentage, efficiency: finalEfficiency });
}
} catch (err) {
console.error("❌ Error fetching rates:", err);
}
};

// Fetch all data (reusable function)
const fetchAllData = () => {
fetchTotalProduction();
fetchRates();
};

// Initial data fetch
useEffect(() => {
fetchAllData();
}, []);

// Polling: Fetch data every 5 seconds for real-time updates
useEffect(() => {
const interval = setInterval(() => {
console.log("🔄 DashboardSummary: Polling for updates...");
fetchAllData();
}, 5000);

return () => clearInterval(interval);
}, []);

// Socket event listeners for instant updates
useEffect(() => {
const socket = io("http://localhost:8001", { transports: ["websocket"] });

// Connection event handlers
socket.on("connect", () => {
console.log("✅ DashboardSummary Socket.IO connected:", socket.id);
fetchAllData(); // Fetch fresh data on connection
});

socket.on("disconnect", () => {
console.log("❌ DashboardSummary Socket.IO disconnected");
});

socket.on("connect_error", (error) => {
console.error("🔌 DashboardSummary Socket connection error:", error);
});

// Listen for various update events
const handleRealtimeUpdate = () => {
console.log("📊 DashboardSummary: Received real-time update event");
fetchAllData();
};

socket.on("defectUpdate", handleRealtimeUpdate);
socket.on("rfidUpdate", handleRealtimeUpdate);
socket.on("rfidScanUpdate", handleRealtimeUpdate);
socket.on("scanUpdate", handleRealtimeUpdate);

// Cleanup function: remove listeners and disconnect socket
return () => {
console.log("🧹 DashboardSummary cleaning up socket connections");
socket.off("defectUpdate", handleRealtimeUpdate);
socket.off("rfidUpdate", handleRealtimeUpdate);
socket.off("rfidScanUpdate", handleRealtimeUpdate);
socket.off("scanUpdate", handleRealtimeUpdate);
socket.off("connect");
socket.off("disconnect");
socket.off("connect_error");
socket.disconnect();
};
}, []); // The empty dependency array ensures this effect runs only once on mount.
return (
<div className="flex flex-col gap-6 my-8">
{/* Live Indicator */}
<div className="flex items-center justify-end gap-2 -mb-4">
<div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
<span className="text-xs text-gray-600 font-medium">Live Updates</span>
</div>

<StatsCard
title="Total Production"
value={summary.totalProduction}
unit="pcs"
bgColor="bg-blue-100"
/>
<StatsCard
title="Efficiency Rate"
value={summary.efficiencyRate}
unit="%"
bgColor="bg-green-100"
/>
<StatsCard
title="Active Workers"
value={summary.activeWorkers}
bgColor="bg-yellow-100"
/>
{/* The 'Active Workers' card was removed because the provided backend
does not have an endpoint to supply this data. */}
<StatsCard
title="Defect Rate"
value={summary.defectRate}
unit="%"
bgColor="bg-red-100"
/>
</div>
);
};
export default DashboardSummary;
