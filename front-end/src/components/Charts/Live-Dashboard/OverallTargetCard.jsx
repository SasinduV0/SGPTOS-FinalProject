// import { useEffect, useMemo, useState } from "react";
// import { io } from "socket.io-client";
// import { PieChart, Pie, Cell } from "recharts";
// import { fmtRemaining } from "../utils/time";

// const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

// export default function OverallTargetCard() {
//   const [data, setData] = useState(null);

//   // initial fetch
//   useEffect(() => {
//     fetch(`${API_BASE}/api/overall`)
//       .then((r) => r.json())
//       .then(setData)
//       .catch(console.error);
//   }, []);

//   // realtime
//   useEffect(() => {
//     const socket = io(API_BASE, { transports: ["websocket"] });
//     socket.on("overall:update", (payload) => setData((prev) =>
//       // if first payload, take it; else keep shiftEnd from server payload
//       ({ ...prev, ...payload })
//     ));
//     return () => socket.disconnect();
//   }, []);

//   // refresh the "time remaining" every minute
//   const [, force] = useState(0);
//   useEffect(() => {
//     const id = setInterval(() => force((n) => n + 1), 60_000);
//     return () => clearInterval(id);
//   }, []);

//   const chartData = useMemo(() => {
//     const pct = data?.percent ?? 0;
//     return [{ name: "done", value: pct }, { name: "remain", value: 100 - pct }];
//   }, [data]);

//   if (!data) {
//     return (
//       <div className="p-6 rounded-2xl bg-white shadow w-full max-w-md">
//         <p className="text-slate-500">Loading overall target…</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 rounded-2xl bg-white shadow w-full max-w-md">
//       <h2 className="text-xl font-semibold text-slate-800">Overall Target</h2>

//       <div className="flex items-center gap-6 mt-4">
//         <PieChart width={160} height={160}>
//           <Pie
//             data={chartData}
//             dataKey="value"
//             startAngle={90}
//             endAngle={-270}
//             innerRadius={50}
//             outerRadius={70}
//             paddingAngle={2}
//             stroke="none"
//           >
//             {/* Keep default colors; dashboard theme can override via CSS if needed */}
//             <Cell />
//             <Cell />
//           </Pie>
//         </PieChart>

//         <div className="flex flex-col">
//           <div className="text-3xl font-bold">{(data.percent ?? 0).toFixed(2)}%</div>
//           <div className="text-slate-600">
//             {data.produced} / {data.targetTotal} Pcs
//           </div>

//           <div className="mt-4">
//             <div className="text-sm text-slate-500">Time remaining</div>
//             <div className="inline-block mt-1 px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold">
//               {fmtRemaining(data.shiftEnd)}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
