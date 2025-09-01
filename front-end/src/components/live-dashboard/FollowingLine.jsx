import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

// ✅ Use websocket transport
const socket = io("http://localhost:8000", { transports: ["websocket"] });

const FollowingLine = () => {
  const [employees, setEmployees] = useState([]);
  const [lowestLine, setLowestLine] = useState(null);

  // Fetch all employees initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/employees`);
        updateLowestLine(res.data);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchData();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    socket.on("leadingLineUpdate", (updatedEmployees) => {
      updateLowestLine(updatedEmployees);
    });

    return () => {
      socket.off("leadingLineUpdate");
    };
  }, []);

  // Determine lowest PCS line and its employees
  const updateLowestLine = (allEmployees) => {
    if (!allEmployees.length) return;

    // Calculate PCS total per line safely
    const lineTotals = allEmployees.reduce((acc, emp) => {
      const pcs = Number(emp.pcs) || 0; // Ensure PCS is a number
      acc[emp.line] = (acc[emp.line] || 0) + pcs;
      return acc;
    }, {});

    // Find line with lowest PCS
    const minLineEntry = Object.entries(lineTotals).reduce(
      (min, [line, total]) => (total < min.total ? { line, total } : min),
      { line: null, total: Infinity }
    );

    const minLine = minLineEntry.line;

    // Get employees of lowest PCS line
    const lowestLineEmployees = allEmployees.filter(
      (emp) => Number(emp.line) === Number(minLine)
    );

    setLowestLine(minLine);
    setEmployees(lowestLineEmployees);
  };

  // Sort employees by pcs ascending & take lowest 5
  const lowestEmployees = [...employees]
    .sort((a, b) => Number(a.pcs) - Number(b.pcs))
    .slice(0, 5);

  return (
    <div className="p-2">
      <div className="text-white rounded-2xl p-3">
        <h2 className="text-lg font-bold text-center">Following Line</h2>

        {lowestLine !== null && (
          <p className="text-center text-sm text-gray-300">
            Line {lowestLine} :{" "}
            {employees.reduce((sum, emp) => sum + Number(emp.pcs || 0), 0)} Total PCS
          </p>
        )}

        <div className="mt-3 space-y-1">
          {lowestEmployees.map((emp) => (
            <div
              key={emp._id}
              className="flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              <div className="flex items-center gap-4">
                <FaUser className="text-red-400" />
                <span>{emp.name}</span>
              </div>
              <span className="font-semibold">{emp.pcs} Pcs</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FollowingLine;
