import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

// WebSocket connection
const socket = io("http://localhost:8001", { transports: ["websocket"] });

const TopEmployees = () => {
  const [employees, setEmployees] = useState([]);

  // Fetch all employees initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8001/api/employees`);
        setEmployees(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      setEmployees(updatedEmployees);
    });

    return () => {
      socket.off("leadingLineUpdate");
    };
  }, []);

  // Sort all employees by pcs (highest first) and select top 4
  const topEmployees = [...employees]
    .sort((a, b) => Number(b.pcs) - Number(a.pcs))
    .slice(0, 4);

  return (
    <div className="">
      <div className="text-black rounded-2xl px-3 py-1">
        <h2 className="text-lg font-bold text-center">Top 4 Employees (All Lines)</h2>

        <div className="mt-3 space-y-1">
          {topEmployees.map((emp, index) => (
            <div
              key={emp._id}
              className="flex justify-between items-center px-3 py-1 rounded-lg  hover:bg-yellow-300 transition"
            >
              <div className="flex items-center gap-4">
                <FaUser className="text-yellow-700" />
                <span className="font-medium flex gap-10 text-gray-700">
                  {index + 1}. {emp.name} <span className="text-yellow-300 indent-10"> </span> Line {emp.line}
                </span>
              </div>
              <span className="font-semibold">{emp.pcs} Pcs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopEmployees;
