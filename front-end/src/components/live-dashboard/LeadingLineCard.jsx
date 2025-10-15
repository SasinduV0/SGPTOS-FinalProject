
// import React, { useEffect, useState } from "react";
// import io from "socket.io-client";
// import axios from "axios";
// import { FaUser } from "react-icons/fa";

// const socket = io("http://localhost:8000"); // backend URL

// const LeadingLine = () => {
//   const [employees, setEmployees] = useState([]);

//   // fetch initial employees
//   useEffect(() => {
//     const fetchData = async () => {
//       const res = await axios.get("http://localhost:8000/api/employees");
//       setEmployees(res.data);
//     };
//     fetchData();
//   }, []);

//   // listen for real-time updates
//   useEffect(() => {
//     socket.on("leadingLineUpdate", (updatedEmployees) => {
//       console.log("🔄 Received update:", updatedEmployees);
//       setEmployees(updatedEmployees);
//     });

//     return () => {
//       socket.off("leadingLineUpdate");
//     };
//   }, []);

//   // 🔥 sort employees by pcs (highest first) and pick top 5
//   const topEmployees = [...employees]
//     .sort((a, b) => b.pcs - a.pcs)
//     .slice(0, 5);

//   return (
//     <div className="p-2">
//       <div className=" text-white rounded-2xl p-3">
//         {/* Title */}
//         <h2 className="text-lg font-bold text-center">Leading Line</h2>

//         {/* Example line info (make dynamic later if needed) */}
//         <p className="text-center text-sm text-gray-300">
//           Line 4 : 500 Target
//         </p>

//         {/* Employees list (only top 5 by pcs) */}
//         <div className="mt-3 space-y-2 ">
//           {topEmployees.map((emp) => (
//             <div
//               key={emp._id}
//               className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-700 transition"
//             >
//               {/* Left: icon + name */}
//               <div className="flex items-center gap-4">
//                 <FaUser className="text-blue-400" />
//                 <span>{emp.name}</span>
//               </div>

//               {/* Right: pcs */}
//               <span className="font-semibold">{emp.pcs} Pcs</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeadingLine;


import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

// ✅ Enhanced socket connection with error handling  
const socket = io("http://localhost:8001", { 
  transports: ["websocket"],
  autoConnect: true,
  forceNew: true
});

const LeadingLine = () => {
  const [employees, setEmployees] = useState([]);
  const [leadingLine, setLeadingLine] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Handle socket connection events
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setConnectionStatus("connected");
      // Request initial data
      socket.emit("getAllEmployees");
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setConnectionStatus("error");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }, []);

  // fetch all employees initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Use new endpoint with scan counts
        const res = await axios.get(`http://localhost:8001/api/employees-with-scans`);
        console.log("📤 Fetched initial data:", res.data.length, "employees");
        updateLeadingLine(res.data);
      } catch (error) {
        console.error("❌ Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  // listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      console.log("🔄 Received real-time update:", updatedEmployees.length, "employees");
      updateLeadingLine(updatedEmployees);
    });

    return () => {
      socket.off("leadingLineUpdate");
    };
  }, []);

  // function to calculate leading line and its employees
  const updateLeadingLine = (allEmployees) => {
    if (!allEmployees.length) return;

    // sum pcs per line
    const lineTotals = allEmployees.reduce((acc, emp) => {
      acc[emp.line] = (acc[emp.line] || 0) + emp.pcs;
      return acc;
    }, {});

    // find line with highest PCS
    const topLine = Object.entries(lineTotals).reduce(
      (max, [line, total]) => (total > max.total ? { line, total } : max),
      { line: null, total: 0 }
    ).line;

    // filter employees for top line
    const topLineEmployees = allEmployees.filter(emp => emp.line === Number(topLine));

    setLeadingLine(topLine);
    setEmployees(topLineEmployees);
  };

  // sort employees by pcs and pick top 5
  const topEmployees = [...employees].sort((a, b) => b.pcs - a.pcs).slice(0, 5);

  return (
    <div className="p-2">
      <div className="text-white rounded-2xl px-3">
        <h2 className="text-lg font-bold text-center">
          Leading Line 
          {/* {connectionStatus === "connected" && <span className="text-green-400 text-xs ml-2">●</span>}
          {connectionStatus === "disconnected" && <span className="text-red-400 text-xs ml-2">●</span>} */}
        </h2>

        {leadingLine !== null && (
          <p className="text-center text-sm text-gray-300">
            Line {leadingLine} : {employees.reduce((sum, emp) => sum + emp.pcs, 0)} Total PCS
          </p>
        )}

        <div className="mt-3 space-y-1">
          {topEmployees.length > 0 ? (
            topEmployees.map((emp) => (
              <div
                key={emp._id}
                className="flex justify-between items-center px-3 py-1 rounded-lg hover:bg-gray-700 transition"
              >
                <div className="flex items-center gap-4">
                  <FaUser className="text-blue-400" />
                  <span>{emp.name}</span>
                </div>
                <span className="font-semibold">{emp.pcs} Pcs</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              No employees found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadingLine;


