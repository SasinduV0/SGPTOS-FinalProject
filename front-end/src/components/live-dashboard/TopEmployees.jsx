import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

// WebSocket connection
const socket = io("http://localhost:8000", { transports: ["websocket"] });

const TopEmployees = () => {
  const [employees, setEmployees] = useState([]);

  // Fetch all employees initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/employees`);
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
    <div className="p-2">
      <div className="text-white rounded-2xl p-3">
        <h2 className="text-lg font-bold text-center">Top 4 Employees (All Lines)</h2>

        <div className="mt-3 space-y-2">
          {topEmployees.map((emp, index) => (
            <div
              key={emp._id}
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-4">
                <FaUser className="text-green-400" />
                <span>
                  {index + 1}. {emp.name} (Line {emp.line})
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
