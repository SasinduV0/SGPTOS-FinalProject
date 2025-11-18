
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
  const [leadingLineTotal, setLeadingLineTotal] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Handle socket connection events
  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setConnectionStatus("connected");
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

  // Fetch leading line data using station-based aggregation
  const fetchLeadingLineData = async () => {
    try {
      // Use new backend endpoint that handles all the logic
      const res = await axios.get(`http://localhost:8001/api/leading-line-data`);
      const { leadingLine: line, leadingLineTotal: total, employees: emps } = res.data;

      setLeadingLine(line);
      setLeadingLineTotal(total);
      setEmployees(emps);
      
      console.log("📊 Leading line data:", { line, total, employeeCount: emps.length });
    } catch (error) {
      console.error("❌ Error fetching leading line data:", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchLeadingLineData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", () => {
      console.log("🔄 Received real-time update, refreshing data");
      fetchLeadingLineData();
    });

    return () => {
      socket.off("leadingLineUpdate");
    };
  }, []);

  // Top 5 employees already sorted
  const topEmployees = employees.slice(0, 5);

  return (
    <div className="p-2">
      <div className="text-white rounded-2xl px-3">
        <h2 className="text-lg font-bold text-center">
          Leading Line
        </h2>

        {leadingLine !== null && (
          <p className="text-center text-sm text-gray-300">
            Line {leadingLine} : {leadingLineTotal} Total PCS
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


