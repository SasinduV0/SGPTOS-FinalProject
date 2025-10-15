import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

// ✅ Use websocket transport
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const FollowingLine = () => {
  const [employees, setEmployees] = useState([]);
  const [delayedLine, setDelayedLine] = useState(null);
  const [delayedLineTotal, setDelayedLineTotal] = useState(0);

  // Fetch delayed line data using station-based aggregation
  const fetchDelayedLineData = async () => {
    try {
      // Use backend endpoint that handles all the logic
      const res = await axios.get(`http://localhost:8001/api/delayed-line-data`);
      const { delayedLine: line, delayedLineTotal: total, employees: emps } = res.data;

      setDelayedLine(line);
      setDelayedLineTotal(total);
      setEmployees(emps);
      
      console.log("📊 Delayed line data:", { line, total, employeeCount: emps.length });
    } catch (error) {
      console.error("❌ Error fetching delayed line data:", error);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchDelayedLineData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", () => {
      console.log("🔄 Received real-time update, refreshing delayed line data");
      fetchDelayedLineData();
    });

    return () => {
      socket.off("leadingLineUpdate");
    };
  }, []);

  // Top 5 employees already sorted (lowest first)
  const lowestEmployees = employees.slice(0, 5);

  return (
    <div className="p-0">
      <div className="text-white rounded-2xl px-3">
        <h2 className="text-lg font-bold text-center">Delayed Line</h2>

        {delayedLine !== null && (
          <p className="text-center text-sm text-gray-300">
            Line {delayedLine} : {delayedLineTotal} Total PCS
          </p>
        )}

        <div className="mt-3">
          {lowestEmployees.length > 0 ? (
            lowestEmployees.map((emp) => (
              <div
                key={emp._id}
                className="flex justify-between items-center px-3 py-[6px] rounded-lg hover:bg-red-400 transition"
              >
                <div className="flex items-center gap-4">
                  <FaUser className="text-red-400" />
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

export default FollowingLine;
