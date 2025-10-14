import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import { FaUser } from "react-icons/fa";

const FollowingLine = () => {
  const [employees, setEmployees] = useState([]);
  const [lowestLine, setLowestLine] = useState(null);
  const [socket, setSocket] = useState(null);

  // Determine lowest PCS line and its employees
  const updateLowestLine = (allEmployees) => {
    if (!allEmployees || !allEmployees.length) {
      console.log("⚠️ No employees data received");
      setEmployees([]);
      setLowestLine(null);
      return;
    }

    console.log("📊 Processing employees:", allEmployees);

    // Calculate PCS total per line safely
    const lineTotals = allEmployees.reduce((acc, emp) => {
      const line = emp.line || emp.Line_Number; // Support both field names
      const pcs = Number(emp.pcs || emp.PCS || 0); // Support both field names
      
      if (line) {
        acc[line] = (acc[line] || 0) + pcs;
      }
      return acc;
    }, {});

    console.log("📈 Line totals:", lineTotals);

    // Check if we have any lines
    if (Object.keys(lineTotals).length === 0) {
      console.log("⚠️ No valid lines found");
      setEmployees([]);
      setLowestLine(null);
      return;
    }

    // Find line with lowest PCS
    const minLineEntry = Object.entries(lineTotals).reduce(
      (min, [line, total]) => (total < min.total ? { line, total } : min),
      { line: null, total: Infinity }
    );

    const minLine = minLineEntry.line;
    console.log("🔻 Lowest line:", minLine, "with", minLineEntry.total, "PCS");

    // Get employees of lowest PCS line
    const lowestLineEmployees = allEmployees.filter(
      (emp) => {
        const empLine = emp.line || emp.Line_Number;
        return String(empLine) === String(minLine);
      }
    );

    console.log("👥 Employees in lowest line:", lowestLineEmployees);

    setLowestLine(minLine);
    setEmployees(lowestLineEmployees);
  };

  // Fetch all employees initially and set up socket
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8001/api/employees");
        console.log("✅ Fetched employees for FollowingLine:", res.data);
        updateLowestLine(res.data);
      } catch (err) {
        console.error("❌ Error fetching employees:", err);
      }
    };
    
    fetchData();

    // Set up Socket.IO connection
    const newSocket = io("http://localhost:8001", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ FollowingLine socket connected");
    });

    newSocket.on("leadingLineUpdate", (updatedEmployees) => {
      console.log("🔄 Received leadingLineUpdate:", updatedEmployees);
      updateLowestLine(updatedEmployees);
    });

    // Also listen for other employee update events
    newSocket.on("rfidUpdate", fetchData);
    newSocket.on("rfidScanUpdate", fetchData);

    // Cleanup on unmount
    return () => {
      newSocket.off("leadingLineUpdate");
      newSocket.off("rfidUpdate");
      newSocket.off("rfidScanUpdate");
      newSocket.disconnect();
    };
  }, []);

  // Sort employees by pcs ascending & take lowest 5
  const lowestEmployees = employees.length > 0 
    ? [...employees]
        .sort((a, b) => {
          const pcsA = Number(a.pcs || a.PCS || 0);
          const pcsB = Number(b.pcs || b.PCS || 0);
          return pcsA - pcsB;
        })
        .slice(0, 5)
    : [];

  return (
    <div className="p-0">
      <div className="text-white rounded-2xl px-3">
        <h2 className="text-lg font-bold text-center">Delayed Line</h2>

        {lowestLine !== null ? (
          <>
            <p className="text-center text-sm text-gray-300 ">
              Line {lowestLine} :{" "}
              {employees.reduce((sum, emp) => sum + Number(emp.pcs || emp.PCS || 0), 0)} Total PCS
            </p>

            <div className="mt-3 space-y-1/2">
              {lowestEmployees.length > 0 ? (
                lowestEmployees.map((emp, index) => (
                  <div
                    key={emp._id || emp.id || index}
                    className="flex justify-between items-center px-3 py-[6px] rounded-lg hover:bg-red-400 transition"
                  >
                    <div className="flex items-center gap-4">
                      <FaUser className="text-red-400" />
                      <span>{emp.name || emp.Name || 'Unknown'}</span>
                    </div>
                    <span className="font-semibold">{emp.pcs || emp.PCS || 0} Pcs</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-gray-400 py-4">
                  No employees in this line
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-sm text-gray-400 py-4">
            Loading production data...
          </p>
        )}
      </div>
    </div>
  );
};

export default FollowingLine;
