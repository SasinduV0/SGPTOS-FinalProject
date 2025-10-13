import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const ReallocatedEmployees = () => {
  const [employees, setEmployees] = useState([]);

  // Helper function to get latest 5 records
  const getLatest5Records = (records) => {
    return records
      .sort((a, b) => {
        // Use MongoDB ObjectId timestamp for sorting (most reliable)
        const timeA = new Date(parseInt(a._id.substring(0, 8), 16) * 1000);
        const timeB = new Date(parseInt(b._id.substring(0, 8), 16) * 1000);
        return timeB - timeA; // Newest first
      })
      .slice(0, 5); // Get only first 5
  };

  // Fetch reallocated employees initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8001/api/line-reallocation/reallocated");
        // Get latest 5 records using ObjectId timestamp
        const latest5 = getLatest5Records(res.data);
        setEmployees(latest5);
      } catch (err) {
        console.error("❌ Error fetching reallocated employees:", err);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time reallocation updates
  useEffect(() => {
    // Listen for specific reallocated employees updates
    socket.on("reallocatedEmployeesUpdate", (reallocatedEmployees) => {
      console.log("📡 Received reallocated employees update:", reallocatedEmployees);
      // Get latest 5 records using ObjectId timestamp
      const latest5 = getLatest5Records(reallocatedEmployees);
      setEmployees(latest5);
    });

    // Also listen for general reallocation updates and filter
    socket.on("reallocationUpdate", (allReallocations) => {
      console.log("📡 Received reallocation update:", allReallocations);
      const reallocated = allReallocations.filter(emp => emp.newLineNo && emp.newLineNo.length > 0);
      // Get latest 5 records using ObjectId timestamp
      const latest5 = getLatest5Records(reallocated);
      setEmployees(latest5);
    });

    // Cleanup
    return () => {
      socket.off("reallocatedEmployeesUpdate");
      socket.off("reallocationUpdate");
    };
  }, []);

  return (
    <div className="">
      <div className="text-black rounded-2xl px-4 bg-white">
        <h2 className="text-lg font-bold text-center">Reallocated Employees</h2>

        <div className="mt-4 space-y-0.5 ">
          {employees.length > 0 ? (
            employees.map((emp, index) => (
              <div
                key={emp.EmployeeID}
                className="flex justify-between items-center px-3 py-1 rounded-lg hover:bg-blue-100 transition"
              >
                <div className="flex items-center gap-4 w-full">
                  <FaUser className="text-gray-700" />
                  <div className="flex justify-between items-center w-full">
                    <span className="font-medium text-gray-700">
                      {emp.name}
                    </span>
                    <span className="text-sm font-semibold text-gray-500">
                      <span className="text-gray-700">From:</span> {emp.lineNo.join(", ")} → <span className="text-gray-700">To:</span> {emp.newLineNo.join(", ")}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No reallocations yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReallocatedEmployees;
