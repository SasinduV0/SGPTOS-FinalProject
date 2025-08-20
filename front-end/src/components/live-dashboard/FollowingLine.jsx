
import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa"; // 👈 user icon

const socket = io("http://localhost:8000"); // backend URL

const FollowingLine = () => {
  const [employees, setEmployees] = useState([]);

  // fetch initial employees
  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:8000/api/employees");
      setEmployees(res.data);
    };
    fetchData();
  }, []);

  // listen for real-time updates
  useEffect(() => {
    socket.on("followingLineUpdate", (updatedEmployees) => {
      console.log("🔄 Received update:", updatedEmployees);
      setEmployees(updatedEmployees);
    });

    return () => {
      socket.off("followingLineUpdate");
    };
  }, []);

  return (
    <div className="">
      <div className=" text-white rounded-2xl p-3">
        {/* Title */}
        <h2 className="text-lg font-bold text-center">Following Line</h2>
        
        {/* Example line info (you can fetch from backend if needed) */}
        <p className="text-center text-sm text-gray-300">
          Line 4 : 500 Target
        </p>

        {/* Employees list */}
        <div className="mt-3 space-y-2 p-2">
          {employees.slice(0, 5).map((emp)  => (
            <div
              key={emp._id}
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              {/* Left: icon + name */}
              <div className="flex items-center gap-4">
                <FaUser className="text-red-400" />
                <span>{emp.name}</span>
              </div>

              {/* Right: pcs */}
              <span className="font-semibold">{emp.pcs} Pcs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowingLine;
